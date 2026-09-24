export function scoreTriviaAnswer(params: {
  correct: boolean;
  answeredAtMs: number;
  questionStartedAtMs: number;
  timeLimitSeconds: number;
}): number {
  if (!params.correct) {
    return 0;
  }
  const elapsed = Math.max(0, params.answeredAtMs - params.questionStartedAtMs);
  const timeLimitMs = params.timeLimitSeconds * 1000;
  const remainingRatio = Math.max(0, timeLimitMs - elapsed) / timeLimitMs;
  return 1000 + Math.round(500 * remainingRatio);
}

export type TriviaSettings = {
  packId: string;
  questionCount: 5 | 10 | 15;
  secondsPerQuestion: number;
  prize?: string;
};

export const DEFAULT_TRIVIA_SETTINGS: TriviaSettings = {
  packId: 'general',
  questionCount: 5,
  secondsPerQuestion: 15,
};
