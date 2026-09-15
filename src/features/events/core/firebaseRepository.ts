import { getAuth } from '@react-native-firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit as fbLimit,
  orderBy,
  query,
  updateDoc,
  where,
  type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

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

type DocData = FirebaseFirestoreTypes.DocumentData;

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
  return {
    id: snapshot.id,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    category: (data.category as LammaEvent['category']) ?? 'other',
    coverKey: (data.coverKey as LammaEvent['coverKey']) ?? 'dinner',
    themeKey: (data.themeKey as LammaEvent['themeKey']) ?? 'generic',
    startAt: (data.startAt as number) ?? 0,
    endAt: (data.endAt as number) ?? 0,
    venueName: (data.venueName as string) ?? '',
    areaAddress: (data.areaAddress as string) ?? '',
    latitude: (data.latitude as number | null) ?? null,
    longitude: (data.longitude as number | null) ?? null,
    hostId: (data.hostId as string) ?? '',
    hostName: (data.hostName as string) ?? '',
    hostPhoto: (data.hostPhoto as string | null) ?? null,
    attendees: (data.attendees as LammaEvent['attendees']) ?? [],
    attendeeCount: (data.attendeeCount as number) ?? 0,
    goingCount: (data.goingCount as number) ?? 0,
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

  async getHomeFeed(params: {
    filter: EventListFilter;
    cursor?: string | null;
    limit?: number;
  }): Promise<HomeFeed> {
    const uid = currentUid();
    const pageSize = params.limit ?? 5;
    const now = Date.now();
    const base = collection(this.db, COLLECTION);

    const q =
      params.filter === 'hosting'
        ? query(
            base,
            where('hostId', '==', uid),
            orderBy('startAt', 'asc'),
            fbLimit(pageSize + 1),
          )
        : params.filter === 'past'
        ? query(
            base,
            where('endAt', '<', now),
            orderBy('endAt', 'desc'),
            fbLimit(pageSize + 1),
          )
        : query(
            base,
            where('endAt', '>=', now),
            orderBy('endAt', 'asc'),
            fbLimit(pageSize + 1),
          );

    const snap = await getDocs(q);
    const events = (snap.docs as SnapshotLike[]).map(d => mapDoc(d, uid));
    const featured =
      !params.cursor && params.filter === 'upcoming'
        ? events.find(e => e.viewerRsvp === 'going') ?? events[0] ?? null
        : null;
    const list = featured ? events.filter(e => e.id !== featured.id) : events;
    return {
      featured,
      page: { events: list.slice(0, pageSize), nextCursor: null },
    };
  }

  async getEvent(id: string): Promise<LammaEvent | null> {
    const snapshot = await getDoc(doc(this.db, COLLECTION, id));
    return snapshot.exists() ? mapDoc(snapshot, currentUid()) : null;
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
    const q = query(
      base,
      where('visibility', '==', 'public'),
      orderBy('startAt', 'asc'),
      fbLimit(pageSize),
    );
    const snap = await getDocs(q);
    const queryText = params.query?.trim().toLowerCase() ?? '';
    const events = (snap.docs as SnapshotLike[])
      .map(d => mapDoc(d, uid))
      .filter(e =>
        params.category ? e.category === params.category : true,
      )
      .filter(e => (queryText ? e.title.toLowerCase().includes(queryText) : true));
    return { events, nextCursor: null };
  }

  async setRsvp(eventId: string, status: RSVPStatus): Promise<LammaEvent> {
    const uid = currentUid();
    const ref = doc(this.db, COLLECTION, eventId);
    await updateDoc(ref, { [`rsvps.${uid}`]: status });
    const snapshot = await getDoc(ref);
    return mapDoc(snapshot, uid);
  }

  async createEvent(input: CreateEventInput): Promise<LammaEvent> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error(
        'events/auth-required: sign in before creating an event',
      );
    }

    // Force-refresh immediately before the protected write. This catches
    // revoked/expired sessions here instead of surfacing an opaque Firestore
    // permission-denied caused by a stale token.
    const tokenResult = await user.getIdTokenResult(true);
    const expiresAt = Date.parse(tokenResult.expirationTime);
    if (!tokenResult.token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      throw new Error('events/invalid-token: Firebase ID token is not valid');
    }

    const uid = user.uid;
    const payload = {
      title: input.title,
      description: input.description,
      category: input.category,
      coverKey: CATEGORY_TO_COVER[input.category],
      themeKey: input.themeKey,
      startAt: input.startAt,
      endAt: input.endAt,
      venueName: input.venueName,
      areaAddress: input.areaAddress,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      hostId: uid,
      ownerId: uid,
      hostName: user.displayName ?? 'Host',
      hostPhoto: user.photoURL ?? null,
      attendees: [],
      attendeeCount: 1,
      goingCount: 1,
      rsvps: { [uid]: 'going' as RSVPStatus },
      visibility: input.visibility,
      updates: [],
      createdAt: Date.now(),
    };

    // Keep these diagnostics at the actual network boundary. They intentionally
    // exclude the token while recording the uid, expiry, exact payload, and
    // Firestore response/error needed to diagnose security-rule failures.
    console.info('[events.create] Firestore write request', {
      uid,
      tokenExpirationTime: tokenResult.expirationTime,
      payload,
    });

    try {
      const ref = await addDoc(collection(this.db, COLLECTION), payload);
      console.info('[events.create] Firestore write response', {
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
      console.error('[events.create] Firestore write failed', {
        uid,
        payload,
        code: details.code ?? 'unknown',
        message: details.message ?? String(error),
      });
      throw error;
    }
  }
}
