import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../../auth';

export function useEditProfileController() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    user,
    updateProfile,
    signInWithGoogle,
    signInWithApple,
    isAppleSupported,
    isSigningIn,
    activeProvider,
  } = useAuth();

  const isGuest = Boolean(user?.isAnonymous);
  const [name, setName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSave = async () => {
    if (!name.trim()) {
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ displayName: name.trim() });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return {
    t,
    user,
    isGuest,
    name,
    setName: (text: string) => {
      setName(text);
      setSaved(false);
    },
    saving,
    saved,
    onSave,
    goBack: () => navigation.goBack(),
    // Social sign-in (for guest upgrade flow)
    signInWithGoogle,
    signInWithApple,
    isAppleSupported,
    isSigningIn,
    activeProvider,
  };
}
