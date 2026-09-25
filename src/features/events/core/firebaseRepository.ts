import { getAuth } from '@react-native-firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit as fbLimit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from '@react-native-firebase/firestore';

import { reportError } from '../../../services/crashReporting';
import { appLogger } from '../../../services/logger';
import {
  CATEGORY_TO_COVER,
  type EventListFilter,
  type LammaEvent,
  type RSVPStatus,
} from './entity';
import type {
  CreateEventInput,
  EventPage,
  EventRepository,
  HomeFeed,
} from './repository';
import {
  attendeesFromRsvps,
  countRsvps,
  type GuestProfile,
} from './rsvpAttendees';
import { uploadEventThemeImage } from './uploadThemeImage';

/** Inline covers must leave room in the 1 MB Firestore document limit. */
const MAX_INLINE_COVER_CHARS = 900_000;

type DocData = DocumentData;

/** Minimal structural shape shared by document and query snapshots. */
type SnapshotLike = { id: string; data: () => unknown };

const COLLECTION = 'events';

function currentUid(): string {
  const uid = getAuth().currentUser?.uid;
  if (!uid) {
    throw new Error('events/auth-required: no authenticated Firebase user');
  }
  return uid;
}

function mapDoc(snapshot: SnapshotLike, uid: string): LammaEvent {
  const data = (snapshot.data() ?? {}) as DocData;
  const rsvps = (data.rsvps ?? {}) as Record<string, RSVPStatus>;
  const hostId = (data.hostId as string) ?? '';
  const storedAttendees = (data.attendees as LammaEvent['attendees']) ?? [];
  // RSVPs live in the `rsvps` map (the stored `attendees` array is legacy and
  // normally empty), so derive the guest list and counts from it.
  const attendees =
    storedAttendees.length > 0
      ? storedAttendees
      : attendeesFromRsvps({
          rsvps,
          guests: (data.guests ?? {}) as Record<string, GuestProfile>,
          hostId,
        });
  const rsvpCount = Object.keys(rsvps).length;
  return {
    id: snapshot.id,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    category: (data.category as LammaEvent['category']) ?? 'other',
    coverKey: (data.coverKey as LammaEvent['coverKey']) ?? 'dinner',
    coverImageUrl: (data.coverImageUrl as string | null) ?? null,
    themeKey: (data.themeKey as LammaEvent['themeKey']) ?? 'generic',
    startAt: (data.startAt as number) ?? 0,
    endAt: (data.endAt as number) ?? 0,
    venueName: (data.venueName as string) ?? '',
    areaAddress: (data.areaAddress as string) ?? '',
    latitude: (data.latitude as number | null) ?? null,
    longitude: (data.longitude as number | null) ?? null,
    hostId: (data.hostId as string) ?? '',
    hostName:
      (data.hostName as string)?.trim() ||
      ((data.hostId as string) === uid
        ? (getAuth().currentUser?.displayName ?? 'Host')
        : 'Host'),
    hostPhoto: (data.hostPhoto as string | null) ?? null,
    attendees,
    attendeeCount:
      rsvpCount > 0
        ? rsvpCount - countRsvps(rsvps, 'none')
        : (data.attendeeCount as number) ?? 0,
    goingCount:
      rsvpCount > 0
        ? countRsvps(rsvps, 'going')
        : (data.goingCount as number) ?? 0,
    viewerRsvp: rsvps[uid] ?? 'none',
    isHosting: (data.hostId as string) === uid,
    visibility: (data.visibility as LammaEvent['visibility']) ?? 'public',
    updates: (data.updates as LammaEvent['updates']) ?? [],
    createdAt: (data.createdAt as number) ?? 0,
  };
}

/** Firestore-backed event repository used when `env.firebaseEnabled` is true. */
export class FirebaseEventRepository implements EventRepository {
  private get db() {
    return getFirestore();
  }

  private purgeStarted = false;

  /**
   * Events are deleted once they end. Firestore TTL (expireAt) needs the Blaze
   * plan, so every app session also removes a small batch of ended events
   * itself (rules allow anyone signed in to delete an event that has ended).
   */
  private purgeEndedEvents(): void {
    if (this.purgeStarted) {
      return;
    }
    this.purgeStarted = true;
    const run = async () => {
      const snap = await getDocs(
        query(
          collection(this.db, COLLECTION),
          where('endAt', '<', Date.now()),
          fbLimit(25),
        ),
      );
      await Promise.all(
        (snap.docs as Array<SnapshotLike & { ref: unknown }>).map(d =>
          deleteDoc(d.ref as Parameters<typeof deleteDoc>[0]).catch(() => undefined),
        ),
      );
      if (snap.docs.length > 0) {
        appLogger.log('[events.purge] removed ended events', {
          count: snap.docs.length,
        });
      }
    };
    run().catch(error => {
      this.purgeStarted = false;
      appLogger.error('[events.purge] failed', error);
    });
  }

