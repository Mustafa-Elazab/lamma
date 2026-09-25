import {
  buildGuestSession,
  isGuestSession,
  isGuestTokenExpired,
} from '../guestSession';

describe('guest session', () => {
  it('builds a session snapshot from a Firebase ID token result', () => {
    const session = buildGuestSession({
      uid: 'anon_1',
      idToken: 'token',
      expirationTime: '2030-01-01T00:00:00.000Z',
      refreshToken: '',
      now: 1,
    });
    expect(session).toEqual({
      uid: 'anon_1',
      idToken: 'token',
      expiresAt: Date.parse('2030-01-01T00:00:00.000Z'),
      refreshToken: null,
      savedAt: 1,
    });
    expect(isGuestSession(session)).toBe(true);
    expect(isGuestTokenExpired(session, Date.parse('2029-12-31'))).toBe(false);
    expect(isGuestTokenExpired(session, Date.parse('2030-01-02'))).toBe(true);
  });

  it('rejects malformed stored values', () => {
    expect(isGuestSession(null)).toBe(false);
    expect(isGuestSession({ uid: '', idToken: 'x', expiresAt: 1, savedAt: 1 })).toBe(false);
    expect(isGuestSession({ uid: 'a', idToken: 1 })).toBe(false);
  });
});
