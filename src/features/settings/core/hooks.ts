import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { DEFAULT_PREFERENCES, type Preferences } from './entity';
import { getPreferencesRepository } from './preferencesRepository';

const preferencesKey = ['preferences'] as const;

export function usePreferences() {
  const repository = getPreferencesRepository();
  const queryClient = useQueryClient();
  const query = useQuery<Preferences, Error>({
    queryKey: preferencesKey,
    queryFn: () => repository.get(),
    initialData: DEFAULT_PREFERENCES,
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
