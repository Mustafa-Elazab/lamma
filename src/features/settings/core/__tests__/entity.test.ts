import { DEFAULT_PREFERENCES, toggleTheme } from '../entity';

describe('preferences entity', () => {
  it('adds a theme when not saved', () => {
    expect(toggleTheme(['wedding'], 'travel')).toEqual(['wedding', 'travel']);
  });

  it('removes a theme when already saved', () => {
    expect(toggleTheme(['wedding', 'travel'], 'wedding')).toEqual(['travel']);
  });

  it('has sensible defaults', () => {
    expect(DEFAULT_PREFERENCES.appearance).toBe('light');
    expect(DEFAULT_PREFERENCES.notifications.reminders).toBe(true);
  });
});
