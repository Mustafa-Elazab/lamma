export type UserProfile = {
  displayName: string | null;
  /** Shrunk JPEG as a `data:image/...;base64,` URI (no Storage on Spark). */
  photoDataUrl: string | null;
  /** True once the user saved or skipped the first-run profile setup. */
  setupCompleted: boolean;
  updatedAt: number;
};

export type UserProfilePatch = Partial<Omit<UserProfile, 'updatedAt'>>;

export const EMPTY_PROFILE: UserProfile = {
  displayName: null,
  photoDataUrl: null,
  setupCompleted: false,
  updatedAt: 0,
};

/** Firestore documents max out at 1 MB; a 512px photo is far below this. */
export const MAX_PROFILE_PHOTO_CHARS = 700_000;

/**
 * First-run profile setup is shown when the signed-in account has no display
 * name yet and the user has not already saved or skipped the setup screen.
 */
export function needsProfileSetup(params: {
  displayName: string | null | undefined;
  setupCompleted: boolean;
}): boolean {
  return !params.displayName?.trim() && !params.setupCompleted;
}

export function normalizeProfile(data: unknown): UserProfile {
  const d = (data ?? {}) as Record<string, unknown>;
  const photo = typeof d.photoDataUrl === 'string' ? d.photoDataUrl : null;
  return {
    displayName:
      typeof d.displayName === 'string' && d.displayName.trim()
        ? d.displayName.trim()
        : null,
    photoDataUrl: photo && photo.startsWith('data:image/') ? photo : null,
    setupCompleted: d.setupCompleted === true,
    updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : 0,
  };
}
