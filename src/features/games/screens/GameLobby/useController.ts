import Clipboard from '@react-native-clipboard/clipboard';
import { Share } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../../auth';
import { useLanguage } from '../../../../app/localization';
import { buildGameRoomLink } from '../../../../navigation/linking';
import type { GamesStackParamList } from '../../../../navigation/types';
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
  MafiosoContent,
  QuarterMilePack,
  TriviaPack,
} from '../../core/types';
import {
  nextIcebreakerRound,
  type IcebreakerRound,
} from '../../icebreakers/engine';
import {
  advanceMafiosoPhase,
  castMafiosoVote,
  createMafiosoState,
  currentMafiosoPhaseSlot,
  revealMafiosoVote,
  type MafiosoState,
} from '../../mafioso/engine';
import { MAFIOSO_PHASE_COUNT, mafiosoRolePlan } from '../../mafioso/rules';
import {
  advanceQuarterMileTurn,
  applyQuarterMileChoice,
  createQuarterMileState,
  currentQuarterMilePlayerId,
  quarterMileScores,
  quarterMileWinner,
  type QuarterMileState,
} from '../../quarter-mile/engine';
import { QUARTER_MILE_PACKS } from '../../quarter-mile/content/packs';
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

const EMPTY_MAFIOSO_PHASES: MafiosoContent['phases'] = [];
const EMPTY_TRIVIA_PACKS: TriviaPack[] = [];
const EMPTY_QUARTER_MILE_PACKS: QuarterMilePack[] = [];
const EMPTY_ICEBREAKER_PROMPTS: IcebreakerPrompt[] = [];
const EMPTY_PLAYERS: GamePlayer[] = [];

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

function getRoleLabel(
  mafioso: MafiosoContent | undefined,
  role: string,
  language: ReturnType<typeof useLanguage>['language'],
): string {
  return localizeText(mafioso?.roles[role]?.label, language) || role;
}

function getRoleDescription(
  mafioso: MafiosoContent | undefined,
  role: string,
  language: ReturnType<typeof useLanguage>['language'],
): string {
  return localizeText(mafioso?.roles[role]?.description, language);
}

type GameplayState =
  | { kind: 'mafioso'; state: MafiosoState }
  | { kind: 'trivia-setup'; settings: TriviaSettings }
  | { kind: 'trivia-time'; round: TriviaRoundState }
  | { kind: 'quarter-mile'; state: QuarterMileState }
  | { kind: 'icebreakers'; current: IcebreakerRound | null };

