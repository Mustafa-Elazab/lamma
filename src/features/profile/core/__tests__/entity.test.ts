import { needsProfileSetup, normalizeProfile } from '../entity';
import { LocalUserProfileRepository } from '../localRepository';

describe('profile entity', () => {
  it('asks for setup only without a name and before save/skip', () => {
    expect(needsProfileSetup({ displayName: null, setupCompleted: false })).toBe(true);
    expect(needsProfileSetup({ displayName: '  ', setupCompleted: false })).toBe(true);
    expect(needsProfileSetup({ displayName: 'Mona', setupCompleted: false })).toBe(false);
    expect(needsProfileSetup({ displayName: null, setupCompleted: true })).toBe(false);
  });

  it('normalizes stored documents', () => {
    expect(normalizeProfile(null).setupCompleted).toBe(false);
    const p = normalizeProfile({
      displayName: ' Mona ',
      photoDataUrl: 'https://not-inline.example/x.jpg',
      setupCompleted: true,
    });
    expect(p.displayName).toBe('Mona');
    expect(p.photoDataUrl).toBeNull();
    expect(p.setupCompleted).toBe(true);
  });

  it('saves and merges profile patches locally', async () => {
    const repo = new LocalUserProfileRepository();
    await repo.save('u1', { displayName: 'Mona' });
    const saved = await repo.save('u1', {
      photoDataUrl: 'data:image/jpeg;base64,abc',
      setupCompleted: true,
    });
    expect(saved.displayName).toBe('Mona');
    expect(saved.photoDataUrl).toBe('data:image/jpeg;base64,abc');
    expect((await repo.get('u1')).setupCompleted).toBe(true);
  });
});
