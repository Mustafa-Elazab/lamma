import type { GamePlayer } from '../core/types';
import type { TriviaPack, TriviaQuestion } from '../core/types';
import {
  DEFAULT_TRIVIA_SETTINGS,
  scoreTriviaAnswer,
  type TriviaSettings,
} from './scoring';

export type TriviaPlayerScore = {
  playerId: string;
  name: string;
  score: number;
};

export type TriviaRoundState = {
  settings: TriviaSettings;
  questions: TriviaQuestion[];
  currentIndex: number;
  questionStartedAtMs: number;
  answers: Record<string, { optionIndex: number; answeredAtMs: number }>;
  scores: TriviaPlayerScore[];
  phase: 'question' | 'reveal' | 'finished';
};


function shuffleQuestions(questions: TriviaQuestion[]): TriviaQuestion[] {
  const next = [...questions];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i];
    next[i] = next[j]!;
    next[j] = tmp!;
  }
  return next;
}

export function createTriviaRound(params: {
  pack: TriviaPack;
  players: GamePlayer[];
  settings?: Partial<TriviaSettings>;
  now: number;
}): TriviaRoundState {
  const settings: TriviaSettings = {
    ...DEFAULT_TRIVIA_SETTINGS,
    packId: params.pack.id,
    ...params.settings,
  };
  const shuffled = shuffleQuestions(params.pack.questions);
  return {
    settings,
    questions: shuffled.slice(0, settings.questionCount),
    currentIndex: 0,
    questionStartedAtMs: params.now,
    answers: {},
    scores: params.players.map(player => ({
      playerId: player.id,
      name: player.name,
      score: 0,
    })),
    phase: 'question',
  };
}

export function answerTriviaQuestion(
  state: TriviaRoundState,
  playerId: string,
  optionIndex: number,
  answeredAtMs: number,
): TriviaRoundState {
  if (state.phase !== 'question' || state.answers[playerId]) {
    return state;
  }
  return {
    ...state,
    answers: {
      ...state.answers,
      [playerId]: { optionIndex, answeredAtMs },
    },
  };
}

export function revealTriviaQuestion(
  state: TriviaRoundState,
): TriviaRoundState {
  if (state.phase !== 'question') {
    return state;
  }
  const question = state.questions[state.currentIndex];
  if (!question) {
    return { ...state, phase: 'finished' };
  }
  const scores = state.scores.map(player => {
    const answer = state.answers[player.playerId];
    const delta = answer
      ? scoreTriviaAnswer({
          correct: answer.optionIndex === question.correctIndex,
          answeredAtMs: answer.answeredAtMs,
          questionStartedAtMs: state.questionStartedAtMs,
          timeLimitSeconds: state.settings.secondsPerQuestion,
        })
      : 0;
    return { ...player, score: player.score + delta };
  });
  return { ...state, scores, phase: 'reveal' };
}

export function advanceTriviaQuestion(
  state: TriviaRoundState,
  now: number,
): TriviaRoundState {
  if (state.phase !== 'reveal') {
    return state;
  }
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.questions.length) {
    return { ...state, phase: 'finished' };
  }
  return {
    ...state,
    currentIndex: nextIndex,
    questionStartedAtMs: now,
    answers: {},
    phase: 'question',
  };
}

export function triviaLeaderboard(
  state: TriviaRoundState,
): TriviaPlayerScore[] {
  return [...state.scores].sort((a, b) => b.score - a.score);
}

export function triviaWinner(
  state: TriviaRoundState,
): TriviaPlayerScore | null {
  return triviaLeaderboard(state)[0] ?? null;
}
