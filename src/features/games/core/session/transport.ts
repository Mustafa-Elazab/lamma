import type {
  GameSession,
  GameSessionPlayerAction,
  SessionTransport,
} from '../types';

export type GameSessionTransportAdapter = {
  kind: SessionTransport;
  host(session: GameSession): Promise<void>;
  join(code: string): Promise<GameSession | null>;
  listAvailableSessions?(): Promise<GameSession[]>;
  subscribeAvailableSessions?(
    onSessions: (sessions: GameSession[]) => void,
  ): () => void;
  publish(session: GameSession): Promise<void>;
  subscribe?(
    code: string,
    onSession: (session: GameSession | null) => void,
  ): () => void;
  submitPlayerAction?(
    code: string,
    action: GameSessionPlayerAction,
  ): Promise<void>;
  subscribePlayerActions?(
    code: string,
    onActions: (actions: GameSessionPlayerAction[]) => void,
  ): () => void;
  leave(sessionId: string): Promise<void>;
};

export class LocalRoomCodeSessionAdapter implements GameSessionTransportAdapter {
  readonly kind = 'firestore-room-code' as const;

  private readonly sessions = new Map<string, GameSession>();
  private readonly actions = new Map<string, GameSessionPlayerAction[]>();
  private readonly listeners = new Map<
    string,
    Set<(session: GameSession | null) => void>
  >();
  private readonly discoveryListeners = new Set<
    (sessions: GameSession[]) => void
  >();
  private readonly actionListeners = new Map<
    string,
    Set<(actions: GameSessionPlayerAction[]) => void>
  >();

  private emit(code: string): void {
    const normalized = code.toUpperCase();
    const session = this.sessions.get(normalized) ?? null;
    this.listeners.get(normalized)?.forEach(listener => listener(session));
  }

  private emitActions(code: string): void {
    const normalized = code.toUpperCase();
    const actions = [...(this.actions.get(normalized) ?? [])].sort(
      (a, b) => a.createdAt - b.createdAt,
    );
    this.actionListeners
      .get(normalized)
      ?.forEach(listener => listener(actions));
  }

  private availableSessions(): GameSession[] {
    return [...this.sessions.values()]
      .filter(session => session.phase !== 'ended')
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  private emitDiscovery(): void {
    const sessions = this.availableSessions();
    this.discoveryListeners.forEach(listener => listener(sessions));
  }

  async host(session: GameSession): Promise<void> {
    this.sessions.set(session.code.toUpperCase(), session);
    this.emit(session.code);
    this.emitDiscovery();
  }

  async join(code: string): Promise<GameSession | null> {
    return this.sessions.get(code.toUpperCase()) ?? null;
  }

  async listAvailableSessions(): Promise<GameSession[]> {
    return this.availableSessions();
  }

  subscribeAvailableSessions(
    onSessions: (sessions: GameSession[]) => void,
  ): () => void {
    this.discoveryListeners.add(onSessions);
    onSessions(this.availableSessions());
    return () => {
      this.discoveryListeners.delete(onSessions);
    };
  }

  async publish(session: GameSession): Promise<void> {
    this.sessions.set(session.code.toUpperCase(), session);
    this.emit(session.code);
    this.emitDiscovery();
  }

  subscribe(
    code: string,
    onSession: (session: GameSession | null) => void,
  ): () => void {
    const normalized = code.toUpperCase();
    const listeners = this.listeners.get(normalized) ?? new Set();
    listeners.add(onSession);
    this.listeners.set(normalized, listeners);
    onSession(this.sessions.get(normalized) ?? null);
    return () => {
      listeners.delete(onSession);
      if (listeners.size === 0) {
        this.listeners.delete(normalized);
      }
    };
  }

  async submitPlayerAction(
    code: string,
    action: GameSessionPlayerAction,
  ): Promise<void> {
    const normalized = code.toUpperCase();
    const actions = this.actions.get(normalized) ?? [];
    if (!actions.some(item => item.id === action.id)) {
      this.actions.set(normalized, [...actions, action]);
      this.emitActions(normalized);
    }
  }

  subscribePlayerActions(
    code: string,
    onActions: (actions: GameSessionPlayerAction[]) => void,
  ): () => void {
    const normalized = code.toUpperCase();
    const listeners = this.actionListeners.get(normalized) ?? new Set();
    listeners.add(onActions);
    this.actionListeners.set(normalized, listeners);
    onActions([...(this.actions.get(normalized) ?? [])]);
    return () => {
      listeners.delete(onActions);
      if (listeners.size === 0) {
        this.actionListeners.delete(normalized);
      }
    };
  }

  async leave(sessionId: string): Promise<void> {
    for (const [code, session] of this.sessions.entries()) {
      if (session.id === sessionId) {
        this.sessions.delete(code);
        this.actions.delete(code);
        this.emit(code);
        this.emitActions(code);
        this.emitDiscovery();
        return;
      }
    }
  }
}
