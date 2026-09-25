import Clipboard from '@react-native-clipboard/clipboard';
import { Alert, Share } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../../auth';
import { useLanguage } from '../../../../app/localization';
import { buildGameRoomLink } from '../../../../navigation/linking';
import type { GamesStackParamList } from '../../../../navigation/types';
import { trackEvent } from '../../../../services/analytics';
import { appLogger } from '../../../../services/logger';
import { useGameContent } from '../../core/hooks';
import { localizeText } from '../../core/localized';
import { gameById } from '../../core/registry';
import { useGameSession } from '../../core/session';
import type {
  GameDefinition,
  GameId,
  GamePlayer,
  GameSessionPlayerAction,
  IcebreakerPrompt,
  QuarterMilePack,
  TriviaPack,
} from '../../core/types';
import {
  nextIcebreakerRound,
  type IcebreakerRound,
} from '../../icebreakers/engine';
import {
  allImposterVotesIn,
  castImposterVote,
  createImposterRound,
  imposterGuess,
  imposterLeaderboard,
  revealImposterVote,
  skipImposterGuess,
  startImposterVote,
  type ImposterState,
} from '../../imposter/engine';
import {
  advanceQuarterMileTurn,
  applyQuarterMileChoice,
  createQuarterMileState,
  currentQuarterMilePlayerId,
  quarterMileScores,
  quarterMileWinner,
  type QuarterMileState,
} from '../../quarter-mile/engine';
import {
  QUARTER_MILE_PACKS,
  formatQuarterMileScore,
  quarterMilePackUnit,
} from '../../quarter-mile/content/packs';
import {
  advanceTriviaQuestion,
  answerTriviaQuestion,
  createTriviaRound,
  revealTriviaQuestion,
  triviaLeaderboard,
  triviaWinner,
  type TriviaRoundState,
} from '../../trivia/engine';
import {
  DEFAULT_TRIVIA_SETTINGS,
  type TriviaSettings,
} from '../../trivia/scoring';

const EMPTY_TRIVIA_PACKS: TriviaPack[] = [];
const EMPTY_QUARTER_MILE_PACKS: QuarterMilePack[] = [];
const EMPTY_ICEBREAKER_PROMPTS: IcebreakerPrompt[] = [];
const EMPTY_PLAYERS: GamePlayer[] = [];
const EMPTY_IDS: string[] = [];

/** Late joiners get a zero-score row the first time they answer. */
function withTriviaPlayer(
  round: TriviaRoundState,
  player: GamePlayer | null,
): TriviaRoundState {
  if (!player || round.scores.some(score => score.playerId === player.id)) {
    return round;
  }
  return {
    ...round,
    scores: [...round.scores, { playerId: player.id, name: player.name, score: 0 }],
  };
}

function localizeGameDefinition(
  definition: GameDefinition,
  language: ReturnType<typeof useLanguage>['language'],
): GameDefinition {
  return {
    ...definition,
    name: localizeText(definition.name, language),
    shortDescription: localizeText(definition.shortDescription, language),
  };
}

type GameplayState =
  | { kind: 'imposter'; state: ImposterState }
  | { kind: 'trivia-setup'; settings: TriviaSettings }
  | { kind: 'trivia-time'; round: TriviaRoundState }
  | { kind: 'quarter-mile'; state: QuarterMileState }
  | { kind: 'icebreakers'; current: IcebreakerRound | null };

/** Pack id and "finished" flag of the running game, for analytics. */
function gameplaySummary(
  gameplay: GameplayState | null,
): { packId?: string; finished: boolean; players: number } | null {
  switch (gameplay?.kind) {
    case 'imposter':
      return {
        finished: gameplay.state.phase === 'result',
        players: gameplay.state.playerIds?.length ?? 0,
      };
    case 'trivia-time':
      return {
        packId: gameplay.round.settings?.packId,
        finished: gameplay.round.phase === 'finished',
        players: gameplay.round.scores?.length ?? 0,
      };
    case 'quarter-mile':
      return {
        packId: gameplay.state.packId,
        finished: gameplay.state.phase === 'finished',
        players: gameplay.state.playerOrder?.length ?? 0,
      };
    default:
      return null;
  }
}

