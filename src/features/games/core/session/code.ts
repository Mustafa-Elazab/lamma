import type { GameId } from '../types';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(length = 4): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]!;
  }
  return out;
}

export function roomCodeForGame(gameId: GameId, _now = Date.now()): string {
  const prefix = gameId
    .split('-')
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
  return `${prefix}${randomSuffix(4)}`;
}
