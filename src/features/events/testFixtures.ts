/**
 * Test-only fixtures. This module is imported exclusively by Jest specs and the
 * `__DEV__` local repositories' optional seed helpers — it is never imported by
 * production UI code, so no seeded data ships in the default app path.
 */
import type { Attendee, GuestRelation, LammaEvent } from './core/entity';

const VIEWER_ID = 'user_me';

const FIRST_NAMES = [
  'Ahmed',
  'Sara',
  'Omar',
  'Nour',
  'Khaled',
  'Yara',
  'Karim',
  'Mona',
  'Hana',
  'Ali',
  'Laila',
  'Youssef',
  'Dina',
  'Tarek',
  'Salma',
  'Hassan',
];
const LAST_NAMES = [
  'Ahmed',
  'Hassan',
  'Ali',
  'Mohamed',
  'Khaled',
  'Mostafa',
  'Fouad',
  'Nabil',
];

function makeAttendees(
  count: number,
  goingRatio: number,
  seed: number,
): Attendee[] {
  const attendees: Attendee[] = [];
  for (let i = 0; i < count; i += 1) {
    const first = FIRST_NAMES[(i + seed) % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 3 + seed) % LAST_NAMES.length];
    const isGoing = i / count < goingRatio;
    const relation: GuestRelation =
      i < 2 ? 'family' : i % 5 === 0 ? 'family' : 'friend';
    attendees.push({
      id: `att_${seed}_${i}`,
      name: `${first} ${last}`,
      photoURL: null,
      rsvp: isGoing ? 'going' : i % 2 === 0 ? 'maybe' : 'declined',
      relation,
      note: null,
      plusOnes: i % 4 === 0 ? 1 : 0,
    });
  }
  return attendees;
}

function at(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): number {
  return new Date(year, month, day, hour, minute, 0, 0).getTime();
}

export const VIEWER = {
  id: VIEWER_ID,
  name: 'Mostafa Elazab',
};

