import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type { AppStackParamList } from '../../../../navigation/types';
import {
  toCompactCard,
  useDiscoverEvents,
  type EventCategory,
  type LammaEvent,
} from '../../../events';

export function useDiscoverController() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [rawQuery, setRawQuery] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EventCategory | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(rawQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  const request = useDiscoverEvents(query, category);

  const events = useMemo<LammaEvent[]>(
    () => (request.data?.pages ?? []).flatMap(page => page.events),
    [request.data],
  );

  const toCard = useCallback(
    (event: LammaEvent) => toCompactCard(event, { locale: language, t }),
    [language, t],
  );

  const openEvent = useCallback(
    (eventId: string) => navigation.navigate('EventDetails', { eventId }),
    [navigation],
  );

  const loadMore = useCallback(() => {
    if (request.hasNextPage && !request.isFetchingNextPage) {
      void request.fetchNextPage();
    }
  }, [request]);

  // `null` is the "All" chip, which is first and selected when the screen opens.
  const toggleCategory = useCallback((next: EventCategory) => {
    setCategory(prev => (prev === next ? null : next));
  }, []);
  const selectAll = useCallback(() => setCategory(null), []);

  return {
    t,
    rawQuery,
    setRawQuery,
    category,
    toggleCategory,
    selectAll,
    events,
    toCard,
    openEvent,
    loadMore,
    isLoading: request.isLoading,
    isError: request.isError,
    isRefetching: request.isRefetching,
    refetch: request.refetch,
    isFetchingNextPage: request.isFetchingNextPage,
  };
}
