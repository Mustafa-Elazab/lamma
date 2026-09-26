import type { Attendee, LammaEvent, RSVPStatus } from './core/entity';

export type GuestGroups = {
  hosts: Attendee[];
  family: Attendee[];
  friends: Attendee[];
};

/**
 * Splits attendees into host/family/friend groups for a given RSVP filter.
 * The event creator is always "going", so it only appears on the Going tab;
 * co-hosts are filtered by their own RSVP like everyone else.
 */
export function groupGuests(
  event: LammaEvent,
  rsvp: RSVPStatus,
): GuestGroups {
  const hostSynthetic: Attendee = {
    id: `host_${event.hostId}`,
    name: event.hostName,
    photoURL: event.hostPhoto,
    rsvp: 'going',
    relation: 'host',
    note: null,
    plusOnes: 0,
  };
  const others = event.attendees.filter(
    a => a.relation !== 'host' && a.id !== event.hostId,
  );
  const cohosts = others.filter(
    a => a.relation === 'cohost' && a.rsvp === rsvp,
  );
  const family = others.filter(
    a => a.relation === 'family' && a.rsvp === rsvp,
  );
  const friends = others.filter(
    a => a.relation === 'friend' && a.rsvp === rsvp,
  );
  return {
    hosts: rsvp === 'going' ? [hostSynthetic, ...cohosts] : cohosts,
    family,
    friends,
  };
}

/** Number of people in the groups, counting each guest's plus-ones. */
export function countGroupPeople(groups: GuestGroups): number {
  return [...groups.hosts, ...groups.family, ...groups.friends].reduce(
    (sum, guest) => sum + 1 + Math.max(0, guest.plusOnes),
    0,
  );
}

export function countByRsvp(event: LammaEvent, rsvp: RSVPStatus): number {
  return event.attendees.filter(a => a.rsvp === rsvp).length;
}
