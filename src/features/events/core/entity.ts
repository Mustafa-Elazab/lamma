export type EventCategory =
  | 'birthday'
  | 'wedding'
  | 'engagement'
  | 'dinner'
  | 'trip'
  | 'gathering'
  | 'iftar'
  | 'other';

export type RSVPStatus = 'going' | 'maybe' | 'declined' | 'none';

export type EventThemeKey =
  | 'wedding'
  | 'birthday'
  | 'dinner'
  | 'travel'
  | 'generic';

export type EventCoverKey = 'wedding' | 'birthday' | 'dinner' | 'trip';

export type EventVisibility = 'public' | 'private';

export type GuestRelation = 'host' | 'cohost' | 'family' | 'friend';

export type Attendee = {
  id: string;
  name: string;
  photoURL: string | null;
  rsvp: RSVPStatus;
  relation: GuestRelation;
  note: string | null;
  plusOnes: number;
};

export type EventUpdate = {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  message: string;
  createdAt: number;
  pinned: boolean;
};

export type LammaEvent = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  coverKey: EventCoverKey;
  /** Optional real cover photo (event media) URL; falls back to cover art. */
  coverImageUrl?: string | null;
  themeKey: EventThemeKey;
  startAt: number;
  endAt: number;
  venueName: string;
  areaAddress: string;
  latitude: number | null;
  longitude: number | null;
  hostId: string;
  hostName: string;
  hostPhoto: string | null;
  attendees: Attendee[];
  attendeeCount: number;
  goingCount: number;
  viewerRsvp: RSVPStatus;
  isHosting: boolean;
  visibility: EventVisibility;
  updates: EventUpdate[];
  createdAt: number;
};

export type EventListFilter = 'upcoming' | 'hosting' | 'past';

export const CATEGORY_TO_COVER: Record<EventCategory, EventCoverKey> = {
  birthday: 'birthday',
  wedding: 'wedding',
  engagement: 'wedding',
  dinner: 'dinner',
  trip: 'trip',
  gathering: 'dinner',
  iftar: 'dinner',
  other: 'dinner',
};

export const CATEGORY_TO_THEME: Record<EventCategory, EventThemeKey> = {
  birthday: 'birthday',
  wedding: 'wedding',
  engagement: 'wedding',
  dinner: 'dinner',
  trip: 'travel',
  gathering: 'generic',
  iftar: 'generic',
  other: 'generic',
};

export function goingAttendees(event: LammaEvent): Attendee[] {
  return event.attendees.filter(a => a.rsvp === 'going');
}
