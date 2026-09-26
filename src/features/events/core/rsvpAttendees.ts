import type { Attendee, RSVPStatus } from './entity';

/** Public guest card saved next to each RSVP (`guests.{uid}` on the event). */
export type GuestProfile = {
  name?: string | null;
  photoURL?: string | null;
};

const VALID: ReadonlyArray<RSVPStatus> = ['going', 'maybe', 'declined'];

/**
 * Builds the attendee list from the event's `rsvps` map (uid -> status) and
 * the optional `guests` map (uid -> name/photo). The host is excluded because
 * the guest list always renders the host separately.
 */
export function attendeesFromRsvps(params: {
  rsvps: Record<string, RSVPStatus | undefined>;
  guests?: Record<string, GuestProfile | undefined>;
  hostId: string;
  guestLabel?: string;
}): Attendee[] {
  const { rsvps, guests = {}, hostId, guestLabel = 'Guest' } = params;
  return Object.entries(rsvps)
    .filter(
      (entry): entry is [string, RSVPStatus] =>
        entry[0] !== hostId &&
        entry[1] !== undefined &&
        VALID.includes(entry[1]),
    )
    .map(([uid, rsvp]) => {
      const profile = guests[uid];
      const photo = profile?.photoURL ?? null;
      return {
        id: uid,
        name: profile?.name?.trim() || guestLabel,
        photoURL: photo && /^https?:\/\//i.test(photo) ? photo : null,
        rsvp,
        relation: 'friend' as const,
        note: null,
        plusOnes: 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Counts RSVPs with the given status (the host's own "going" included). */
export function countRsvps(
  rsvps: Record<string, RSVPStatus | undefined>,
  status: RSVPStatus,
): number {
  return Object.values(rsvps).filter(value => value === status).length;
}
