import type { UserProfile, UserProfilePatch } from './entity';

export interface UserProfileRepository {
  get(uid: string): Promise<UserProfile>;
  save(uid: string, patch: UserProfilePatch): Promise<UserProfile>;
}
