import { DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import { NativeModules } from 'react-native';

import type {
  GameSession,
  GameSessionPlayerAction,
  SessionTransport,
} from '../types';
import type { GameSessionTransportAdapter } from './transport';

export const NATIVE_GAME_SESSION_EVENTS = {
  session: 'LammaGameSession.session',
  availableSessions: 'LammaGameSession.availableSessions',
  playerActions: 'LammaGameSession.playerActions',
} as const;

type NativeGameSessionBridge = {
  host(sessionJson: string): Promise<void>;
  join(code: string): Promise<string | null>;
  publish(sessionJson: string): Promise<void>;
  submitPlayerAction(code: string, actionJson: string): Promise<void>;
  leave(sessionId: string): Promise<void>;
  listAvailableSessions?(): Promise<string[]>;
  subscribeAvailableSessions?(): Promise<void> | void;
  unsubscribeAvailableSessions?(): Promise<void> | void;
  subscribeSession?(code: string): Promise<void> | void;
  unsubscribeSession?(code: string): Promise<void> | void;
  subscribePlayerActions?(code: string): Promise<void> | void;
  unsubscribePlayerActions?(code: string): Promise<void> | void;
};

type SessionEventPayload = {
  code?: unknown;
  session?: unknown;
};

type AvailableSessionsEventPayload = {
  sessions?: unknown;
};

type PlayerActionsEventPayload = {
  code?: unknown;
  actions?: unknown;
};

type AndroidPermission = Parameters<
  typeof PermissionsAndroid.requestMultiple
>[0][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isNativeGameSessionBridge(
  value: unknown,
): value is NativeGameSessionBridge {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.host === 'function' &&
    typeof value.join === 'function' &&
    typeof value.publish === 'function' &&
    typeof value.submitPlayerAction === 'function' &&
    typeof value.leave === 'function'
  );
}

function nativeTransportKind(): SessionTransport | null {
  if (Platform.OS === 'android') {
    return 'nearby';
  }
  if (Platform.OS === 'ios') {
    return 'multipeer';
  }
  return null;
}

function parseJson(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function parseSession(value: unknown): GameSession | null {
  const parsed = parseJson(value);
  if (!isRecord(parsed)) {
    return null;
  }
  if (
    typeof parsed.id !== 'string' ||
    typeof parsed.gameId !== 'string' ||
    typeof parsed.code !== 'string' ||
    typeof parsed.hostId !== 'string'
  ) {
    return null;
  }
  return parsed as GameSession;
}

function parseSessionArray(value: unknown): GameSession[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.flatMap(item => {
    const session = parseSession(item);
    return session ? [session] : [];
  });
}

function parsePlayerActionArray(value: unknown): GameSessionPlayerAction[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.flatMap(item => {
    const action = parseJson(item);
    if (
      !isRecord(action) ||
      typeof action.id !== 'string' ||
      typeof action.kind !== 'string' ||
      typeof action.playerId !== 'string' ||
      typeof action.createdAt !== 'number'
    ) {
      return [];
    }
    return [action as GameSessionPlayerAction];
  });
}

function eventCodeMatches(payloadCode: unknown, code: string): boolean {
  return (
    typeof payloadCode !== 'string' ||
    payloadCode.trim().toUpperCase() === code.trim().toUpperCase()
  );
}

async function requestAndroidNearbyPermissions(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  const permissions: AndroidPermission[] = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ];
  if (Number(Platform.Version) >= 31) {
    permissions.push(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    );
  }
  if (Number(Platform.Version) >= 33) {
    permissions.push(PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES);
  }
  const results = (await PermissionsAndroid.requestMultiple(permissions)) as Partial<
    Record<AndroidPermission, string>
  >;
  const denied = permissions.some(
    permission =>
      results[permission] !== PermissionsAndroid.RESULTS.GRANTED,
  );
  if (denied) {
    throw new Error('games.nearby-permission-denied');
  }
}

function settleNativeSubscription(value: Promise<void> | void): void {
  if (!value) {
    return;
  }
  value.catch(() => undefined);
}

export class NativeGameSessionTransportAdapter
  implements GameSessionTransportAdapter
{
  constructor(
    private readonly bridge: NativeGameSessionBridge,
    readonly kind: SessionTransport,
  ) {}

  async host(session: GameSession): Promise<void> {
    await requestAndroidNearbyPermissions();
    await this.bridge.host(JSON.stringify(session));
  }

  async join(code: string): Promise<GameSession | null> {
    await requestAndroidNearbyPermissions();
    const sessionJson = await this.bridge.join(code.trim().toUpperCase());
    return parseSession(sessionJson);
  }

  async listAvailableSessions(): Promise<GameSession[]> {
    await requestAndroidNearbyPermissions();
    if (!this.bridge.listAvailableSessions) {
      return [];
    }
    const sessions = await this.bridge.listAvailableSessions();
    return parseSessionArray(sessions);
  }

  subscribeAvailableSessions(
    onSessions: (sessions: GameSession[]) => void,
  ): () => void {
    settleNativeSubscription(
      requestAndroidNearbyPermissions().then(() =>
        this.bridge.subscribeAvailableSessions?.(),
      ),
    );
    const subscription = DeviceEventEmitter.addListener(
      NATIVE_GAME_SESSION_EVENTS.availableSessions,
      (payload: AvailableSessionsEventPayload | string) => {
        const parsed = parseJson(payload);
        const sessions = isRecord(parsed) ? parsed.sessions : parsed;
        onSessions(parseSessionArray(sessions));
      },
    );
    return () => {
      subscription.remove();
      settleNativeSubscription(this.bridge.unsubscribeAvailableSessions?.());
    };
  }

  async publish(session: GameSession): Promise<void> {
    await this.bridge.publish(JSON.stringify(session));
  }

  subscribe(
    code: string,
    onSession: (session: GameSession | null) => void,
  ): () => void {
    const normalizedCode = code.trim().toUpperCase();
    settleNativeSubscription(this.bridge.subscribeSession?.(normalizedCode));
    const subscription = DeviceEventEmitter.addListener(
      NATIVE_GAME_SESSION_EVENTS.session,
      (payload: SessionEventPayload | string) => {
        const parsed = parseJson(payload);
        if (isRecord(parsed)) {
          if (!eventCodeMatches(parsed.code, normalizedCode)) {
            return;
          }
          onSession(
            Object.prototype.hasOwnProperty.call(parsed, 'session')
              ? parseSession(parsed.session)
              : parseSession(parsed),
          );
          return;
        }
        onSession(parseSession(parsed));
      },
    );
    return () => {
      subscription.remove();
      settleNativeSubscription(this.bridge.unsubscribeSession?.(normalizedCode));
    };
  }

  async submitPlayerAction(
    code: string,
    action: GameSessionPlayerAction,
  ): Promise<void> {
    await this.bridge.submitPlayerAction(
      code.trim().toUpperCase(),
      JSON.stringify(action),
    );
  }

  subscribePlayerActions(
    code: string,
    onActions: (actions: GameSessionPlayerAction[]) => void,
  ): () => void {
    const normalizedCode = code.trim().toUpperCase();
    settleNativeSubscription(
      this.bridge.subscribePlayerActions?.(normalizedCode),
    );
    const subscription = DeviceEventEmitter.addListener(
      NATIVE_GAME_SESSION_EVENTS.playerActions,
      (payload: PlayerActionsEventPayload | string) => {
        const parsed = parseJson(payload);
        if (isRecord(parsed)) {
          if (!eventCodeMatches(parsed.code, normalizedCode)) {
            return;
          }
          onActions(parsePlayerActionArray(parsed.actions));
          return;
        }
        onActions(parsePlayerActionArray(parsed));
      },
    );
    return () => {
      subscription.remove();
      settleNativeSubscription(
        this.bridge.unsubscribePlayerActions?.(normalizedCode),
      );
    };
  }

  async leave(sessionId: string): Promise<void> {
    await this.bridge.leave(sessionId);
  }
}

export function getNativeGameSessionTransport(): GameSessionTransportAdapter | null {
  const kind = nativeTransportKind();
  const bridge = (NativeModules as { LammaGameSession?: unknown })
    .LammaGameSession;
  if (!kind || !isNativeGameSessionBridge(bridge)) {
    return null;
  }
  return new NativeGameSessionTransportAdapter(bridge, kind);
}
