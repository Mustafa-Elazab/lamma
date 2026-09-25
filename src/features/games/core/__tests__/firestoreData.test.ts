import {
  castImposterVote,
  createImposterRound,
  revealImposterVote,
  startImposterVote,
} from '../../imposter/engine';
import { QUARTER_MILE_PACKS } from '../../quarter-mile/content/packs';
import {
  advanceQuarterMileTurn,
  applyQuarterMileChoice,
  createQuarterMileState,
} from '../../quarter-mile/engine';
import { stripUndefined } from '../session/firestoreData';
import type { GamePlayer } from '../types';

/** Paths of every undefined value, i.e. what Firestore would reject. */
function undefinedPaths(value: unknown, path = '$'): string[] {
  if (value === undefined) {
    return [path];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => undefinedPaths(item, `${path}[${i}]`));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).flatMap(key =>
      undefinedPaths((value as Record<string, unknown>)[key], `${path}.${key}`),
    );
  }
  return [];
}

const guests: GamePlayer[] = [
  { id: 'anon-host', name: 'Guest', connected: true, isHost: true },
  { id: 'anon-2', name: 'Guest', connected: true, isHost: false },
  { id: 'anon-3', name: 'Guest', connected: true, isHost: false },
  { id: 'anon-4', name: 'Guest', connected: true, isHost: false },
];

describe('stripUndefined (Firestore writes)', () => {
  it('drops undefined fields deeply and nulls undefined array items', () => {
    expect(
      stripUndefined({
        a: 1,
        b: undefined,
        c: { d: undefined, e: 'x', f: [1, undefined, { g: undefined }] },
        h: null,
      }),
    ).toEqual({ a: 1, c: { e: 'x', f: [1, null, {}] }, h: null });
  });

  it('keeps non-plain objects untouched', () => {
    const date = new Date(0);
    expect(stripUndefined({ date }).date).toBe(date);
  });
});

describe('game states are Firestore-safe (regression: guests stuck after "Next pair")', () => {
  it('quarter mile never writes lastChoice: undefined', () => {
    const cars = QUARTER_MILE_PACKS.find(pack => pack.id === 'cars')!;
    let state = createQuarterMileState({ pack: cars, players: guests.slice(0, 2) });
    for (let turn = 0; turn < 5; turn += 1) {
      const current = state.playerOrder[state.turnIndex % 2]!;
      state = applyQuarterMileChoice(state, current, turn % 2 ? 'leave' : 'take');
      expect(undefinedPaths(state)).toEqual([]);
      state = advanceQuarterMileTurn(state);
      expect(undefinedPaths(state)).toEqual([]);
      expect('lastChoice' in state).toBe(false);
    }
  });

  it('imposter tie result has no votedOutId: undefined', () => {
    let state = startImposterVote(createImposterRound({ players: guests, rng: () => 0 }));
    state = castImposterVote(state, 'anon-host', 'anon-2');
    state = castImposterVote(state, 'anon-2', 'anon-host');
    state = castImposterVote(state, 'anon-3', 'anon-4');
    state = castImposterVote(state, 'anon-4', 'anon-3');
    const result = revealImposterVote(state);
    expect(result.tie).toBe(true);
    expect(undefinedPaths(result)).toEqual([]);
  });
});
