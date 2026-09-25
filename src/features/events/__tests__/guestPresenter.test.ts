import { buildSeedEvents } from '../testFixtures';
import { countByRsvp, countGroupPeople, groupGuests } from '../guestPresenter';

describe('guest presenter', () => {
  const wedding = buildSeedEvents().find(
    e => e.id === 'evt_wedding_mohamed_sara',
  )!;

  it('includes the host in the hosts group on the Going tab', () => {
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

  it('does not show the host on the Maybe / Declined tabs', () => {
    const maybe = groupGuests(wedding, 'maybe');
    expect(maybe.hosts.some(a => a.relation === 'host')).toBe(false);
    expect(
      [...maybe.hosts, ...maybe.family, ...maybe.friends].every(
        a => a.rsvp === 'maybe',
      ),
    ).toBe(true);
  });

  it('shows an empty Maybe tab when only the host is going', () => {
    const hostOnly = { ...wedding, attendees: [] };
    expect(countGroupPeople(groupGuests(hostOnly, 'going'))).toBe(1);
    expect(countGroupPeople(groupGuests(hostOnly, 'maybe'))).toBe(0);
    expect(countGroupPeople(groupGuests(hostOnly, 'declined'))).toBe(0);
  });
});
