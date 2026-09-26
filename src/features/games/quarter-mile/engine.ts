import type { GamePlayer, QuarterMileItem, QuarterMilePack } from '../core/types';

export type QuarterMileChoice = 'take' | 'leave';

export type QuarterMileOwned = {
  playerId: string;
  item: QuarterMileItem;
  from: 'known' | 'hidden';
};

export type QuarterMileState = {
  packId: string;
  turnIndex: number;
  playerOrder: string[];
  remaining: QuarterMileItem[];
  known: QuarterMileItem | null;
  hidden: QuarterMileItem | null;
  owned: QuarterMileOwned[];
  phase: 'choose' | 'reveal' | 'finished';
  lastChoice?: {
    playerId: string;
    choice: QuarterMileChoice;
    known: QuarterMileItem;
    hidden: QuarterMileItem;
    received: QuarterMileItem;
  };
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

export function createQuarterMileState(params: {
  pack: QuarterMilePack;
  players: GamePlayer[];
}): QuarterMileState {
  const playerOrder = params.players.map(p => p.id);
  const remaining = shuffle(params.pack.items);
  const known = remaining.shift() ?? null;
  const hidden = remaining.shift() ?? null;
  return {
    packId: params.pack.id,
    turnIndex: 0,
    playerOrder,
    remaining,
    known,
    hidden,
    owned: [],
    phase: known && hidden ? 'choose' : 'finished',
  };
}

export function currentQuarterMilePlayerId(
  state: QuarterMileState,
): string | null {
  if (state.phase === 'finished' || state.playerOrder.length === 0) {
    return null;
  }
  return state.playerOrder[state.turnIndex % state.playerOrder.length] ?? null;
}

export function applyQuarterMileChoice(
  state: QuarterMileState,
  playerId: string,
  choice: QuarterMileChoice,
): QuarterMileState {
  if (state.phase !== 'choose' || !state.known || !state.hidden) {
    return state;
  }
  if (currentQuarterMilePlayerId(state) !== playerId) {
    return state;
  }
  const received = choice === 'take' ? state.known : state.hidden;
  const other = choice === 'take' ? state.hidden : state.known;
  const otherPlayerId =
    state.playerOrder.find(id => id !== playerId) ?? playerId;
  const owned: QuarterMileOwned[] = [
    ...state.owned,
    {
      playerId,
      item: received,
      from: choice === 'take' ? 'known' : 'hidden',
    },
    {
      playerId: otherPlayerId,
      item: other,
      from: choice === 'take' ? 'hidden' : 'known',
    },
  ];
  return {
    ...state,
    owned,
    phase: 'reveal',
    lastChoice: {
      playerId,
      choice,
      known: state.known,
      hidden: state.hidden,
      received,
    },
    known: null,
    hidden: null,
  };
}

export function advanceQuarterMileTurn(state: QuarterMileState): QuarterMileState {
  if (state.phase !== 'reveal') {
    return state;
  }
  if (state.remaining.length < 2) {
    return { ...state, phase: 'finished', known: null, hidden: null };
  }
  const remaining = [...state.remaining];
  const known = remaining.shift() ?? null;
  const hidden = remaining.shift() ?? null;
  // Omit lastChoice instead of setting it to undefined (Firestore rejects undefined).
  const rest: QuarterMileState = { ...state };
  delete rest.lastChoice;
  return {
    ...rest,
    remaining,
    known,
    hidden,
    turnIndex: state.turnIndex + 1,
    phase: known && hidden ? 'choose' : 'finished',
  };
}

export function quarterMileScores(
  state: QuarterMileState,
): Array<{ playerId: string; score: number }> {
  const byPlayer = new Map<string, number>();
  for (const id of state.playerOrder) {
    byPlayer.set(id, 0);
  }
  for (const row of state.owned) {
    byPlayer.set(row.playerId, (byPlayer.get(row.playerId) ?? 0) + row.item.score);
  }
  return [...byPlayer.entries()]
    .map(([playerId, score]) => ({ playerId, score }))
    .sort((a, b) => b.score - a.score);
}

export function quarterMileWinner(
  state: QuarterMileState,
): { playerId: string; score: number } | null {
  if (state.phase !== 'finished') {
    return null;
  }
  return quarterMileScores(state)[0] ?? null;
}
