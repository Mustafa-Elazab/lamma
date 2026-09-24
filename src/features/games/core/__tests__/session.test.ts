import {
  DeviceEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {
  initialSessionState,
  sessionReducer,
} from '../session/sessionReducer';
import { roomCodeForGame } from '../session/code';
import {
  getNativeGameSessionTransport,
  NATIVE_GAME_SESSION_EVENTS,
} from '../session/nativeTransport';
import {
  __setGameSessionTransportForTest,
  getGameSessionTransport,
} from '../session/sessionTransport';
import { LocalRoomCodeSessionAdapter } from '../session/transport';
import type { GamePlayer, GameSession } from '../types';

const host: GamePlayer = {
  id: 'host',
  name: 'Host',
  isHost: true,
  connected: true,
};

const guest: GamePlayer = {
  id: 'guest',
  name: 'Guest',
  isHost: false,
  connected: true,
};

const originalPlatformOS = Platform.OS;
const originalNativeGameSession = (NativeModules as {
  LammaGameSession?: unknown;
}).LammaGameSession;

describe('game session', () => {
  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatformOS,
      configurable: true,
    });
    (NativeModules as { LammaGameSession?: unknown }).LammaGameSession =
      originalNativeGameSession;
    __setGameSessionTransportForTest(null);
    jest.restoreAllMocks();
  });

  it('creates room codes with a game prefix', () => {
    expect(roomCodeForGame('trivia-time')).toMatch(/^TT[A-Z0-9]{4}$/);
    expect(roomCodeForGame('mafioso')).toMatch(/^M[A-Z0-9]{4}$/);
  });

  it('handles host, join, disconnect, reconnect, and start in one reducer', () => {
    const hosted = sessionReducer(initialSessionState, {
      type: 'host',
      gameId: 'mafioso',
      host,
      code: 'MA1234',
      now: 1,
    });
    const joined = sessionReducer(hosted, {
      type: 'join',
      player: guest,
      now: 2,
    });
    expect(joined.current?.players).toHaveLength(2);

    const disconnected = sessionReducer(joined, {
      type: 'disconnect',
      playerId: 'guest',
      now: 3,
    });
    expect(
      disconnected.current?.players.find(player => player.id === 'guest')
        ?.connected,
    ).toBe(false);

    const reconnected = sessionReducer(disconnected, {
      type: 'reconnect',
      playerId: 'guest',
      now: 4,
    });
    expect(
      reconnected.current?.players.find(player => player.id === 'guest')
        ?.connected,
    ).toBe(true);

    const started = sessionReducer(reconnected, { type: 'start', now: 5 });
    expect(started.current?.phase).toBe('in-game');
  });

  it('hosts, joins, publishes, and leaves through the room-code adapter', async () => {
    const adapter = new LocalRoomCodeSessionAdapter();
    const state = sessionReducer(initialSessionState, {
      type: 'host',
      gameId: 'icebreakers',
      host,
      code: 'ICROOM',
      now: 1,
    });
    const session = state.current;
    expect(session).not.toBeNull();
    await adapter.host(session!);
    expect(await adapter.join('ICROOM')).toEqual(session);

    const started = sessionReducer(state, { type: 'start', now: 2 }).current!;
    await adapter.publish(started);
    expect((await adapter.join('ICROOM'))?.phase).toBe('in-game');

    await adapter.leave(started.id);
    expect(await adapter.join('ICROOM')).toBeNull();
  });

  it('discovers active room-code sessions', async () => {
    const adapter = new LocalRoomCodeSessionAdapter();
    const state = sessionReducer(initialSessionState, {
      type: 'host',
      gameId: 'trivia-time',
      host,
      code: 'TTDISC',
      now: 1,
    });
    const discovered: string[][] = [];
    const unsubscribe = adapter.subscribeAvailableSessions(sessions => {
      discovered.push(sessions.map(session => session.code));
    });

    await adapter.host(state.current!);
    expect((await adapter.listAvailableSessions()).map(session => session.code))
      .toEqual(['TTDISC']);
    await adapter.leave(state.current!.id);
    unsubscribe();

    expect(discovered).toEqual([[], ['TTDISC'], []]);
  });

  it('uses the linked Android Nearby native transport before fallback transport', async () => {
    Object.defineProperty(Platform, 'OS', {
      value: 'android',
      configurable: true,
    });
    const state = sessionReducer(initialSessionState, {
      type: 'host',
      gameId: 'icebreakers',
      host,
      code: 'ICROOM',
      now: 1,
    });
    const session = state.current!;
    jest
      .spyOn(PermissionsAndroid, 'requestMultiple')
      .mockResolvedValue({
        [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]:
          PermissionsAndroid.RESULTS.GRANTED,
        [PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE]:
          PermissionsAndroid.RESULTS.GRANTED,
        [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]:
          PermissionsAndroid.RESULTS.GRANTED,
        [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]:
          PermissionsAndroid.RESULTS.GRANTED,
        [PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES]:
          PermissionsAndroid.RESULTS.GRANTED,
      } as unknown as Awaited<
        ReturnType<typeof PermissionsAndroid.requestMultiple>
      >);
    const bridge = {
      host: jest.fn(async () => undefined),
      join: jest.fn(async () => JSON.stringify(session)),
      publish: jest.fn(async () => undefined),
      submitPlayerAction: jest.fn(async () => undefined),
      leave: jest.fn(async () => undefined),
      listAvailableSessions: jest.fn(async () => [JSON.stringify(session)]),
      subscribeSession: jest.fn(),
      unsubscribeSession: jest.fn(),
    };
    (NativeModules as { LammaGameSession?: unknown }).LammaGameSession = bridge;

    const nativeTransport = getNativeGameSessionTransport();
    expect(nativeTransport?.kind).toBe('nearby');
    // Firestore room-code is preferred when Firebase is enabled so phone+sim can join.
    expect(['firestore-room-code', 'nearby']).toContain(
      getGameSessionTransport().kind,
    );

    await nativeTransport?.host(session);
    const hostPayload = (bridge.host as jest.Mock).mock.calls[0][0] as string;
    expect(JSON.parse(hostPayload) as GameSession).toEqual(session);
    await expect(nativeTransport?.join('icroom')).resolves.toEqual(session);
    await expect(nativeTransport?.listAvailableSessions?.()).resolves.toEqual([
      session,
    ]);
  });

  it('uses Multipeer native session events to hydrate subscribed iOS rooms', () => {
    Object.defineProperty(Platform, 'OS', {
      value: 'ios',
      configurable: true,
    });
    const state = sessionReducer(initialSessionState, {
      type: 'host',
      gameId: 'mafioso',
      host,
      code: 'MAROOM',
      now: 1,
    });
    const started = sessionReducer(state, { type: 'start', now: 2 }).current!;
    const bridge = {
      host: jest.fn(async () => undefined),
      join: jest.fn(async () => JSON.stringify(started)),
      publish: jest.fn(async () => undefined),
      submitPlayerAction: jest.fn(async () => undefined),
      leave: jest.fn(async () => undefined),
      subscribeSession: jest.fn(),
      unsubscribeSession: jest.fn(),
    };
    (NativeModules as { LammaGameSession?: unknown }).LammaGameSession = bridge;

    const nativeTransport = getNativeGameSessionTransport();
    const updates: Array<GameSession | null> = [];
    const unsubscribe = nativeTransport!.subscribe!('MAROOM', session => {
      updates.push(session);
    });

    DeviceEventEmitter.emit(NATIVE_GAME_SESSION_EVENTS.session, {
      code: 'OTHER',
      session: JSON.stringify(state.current),
    });
    DeviceEventEmitter.emit(NATIVE_GAME_SESSION_EVENTS.session, {
      code: 'MAROOM',
      session: JSON.stringify(started),
    });
    unsubscribe();

    expect(nativeTransport?.kind).toBe('multipeer');
    expect(bridge.subscribeSession).toHaveBeenCalledWith('MAROOM');
    expect(bridge.unsubscribeSession).toHaveBeenCalledWith('MAROOM');
    expect(updates).toEqual([started]);
  });

  it('publishes game state updates to room-code subscribers', async () => {
    const adapter = new LocalRoomCodeSessionAdapter();
    const state = sessionReducer(initialSessionState, {
      type: 'host',
      gameId: 'trivia-time',
      host,
      code: 'TTROOM',
      now: 1,
    });
    const session = state.current!;
    const updates: Array<string | undefined> = [];

    await adapter.host(session);
    const unsubscribe = adapter.subscribe('TTROOM', next => {
      updates.push(next?.phase);
    });
    const started = sessionReducer(state, {
      type: 'start',
      now: 2,
      gameState: { kind: 'trivia-time', round: 1 },
    }).current!;
    await adapter.publish(started);
    unsubscribe();

    expect(updates).toEqual(['lobby', 'in-game']);
    expect((await adapter.join('TTROOM'))?.gameState).toEqual({
      kind: 'trivia-time',
      round: 1,
    });
  });

  it('submits player actions and applies join actions once', async () => {
    const adapter = new LocalRoomCodeSessionAdapter();
    const state = sessionReducer(initialSessionState, {
      type: 'host',
      gameId: 'mafioso',
      host,
      code: 'MAROOM',
      now: 1,
    });
    const actions: string[][] = [];
    await adapter.host(state.current!);
    const unsubscribe = adapter.subscribePlayerActions('MAROOM', next => {
      actions.push(next.map(action => action.id));
    });

    await adapter.submitPlayerAction('MAROOM', {
      id: 'guest-join-1',
      kind: 'join',
      playerId: guest.id,
      player: guest,
      createdAt: 2,
    });
    unsubscribe();

    expect(actions).toEqual([[], ['guest-join-1']]);
    const joined = sessionReducer(state, {
      type: 'applyPlayerAction',
      action: {
        id: 'guest-join-1',
        kind: 'join',
        playerId: guest.id,
        player: guest,
        createdAt: 2,
      },
      now: 3,
    });
    const reapplied = sessionReducer(joined, {
      type: 'applyPlayerAction',
      action: {
        id: 'guest-join-1',
        kind: 'join',
        playerId: guest.id,
        player: guest,
        createdAt: 2,
      },
      now: 4,
    });

    expect(joined.current?.players).toHaveLength(2);
    expect(reapplied.current?.players).toHaveLength(2);
    expect(reapplied.current?.appliedActionIds).toEqual(['guest-join-1']);
  });

  it('applies connection actions as host-authoritative presence changes', () => {
    const hosted = sessionReducer(initialSessionState, {
      type: 'host',
      gameId: 'icebreakers',
      host,
      code: 'ICLIVE',
      now: 1,
    });
    const joined = sessionReducer(hosted, {
      type: 'join',
      player: guest,
      now: 2,
    });
    const disconnected = sessionReducer(joined, {
      type: 'applyPlayerAction',
      action: {
        id: 'guest-away',
        kind: 'connection',
        playerId: guest.id,
        connected: false,
        createdAt: 3,
      },
      now: 3,
    });
    const reconnected = sessionReducer(disconnected, {
      type: 'applyPlayerAction',
      action: {
        id: 'guest-back',
        kind: 'connection',
        playerId: guest.id,
        connected: true,
        createdAt: 4,
      },
      now: 4,
    });

    expect(
      disconnected.current?.players.find(player => player.id === guest.id)
        ?.connected,
    ).toBe(false);
    expect(
      reconnected.current?.players.find(player => player.id === guest.id)
        ?.connected,
    ).toBe(true);
    expect(reconnected.current?.appliedActionIds).toEqual([
      'guest-away',
      'guest-back',
    ]);
  });
});
