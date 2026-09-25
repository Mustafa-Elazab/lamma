import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../auth';
import { EMPTY_PROFILE, type UserProfile, type UserProfilePatch } from './entity';
import { getUserProfileRepository } from './profileRepository';

export const userProfileKey = (uid: string | null) =>
  ['userProfile', uid ?? 'anonymous'] as const;

export function useUserProfile() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const query = useQuery<UserProfile, Error>({
    queryKey: userProfileKey(uid),
    queryFn: () => getUserProfileRepository().get(uid as string),
    enabled: Boolean(uid),
  });
  return { ...query, profile: query.data ?? EMPTY_PROFILE };
}

export function useSaveUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid ?? null;
  return useMutation<UserProfile, Error, UserProfilePatch>({
    mutationFn: patch => {
      if (!uid) {
        throw new Error('profile/auth-required');
      }
      return getUserProfileRepository().save(uid, patch);
    },
    onSuccess: profile => {
      queryClient.setQueryData(userProfileKey(uid), profile);
    },
  });
}
