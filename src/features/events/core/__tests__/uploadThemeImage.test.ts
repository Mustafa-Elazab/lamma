import { eventThemeStoragePath } from '../uploadThemeImage';

describe('eventThemeStoragePath', () => {
  it('matches storage.rules /events/{uid}/{allPaths=**}', () => {
    expect(eventThemeStoragePath('abcUID', 1700000000000)).toBe(
      'events/abcUID/themes/1700000000000.jpg',
    );
  });
});
