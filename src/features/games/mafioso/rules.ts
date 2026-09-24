export type MafiosoRole = 'mafia' | 'villager';

/** Labels keep Firestore id `mafia` while product copy says Mafioso. */
export const MAFIOSO_ROLES: Record<
  MafiosoRole,
  { label: string; description: string }
> = {
  mafia: {
    label: 'Mafioso',
    description:
      'You are one of the hidden mafiosos. Blend in, steer votes, and survive.',
  },
  villager: {
    label: 'Citizen',
    description:
      'Use clues and discussion to find both mafiosos before they outnumber you.',
  },
};

/** Clue-and-vote loop (matches Egyptian Mafioso shows). */
export const MAFIOSO_PHASES = [
  'Role deal',
  'Clue',
  'Discussion',
  'Vote',
  'Reveal',
] as const;

export const MAFIOSO_PHASE_COUNT = MAFIOSO_PHASES.length;

/**
 * Always 2 mafiosos when there are enough seats (video format), otherwise 1.
 * No night doctor/detective — investigation is clue-driven.
 */
export const MAFIOSO_ROLE_DISTRIBUTION: Record<
  number,
  Record<MafiosoRole, number>
> = {
  4: { mafia: 1, villager: 3 },
  5: { mafia: 2, villager: 3 },
  6: { mafia: 2, villager: 4 },
  7: { mafia: 2, villager: 5 },
  8: { mafia: 2, villager: 6 },
  9: { mafia: 2, villager: 7 },
  10: { mafia: 2, villager: 8 },
  11: { mafia: 2, villager: 9 },
  12: { mafia: 2, villager: 10 },
};

export function mafiosoRolePlan(playerCount: number): MafiosoRole[] {
  const clamped = Math.max(4, Math.min(12, playerCount));
  const dist =
    MAFIOSO_ROLE_DISTRIBUTION[clamped] ?? MAFIOSO_ROLE_DISTRIBUTION[4];
  const roles: MafiosoRole[] = [];
  (Object.keys(dist) as MafiosoRole[]).forEach(role => {
    for (let i = 0; i < dist[role]; i += 1) {
      roles.push(role);
    }
  });
  // Shuffle so mafiosos are not always first seats.
  for (let i = roles.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = roles[i]!;
    roles[i] = roles[j]!;
    roles[j] = tmp;
  }
  while (roles.length < playerCount) {
    roles.push('villager');
  }
  return roles.slice(0, playerCount);
}

export function mafiosoTownWins(state: {
  assignments: Array<{ playerId: string; role: MafiosoRole }>;
  eliminatedPlayerIds: string[];
}): boolean {
  const living = state.assignments.filter(
    a => !state.eliminatedPlayerIds.includes(a.playerId),
  );
  return living.every(a => a.role !== 'mafia');
}

export function mafiosoMafiaWins(state: {
  assignments: Array<{ playerId: string; role: MafiosoRole }>;
  eliminatedPlayerIds: string[];
}): boolean {
  const living = state.assignments.filter(
    a => !state.eliminatedPlayerIds.includes(a.playerId),
  );
  const mafia = living.filter(a => a.role === 'mafia').length;
  const town = living.length - mafia;
  return mafia > 0 && mafia >= town;
}
