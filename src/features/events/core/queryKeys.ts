import type { EventCategory, EventListFilter } from './entity';

export const eventKeys = {
  all: ['events'] as const,
  home: (filter: EventListFilter) =>
    [...eventKeys.all, 'home', filter] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
  discover: (query: string, category: EventCategory | null) =>
    [...eventKeys.all, 'discover', query, category ?? 'all'] as const,
};
