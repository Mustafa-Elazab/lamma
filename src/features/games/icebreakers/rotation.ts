import type { GamePlayer } from '../core/types';

export function nextIcebreakerPlayer(
  players: GamePlayer[],
  previousPlayerIds: string[],
): GamePlayer | null {
  const connected = players.filter(player => player.connected);
  if (connected.length === 0) {
    return null;
  }
  const unpicked = connected.find(player => !previousPlayerIds.includes(player.id));
  if (unpicked) {
    return unpicked;
  }
  return connected[previousPlayerIds.length % connected.length] ?? connected[0];
}
