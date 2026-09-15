import { buildEventDeepLink, linking } from '../linking';

describe('deep linking', () => {
  it('builds canonical event links', () => {
    expect(buildEventDeepLink('abc123')).toBe('https://lamma.app/e/abc123');
  });

  it('registers the lamma.app prefixes', () => {
    expect(linking.prefixes).toContain('https://lamma.app');
    expect(linking.prefixes).toContain('lamma://');
  });

  it('maps event details to e/:eventId', () => {
    const screens = linking.config?.screens;
    expect(screens?.EventDetails).toBe('e/:eventId');
  });
});
