import { displayNameOrGuest, isGuest, type AuthUser } from '../entity';

const guest: AuthUser = {
  uid: 'guest_1',
  displayName: null,
  email: null,
  photoURL: null,
  isAnonymous: true,
  providers: ['anonymous'],
};

const member: AuthUser = {
  uid: 'user_1',
  displayName: 'Mostafa Elazab',
  email: 'mostafa@lamma.app',
  photoURL: null,
  isAnonymous: false,
  providers: ['google'],
};

describe('auth entity helpers', () => {
  it('detects guests', () => {
    expect(isGuest(guest)).toBe(true);
    expect(isGuest(member)).toBe(false);
    expect(isGuest(null)).toBe(false);
  });

  it('falls back to guest label for anonymous users', () => {
    expect(displayNameOrGuest(guest, 'Guest')).toBe('Guest');
    expect(displayNameOrGuest(null, 'Guest')).toBe('Guest');
    expect(displayNameOrGuest(member, 'Guest')).toBe('Mostafa Elazab');
    expect(
      displayNameOrGuest({ ...guest, displayName: 'Nour' }, 'Guest'),
    ).toBe('Nour');
  });
});
