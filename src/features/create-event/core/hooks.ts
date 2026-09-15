import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { EventDraft } from './draftEntity';
import { getDraftRepository } from './draftRepositoryFactory';
import { draftKeys } from './queryKeys';

export function useDrafts() {
  const repository = getDraftRepository();
  return useQuery<EventDraft[], Error>({
    queryKey: draftKeys.list(),
    queryFn: () => repository.list(),
  });
}

export function useDraft(id: string | undefined) {
  const repository = getDraftRepository();
  return useQuery<EventDraft | null, Error>({
    queryKey: draftKeys.detail(id ?? 'none'),
    queryFn: () => (id ? repository.get(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useDeleteDraft() {
  const repository = getDraftRepository();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: id => repository.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: draftKeys.all });
    },
  });
}
