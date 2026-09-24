import type {
  GameId,
  GamePlayer,
  GameSession,
  GameSessionPlayerAction,
} from '../types';

export type SessionState = {
  current: GameSession | null;
};

export type SessionAction =
  | { type: 'hydrate'; session: GameSession }
  | { type: 'host'; gameId: GameId; host: GamePlayer; now: number; code: string }
  | { type: 'join'; player: GamePlayer; now: number }
  | { type: 'disconnect'; playerId: string; now: number }
  | { type: 'reconnect'; playerId: string; now: number }
  | { type: 'start'; now: number; gameState?: unknown }
  | {
      type: 'setGameState';
      gameState: unknown;
      now: number;
      appliedActionIds?: string[];
    }
  | { type: 'applyPlayerAction'; action: GameSessionPlayerAction; now: number }
  | { type: 'end'; now: number }
  | { type: 'reset' };

export const initialSessionState: SessionState = { current: null };

function updateSession(
  state: SessionState,
  updater: (session: GameSession) => GameSession,
): SessionState {
  if (!state.current) {
    return state;
  }
  return { current: updater(state.current) };
}

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case 'hydrate':
      return { current: action.session };
    case 'host':
      return {
        current: {
          id: `${action.gameId}-${action.code}`,
          gameId: action.gameId,
          code: action.code,
          phase: 'lobby',
          hostId: action.host.id,
          players: [{ ...action.host, isHost: true, connected: true }],
          appliedActionIds: [],
          createdAt: action.now,
          updatedAt: action.now,
        },
      };
    case 'join':
      return updateSession(state, session => {
        const existing = session.players.find(player => player.id === action.player.id);
        const players = existing
          ? session.players.map(player =>
              player.id === action.player.id
                ? { ...player, ...action.player, connected: true }
                : player,
            )
          : [...session.players, { ...action.player, isHost: false, connected: true }];
        return { ...session, players, updatedAt: action.now };
      });
    case 'disconnect':
      return updateSession(state, session => ({
        ...session,
        players: session.players.map(player =>
          player.id === action.playerId ? { ...player, connected: false } : player,
        ),
        updatedAt: action.now,
      }));
    case 'reconnect':
      return updateSession(state, session => ({
        ...session,
        players: session.players.map(player =>
          player.id === action.playerId ? { ...player, connected: true } : player,
        ),
        updatedAt: action.now,
      }));
    case 'start':
      return updateSession(state, session => ({
        ...session,
        phase: 'in-game',
        gameState: action.gameState ?? session.gameState,
        updatedAt: action.now,
      }));
    case 'setGameState':
      return updateSession(state, session => ({
        ...session,
        gameState: action.gameState,
        appliedActionIds: action.appliedActionIds?.length
          ? Array.from(
              new Set([
                ...(session.appliedActionIds ?? []),
                ...action.appliedActionIds,
              ]),
            )
          : session.appliedActionIds,
        updatedAt: action.now,
      }));
    case 'applyPlayerAction':
      return updateSession(state, session => {
        if ((session.appliedActionIds ?? []).includes(action.action.id)) {
          return session;
        }
        const next =
          action.action.kind === 'join'
            ? sessionReducer(
                { current: session },
                { type: 'join', player: action.action.player, now: action.now },
              ).current
            : action.action.kind === 'connection'
            ? sessionReducer(
                { current: session },
                {
                  type: action.action.connected ? 'reconnect' : 'disconnect',
                  playerId: action.action.playerId,
                  now: action.now,
                },
              ).current
            : null;
        if (!next) {
          return session;
        }
        return {
          ...next,
          appliedActionIds: [
            ...(session.appliedActionIds ?? []),
            action.action.id,
          ],
        };
      });
    case 'end':
      return updateSession(state, session => ({
        ...session,
        phase: 'ended',
        updatedAt: action.now,
      }));
    case 'reset':
      return initialSessionState;
    default:
      return state;
  }
}
