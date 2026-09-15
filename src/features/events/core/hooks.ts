import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import type {
  EventCategory,
  EventListFilter,
  LammaEvent,
  RSVPStatus,
} from './entity';
import { getEventRepository } from './eventRepository';
import { eventKeys } from './queryKeys';
import type { CreateEventInput, EventPage, HomeFeed } from './repository';

export function useHomeFeed(filter: EventListFilter) {
  const repository = getEventRepository();
  return useInfiniteQuery<
    HomeFeed,
    Error,
    InfiniteData<HomeFeed>,
    ReturnType<typeof eventKeys.home>,
    string | null
  >({
    queryKey: eventKeys.home(filter),
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      repository.getHomeFeed({ filter, cursor: pageParam }),
    getNextPageParam: lastPage => lastPage.page.nextCursor,
  });
}

export function useEvent(eventId: string) {
  const repository = getEventRepository();
  return useQuery<LammaEvent | null, Error>({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => repository.getEvent(eventId),
  });
}

export function useDiscoverEvents(query: string, category: EventCategory | null) {
  const repository = getEventRepository();
  return useInfiniteQuery<
    EventPage,
    Error,
    InfiniteData<EventPage>,
    ReturnType<typeof eventKeys.discover>,
    string | null
  >({
    queryKey: eventKeys.discover(query, category),
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      repository.listPublicEvents({ query, category, cursor: pageParam }),
    getNextPageParam: lastPage => lastPage.nextCursor,
  });
}

export function useRsvpMutation() {
  const repository = getEventRepository();
  const queryClient = useQueryClient();
  return useMutation<
    LammaEvent,
    Error,
    { eventId: string; status: RSVPStatus }
  >({
    mutationFn: ({ eventId, status }) => repository.setRsvp(eventId, status),
    onSuccess: updated => {
      queryClient.setQueryData(eventKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useCreateEvent() {
  const repository = getEventRepository();
  const queryClient = useQueryClient();
  return useMutation<LammaEvent, Error, CreateEventInput>({
    mutationFn: input => repository.createEvent(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
