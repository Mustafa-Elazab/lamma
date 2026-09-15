import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { DEFAULT_PREFERENCES, type Preferences } from './entity';
import { getPreferencesRepository } from './preferencesRepository';

const preferencesKey = ['preferences'] as const;

export function usePreferences(options?: { enabled?: boolean }) {
  const repository = getPreferencesRepository();
  const queryClient = useQueryClient();
  const query = useQuery<Preferences, Error>({
    queryKey: preferencesKey,
    queryFn: () => repository.get(),
    // Placeholder paints immediately but remains stale, so persisted Firebase
    // preferences are still fetched on every cold launch.
    placeholderData: DEFAULT_PREFERENCES,
    enabled: options?.enabled ?? true,
  });

  const mutation = useMutation<void, Error, Preferences, Preferences | undefined>({
    mutationFn: preferences => repository.save(preferences),
    onMutate: async next => {
      await queryClient.cancelQueries({ queryKey: preferencesKey });
      const previous = queryClient.getQueryData<Preferences>(preferencesKey);
      queryClient.setQueryData(preferencesKey, next);
      return previous;
    },
    onError: (_error, _next, context) => {
      if (context) {
        queryClient.setQueryData(preferencesKey, context);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: preferencesKey });
    },
  });

  return {
    preferences: query.data ?? DEFAULT_PREFERENCES,
    update: (preferences: Preferences) => mutation.mutate(preferences),
  };
}
