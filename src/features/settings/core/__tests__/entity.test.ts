import { DEFAULT_PREFERENCES } from '../entity';

describe('preferences entity', () => {
  it('has sensible defaults', () => {
    expect(DEFAULT_PREFERENCES.appearance).toBe('light');
    expect(DEFAULT_PREFERENCES.notifications.reminders).toBe(true);
  });
});
