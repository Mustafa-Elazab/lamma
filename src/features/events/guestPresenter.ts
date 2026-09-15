import type { Attendee, LammaEvent, RSVPStatus } from './core/entity';

export type GuestGroups = {
  hosts: Attendee[];
  family: Attendee[];
  friends: Attendee[];
};

/** Splits attendees into host/family/friend groups for a given RSVP filter. */
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
  const cohosts = event.attendees.filter(a => a.relation === 'cohost');
  const family = event.attendees.filter(
    a => a.relation === 'family' && a.rsvp === rsvp,
  );
  const friends = event.attendees.filter(
    a => a.relation === 'friend' && a.rsvp === rsvp,
  );
  return {
    hosts: [hostSynthetic, ...cohosts],
    family,
    friends,
  };
}

export function countByRsvp(event: LammaEvent, rsvp: RSVPStatus): number {
  return event.attendees.filter(a => a.rsvp === rsvp).length;
}