  async getHomeFeed(params: {
    filter: EventListFilter;
    cursor?: string | null;
    limit?: number;
  }): Promise<HomeFeed> {
    const uid = currentUid();
    const pageSize = params.limit ?? 5;
    const now = Date.now();
    const base = collection(this.db, COLLECTION);
    this.purgeEndedEvents();

    try {
      let events: LammaEvent[] = [];

      if (params.filter === 'hosting') {
        // Querying on hostId alone avoids requiring a Firestore composite index on (hostId, startAt).
        const q = query(
          base,
          where('hostId', '==', uid),
          fbLimit(pageSize * 3),
        );
        const snap = await getDocs(q);
        events = (snap.docs as SnapshotLike[])
          .map(d => mapDoc(d, uid))
          .sort((a, b) => a.startAt - b.startAt);
      } else if (params.filter === 'past') {
        const q = query(
          base,
          where('endAt', '<', now),
          orderBy('endAt', 'desc'),
          fbLimit(pageSize + 1),
        );
        const snap = await getDocs(q);
        events = (snap.docs as SnapshotLike[]).map(d => mapDoc(d, uid));
      } else {
        const q = query(
          base,
          where('endAt', '>=', now),
          orderBy('endAt', 'asc'),
          fbLimit(pageSize + 1),
        );
        const snap = await getDocs(q);
        events = (snap.docs as SnapshotLike[]).map(d => mapDoc(d, uid));
      }

      const featured =
        !params.cursor && params.filter === 'upcoming'
          ? events.find(e => e.viewerRsvp === 'going') ?? events[0] ?? null
          : null;
      const list = featured ? events.filter(e => e.id !== featured.id) : events;
      return {
        featured,
        page: { events: list.slice(0, pageSize), nextCursor: null },
      };
    } catch (error) {
      appLogger.error('[events.getHomeFeed] Firestore query failed', error, {
        filter: params.filter,
        uid,
      });
      reportError(error, 'events.home-feed', { filter: params.filter, uid });
      throw error;
    }
  }

  async getEvent(id: string): Promise<LammaEvent | null> {
    const uid = currentUid();
    try {
      const snapshot = await getDoc(doc(this.db, COLLECTION, id));
      return snapshot.exists() ? mapDoc(snapshot, uid) : null;
    } catch (error) {
      appLogger.error('[events.getEvent] Firestore query failed', error, { id, uid });
      reportError(error, 'events.get-event', { id, uid });
      throw error;
    }
  }

  async listPublicEvents(params: {
    query?: string;
    category?: LammaEvent['category'] | null;
    cursor?: string | null;
    limit?: number;
  }): Promise<EventPage> {
    const uid = currentUid();
    const pageSize = params.limit ?? 8;
    const base = collection(this.db, COLLECTION);

    try {
      // Querying visibility alone avoids requiring a Firestore composite index on (visibility, startAt).
      // Equality-only filters (visibility + category) need no composite index.
      const q = params.category
        ? query(
            base,
            where('visibility', '==', 'public'),
            where('category', '==', params.category),
            fbLimit(pageSize * 3),
          )
        : query(
            base,
            where('visibility', '==', 'public'),
            fbLimit(pageSize * 3),
          );
      const snap = await getDocs(q);
      const queryText = params.query?.trim().toLowerCase() ?? '';
      const events = (snap.docs as SnapshotLike[])
        .map(d => mapDoc(d, uid))
        .sort((a, b) => a.startAt - b.startAt)
        .filter(e =>
          params.category ? e.category === params.category : true,
        )
        .filter(e => (queryText ? e.title.toLowerCase().includes(queryText) : true));
      return { events: events.slice(0, pageSize), nextCursor: null };
    } catch (error) {
      appLogger.error('[events.listPublicEvents] Firestore query failed', error, {
        query: params.query,
        category: params.category,
        uid,
      });
      reportError(error, 'events.list-public', { uid });
      throw error;
    }
  }

