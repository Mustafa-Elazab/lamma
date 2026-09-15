import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppInput } from '../../../../design-system/atoms/Input';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import { useAuth } from '../../../auth';
import { GoogleMark, AppleMark } from '../../../auth/components/ProviderMarks';
import { SocialButton } from '../../../auth/components/SocialButton';

export function EditProfileScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={t('profile.editProfileTitle')}
          onBack={() => navigation.goBack()}
        />
      }
    >
      {isGuest ? (
        <View style={styles.section}>
          <AppText variant="subheading">{t('profile.upgradeTitle')}</AppText>
          <AppText variant="body" color="textMuted">
            {t('profile.upgradeSubtitle')}
          </AppText>
          <View style={styles.socials}>
            <SocialButton
              label={t('auth.continueWithGoogle')}
              mark={<GoogleMark />}
              tone="light"
              onPress={() => void signInWithGoogle()}
              loading={activeProvider === 'google'}
              disabled={isSigningIn}
            />
            {isAppleSupported ? (
              <SocialButton
                label={t('auth.continueWithApple')}
                mark={<AppleMark />}
                tone="dark"
                onPress={() => void signInWithApple()}
                loading={activeProvider === 'apple'}
                disabled={isSigningIn}
              />
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <AppInput
            label={t('profile.displayNameLabel')}
            placeholder={t('profile.displayNamePlaceholder')}
            value={name}
            onChangeText={text => {
              setName(text);
              setSaved(false);
            }}
            leftIcon="profile"
          />
          {user?.email ? (
            <AppInput
              label="Email"
              value={user.email}
              editable={false}
              leftIcon="link"
            />
          ) : null}
          {saved ? (
            <AppText variant="caption" color="success">
              {t('profile.profileSaved')}
            </AppText>
          ) : null}
          <AppButton
            label={t('common.save')}
            onPress={() => void onSave()}
            loading={saving}
            disabled={!name.trim() || saving}
          />
        </View>
      )}
    </AppScreenTemplate>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    section: { gap: theme.spacing.md },
    socials: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  });
}
