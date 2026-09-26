import { attendeesFromRsvps, countRsvps } from '../rsvpAttendees';

describe('attendeesFromRsvps', () => {
  const rsvps = {
    host1: 'going' as const,
    a: 'going' as const,
    b: 'maybe' as const,
    c: 'declined' as const,
    d: 'none' as const,
  };

  it('builds attendees from the rsvps map, excluding the host and "none"', () => {
    const list = attendeesFromRsvps({
      rsvps,
      guests: { a: { name: 'Aya' }, b: { name: 'Bassem', photoURL: 'data:image/png;base64,xx' } },
      hostId: 'host1',
    });
    expect(list.map(x => x.id).sort()).toEqual(['a', 'b', 'c']);
    expect(list.find(x => x.id === 'a')?.name).toBe('Aya');
    expect(list.find(x => x.id === 'c')?.name).toBe('Guest');
    // Inline data URIs are never used as guest avatars.
    expect(list.find(x => x.id === 'b')?.photoURL).toBeNull();
    expect(list.find(x => x.id === 'b')?.rsvp).toBe('maybe');
  });

  it('counts rsvps by status', () => {
    expect(countRsvps(rsvps, 'going')).toBe(2);
    expect(countRsvps(rsvps, 'maybe')).toBe(1);
  });
});