export function buildSeedEvents(): LammaEvent[] {
  return [
    {
      id: 'evt_wedding_mohamed_sara',
      title: 'Mohamed & Sara Wedding',
      description:
        'Two hearts, one beautiful journey. Join us as we celebrate love, family and a brighter tomorrow.',
      category: 'wedding',
      coverKey: 'wedding',
      themeKey: 'wedding',
      startAt: at(2026, 11, 18, 20, 0),
      endAt: at(2026, 11, 19, 0, 0),
      venueName: 'Royal Palace',
      areaAddress: 'Al Gomhoria St, Mansoura, Dakahlia',
      latitude: 31.0409,
      longitude: 31.3785,
      hostId: 'user_mohamed',
      hostName: 'Mohamed',
      hostPhoto: null,
      attendees: makeAttendees(60, 0.85, 1),
      attendeeCount: 220,
      goingCount: 186,
      viewerRsvp: 'going',
      isHosting: false,
      visibility: 'public',
      updates: [
        {
          id: 'upd_1',
          authorId: 'user_mohamed',
          authorName: 'Mohamed',
          authorPhoto: null,
          message:
            "We can't wait to see you all! Please make sure to arrive a bit early to enjoy the evening with us.",
          createdAt: at(2026, 11, 16, 12, 0),
          pinned: true,
        },
      ],
      createdAt: at(2026, 9, 1, 10, 0),
    },
    {
      id: 'evt_birthday_mostafa',
      title: "Mostafa's Birthday Dinner",
      description:
        'Join me for a special evening filled with great food, good company, and birthday vibes!',
      category: 'birthday',
      coverKey: 'dinner',
      themeKey: 'birthday',
      startAt: at(2027, 0, 10, 19, 30),
      endAt: at(2027, 0, 10, 23, 0),
      venueName: 'Zooba',
      areaAddress: 'Zamalek, Cairo',
      latitude: 30.0609,
      longitude: 31.2197,
      hostId: VIEWER_ID,
      hostName: VIEWER.name,
      hostPhoto: null,
      attendees: makeAttendees(20, 0.9, 2),
      attendeeCount: 20,
      goingCount: 18,
      viewerRsvp: 'going',
      isHosting: true,
      visibility: 'private',
      updates: [],
      createdAt: at(2026, 8, 20, 10, 0),
    },
    {
      id: 'evt_trip_sinai',
      title: 'Sinai Weekend Trip',
      description:
        'Same friends, new horizons. A weekend of sea, mountains and good vibes in Dahab.',
      category: 'trip',
      coverKey: 'trip',
      themeKey: 'travel',
      startAt: at(2027, 0, 22, 8, 0),
      endAt: at(2027, 0, 25, 20, 0),
      venueName: 'Dahab',
      areaAddress: 'Dahab, South Sinai',
      latitude: 28.5091,
      longitude: 34.5136,
      hostId: 'user_karim',
      hostName: 'Karim',
      hostPhoto: null,
      attendees: makeAttendees(35, 0.9, 3),
      attendeeCount: 35,
      goingCount: 32,
      viewerRsvp: 'going',
      isHosting: false,
      visibility: 'public',
      updates: [],
      createdAt: at(2026, 8, 15, 10, 0),
    },
    {
      id: 'evt_iftar_family',
      title: 'Family Iftar Gathering',
      description:
        'Breaking our fast together as one big family. Bring your appetite and your smiles.',
      category: 'iftar',
      coverKey: 'dinner',
      themeKey: 'generic',
      startAt: at(2027, 2, 14, 18, 0),
      endAt: at(2027, 2, 14, 22, 0),
      venueName: 'Home',
      areaAddress: 'Maadi, Cairo',
      latitude: 29.9603,
      longitude: 31.2569,
      hostId: VIEWER_ID,
      hostName: VIEWER.name,
      hostPhoto: null,
      attendees: makeAttendees(24, 0.8, 4),
      attendeeCount: 24,
      goingCount: 19,
      viewerRsvp: 'none',
      isHosting: true,
      visibility: 'private',
      updates: [],
      createdAt: at(2026, 8, 10, 10, 0),
    },
    {
      id: 'evt_engagement_layla',
      title: 'Layla & Youssef Engagement',
      description:
        "Celebrating the beginning of forever. We'd love to share this joy with you.",
      category: 'engagement',
      coverKey: 'wedding',
      themeKey: 'wedding',
      startAt: at(2027, 1, 5, 19, 0),
      endAt: at(2027, 1, 5, 23, 0),
      venueName: 'Nile Ritz',
      areaAddress: 'Downtown, Cairo',
      latitude: 30.0444,
      longitude: 31.2357,
      hostId: 'user_layla',
      hostName: 'Layla',
      hostPhoto: null,
      attendees: makeAttendees(40, 0.85, 5),
      attendeeCount: 120,
      goingCount: 98,
      viewerRsvp: 'maybe',
      isHosting: false,
      visibility: 'public',
      updates: [],
      createdAt: at(2026, 8, 5, 10, 0),
    },
    {
      id: 'evt_past_graduation',
      title: 'Graduation Celebration',
      description: 'We did it! Thank you for being part of the journey.',
      category: 'gathering',
      coverKey: 'dinner',
      themeKey: 'generic',
      startAt: at(2026, 5, 20, 18, 0),
      endAt: at(2026, 5, 20, 23, 0),
      venueName: 'Cairo Marriott',
      areaAddress: 'Zamalek, Cairo',
      latitude: 30.0571,
      longitude: 31.2243,
      hostId: VIEWER_ID,
      hostName: VIEWER.name,
      hostPhoto: null,
      attendees: makeAttendees(30, 0.9, 6),
      attendeeCount: 30,
      goingCount: 28,
      viewerRsvp: 'going',
      isHosting: true,
      visibility: 'private',
      updates: [],
      createdAt: at(2026, 4, 1, 10, 0),
    },
    {
      id: 'evt_past_reunion',
      title: 'School Reunion Dinner',
      description: 'Old friends, timeless memories. Great to see everyone again.',
      category: 'dinner',
      coverKey: 'dinner',
      themeKey: 'dinner',
      startAt: at(2026, 6, 12, 20, 0),
      endAt: at(2026, 6, 13, 0, 0),
      venueName: 'Sequoia',
      areaAddress: 'Zamalek, Cairo',
      latitude: 30.0736,
      longitude: 31.2223,
      hostId: 'user_omar',
      hostName: 'Omar',
      hostPhoto: null,
      attendees: makeAttendees(25, 0.8, 7),
      attendeeCount: 25,
      goingCount: 20,
      viewerRsvp: 'going',
      isHosting: false,
      visibility: 'public',
      updates: [],
      createdAt: at(2026, 5, 1, 10, 0),
    },
  ];
}
