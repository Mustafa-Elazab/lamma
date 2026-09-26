import { useCallback, useEffect, useState } from 'react';

import type { AuthUser } from '../auth';
import { needsProfileSetup } from './core/entity';
import { hasCompletedProfileSetup } from './core/setupFlag';

export type ProfileSetupGateStatus = 'checking' | 'needed' | 'done';

/**
 * Decides whether the first-run profile setup screen shows after sign-in
 * (guest, Google or Apple): only when the account has no display name and
 * the user has not already saved or skipped the setup on this device.
 */
export function useProfileSetupGate(user: AuthUser | null): {
  status: ProfileSetupGateStatus;
  complete: () => void;
} {
  const uid = user?.uid ?? null;
  const [checked, setChecked] = useState<{ uid: string; done: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (!uid) {
      return;
    }
    let cancelled = false;
    hasCompletedProfileSetup(uid)
      .catch(() => true)
      .then(done => {
        if (!cancelled) {
          setChecked({ uid, done });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const complete = useCallback(() => {
    if (uid) {
      setChecked({ uid, done: true });
    }
  }, [uid]);

  if (!uid) {
    return { status: 'done', complete };
  }
  if (!checked || checked.uid !== uid) {
    return { status: 'checking', complete };
  }
  const needed = needsProfileSetup({
    displayName: user?.displayName,
    setupCompleted: checked.done,
  });
  return { status: needed ? 'needed' : 'done', complete };
}
