import {
  buildEventAppLink,
  buildEventDeepLink,
  eventIdFromLink,
  linking,
  parseIncomingLink,
} from '../linking';

describe('deep linking', () => {
  it('builds canonical Vercel event links', () => {
    expect(buildEventDeepLink('abc123')).toBe(
      'https://lamma-links.vercel.app/e/abc123',
    );
  });

  it('builds the custom-scheme app link', () => {
    expect(buildEventAppLink('abc123')).toBe('lamma://e/abc123');
  });

  it('registers the Vercel and custom-scheme prefixes', () => {
    expect(linking.prefixes).toContain('https://lamma-links.vercel.app');
    expect(linking.prefixes).toContain('lamma://');
  });

  it('maps event details to e/:eventId', () => {
    const screens = linking.config?.screens;
    expect(screens?.EventDetails).toBe('e/:eventId');
  });

  it('maps games into the Games tab stack', () => {
    const mainTabs = linking.config?.screens?.MainTabs;
    expect(mainTabs).toEqual(
      expect.objectContaining({
        screens: expect.objectContaining({
          Games: expect.objectContaining({
            path: 'games',
            screens: expect.objectContaining({
              GamesHub: '',
              GameLobby: ':gameId',
            }),
          }),
        }),
      }),
    );
  });

  it('parses event ids from https and custom-scheme URLs', () => {
    expect(eventIdFromLink('https://lamma-links.vercel.app/e/abc123')).toBe(
      'abc123',
    );
    expect(eventIdFromLink('lamma://e/abc123')).toBe('abc123');
    expect(eventIdFromLink('https://lamma-links.vercel.app/e/abc123/share')).toBe(
      'abc123',
    );
    expect(eventIdFromLink('https://example.com/home')).toBeNull();
    expect(eventIdFromLink('https://lamma.app/e/abc123')).toBeNull();
  });

  it('rejects malformed or hostile event ids without throwing', () => {
    for (const bad of [
      'https://lamma-links.vercel.app/e/',
      'https://lamma-links.vercel.app/e/../../something',
      'https://lamma-links.vercel.app/e/%00',
      'https://lamma-links.vercel.app/e/%E0%A4%A',
      'lamma://e/<script>',
      'https://evil.example/e/abc123',
    ]) {
      expect(eventIdFromLink(bad)).toBeNull();
    }
  });

  it('keeps /e and /g out of React Navigation so they open once, after auth', () => {
    const filter = linking.filter!;
    expect(filter('https://lamma-links.vercel.app/e/abc123')).toBe(false);
    expect(filter('lamma://e/%00')).toBe(false);
    expect(filter('lamma://g/ABCD12')).toBe(false);
    expect(filter('lamma://home')).toBe(true);
  });

  it('parses room and event links into a single pending link', () => {
    expect(parseIncomingLink('lamma://g/abcd12')).toEqual({
      kind: 'room',
      code: 'ABCD12',
    });
    expect(parseIncomingLink('https://lamma-links.vercel.app/e/abc123')).toEqual({
      kind: 'event',
      eventId: 'abc123',
    });
    expect(parseIncomingLink('https://lamma-links.vercel.app/about')).toBeNull();
  });
});