function isGameplayState(value: unknown): value is GameplayState {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return (
    (value as { kind?: unknown }).kind === 'imposter' ||
    (value as { kind?: unknown }).kind === 'trivia-setup' ||
    (value as { kind?: unknown }).kind === 'trivia-time' ||
    (value as { kind?: unknown }).kind === 'quarter-mile' ||
    (value as { kind?: unknown }).kind === 'icebreakers'
  );
}

export function useGameLobbyController(gameId: GameId) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<GamesStackParamList>>();
  const session = useGameSession();
  const contentQuery = useGameContent(gameId);
  const gameContent = contentQuery.data ?? null;
  const game = localizeGameDefinition(
    gameContent?.definition ?? gameById(gameId),
    language,
  );
  const triviaPacks = gameContent?.triviaPacks ?? EMPTY_TRIVIA_PACKS;
  const quarterMilePacks =
    (gameContent?.quarterMilePacks?.length
      ? gameContent.quarterMilePacks
      : QUARTER_MILE_PACKS) ?? EMPTY_QUARTER_MILE_PACKS;
  const [quarterMilePackId, setQuarterMilePackId] = useState<string | null>(
    null,
  );
  const selectedQuarterMilePack =
    quarterMilePacks.find(pack => pack.id === quarterMilePackId) ??
    quarterMilePacks[0];
  const icebreakerPrompts =
    gameContent?.icebreakerPrompts ?? EMPTY_ICEBREAKER_PROMPTS;
  const [triviaSettings, setTriviaSettings] = useState<TriviaSettings>({
    ...DEFAULT_TRIVIA_SETTINGS,
  });

  useEffect(() => {
    if (session.current?.gameId === gameId) {
      return;
    }
    let cancelled = false;
    session
      .hostGame(gameId)
      .catch(error => {
        if (cancelled) {
          return;
        }
        appLogger.error('[games.host] Failed to host session', error);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId, session]);

  const players = session.current?.players ?? EMPTY_PLAYERS;
  const connectedPlayers = players.filter(player => player.connected);
  const gameplay = isGameplayState(session.current?.gameState)
    ? session.current.gameState
    : null;
  const summary = gameplaySummary(gameplay);
  const gameFinished = summary?.finished ?? false;
  const wasFinished = useRef(gameFinished);
  useEffect(() => {
    if (gameFinished && !wasFinished.current && summary) {
      void trackEvent('game_end', {
        game_id: gameId,
        pack_id: summary.packId,
        players: summary.players,
      });
    }
    wasFinished.current = gameFinished;
    // Only the finished transition matters, not every state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameFinished]);
  const currentTriviaSettings =
    gameplay?.kind === 'trivia-setup' ? gameplay.settings : triviaSettings;
  // Always identify the local player by their own auth uid. Never fall back to
  // another player (that made guests think they were the host).
  const localPlayerId = user?.uid ?? 'local-host';
  const me = players.find(player => player.id === localPlayerId) ?? null;
  const isHost = Boolean(session.current && session.current.hostId === localPlayerId);
  const requiredConnectedPlayers = Math.max(1, game.minPlayers);
  const canStart =
    isHost && connectedPlayers.length >= requiredConnectedPlayers;

  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    appLogger.log('[games.start-gate]', {
      gameId,
      isHost,
      connectedPlayers: connectedPlayers.length,
      configuredMinPlayers: game.minPlayers,
      requiredConnectedPlayers,
      canStart,
      playerIds: players.map(player => ({
        id: player.id,
        isHost: player.isHost,
        connected: player.connected,
      })),
    });
  }, [
    canStart,
    connectedPlayers.length,
    game.minPlayers,
    gameId,
    isHost,
    players,
    requiredConnectedPlayers,
  ]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (gameplay?.kind !== 'trivia-time' || gameplay.round.phase !== 'question') {
      return undefined;
    }
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [gameplay]);

  const appliedIds = session.current?.appliedActionIds ?? EMPTY_IDS;
  const isPending = useCallback(
    (predicate: (action: GameSessionPlayerAction) => boolean) =>
      session.playerActions.some(
        action =>
          action.playerId === localPlayerId &&
          !appliedIds.includes(action.id) &&
          predicate(action),
      ),
    [appliedIds, localPlayerId, session.playerActions],
  );

  const sendAction = useCallback(
    (action: Parameters<typeof session.submitPlayerAction>[0]) => {
      session.submitPlayerAction(action).catch(error => {
        appLogger.error('[games.action] submit failed', error, {
          kind: action.kind,
        });
        Alert.alert(t('games.actionFailedTitle'), t('games.actionFailed'));
      });
    },
    [session, t],
  );

  const imposter = gameplay?.kind === 'imposter' ? gameplay.state : null;
  const amInImposterRound = Boolean(
    imposter && imposter.playerIds.includes(localPlayerId),
  );
  const amImposter = Boolean(imposter && imposter.imposterId === localPlayerId);
  const myImposterVote = imposter?.votes[localPlayerId];
  const myPendingImposterVote = imposter
    ? isPending(a => a.kind === 'imposter-vote' && a.round === imposter.round)
    : false;
  const myPendingImposterGuess = imposter
    ? isPending(a => a.kind === 'imposter-guess' && a.round === imposter.round)
    : false;
  const imposterVoteCounts = useMemo(() => {
    if (!imposter) {
      return [] as Array<{ playerId: string; name: string; count: number }>;
    }
    const counts: Record<string, number> = {};
    Object.values(imposter.votes).forEach(target => {
      counts[target] = (counts[target] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([playerId, count]) => ({
        playerId,
        name: imposter.playerNames[playerId] ?? playerId,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [imposter]);

  const myPendingTriviaAnswer =
    gameplay?.kind === 'trivia-time' && me
      ? session.playerActions.find(
          action =>
            action.kind === 'trivia-answer' &&
            action.playerId === me.id &&
            action.questionIndex === gameplay.round.currentIndex &&
            !(session.current?.appliedActionIds ?? []).includes(action.id),
        )
      : undefined;
  const canSeeIcebreakerPrompt =
    gameplay?.kind === 'icebreakers' &&
    gameplay.current?.player.id === localPlayerId;
  const myPendingIcebreakerNext =
    gameplay?.kind === 'icebreakers' && gameplay.current
      ? isPending(
          a =>
            a.kind === 'icebreaker-next' &&
            a.round === gameplay.current?.round,
        )
      : false;
  const triviaSecondsLeft =
    gameplay?.kind === 'trivia-time' && gameplay.round.phase === 'question'
      ? Math.max(
          0,
          Math.ceil(
            (gameplay.round.questionStartedAtMs +
              gameplay.round.settings.secondsPerQuestion * 1000 -
              now) /
              1000,
          ),
        )
      : null;
  const triviaAnsweredCount =
    gameplay?.kind === 'trivia-time'
      ? Object.keys(gameplay.round.answers).length
      : 0;
  const quarterMileSpectator =
    gameplay?.kind === 'quarter-mile' &&
    !gameplay.state.playerOrder.includes(localPlayerId);

  const gameSummary = useMemo(() => {
    if (gameId === 'imposter') {
      return {
        title: t('games.imposterSetup'),
        lines: [
          t('games.imposterRule1'),
          t('games.imposterRule2'),
          t('games.imposterRule3'),
          t('games.imposterRule4'),
        ],
      };
    }
    if (gameId === 'quarter-mile') {
      const pack = selectedQuarterMilePack;
      return {
        title: t('games.quarterMileSetup'),
        lines: [
          t('games.quarterMileHint'),
          pack
            ? t('games.quarterMilePackLine', {
                pack: localizeText(pack.name, language),
                count: pack.items.length,
              })
            : '',
        ].filter(Boolean),
      };
    }
    if (gameId === 'trivia-time') {
  const pack = triviaPacks.find(
        item => item.id === currentTriviaSettings.packId,
      );
      return {
        title: t('games.triviaSetup'),
        lines: [
          t('games.triviaPack', {
            pack: localizeText(pack?.name, language) || 'General Knowledge',
          }),
          t('games.triviaQuestions', {
            count: currentTriviaSettings.questionCount,
            seconds: currentTriviaSettings.secondsPerQuestion,
          }),
          currentTriviaSettings.prize
            ? t('games.triviaPrizeAward', {
                prize: currentTriviaSettings.prize,
              })
            : t('games.triviaPrizeHint'),
        ],
      };
    }
    return {
      title: t('games.icebreakersSetup'),
      lines: [
        t('games.icebreakersPromptCount', {
          count: icebreakerPrompts.length,
        }),
        t('games.icebreakersRotation'),
      ],
    };
  }, [
    currentTriviaSettings,
    gameId,
    icebreakerPrompts.length,
    language,
    t,
    triviaPacks,
    selectedQuarterMilePack,
  ]);

  const start = useCallback(() => {
    if (!isHost || connectedPlayers.length < requiredConnectedPlayers) {
      return;
    }
    const logStart = (packId: string | undefined, playerCount: number) =>
      void trackEvent('game_start', {
        game_id: gameId,
        pack_id: packId,
        players: playerCount,
      });
    if (gameId === 'imposter') {
      session.startCurrent({
        kind: 'imposter',
        state: createImposterRound({
          players: connectedPlayers,
          previous: gameplay?.kind === 'imposter' ? gameplay.state : undefined,
        }),
      });
      logStart(undefined, connectedPlayers.length);
      return;
    }
    if (gameId === 'trivia-time') {
      const pack =
        triviaPacks.find(item => item.id === currentTriviaSettings.packId) ??
        triviaPacks[0];
      if (!pack) {
        return;
      }
      session.startCurrent({
        kind: 'trivia-time',
        round: createTriviaRound({
          pack,
          players: connectedPlayers,
          settings: currentTriviaSettings,
          now: Date.now(),
        }),
      });
      logStart(pack.id, connectedPlayers.length);
      return;
    }
    if (gameId === 'quarter-mile') {
      const pack = selectedQuarterMilePack;
      if (!pack || connectedPlayers.length < 2) {
        return;
      }
      session.startCurrent({
        kind: 'quarter-mile',
        state: createQuarterMileState({
          pack,
          players: connectedPlayers.slice(0, 2),
        }),
      });
      logStart(pack.id, 2);
      return;
    }
    if (icebreakerPrompts.length === 0) {
      return;
    }
    session.startCurrent({
      kind: 'icebreakers',
      current: nextIcebreakerRound({
        players: connectedPlayers,
        prompts: icebreakerPrompts,
      }),
    });
    logStart(undefined, connectedPlayers.length);
  }, [
    connectedPlayers,
    currentTriviaSettings,
    gameId,
    gameplay,
    icebreakerPrompts,
    isHost,
    selectedQuarterMilePack,
    requiredConnectedPlayers,
    session,
    triviaPacks,
  ]);

  const updateTriviaSetting = useCallback(
    <K extends keyof TriviaSettings>(key: K, value: TriviaSettings[K]) => {
      const next = { ...triviaSettings, [key]: value };
      setTriviaSettings(next);
      if (
        isHost &&
        gameId === 'trivia-time' &&
        session.current?.phase !== 'in-game'
      ) {
        session.updateGameState({ kind: 'trivia-setup', settings: next });
      }
    },
    [gameId, isHost, session, triviaSettings],
  );

  useEffect(() => {
    if (
      !isHost ||
      gameId !== 'trivia-time' ||
      session.current?.phase !== 'lobby' ||
      gameplay?.kind === 'trivia-setup'
    ) {
      return;
    }
    session.updateGameState({ kind: 'trivia-setup', settings: triviaSettings });
  }, [gameId, gameplay, isHost, session, triviaSettings]);

  const openImposterVote = useCallback(() => {
    if (!isHost || gameplay?.kind !== 'imposter') {
      return;
    }
    session.updateGameState({
      kind: 'imposter',
      state: startImposterVote(gameplay.state),
    });
  }, [gameplay, isHost, session]);

  const revealImposter = useCallback(() => {
    if (!isHost || gameplay?.kind !== 'imposter') {
      return;
    }
    session.updateGameState({
      kind: 'imposter',
      state: revealImposterVote(gameplay.state),
    });
  }, [gameplay, isHost, session]);

  const skipGuess = useCallback(() => {
    if (!isHost || gameplay?.kind !== 'imposter') {
      return;
    }
    session.updateGameState({
      kind: 'imposter',
      state: skipImposterGuess(gameplay.state),
    });
  }, [gameplay, isHost, session]);

  const voteImposter = useCallback(
    (targetPlayerId: string) => {
      if (gameplay?.kind !== 'imposter' || gameplay.state.phase !== 'vote') {
        return;
      }
      if (isHost) {
        session.updateGameState({
          kind: 'imposter',
          state: castImposterVote(gameplay.state, localPlayerId, targetPlayerId),
        });
        return;
      }
      sendAction({
        kind: 'imposter-vote',
        playerId: localPlayerId,
        targetPlayerId,
        round: gameplay.state.round,
      });
    },
    [gameplay, isHost, localPlayerId, sendAction, session],
  );

  const guessImposterWord = useCallback(
    (wordId: string) => {
      if (gameplay?.kind !== 'imposter' || gameplay.state.phase !== 'guess') {
        return;
      }
      if (isHost) {
        session.updateGameState({
          kind: 'imposter',
          state: imposterGuess(gameplay.state, localPlayerId, wordId),
        });
        return;
      }
      sendAction({
        kind: 'imposter-guess',
        playerId: localPlayerId,
        wordId,
        round: gameplay.state.round,
      });
    },
    [gameplay, isHost, localPlayerId, sendAction, session],
  );

  // Host: apply guests' imposter votes and guesses.
  useEffect(() => {
    if (!isHost || gameplay?.kind !== 'imposter') {
      return;
    }
    const pending = session.playerActions.filter(
      action =>
        (action.kind === 'imposter-vote' || action.kind === 'imposter-guess') &&
        action.round === gameplay.state.round &&
        !appliedIds.includes(action.id),
    );
    if (pending.length === 0) {
      return;
    }
    const state = pending.reduce((next, action) => {
      if (action.kind === 'imposter-vote') {
        return castImposterVote(next, action.playerId, action.targetPlayerId);
      }
      if (action.kind === 'imposter-guess') {
        return imposterGuess(next, action.playerId, action.wordId);
      }
      return next;
    }, gameplay.state);
    session.updateGameState(
      { kind: 'imposter', state },
      pending.map(action => action.id),
    );
  }, [appliedIds, gameplay, isHost, session]);

  // Host: reveal automatically once every connected player in the round voted.
  useEffect(() => {
    if (
      !isHost ||
      gameplay?.kind !== 'imposter' ||
      gameplay.state.phase !== 'vote'
    ) {
      return;
    }
    if (
      allImposterVotesIn(
        gameplay.state,
        connectedPlayers.map(player => player.id),
      )
    ) {
      session.updateGameState({
        kind: 'imposter',
        state: revealImposterVote(gameplay.state),
      });
    }
  }, [connectedPlayers, gameplay, isHost, session]);

  const answerTrivia = useCallback(
    (optionIndex: number) => {
      if (gameplay?.kind !== 'trivia-time') {
        return;
      }
      const answeredAtMs = Date.now();
      if (isHost) {
        session.updateGameState({
          kind: 'trivia-time',
          round: answerTriviaQuestion(
            withTriviaPlayer(gameplay.round, me),
            localPlayerId,
            optionIndex,
            answeredAtMs,
          ),
        });
        return;
      }
      sendAction({
        kind: 'trivia-answer',
        playerId: localPlayerId,
        optionIndex,
        questionIndex: gameplay.round.currentIndex,
        answeredAtMs,
      });
    },
    [gameplay, isHost, localPlayerId, me, sendAction, session],
  );

  useEffect(() => {
    if (!isHost || gameplay?.kind !== 'trivia-time') {
      return;
    }
    const appliedActionIds = session.current?.appliedActionIds ?? [];
    const pendingAnswerActions = session.playerActions.filter(
      action =>
        action.kind === 'trivia-answer' &&
        action.questionIndex === gameplay.round.currentIndex &&
        !appliedActionIds.includes(action.id),
    ) as Array<Extract<GameSessionPlayerAction, { kind: 'trivia-answer' }>>;
    if (pendingAnswerActions.length === 0) {
      return;
    }
    const round = pendingAnswerActions.reduce(
      (nextRound, action) =>
        answerTriviaQuestion(
          withTriviaPlayer(
            nextRound,
            players.find(player => player.id === action.playerId) ?? null,
          ),
          action.playerId,
          action.optionIndex,
          action.answeredAtMs,
        ),
      gameplay.round,
    );
    session.updateGameState(
      { kind: 'trivia-time', round },
      pendingAnswerActions.map(action => action.id),
    );
  }, [gameplay, isHost, players, session]);

  const revealTrivia = useCallback(() => {
    if (!isHost || gameplay?.kind !== 'trivia-time') {
      return;
    }
    session.updateGameState({
      kind: 'trivia-time',
      round: revealTriviaQuestion(gameplay.round),
    });
  }, [gameplay, isHost, session]);

  const nextTrivia = useCallback(() => {
    if (!isHost || gameplay?.kind !== 'trivia-time') {
      return;
    }
    session.updateGameState({
      kind: 'trivia-time',
      round: advanceTriviaQuestion(gameplay.round, Date.now()),
    });
  }, [gameplay, isHost, session]);


  const chooseQuarterMile = useCallback(
    (choice: 'take' | 'leave') => {
      if (gameplay?.kind !== 'quarter-mile') {
        return;
      }
      const turnIndex = gameplay.state.turnIndex;
      if (isHost) {
        session.updateGameState({
          kind: 'quarter-mile',
          state: applyQuarterMileChoice(gameplay.state, localPlayerId, choice),
        });
        return;
      }
      sendAction({
        kind: 'quarter-mile-choice',
        playerId: localPlayerId,
        turnIndex,
        choice,
      });
    },
    [gameplay, isHost, localPlayerId, sendAction, session],
  );

  const nextQuarterMile = useCallback(() => {
    if (!isHost || gameplay?.kind !== 'quarter-mile') {
      return;
    }
    session.updateGameState({
      kind: 'quarter-mile',
      state: advanceQuarterMileTurn(gameplay.state),
    });
  }, [gameplay, isHost, session]);

  const finishIcebreakerTurn = useCallback(() => {
    if (gameplay?.kind !== 'icebreakers' || !gameplay.current) {
      return;
    }
    if (gameplay.current.player.id !== localPlayerId && !isHost) {
      return;
    }
    if (isHost) {
      session.updateGameState({
        kind: 'icebreakers',
        current: nextIcebreakerRound({
          players: connectedPlayers,
          prompts: icebreakerPrompts,
          previous: gameplay.current,
        }),
      });
      return;
    }
    sendAction({
      kind: 'icebreaker-next',
      playerId: localPlayerId,
      round: gameplay.current.round,
    });
  }, [
    connectedPlayers,
    gameplay,
    icebreakerPrompts,
    isHost,
    localPlayerId,
    sendAction,
    session,
  ]);

  // Host: when the spotlighted guest taps Done, move to the next person.
  useEffect(() => {
    if (!isHost || gameplay?.kind !== 'icebreakers' || !gameplay.current) {
      return;
    }
    const current = gameplay.current;
    const action = session.playerActions.find(
      item =>
        item.kind === 'icebreaker-next' &&
        item.round === current.round &&
        item.playerId === current.player.id &&
        !appliedIds.includes(item.id),
    );
    if (!action) {
      return;
    }
    session.updateGameState(
      {
        kind: 'icebreakers',
        current: nextIcebreakerRound({
          players: connectedPlayers,
          prompts: icebreakerPrompts,
          previous: current,
        }),
      },
      action.id,
    );
  }, [appliedIds, connectedPlayers, gameplay, icebreakerPrompts, isHost, session]);

  const nextIcebreaker = useCallback(() => {
    if (!isHost || gameplay?.kind !== 'icebreakers') {
      return;
    }
    session.updateGameState({
      kind: 'icebreakers',
      current: nextIcebreakerRound({
        players: connectedPlayers,
        prompts: icebreakerPrompts,
        previous: gameplay.current ?? undefined,
      }),
    });
  }, [connectedPlayers, gameplay, icebreakerPrompts, isHost, session]);

  useEffect(() => {
    if (!isHost || gameplay?.kind !== 'trivia-time') {
      return undefined;
    }
    if (gameplay.round.phase === 'question') {
      const everyoneAnswered =
        connectedPlayers.length > 0 &&
        connectedPlayers.every(player => gameplay.round.answers[player.id]);
      if (everyoneAnswered) {
        const early = setTimeout(revealTrivia, 800);
        return () => clearTimeout(early);
      }
      const timeoutMs = Math.max(
        0,
        gameplay.round.questionStartedAtMs +
          gameplay.round.settings.secondsPerQuestion * 1000 -
          Date.now(),
      );
      const timeout = setTimeout(revealTrivia, timeoutMs);
      return () => clearTimeout(timeout);
    }
    if (gameplay.round.phase === 'reveal') {
      const timeout = setTimeout(nextTrivia, 4000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [connectedPlayers, gameplay, isHost, nextTrivia, revealTrivia]);


  useEffect(() => {
    if (!isHost || gameplay?.kind !== 'quarter-mile') {
      return;
    }
    const pending = session.playerActions.filter(
      action =>
        action.kind === 'quarter-mile-choice' &&
        action.turnIndex === gameplay.state.turnIndex &&
        !(session.current?.appliedActionIds ?? []).includes(action.id),
    );
    if (pending.length === 0) {
      return;
    }
    const action = pending[0];
    if (action.kind !== 'quarter-mile-choice') {
      return;
    }
    session.updateGameState(
      {
        kind: 'quarter-mile',
        state: applyQuarterMileChoice(
          gameplay.state,
          action.playerId,
          action.choice,
        ),
      },
      action.id,
    );
  }, [gameplay, isHost, session]);

  const leave = useCallback(() => {
    session.leaveCurrent();
    navigation.goBack();
  }, [navigation, session]);

  const [codeCopied, setCodeCopied] = useState(false);
  const roomCode = session.current?.code;
  const copyRoomCode = useCallback(() => {
    if (!roomCode) {
      return;
    }
    Clipboard.setString(roomCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  }, [roomCode]);

  const shareRoom = useCallback(() => {
    if (!roomCode) {
      return;
    }
    const link = buildGameRoomLink(roomCode);
    Share.share({
      message: t('games.shareRoomMessage', {
        game: String(game.name),
        link,
        code: roomCode,
      }),
    }).catch(error => appLogger.error('games.shareRoom failed', error));
  }, [game.name, roomCode, t]);

  return {
    t,
    game,
    codeCopied,
    copyRoomCode,
    shareRoom,
    contentLoading: contentQuery.isLoading,
    contentError: contentQuery.isError,
    contentEmpty: !contentQuery.isLoading && !gameContent,
    refetchContent: contentQuery.refetch,
    triviaPacks,
    quarterMilePacks,
    selectedQuarterMilePackId: selectedQuarterMilePack?.id ?? null,
    selectQuarterMilePack: setQuarterMilePackId,
    formatQuarterMileScore: (score: number | null | undefined) =>
      formatQuarterMileScore(
        score,
        quarterMilePackUnit(
          quarterMilePacks,
          gameplay?.kind === 'quarter-mile' ? gameplay.state?.packId : undefined,
        ),
      ),
    quarterMileCurrentPackName:
      gameplay?.kind === 'quarter-mile'
        ? localizeText(
            quarterMilePacks.find(pack => pack.id === gameplay.state.packId)?.name,
            language,
          )
        : '',
    current: session.current,
    players,
    connectedPlayers,
    canStart,
    canStartNext: isHost && connectedPlayers.length >= requiredConnectedPlayers,
    gameplay,
    me,
    isHost,
    localPlayerId,
    requiredConnectedPlayers,
    imposter,
    amInImposterRound,
    amImposter,
    myImposterVote,
    myPendingImposterVote,
    myPendingImposterGuess,
    imposterVoteCounts,
    imposterLeaderboard: imposter ? imposterLeaderboard(imposter) : [],
    openImposterVote,
    revealImposter,
    skipGuess,
    voteImposter,
    guessImposterWord,
    triviaSecondsLeft,
    triviaAnsweredCount,
    quarterMileSpectator,
    myPendingIcebreakerNext,
    finishIcebreakerTurn,
    myPendingTriviaAnswer,
    canSeeIcebreakerPrompt,
    triviaSettings,
    currentTriviaSettings,
    updateTriviaSetting,
    answerTrivia,
    revealTrivia,
    nextTrivia,
    nextIcebreaker,
    chooseQuarterMile,
    nextQuarterMile,
    quarterMileActivePlayerId:
      gameplay?.kind === 'quarter-mile'
        ? currentQuarterMilePlayerId(gameplay.state)
        : null,
    quarterMileScores:
      gameplay?.kind === 'quarter-mile' ? quarterMileScores(gameplay.state) : [],
    quarterMileWinner:
      gameplay?.kind === 'quarter-mile' ? quarterMileWinner(gameplay.state) : null,
    triviaLeaderboard:
      gameplay?.kind === 'trivia-time' ? triviaLeaderboard(gameplay.round) : [],
    triviaWinner:
      gameplay?.kind === 'trivia-time' ? triviaWinner(gameplay.round) : null,
    gameSummary,
    start,
    leave,
  };
}
