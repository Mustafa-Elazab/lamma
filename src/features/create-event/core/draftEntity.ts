import type {
  EventCategory,
  EventThemeKey,
  EventVisibility,
} from '../../events';
import { CATEGORY_TO_THEME } from '../../events';
import type { CreateEventInput } from '../../events';

export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 250;
export const DEFAULT_TIMEZONE = 'Africa/Cairo';
export const DEFAULT_TIMEZONE_LABEL = 'Eastern European Time (EET)';

export type EventDraft = {
  id: string;
  title: string;
  category: EventCategory | null;
  description: string;
  startAt: number | null;
  endAt: number | null;
  timezone: string;
  venueName: string;
  areaAddress: string;
  themeKey: EventThemeKey;
  visibility: EventVisibility;
  step: number;
  updatedAt: number;
};

export function createEmptyDraft(id: string): EventDraft {
  return {
    id,
    title: '',
    category: null,
    description: '',
    startAt: null,
    endAt: null,
    timezone: DEFAULT_TIMEZONE,
    venueName: '',
    areaAddress: '',
    themeKey: 'generic',
    visibility: 'private',
    step: 0,
    updatedAt: Date.now(),
  };
}

/** Resolves the theme to use for the draft, following the category default. */
export function resolveDraftTheme(draft: EventDraft): EventThemeKey {
  if (draft.themeKey !== 'generic') {
    return draft.themeKey;
  }
  return draft.category ? CATEGORY_TO_THEME[draft.category] : 'generic';
}

export function draftToCreateInput(
  draft: EventDraft,
): CreateEventInput | null {
  if (
    !draft.title.trim() ||
    !draft.category ||
    draft.startAt === null ||
    draft.endAt === null ||
    !draft.venueName.trim() ||
    !draft.areaAddress.trim()
  ) {
    return null;
  }
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category,
    themeKey: resolveDraftTheme(draft),
    startAt: draft.startAt,
    endAt: draft.endAt,
    timezone: draft.timezone,
    venueName: draft.venueName.trim(),
    areaAddress: draft.areaAddress.trim(),
    visibility: draft.visibility,
  };
}

export function isDraftEmpty(draft: EventDraft): boolean {
  return (
    !draft.title.trim() &&
    !draft.category &&
    !draft.description.trim() &&
    draft.startAt === null &&
    !draft.venueName.trim() &&
    !draft.areaAddress.trim()
  );
}
