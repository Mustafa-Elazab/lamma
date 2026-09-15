import type { EventThemeKey } from '../../events';

export type NotificationPreferences = {
  reminders: boolean;
  rsvps: boolean;
  updates: boolean;
  invites: boolean;
};

export type AppearanceMode = 'light' | 'dark' | 'system';

export type Preferences = {
  notifications: NotificationPreferences;
  appearance: AppearanceMode;
  savedThemes: EventThemeKey[];
};

export const DEFAULT_PREFERENCES: Preferences = {
  notifications: {
    reminders: true,
    rsvps: true,
    updates: true,
    invites: true,
  },
  appearance: 'light',
  savedThemes: ['wedding', 'travel'],
};

export function toggleTheme(
  saved: EventThemeKey[],
  theme: EventThemeKey,
): EventThemeKey[] {
  return saved.includes(theme)
    ? saved.filter(t => t !== theme)
    : [...saved, theme];
}
