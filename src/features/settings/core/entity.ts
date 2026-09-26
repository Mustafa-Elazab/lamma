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
};

export const DEFAULT_PREFERENCES: Preferences = {
  notifications: {
    reminders: true,
    rsvps: true,
    updates: true,
    invites: true,
  },
  appearance: 'light',
};
