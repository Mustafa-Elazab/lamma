import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';

import { displayNameOrGuest, useAuth } from '../../../auth';
import type {
  GameId,
  GamePlayer,
  GameSession,
  GameSessionPlayerAction,
} from '../types';
import { roomCodeForGame } from './code';
import {
  initialSessionState,
  sessionReducer,
  type SessionState,
} from './sessionReducer';
import { getGameSessionTransport } from './sessionTransport';

type GameSessionContextValue = SessionState & {
  playerActions: GameSessionPlayerAction[];
  availableSessions: GameSession[];
  hostGame: (gameId: GameId) => Promise<GameSession>;
  joinByCode: (code: string, playerName: string) => Promise<GameSession | null>;
  joinCurrent: (playerName: string) => void;
  startCurrent: (gameState?: unknown) => void;
  updateGameState: (
    gameState: unknown,
    appliedActionIds?: string | string[],
  ) => void;
  submitPlayerAction: (action: PlayerActionInput) => Promise<void>;
  disconnectPlayer: (playerId: string) => void;
  reconnectPlayer: (playerId: string) => void;
  leaveCurrent: () => void;
};

type PlayerActionInput =
  | Omit<
      Extract<GameSessionPlayerAction, { kind: 'join' }>,
      'id' | 'createdAt'
    >
  | Omit<
      Extract<GameSessionPlayerAction, { kind: 'trivia-answer' }>,
      'id' | 'createdAt'
    >
  | Omit<
      Extract<GameSessionPlayerAction, { kind: 'mafioso-vote' }>,
      'id' | 'createdAt'
    >
  | Omit<
      Extract<GameSessionPlayerAction, { kind: 'quarter-mile-choice' }>,
      'id' | 'createdAt'
    >
  | Omit<
      Extract<GameSessionPlayerAction, { kind: 'connection' }>,
      'id' | 'createdAt'
    >;

const GameSessionContext = createContext<GameSessionContextValue | undefined>(
  undefined,
);

function playerFromName(id: string, name: string, isHost = false): GamePlayer {
  return { id, name, isHost, connected: true };
}

