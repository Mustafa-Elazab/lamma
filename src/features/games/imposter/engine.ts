import type { GamePlayer } from '../core/types';
import type { LocalizedText } from '../core/localized';
import { IMPOSTER_CATEGORIES, type ImposterCategory } from './words';

/**
 * Imposter rules:
 * 1. Everyone except one random player (the imposter) sees the same secret word.
 *    The imposter only sees the category.
 * 2. In speaking order, each player says one short clue about the word.
 * 3. Everyone votes on their own phone for who they think the imposter is
 *    (you can't vote for yourself).
 * 4. Most votes is voted out. A tie, or voting out an innocent player, means the imposter wins.
 * 5. If the imposter is caught, they get one guess at the word. A correct guess steals the win.
 * Scoring: players who voted for the imposter get 1 point when the players win;
 * the imposter gets 2 points when they win.
 */
export const IMPOSTER_MIN_PLAYERS = 3;
export const IMPOSTER_GUESS_OPTIONS = 6;

export type ImposterPhase = 'clues' | 'vote' | 'guess' | 'result';

export type ImposterState = {
  round: number;
  categoryId: string;
  categoryName: LocalizedText;
  wordId: string;
  word: LocalizedText;
  imposterId: string;
  /** Players dealt into this round, in speaking order. */
  playerIds: string[];
  playerNames: Record<string, string>;
  phase: ImposterPhase;
  votes: Record<string, string>;
  votedOutId?: string;
  tie?: boolean;
  guessOptions?: Array<{ id: string; word: LocalizedText }>;
  guessWordId?: string;
  winner?: 'players' | 'imposter';
  scores: Record<string, number>;
  usedWordIds: string[];
};

type Rng = () => number;

function pick<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)]!;
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

export function createImposterRound(params: {
  players: GamePlayer[];
  previous?: ImposterState;
  categories?: ImposterCategory[];
  rng?: Rng;
}): ImposterState {
  const rng = params.rng ?? Math.random;
  const categories = params.categories ?? IMPOSTER_CATEGORIES;
  const used = params.previous?.usedWordIds ?? [];
  const pool = categories.flatMap(category =>
    category.words
      .filter(word => !used.includes(`${category.id}:${word.id}`))
      .map(word => ({ category, word })),
  );
  const choice = pool.length
    ? pick(pool, rng)
    : (() => {
        const category = pick(categories, rng);
        return { category, word: pick(category.words, rng) };
      })();
  const ordered = shuffle(params.players, rng);
  const imposter = pick(ordered, rng);
  const scores: Record<string, number> = { ...(params.previous?.scores ?? {}) };
  ordered.forEach(player => {
    scores[player.id] = scores[player.id] ?? 0;
  });
  return {
    round: (params.previous?.round ?? 0) + 1,
    categoryId: choice.category.id,
    categoryName: choice.category.name,
    wordId: choice.word.id,
    word: choice.word.word,
    imposterId: imposter.id,
    playerIds: ordered.map(player => player.id),
    playerNames: {
      ...(params.previous?.playerNames ?? {}),
      ...Object.fromEntries(ordered.map(p => [p.id, p.name])),
    },
    phase: 'clues',
    votes: {},
    scores,
    usedWordIds: pool.length
      ? [...used, `${choice.category.id}:${choice.word.id}`]
      : [`${choice.category.id}:${choice.word.id}`],
  };
}

export function startImposterVote(state: ImposterState): ImposterState {
  return state.phase === 'clues' ? { ...state, phase: 'vote', votes: {} } : state;
}

export function castImposterVote(
  state: ImposterState,
  voterId: string,
  targetId: string,
): ImposterState {
  if (
    state.phase !== 'vote' ||
    voterId === targetId ||
    state.votes[voterId] ||
    !state.playerIds.includes(voterId) ||
    !state.playerIds.includes(targetId)
  ) {
    return state;
  }
  return { ...state, votes: { ...state.votes, [voterId]: targetId } };
}

export function allImposterVotesIn(
  state: ImposterState,
  connectedIds: string[],
): boolean {
  const voters = state.playerIds.filter(id => connectedIds.includes(id));
  return voters.length > 0 && voters.every(id => Boolean(state.votes[id]));
}

function finish(state: ImposterState, winner: 'players' | 'imposter'): ImposterState {
  const scores = { ...state.scores };
  if (winner === 'imposter') {
    scores[state.imposterId] = (scores[state.imposterId] ?? 0) + 2;
  } else {
    Object.entries(state.votes).forEach(([voterId, targetId]) => {
      if (targetId === state.imposterId) {
        scores[voterId] = (scores[voterId] ?? 0) + 1;
      }
    });
  }
  return { ...state, phase: 'result', winner, scores };
}

export function revealImposterVote(
  state: ImposterState,
  categories: ImposterCategory[] = IMPOSTER_CATEGORIES,
  rng: Rng = Math.random,
): ImposterState {
  if (state.phase !== 'vote') {
    return state;
  }
  const counts: Record<string, number> = {};
  Object.values(state.votes).forEach(target => {
    counts[target] = (counts[target] ?? 0) + 1;
  });
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  const tie = !top || (ranked[1] !== undefined && ranked[1][1] === top[1]);
  if (tie) {
    const tied: ImposterState = { ...state, tie: true };
    delete tied.votedOutId;
    return finish(tied, 'imposter');
  }
  const votedOutId = top[0];
  if (votedOutId !== state.imposterId) {
    return finish({ ...state, votedOutId }, 'imposter');
  }
  const category = categories.find(c => c.id === state.categoryId);
  const others = shuffle(
    (category?.words ?? []).filter(word => word.id !== state.wordId),
    rng,
  ).slice(0, IMPOSTER_GUESS_OPTIONS - 1);
  const guessOptions = shuffle(
    [{ id: state.wordId, word: state.word }, ...others.map(o => ({ id: o.id, word: o.word }))],
    rng,
  );
  return { ...state, votedOutId, phase: 'guess', guessOptions };
}

export function imposterGuess(
  state: ImposterState,
  playerId: string,
  wordId: string,
): ImposterState {
  if (state.phase !== 'guess' || playerId !== state.imposterId) {
    return state;
  }
  const correct = wordId === state.wordId;
  return finish({ ...state, guessWordId: wordId }, correct ? 'imposter' : 'players');
}

/** Host can skip the guess (e.g. imposter left). Counts as a wrong guess. */
export function skipImposterGuess(state: ImposterState): ImposterState {
  return state.phase === 'guess' ? finish(state, 'players') : state;
}

export function imposterLeaderboard(
  state: ImposterState,
): Array<{ playerId: string; name: string; score: number }> {
  return Object.entries(state.scores)
    .map(([playerId, score]) => ({
      playerId,
      name: state.playerNames[playerId] ?? playerId,
      score,
    }))
    .sort((a, b) => b.score - a.score);
}
