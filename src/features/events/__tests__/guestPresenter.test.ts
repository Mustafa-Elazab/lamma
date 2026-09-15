import { buildSeedEvents } from '../core/seed';
import { countByRsvp, groupGuests } from '../guestPresenter';

describe('guest presenter', () => {
  const wedding = buildSeedEvents().find(
    e => e.id === 'evt_wedding_mohamed_sara',
  )!;

  it('always includes the host in the hosts group', () => {
    const groups = groupGuests(wedding, 'going');
    expect(groups.hosts[0].relation).toBe('host');
    expect(groups.hosts[0].name).toBe('Mohamed');
  });

  it('groups family and friends by the selected rsvp', () => {
    const going = groupGuests(wedding, 'going');
    expect(going.family.every(a => a.rsvp === 'going')).toBe(true);
    expect(going.friends.every(a => a.rsvp === 'going')).toBe(true);

    const declined = groupGuests(wedding, 'declined');
    expect(declined.family.every(a => a.rsvp === 'declined')).toBe(true);
  });

  it('counts attendees by rsvp', () => {
    const going = countByRsvp(wedding, 'going');
    expect(going).toBeGreaterThan(0);
    expect(going).toBeLessThanOrEqual(wedding.attendees.length);
  });
});
