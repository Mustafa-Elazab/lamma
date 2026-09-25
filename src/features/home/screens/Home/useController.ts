import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type { AppStackParamList } from '../../../../navigation/types';
import { syncUpcomingEventReminders } from '../../../../services/eventReminders';
import { displayNameOrGuest } from '../../../auth/core/entity';
import { useAuth } from '../../../auth';
import {
  toCompactCard,
  toFeaturedCard,
  useHomeFeed,
  type LammaEvent,
} from '../../../events';
import { usePreferences } from '../../../settings/core';
import type { HomeTab, HomeTabItem } from './types';
import { useUserProfile } from '../../../profile/core';

export function useHomeController() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { preferences } = usePreferences();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [filter, setFilter] = useState<HomeTab>('upcoming');

  const query = useHomeFeed(filter);

  const featured = query.data?.pages[0]?.featured ?? null;
  const events = useMemo<LammaEvent[]>(
    () => (query.data?.pages ?? []).flatMap(page => page.page.events),
    [query.data],
  );

  useEffect(() => {
    if (filter !== 'upcoming') {
      return;
    }
    const upcoming = [
      ...(featured ? [featured] : []),
      ...events,
    ];
    void syncUpcomingEventReminders(
      upcoming,
      preferences.notifications.reminders,
    );
  }, [events, featured, filter, preferences.notifications.reminders]);

  const greetingName = useMemo(() => {
    const full = displayNameOrGuest(user, t('profile.guest'));
    return full.split(' ')[0];
  }, [t, user]);

  const tabs = useMemo<HomeTabItem[]>(
    () => [
      { key: 'upcoming', label: t('home.upcoming') },
      { key: 'hosting', label: t('home.hosting') },
      { key: 'past', label: t('home.past') },
    ],
    [t],
  );

  const featuredCard = useMemo(
    () => (featured ? toFeaturedCard(featured, { locale: language, t }) : null),
    [featured, language, t],
  );

  const toCard = useCallback(
    (event: LammaEvent) => toCompactCard(event, { locale: language, t }),
    [language, t],
  );

  const openEvent = useCallback(
    (eventId: string) => navigation.navigate('EventDetails', { eventId }),
    [navigation],
  );
  const openCreate = useCallback(
    () => navigation.navigate('CreateEvent'),
    [navigation],
  );

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query]);

  const emptyCopy = useMemo(() => {
    if (filter === 'hosting') {
      return {
        title: t('home.emptyHostingTitle'),
        message: t('home.emptyHostingMessage'),
      };
    }
    if (filter === 'past') {
      return {
        title: t('home.emptyPastTitle'),
        message: t('home.emptyPastMessage'),
      };
    }
    return {
      title: t('home.emptyUpcomingTitle'),
      message: t('home.emptyUpcomingMessage'),
    };
  }, [filter, t]);

  const avatarUri = profile.photoDataUrl ?? user?.photoURL ?? null;
  const avatar = useMemo(
    () => (avatarUri ? { uri: avatarUri } : undefined),
    [avatarUri],
  );

  return {
    t,
    filter,
    setFilter,
    tabs,
    greetingName,
    avatar,
    featuredCard,
    featured,
    events,
    toCard,
    openEvent,
    openCreate,
    loadMore,
    emptyCopy,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
