import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from './types';

/**
 * Deep link configuration. Invite links follow the `lamma.app/e/{id}` shape
 * and open straight into the event details screen.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['lamma://', 'https://lamma.app', 'https://www.lamma.app'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Discover: 'discover',
          Notifications: 'notifications',
          Profile: 'profile',
        },
      },
      EventDetails: 'e/:eventId',
      GuestList: 'e/:eventId/guests',
      ShareInvite: 'e/:eventId/share',
    },
  },
};

export function buildEventDeepLink(eventId: string): string {
  return `https://lamma.app/e/${eventId}`;
}
