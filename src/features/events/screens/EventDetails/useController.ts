import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform } from 'react-native';

import { useLanguage } from '../../../../app/localization';
import type { AppStackParamList } from '../../../../navigation/types';
import {
  formatDateLong,
  formatTime,
  goingSummary,
} from '../../../../utils/format';
import { useAuth } from '../../../auth';
import { goingAttendees, type RSVPStatus } from '../../core/entity';
import { useEvent, useRsvpMutation } from '../../core/hooks';
import { eventCover } from '../../core/media';

export function useEventDetailsController(eventId: string) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const query = useEvent(eventId);
  const rsvp = useRsvpMutation();

  const { user } = useAuth();
  const event = query.data ?? null;
  // The creator never RSVPs to their own event: they get host actions instead.
  const isOwner = Boolean(
    event && (event.isHosting || (user?.uid && event.hostId === user.uid)),
  );

  const setRsvp = useCallback(
    (status: RSVPStatus) => {
      rsvp.mutate({ eventId, status });
    },
    [eventId, rsvp],
  );

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openGuests = useCallback(
    () => navigation.navigate('GuestList', { eventId }),
    [eventId, navigation],
  );
  const openShare = useCallback(
    () => navigation.navigate('ShareInvite', { eventId }),
    [eventId, navigation],
  );

  const openInMaps = useCallback(() => {
    if (!event) {
      return;
    }
    const label = encodeURIComponent(event.venueName || event.areaAddress);
    const hasCoords = event.latitude !== null && event.longitude !== null;
    const mapTarget = hasCoords
      ? `${event.latitude},${event.longitude}`
      : encodeURIComponent(event.areaAddress || event.venueName);
    const url =
      Platform.OS === 'ios'
        ? `https://maps.apple.com/?q=${label}&ll=${mapTarget}`
        : `https://www.google.com/maps/search/?api=1&query=${mapTarget}`;
    void Linking.openURL(url);
  }, [event]);

  const heroImage = event ? eventCover(event) : undefined;
  const dateLabel = event ? formatDateLong(event.startAt, language) : '';
  const timeRange = event
    ? `${formatTime(event.startAt, language)} — ${formatTime(
        event.endAt,
        language,
      )}`
    : '';
  const goingStack = event ? goingAttendees(event).slice(0, 7) : [];
  const goingLabel = event
    ? event.goingCount === 1
      ? t('event.onePersonGoing')
      : t('event.peopleGoing', { count: event.goingCount })
    : '';
  const attendeeSummary = event ? goingSummary(event.goingCount, language) : '';

  return {
    t,
    language,
    event,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    heroImage,
    isOwner,
    dateLabel,
    timeRange,
    goingStack,
    goingLabel,
    attendeeSummary,
    setRsvp,
    goBack,
    openGuests,
    openShare,
    openInMaps,
  };
}
