import { initializeApp } from 'firebase-admin/app';
import {
  FieldValue,
  Timestamp,
  type DocumentReference,
  getFirestore,
} from 'firebase-admin/firestore';
import {
  getMessaging,
  type BatchResponse,
  type MulticastMessage,
} from 'firebase-admin/messaging';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();

type RsvpStatus = 'going' | 'maybe' | 'declined' | 'none';
type EventData = {
  title?: unknown;
  venueName?: unknown;
  startAt?: unknown;
  startNotificationLeaseUntil?: unknown;
  startNotificationSent?: unknown;
  rsvps?: unknown;
};
type ClaimedEventStart = {
  id: string;
  title: string;
  venueName: string | null;
  goingUids: string[];
};

const REGION = 'europe-west1';
const EVENT_START_CHANNEL_ID = 'event-start-alarm';
const EVENT_START_LOOKBACK_MS = 5 * 60 * 1000;
const EVENT_START_LEASE_MS = 10 * 60 * 1000;
const MAX_MULTICAST_TOKENS = 500;

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function goingUidsFromRsvps(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }
  return Object.entries(value as Record<string, unknown>)
    .filter(([, status]) => status === 'going')
    .map(([uid]) => uid);
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function claimDueEventStart(
  ref: DocumentReference,
  now: number,
  windowStart: number,
): Promise<ClaimedEventStart | null> {
  const db = getFirestore();
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) {
      return null;
    }

    const data = (snapshot.data() ?? {}) as EventData;
    const startAt = asNumber(data.startAt);
    if (
      data.startNotificationSent === true ||
      (asNumber(data.startNotificationLeaseUntil) ?? 0) > now ||
      startAt === null ||
      startAt > now ||
      startAt <= windowStart
    ) {
      return null;
    }

    const goingUids = goingUidsFromRsvps(data.rsvps);
    transaction.update(ref, {
      // This short lease prevents overlapping scheduler runs from double-firing.
      // Cloud Tasks can replace this polling claim if exact per-event second
      // timing becomes important later.
      startNotificationClaimedAt: Timestamp.now(),
      startNotificationLeaseUntil: now + EVENT_START_LEASE_MS,
      startNotificationWindowStart: windowStart,
    });

    return {
      id: snapshot.id,
      title: asString(data.title) ?? 'Your event',
      venueName: asString(data.venueName),
      goingUids,
    };
  });
}

async function deviceTokensForUsers(uids: string[]): Promise<string[]> {
  const db = getFirestore();
  const snapshots = await Promise.all(
    uids.map(uid => db.collection('users').doc(uid).collection('devices').get()),
  );
  const tokens = snapshots.flatMap(snapshot =>
    snapshot.docs
      .map(doc => asString(doc.data().token) ?? decodeURIComponent(doc.id))
      .filter((token): token is string => Boolean(token)),
  );
  return Array.from(new Set(tokens));
}

async function sendEventStartPush(
  event: ClaimedEventStart,
  tokens: string[],
): Promise<BatchResponse[]> {
  if (tokens.length === 0) {
    return [];
  }

  const responses: BatchResponse[] = [];
  for (const tokenChunk of chunks(tokens, MAX_MULTICAST_TOKENS)) {
    const message: MulticastMessage = {
      tokens: tokenChunk,
      notification: {
        title: `${event.title} is starting now`,
        body: event.venueName ?? 'Open Lamma for the event details.',
      },
      data: {
        type: 'event_start',
        eventId: event.id,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: EVENT_START_CHANNEL_ID,
          priority: 'max',
          sound: 'default',
          defaultSound: true,
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };
    responses.push(await getMessaging().sendEachForMulticast(message));
  }
  return responses;
}

function summarizeResponses(responses: BatchResponse[]): {
  successCount: number;
  failureCount: number;
} {
  return responses.reduce(
    (summary, response) => ({
      successCount: summary.successCount + response.successCount,
      failureCount: summary.failureCount + response.failureCount,
    }),
    { successCount: 0, failureCount: 0 },
  );
}

/**
 * Keeps event counters authoritative when any RSVP changes. The trigger uses
 * Admin SDK privileges; clients may only update their own `rsvps.{uid}` entry
 * and cannot write aggregate counters directly.
 */
export const updateEventRsvpCounters = onDocumentWritten(
  {
    document: 'events/{eventId}',
    region: REGION,
  },
  async event => {
    const snapshot = event.data?.after;
    if (!snapshot?.exists) {
      return;
    }

    const data = snapshot.data();
    if (!data) {
      return;
    }
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

export const sendEventStartNotifications = onSchedule(
  {
    schedule: '* * * * *',
    region: REGION,
    timeZone: 'UTC',
  },
  async () => {
    const db = getFirestore();
    const now = Date.now();
    const windowStart = now - EVENT_START_LOOKBACK_MS;
    const dueEvents = await db
      .collection('events')
      .where('startAt', '>', windowStart)
      .where('startAt', '<=', now)
      .orderBy('startAt', 'asc')
      .limit(100)
      .get();

    await Promise.all(
      dueEvents.docs.map(async snapshot => {
        const claimed = await claimDueEventStart(
          snapshot.ref,
          now,
          windowStart,
        );
        if (!claimed) {
          return;
        }

        const tokens = await deviceTokensForUsers(claimed.goingUids);
        const responses = await sendEventStartPush(claimed, tokens);
        const summary = summarizeResponses(responses);
        await snapshot.ref.update({
          startNotificationSent: true,
          startNotificationDeliveredAt: FieldValue.serverTimestamp(),
          startNotificationLeaseUntil: FieldValue.delete(),
          startNotificationGoingUserCount: claimed.goingUids.length,
          startNotificationTokenCount: tokens.length,
          startNotificationSuccessCount: summary.successCount,
          startNotificationFailureCount: summary.failureCount,
        });
      }),
    );
  },
);
