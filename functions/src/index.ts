import { initializeApp } from 'firebase-admin/app';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

initializeApp();

type RsvpStatus = 'going' | 'maybe' | 'declined' | 'none';

/**
 * Keeps event counters authoritative when any RSVP changes. The trigger uses
 * Admin SDK privileges; clients may only update their own `rsvps.{uid}` entry
 * and cannot write aggregate counters directly.
 */
export const updateEventRsvpCounters = onDocumentWritten(
  {
    document: 'events/{eventId}',
    region: 'europe-west1',
  },
  async event => {
    const snapshot = event.data?.after;
    if (!snapshot?.exists) {
      return;
    }

    const data = snapshot.data();
    const rsvps = (data.rsvps ?? {}) as Record<string, RsvpStatus>;
    const statuses = Object.values(rsvps);
    const attendeeCount = statuses.filter(status => status !== 'none').length;
    const goingCount = statuses.filter(status => status === 'going').length;

    if (
      data.attendeeCount === attendeeCount &&
      data.goingCount === goingCount
    ) {
      return;
    }

    await snapshot.ref.update({ attendeeCount, goingCount });
  },
);