  async setRsvp(eventId: string, status: RSVPStatus): Promise<LammaEvent> {
    const uid = currentUid();
    const user = getAuth().currentUser;
    const ref = doc(this.db, COLLECTION, eventId);
    const photo = user?.photoURL ?? null;
    // The public guest card lets the host's guest list show names per status.
    await updateDoc(ref, {
      [`rsvps.${uid}`]: status,
      [`guests.${uid}`]: {
        name: user?.displayName?.trim() || null,
        photoURL: photo && /^https?:\/\//i.test(photo) ? photo : null,
      },
    });
    const snapshot = await getDoc(ref);
    return mapDoc(snapshot, uid);
  }

  async createEvent(input: CreateEventInput): Promise<LammaEvent> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      const error = new Error(
        'events/auth-required: sign in before creating an event',
      );
      reportError(error, 'events.create-auth', { uid: null });
      throw error;
    }

    // Force-refresh immediately before the protected write. This catches
    // revoked/expired sessions here instead of surfacing an opaque Firestore
    // permission-denied caused by a stale token.
    const tokenResult = await user.getIdTokenResult(true);
    const expiresAt = Date.parse(tokenResult.expirationTime);
    if (!tokenResult.token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      const error = new Error(
        'events/invalid-token: Firebase ID token is not valid',
      );
      reportError(error, 'events.create-auth', {
        uid: user.uid,
        tokenExpirationTime: tokenResult.expirationTime,
      });
      throw error;
    }

    const uid = user.uid;

    let customCoverImageUrl: string | null = null;
    if (input.customThemeUri) {
      if (
        /^https?:\/\//i.test(input.customThemeUri) ||
        input.customThemeUri.startsWith('data:image/')
      ) {
        // Shrunk photos are saved inline as a data URI (free plan, no Storage).
        if (input.customThemeUri.length > MAX_INLINE_COVER_CHARS) {
          throw new Error('events/cover-too-large: pick a smaller photo');
        }
        customCoverImageUrl = input.customThemeUri;
      } else {
        try {
          customCoverImageUrl = await uploadEventThemeImage(
            uid,
            input.customThemeUri,
          );
        } catch (error) {
          appLogger.error(
            '[events.create] Custom theme upload failed',
            error,
            { uid },
          );
          reportError(error, 'events.theme-upload', { uid });
          throw error;
        }
      }
    }

    const payload: Record<string, unknown> = {
      title: input.title,
      description: input.description,
      category: input.category,
      coverKey: CATEGORY_TO_COVER[input.category],
      themeKey: input.themeKey,
      startAt: input.startAt,
      endAt: input.endAt,
      // Firestore TTL deletes the doc after this time (once Blaze is enabled).
      expireAt: Timestamp.fromMillis(input.endAt),
      venueName: input.venueName,
      areaAddress: input.areaAddress,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      hostId: uid,
      ownerId: uid,
      hostName:
        (user.displayName?.trim() || null) ??
        (user.isAnonymous ? 'Guest' : 'Host'),
      hostPhoto: user.photoURL ?? null,
      attendees: [],
      attendeeCount: 1,
      goingCount: 1,
      rsvps: { [uid]: 'going' as RSVPStatus },
      visibility: input.visibility,
      updates: [],
      createdAt: Date.now(),
      ...(customCoverImageUrl ? { coverImageUrl: customCoverImageUrl } : {}),
    };

    // Keep these diagnostics at the actual network boundary. They intentionally
    // exclude the token while recording the uid, expiry, exact payload, and
    // Firestore response/error needed to diagnose security-rule failures.
    const requestDetails = {
      uid,
      tokenExpirationTime: tokenResult.expirationTime,
      payload,
    };
    appLogger.log('[events.create] Firestore write request', requestDetails);
    appLogger.display(
      'Firestore event create',
      requestDetails,
      `${uid}: ${input.title}`,
    );

    try {
      const ref = await addDoc(collection(this.db, COLLECTION), payload);
      appLogger.log('[events.create] Firestore write response', {
        id: ref.id,
        path: ref.path,
      });
      const snapshot = await getDoc(ref);
      if (!snapshot.exists()) {
        throw new Error(
          `events/write-not-readable: ${ref.path} was created but cannot be read`,
        );
      }
      return mapDoc(snapshot, uid);
    } catch (error) {
      const details = error as { code?: string; message?: string };
      const failureDetails = {
        uid,
        payload,
        code: details.code ?? 'unknown',
        message: details.message ?? String(error),
      };
      appLogger.error(
        '[events.create] Firestore write failed',
        error,
        failureDetails,
      );
      reportError(error, 'events.firestore-create', {
        uid,
        code: failureDetails.code,
      });
      throw error;
    }
  }
}
