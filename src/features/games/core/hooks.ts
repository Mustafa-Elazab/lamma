import { useQuery } from '@tanstack/react-query';

import type { GameId } from './types';
import { fetchGameContent, fetchOneGameContent } from './contentRepository';

const STALE_TIME_MS = 1000 * 60 * 60 * 6;

export const gameContentKeys = {
  all: ['games', 'content'] as const,
  detail: (gameId: GameId) => ['games', 'content', gameId] as const,
};

export function useGamesContent() {
  return useQuery({
    queryKey: gameContentKeys.all,
    queryFn: fetchGameContent,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS * 4,
  });
}

export function useGameContent(gameId: GameId) {
  return useQuery({
    queryKey: gameContentKeys.detail(gameId),
    queryFn: () => fetchOneGameContent(gameId),
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS * 4,
  });
}
