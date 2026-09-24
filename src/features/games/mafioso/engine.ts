import type { GamePlayer } from '../core/types';
import {
  MAFIOSO_PHASE_COUNT,
  mafiosoMafiaWins,
  mafiosoRolePlan,
  mafiosoTownWins,
  type MafiosoRole,
} from './rules';

export type MafiosoAssignment = {
  playerId: string;
  playerName: string;
  role: MafiosoRole;
};

export type MafiosoState = {
  assignments: MafiosoAssignment[];
  phaseIndex: number;
  /** Which clue from content is active for this loop (0-based). */
  clueIndex: number;
  votes: Record<string, string>;
  eliminatedPlayerIds: string[];
  lastRevealedPlayerId?: string;
  winner?: 'town' | 'mafia';
};

export function createMafiosoState(players: GamePlayer[]): MafiosoState {
  const roles = mafiosoRolePlan(players.length);
  return {
    phaseIndex: 0,
    clueIndex: 0,
    votes: {},
    eliminatedPlayerIds: [],
    assignments: players.map((player, index) => ({
      playerId: player.id,
      playerName: player.name,
      role: roles[index] ?? 'villager',
    })),
  };
}

export function advanceMafiosoPhase(state: MafiosoState): MafiosoState {
  if (state.winner) {
    return state;
  }
  const nextPhaseIndex = state.phaseIndex + 1;
  const wrapped = nextPhaseIndex % MAFIOSO_PHASE_COUNT;
  const completedLoop = nextPhaseIndex > 0 && wrapped === 0;
  return {
    ...state,
    phaseIndex: nextPhaseIndex,
    clueIndex: completedLoop ? state.clueIndex + 1 : state.clueIndex,
    votes: wrapped === 3 ? {} : state.votes,
    lastRevealedPlayerId: wrapped === 4 ? state.lastRevealedPlayerId : undefined,
  };
}

export function castMafiosoVote(
  state: MafiosoState,
  voterId: string,
  targetPlayerId: string,
): MafiosoState {
  if (state.winner || state.votes[voterId]) {
    return state;
  }
  if (state.eliminatedPlayerIds.includes(voterId)) {
    return state;
  }
  if (
    !state.assignments.some(assignment => assignment.playerId === targetPlayerId) ||
    state.eliminatedPlayerIds.includes(targetPlayerId)
  ) {
    return state;
  }
  return {
    ...state,
    votes: { ...state.votes, [voterId]: targetPlayerId },
  };
}

export function revealMafiosoVote(state: MafiosoState): MafiosoState {
  if (state.winner) {
    return state;
  }
  const counts = Object.values(state.votes).reduce<Record<string, number>>(
    (next, targetPlayerId) => ({
      ...next,
      [targetPlayerId]: (next[targetPlayerId] ?? 0) + 1,
    }),
    {},
  );
  const [targetPlayerId] = Object.entries(counts).sort(
    ([leftId, leftCount], [rightId, rightCount]) =>
      rightCount - leftCount || leftId.localeCompare(rightId),
  )[0] ?? [undefined, 0];
  const eliminatedPlayerIds = targetPlayerId
    ? Array.from(new Set([...state.eliminatedPlayerIds, targetPlayerId]))
    : state.eliminatedPlayerIds;
  const next: MafiosoState = {
    ...state,
    phaseIndex: state.phaseIndex + 1,
    eliminatedPlayerIds,
    lastRevealedPlayerId: targetPlayerId,
  };
  if (mafiosoTownWins(next)) {
    return { ...next, winner: 'town' };
  }
  if (mafiosoMafiaWins(next)) {
    return { ...next, winner: 'mafia' };
  }
  return next;
}

export function currentMafiosoPhaseSlot(state: MafiosoState): number {
  return state.phaseIndex % MAFIOSO_PHASE_COUNT;
}
