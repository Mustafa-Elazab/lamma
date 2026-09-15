import type { EventListFilter } from '../../../events';

export type HomeTab = EventListFilter;

export type HomeTabItem = {
  key: HomeTab;
  label: string;
};
