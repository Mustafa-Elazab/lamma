import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { reportError } from '../../../../services/crashReporting';
import { useAuth } from '../../../auth';
import {
  markProfileSetupCompleted,
  pickProfilePhoto,
  useSaveUserProfile,
} from '../../core';

export function useProfileSetupController(onDone: () => void) {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const saveProfile = useSaveUserProfile();
  const uid = user?.uid ?? null;
  const [name, setName] = useState(user?.displayName ?? '');
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choosePhoto = useCallback(async () => {
    setError(null);
    try {
      const picked = await pickProfilePhoto();
      if (picked) {
        setPhoto(picked);
      }
    } catch {
      setError(t('profileSetup.photoError'));
    }
  }, [t]);

  const save = useCallback(async () => {
    if (!uid) {
      return;
    }
    const displayName = name.trim();
    setSaving(true);
    setError(null);
    try {
      // Firestore first (photo + name), then the auth display name: updating
      // auth re-renders the root gate, which leaves this screen.
      await saveProfile.mutateAsync({
        displayName: displayName || null,
        ...(photo ? { photoDataUrl: photo } : {}),
        setupCompleted: true,
      });
      await markProfileSetupCompleted(uid);
      if (displayName) {
        await updateProfile({ displayName });
      }
      onDone();
    } catch (err) {
      reportError(err, 'profile.setup-save', { uid });
      setError(t('profileSetup.saveError'));
      setSaving(false);
    }
  }, [name, onDone, photo, saveProfile, t, uid, updateProfile]);

  const skip = useCallback(async () => {
    if (!uid) {
      return;
    }
    await markProfileSetupCompleted(uid).catch(err =>
      reportError(err, 'profile.setup-skip', { uid }),
    );
    saveProfile.mutate({ setupCompleted: true });
    onDone();
  }, [onDone, saveProfile, uid]);

  return {
    t,
    name,
    setName,
    photo,
    choosePhoto,
    removePhoto: () => setPhoto(null),
    save,
    skip,
    saving,
    error,
    canSave: Boolean(name.trim() || photo) && !saving,
  };
}
