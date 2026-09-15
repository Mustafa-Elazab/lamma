/**
 * Test-only fixtures. Imported exclusively by Jest specs — never by production
 * UI code, so no seeded notifications ship in the default app path.
 */
import type { AppNotification } from './core/entity';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function buildSeedNotifications(now = Date.now()): AppNotification[] {
  return [
    {
      id: 'ntf_1',
      type: 'invite',
      title: 'New invitation',
      message: 'Mohamed invited you to Mohamed & Sara Wedding.',
      actorName: 'Mohamed',
      eventId: 'evt_wedding_mohamed_sara',
      createdAt: now - 2 * HOUR,
      read: false,
    },
    {
      id: 'ntf_2',
      type: 'rsvp',
      title: 'New RSVP',
      message: 'Nour Ali is going to your Birthday Dinner.',
      actorName: 'Nour Ali',
      eventId: 'evt_birthday_mostafa',
      createdAt: now - 5 * HOUR,
      read: false,
    },
    {
      id: 'ntf_3',
      type: 'update',
      title: 'Event update',
      message: 'Karim posted an update in Sinai Weekend Trip.',
      actorName: 'Karim',
      eventId: 'evt_trip_sinai',
      createdAt: now - 26 * HOUR,
      read: true,
    },
    {
      id: 'ntf_4',
      type: 'reminder',
      title: 'Reminder',
      message: 'Layla & Youssef Engagement is coming up soon.',
      actorName: null,
      eventId: 'evt_engagement_layla',
      createdAt: now - 2 * DAY,
      read: true,
    },
    {
      id: 'ntf_5',
      type: 'comment',
      title: 'New comment',
      message: 'Omar commented on School Reunion Dinner.',
      actorName: 'Omar',
      eventId: 'evt_past_reunion',
      createdAt: now - 4 * DAY,
      read: true,
    },
  ];
}
