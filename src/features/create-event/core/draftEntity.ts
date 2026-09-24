import type {
  EventCategory,
  EventThemeKey,
  EventVisibility,
} from '../../events';
import { CATEGORY_TO_THEME } from '../../events';
import type { CreateEventInput } from '../../events';

export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 250;

export type EventDraft = {
  id: string;
  title: string;
  category: EventCategory | null;
  description: string;
  startAt: number | null;
  endAt: number | null;
  venueName: string;
  areaAddress: string;
  latitude: number | null;
  longitude: number | null;
  themeType: 'preset' | 'custom';
  themeKey: EventThemeKey;
  /**
   * True when the user has tapped a preset swatch, including 'generic'
   * (Minimal). New drafts stay false so the category default applies.
   */
  themeExplicit: boolean;
  /** Local gallery URI while creating. Uploaded to Storage on publish. */
  customThemeUri: string | null;
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
    venueName: '',
    areaAddress: '',
    latitude: null,
    longitude: null,
    themeType: 'preset',
    themeKey: 'generic',
    themeExplicit: false,
    customThemeUri: null,
    visibility: 'private',
    step: 0,
    updatedAt: Date.now(),
  };
}

export function normalizeDraft(raw: Partial<EventDraft> & { id: string }): EventDraft {
  const base = createEmptyDraft(raw.id);
  const merged = { ...base, ...raw };
  const hasCustom = Boolean(merged.customThemeUri);
  return {
    ...merged,
    themeType: hasCustom ? 'custom' : raw.themeType ?? 'preset',
    themeExplicit:
      typeof raw.themeExplicit === 'boolean'
        ? raw.themeExplicit
        : merged.themeKey !== 'generic' && !hasCustom,
    customThemeUri: merged.customThemeUri ?? null,
  };
}

/**
 * Preset theme for the draft. Custom photos are read from `customThemeUri`.
 * Selecting Minimal (`generic`) is a real choice when `themeExplicit` is true.
 */
export function resolveDraftTheme(draft: EventDraft): EventThemeKey {
  if (draft.themeType === 'custom') {
    return draft.themeKey;
  }
  if (draft.themeExplicit) {
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
    venueName: draft.venueName.trim(),
    areaAddress: draft.areaAddress.trim(),
    latitude: draft.latitude,
    longitude: draft.longitude,
    visibility: draft.visibility,
    customThemeUri:
      draft.themeType === 'custom' ? draft.customThemeUri : null,
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