function isGameplayState(value: unknown): value is GameplayState {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return (
    (value as { kind?: unknown }).kind === 'mafioso' ||
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
  const mafiosoContent = gameContent?.mafioso;
  const mafiosoPhases = mafiosoContent?.phases ?? EMPTY_MAFIOSO_PHASES;
  const triviaPacks = gameContent?.triviaPacks ?? EMPTY_TRIVIA_PACKS;
  const quarterMilePacks =
    (gameContent?.quarterMilePacks?.length
      ? gameContent.quarterMilePacks
      : QUARTER_MILE_PACKS) ?? EMPTY_QUARTER_MILE_PACKS;
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
  const currentTriviaSettings =
    gameplay?.kind === 'trivia-setup' ? gameplay.settings : triviaSettings;
  const me =
    players.find(player => player.id === user?.uid) ??
    players.find(player => !player.isHost) ??
    players[0] ??
    null;
  const isHost = Boolean(me && session.current?.hostId === me.id);
  const requiredConnectedPlayers =
    game.syncType === 'host-led'
      ? Math.min(game.minPlayers, 1)
      : game.minPlayers;
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
  const myMafiosoAssignment =
    gameplay?.kind === 'mafioso' && me
      ? gameplay.state.assignments.find(
          assignment => assignment.playerId === me.id,
        )
      : undefined;
  const mafiosoPhaseIndex =
    gameplay?.kind === 'mafioso'
      ? currentMafiosoPhaseSlot(gameplay.state)
      : -1;
  const mafiosoPhase =
    mafiosoPhaseIndex >= 0
      ? localizeText(mafiosoPhases[mafiosoPhaseIndex], language)
      : null;
  const mafiosoClues = mafiosoContent?.clues ?? [];
  const currentMafiosoClue =
    gameplay?.kind === 'mafioso'
      ? mafiosoClues[gameplay.state.clueIndex % Math.max(mafiosoClues.length, 1)]
      : undefined;
  const mafiosoVoteTargets =
    gameplay?.kind === 'mafioso'
      ? gameplay.state.assignments.filter(
          assignment =>
            !gameplay.state.eliminatedPlayerIds.includes(assignment.playerId),
        )
      : [];
  const myMafiosoVote =
    gameplay?.kind === 'mafioso' && me
      ? gameplay.state.votes[me.id]
      : undefined;
  const myPendingMafiosoVote =
    gameplay?.kind === 'mafioso' && me
      ? session.playerActions.find(
          action =>
            action.kind === 'mafioso-vote' &&
            action.playerId === me.id &&
            action.phaseIndex === gameplay.state.phaseIndex &&
            !(session.current?.appliedActionIds ?? []).includes(action.id),
        )
      : undefined;
  const mafiosoRevealedAssignment =
    gameplay?.kind === 'mafioso' && gameplay.state.lastRevealedPlayerId
      ? gameplay.state.assignments.find(
          assignment =>
            assignment.playerId === gameplay.state.lastRevealedPlayerId,
        )
      : undefined;
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
    Boolean(me && gameplay.current?.player.id === me.id);

  const gameSummary = useMemo(() => {
    if (gameId === 'mafioso') {
      const phaseLabels = mafiosoPhases
        .map(phase => localizeText(phase, language))
        .filter(Boolean);
      return {
        title: t('games.mafiosoSetup'),
        lines: [
          t('games.mafiosoRoleCount', {
            count: mafiosoRolePlan(
              Math.max(requiredConnectedPlayers, connectedPlayers.length),
            ).length,
          }),
          phaseLabels.join(' · '),
        ],
      };
    }
        if (gameId === 'quarter-mile') {
      const pack = quarterMilePacks[0];
      return {
        title: t('games.quarterMileSetup'),
        lines: [
          t('games.quarterMileHint'),
          pack
            ? `${localizeText(pack.name, language)} · ${pack.items.length}`
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
    connectedPlayers.length,
    currentTriviaSettings,
    gameId,
    icebreakerPrompts.length,
    language,
    mafiosoPhases,
    requiredConnectedPlayers,
    t,
    triviaPacks,
    quarterMilePacks,
  ]);

  const start = useCallback(() => {
    if (!isHost) {
      return;
    }
    if (gameId === 'mafioso') {
      session.startCurrent({
        kind: 'mafioso',
        state: createMafiosoState(connectedPlayers),
      });
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
      return;
    }
    if (gameId === 'quarter-mile') {
      const pack = quarterMilePacks[0];
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
  }, [
    connectedPlayers,
    currentTriviaSettings,
    gameId,
    icebreakerPrompts,
    isHost,
    quarterMilePacks,
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

  const advanceMafioso = useCallback(() => {
    if (!isHost || gameplay?.kind !== 'mafioso') {
      return;
    }
    const phaseCount = Math.max(
      mafiosoPhases.length,
      MAFIOSO_PHASE_COUNT,
    );
    if (gameplay.state.phaseIndex % phaseCount === 3) {
      session.updateGameState({
        kind: 'mafioso',
        state: revealMafiosoVote(gameplay.state),
      });
      return;
    }
    session.updateGameState({
      kind: 'mafioso',
      state: advanceMafiosoPhase(gameplay.state),
    });
  }, [gameplay, isHost, mafiosoPhases.length, session]);

  const voteMafioso = useCallback(
    (targetPlayerId: string) => {
      if (gameplay?.kind !== 'mafioso' || !me || mafiosoPhaseIndex !== 3) {
        return;
      }
      session
        .submitPlayerAction({
          kind: 'mafioso-vote',
          playerId: me.id,
          targetPlayerId,
          phaseIndex: gameplay.state.phaseIndex,
        })
        .catch(() => undefined);
    },
    [gameplay, mafiosoPhaseIndex, me, session],
  );

  const answerTrivia = useCallback(
    (optionIndex: number) => {
      if (gameplay?.kind !== 'trivia-time' || !me) {
        return;
      }
      const answeredAtMs = Date.now();
      if (isHost) {
        session.updateGameState({
          kind: 'trivia-time',
          round: answerTriviaQuestion(
            gameplay.round,
            me.id,
            optionIndex,
            answeredAtMs,
          ),
        });
        return;
      }
      session
        .submitPlayerAction({
          kind: 'trivia-answer',
          playerId: me.id,
          optionIndex,
          questionIndex: gameplay.round.currentIndex,
          answeredAtMs,
        })
        .catch(() => undefined);
    },
    [gameplay, isHost, me, session],
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
          nextRound,
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
  }, [gameplay, isHost, session]);

  useEffect(() => {
    if (!isHost || gameplay?.kind !== 'mafioso') {
      return;
    }
    const appliedActionIds = session.current?.appliedActionIds ?? [];
    const pendingVoteActions = session.playerActions.filter(
      action =>
        action.kind === 'mafioso-vote' &&
        action.phaseIndex === gameplay.state.phaseIndex &&
        !appliedActionIds.includes(action.id),
    ) as Array<Extract<GameSessionPlayerAction, { kind: 'mafioso-vote' }>>;
    if (pendingVoteActions.length === 0) {
      return;
    }
    const state = pendingVoteActions.reduce(
      (nextState, action) =>
        castMafiosoVote(nextState, action.playerId, action.targetPlayerId),
      gameplay.state,
    );
    session.updateGameState(
      { kind: 'mafioso', state },
      pendingVoteActions.map(action => action.id),
    );
  }, [gameplay, isHost, session]);

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
      if (!me || gameplay?.kind !== 'quarter-mile') {
        return;
      }
      const turnIndex = gameplay.state.turnIndex;
      if (isHost) {
        session.updateGameState({
          kind: 'quarter-mile',
          state: applyQuarterMileChoice(gameplay.state, me.id, choice),
        });
        return;
      }
      void session.submitPlayerAction({
        kind: 'quarter-mile-choice',
        playerId: me.id,
        turnIndex,
        choice,
      });
    },
    [gameplay, isHost, me, session],
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
  }, [gameplay, isHost, nextTrivia, revealTrivia]);


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
    current: session.current,
    players,
    connectedPlayers,
    canStart,
    gameplay,
    me,
    isHost,
    myMafiosoAssignment,
    mafiosoPhaseIndex,
    mafiosoVoteTargets,
    myMafiosoVote,
    myPendingMafiosoVote,
    mafiosoRevealedAssignment,
    mafiosoPhase,
    currentMafiosoClue,
    mafiosoClueText: currentMafiosoClue
      ? localizeText(currentMafiosoClue.text, language)
      : null,
    mafiosoWinner: gameplay?.kind === 'mafioso' ? gameplay.state.winner : undefined,
    mafiosoRoleLabel: (role: string) =>
      getRoleLabel(mafiosoContent, role, language),
    mafiosoRoleDescription: (role: string) =>
      getRoleDescription(mafiosoContent, role, language),
    myPendingTriviaAnswer,
    canSeeIcebreakerPrompt,
    triviaSettings,
    currentTriviaSettings,
    updateTriviaSetting,
    advanceMafioso,
    voteMafioso,
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