export function GameSessionProvider({
  children,
}: PropsWithChildren): React.ReactElement {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const [playerActions, setPlayerActions] = useState<GameSessionPlayerAction[]>(
    [],
  );
  const [availableSessions, setAvailableSessions] = useState<GameSession[]>([]);
  const transport = useMemo(() => getGameSessionTransport(), []);
  const currentCode = state.current?.code;
  const localPlayerId = user?.uid ?? 'local-host';
  const currentPlayerId =
    state.current?.players.find(player => player.id === user?.uid)?.id ??
    state.current?.players.find(player => !player.isHost)?.id ??
    localPlayerId;
  const hasCurrentSession = Boolean(state.current);
  const isCurrentHost = state.current?.hostId === currentPlayerId;

  const submitConnectionPresence = useCallback(
    (connected: boolean) => {
      if (!currentCode || !transport.submitPlayerAction) {
        return;
      }
      const createdAt = Date.now();
      void transport.submitPlayerAction(currentCode, {
        id: `${currentPlayerId}-connection-${createdAt}`,
        kind: 'connection',
        playerId: currentPlayerId,
        connected,
        createdAt,
      });
    },
    [currentCode, currentPlayerId, transport],
  );

  useEffect(() => {
    if (!currentCode || !transport.subscribe) {
      return undefined;
    }
    return transport.subscribe(currentCode, remoteSession => {
      if (remoteSession) {
        dispatch({ type: 'hydrate', session: remoteSession });
      }
    });
  }, [currentCode, transport]);

  useEffect(() => {
    if (!currentCode || !transport.subscribePlayerActions) {
      setPlayerActions([]);
      return undefined;
    }
    return transport.subscribePlayerActions(currentCode, setPlayerActions);
  }, [currentCode, transport]);

  useEffect(() => {
    // Rooms are private: joined only via code or invite link.
    setAvailableSessions([]);
    return undefined;
  }, [transport]);

  const hostGame = useCallback(
    async (gameId: GameId) => {
      const now = Date.now();
      const host = playerFromName(
        localPlayerId,
        displayNameOrGuest(user, 'Host'),
        true,
      );
      const code = roomCodeForGame(gameId, now);
      const nextState = sessionReducer(initialSessionState, {
        type: 'host',
        gameId,
        host,
        code,
        now,
      });
      const session = nextState.current;
      if (!session) {
        throw new Error('games.session-host-failed');
      }
      dispatch({ type: 'host', gameId, host, code, now });
      await transport.host(session);
      return session;
    },
    [localPlayerId, transport, user],
  );

  const joinByCode = useCallback(
    async (code: string, playerName: string) => {
      const remoteSession = await transport.join(code);
      if (!remoteSession) {
        return null;
      }
      const now = Date.now();
      const player = playerFromName(user?.uid ?? `guest-${now}`, playerName);
      const joined = sessionReducer(
        { current: remoteSession },
        { type: 'join', player, now },
      ).current;
      if (!joined) {
        return null;
      }
      dispatch({ type: 'hydrate', session: joined });
      if (transport.submitPlayerAction) {
        await transport.submitPlayerAction(remoteSession.code, {
          id: `${player.id}-join-${now}`,
          kind: 'join',
          playerId: player.id,
          player,
          createdAt: now,
        });
      } else {
        await transport.publish(joined);
      }
      return joined;
    },
    [transport, user],
  );

  useEffect(() => {
    if (!state.current || state.current.hostId !== localPlayerId) {
      return;
    }
    const pendingSessionActions = playerActions.filter(
      action =>
        (action.kind === 'join' || action.kind === 'connection') &&
        !(state.current?.appliedActionIds ?? []).includes(action.id),
    );
    if (pendingSessionActions.length === 0) {
      return;
    }
    const next = pendingSessionActions.reduce(
      (nextState, action) =>
        sessionReducer(nextState, {
          type: 'applyPlayerAction',
          action,
          now: Date.now(),
        }),
      state,
    ).current;
    if (next) {
      dispatch({ type: 'hydrate', session: next });
      void transport.publish(next);
    }
  }, [localPlayerId, playerActions, state, transport]);

  useEffect(() => {
    if (!hasCurrentSession || isCurrentHost) {
      return undefined;
    }
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active' && nextState !== 'background') {
        return;
      }
      submitConnectionPresence(nextState === 'active');
    });
    return () => subscription.remove();
  }, [hasCurrentSession, isCurrentHost, submitConnectionPresence]);

  useEffect(() => {
    if (!hasCurrentSession || isCurrentHost) {
      return undefined;
    }
    return () => submitConnectionPresence(false);
  }, [hasCurrentSession, isCurrentHost, submitConnectionPresence]);

  const joinCurrent = useCallback(
    (playerName: string) => {
      const now = Date.now();
      const player = playerFromName(`guest-${now}`, playerName);
      dispatch({ type: 'join', player, now });
      const next = sessionReducer(state, { type: 'join', player, now }).current;
      if (next) {
        void transport.publish(next);
      }
    },
    [state, transport],
  );

  const startCurrent = useCallback((gameState?: unknown) => {
    const now = Date.now();
    const action = { type: 'start' as const, now, gameState };
    dispatch(action);
    const next = sessionReducer(state, action).current;
    if (next) {
      void transport.publish(next);
    }
  }, [state, transport]);

  const updateGameState = useCallback(
    (gameState: unknown, appliedActionIds?: string | string[]) => {
      const now = Date.now();
      const action = {
        type: 'setGameState' as const,
        gameState,
        now,
        appliedActionIds: Array.isArray(appliedActionIds)
          ? appliedActionIds
          : appliedActionIds
          ? [appliedActionIds]
          : undefined,
      };
      dispatch(action);
      const next = sessionReducer(state, action).current;
      if (next) {
        void transport.publish(next);
      }
    },
    [state, transport],
  );

  const submitPlayerAction = useCallback(
    async (action: PlayerActionInput) => {
      if (!currentCode || !transport.submitPlayerAction) {
        return;
      }
      const createdAt = Date.now();
      await transport.submitPlayerAction(currentCode, {
        ...action,
        id: `${action.playerId}-${action.kind}-${createdAt}`,
        createdAt,
      } as GameSessionPlayerAction);
    },
    [currentCode, transport],
  );

  const disconnectPlayer = useCallback(
    (playerId: string) => {
      const now = Date.now();
      dispatch({ type: 'disconnect', playerId, now });
      const next = sessionReducer(state, { type: 'disconnect', playerId, now }).current;
      if (next) {
        void transport.publish(next);
      }
    },
    [state, transport],
  );

  const reconnectPlayer = useCallback(
    (playerId: string) => {
      const now = Date.now();
      dispatch({ type: 'reconnect', playerId, now });
      const next = sessionReducer(state, { type: 'reconnect', playerId, now }).current;
      if (next) {
        void transport.publish(next);
      }
    },
    [state, transport],
  );

  const leaveCurrent = useCallback(() => {
    if (state.current) {
      if (isCurrentHost) {
        void transport.leave(state.current.id);
      } else if (transport.submitPlayerAction) {
        submitConnectionPresence(false);
      }
    }
    dispatch({ type: 'reset' });
  }, [isCurrentHost, state, submitConnectionPresence, transport]);

  const value = useMemo<GameSessionContextValue>(
    () => ({
      ...state,
      playerActions,
      availableSessions,
      hostGame,
      joinByCode,
      joinCurrent,
      startCurrent,
      updateGameState,
      submitPlayerAction,
      disconnectPlayer,
      reconnectPlayer,
      leaveCurrent,
    }),
    [
      disconnectPlayer,
      availableSessions,
      hostGame,
      joinByCode,
      joinCurrent,
      leaveCurrent,
      playerActions,
      reconnectPlayer,
      startCurrent,
      state,
      submitPlayerAction,
      updateGameState,
    ],
  );

  return (
    <GameSessionContext.Provider value={value}>
      {children}
    </GameSessionContext.Provider>
  );
}

export function useGameSession(): GameSessionContextValue {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error('useGameSession must be used within GameSessionProvider');
  }
  return context;
}
