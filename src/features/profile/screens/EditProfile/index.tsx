import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppInput } from '../../../../design-system/atoms/Input';
import { AppleMark, GoogleMark } from '../../../../design-system/atoms/ProviderMarks';
import { AppText } from '../../../../design-system/atoms/Text';
import { SocialButton } from '../../../../design-system/molecules/SocialButton';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { createStyles } from './styles';
import { useEditProfileController } from './useController';

export function EditProfileScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const c = useEditProfileController();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={t('profile.editProfileTitle')}
          onBack={c.goBack}
        />
      }
    >
      {c.isGuest ? (
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
              onPress={() => void c.signInWithGoogle()}
              loading={c.activeProvider === 'google'}
              disabled={c.isSigningIn}
            />
            {c.isAppleSupported ? (
              <SocialButton
                label={t('auth.continueWithApple')}
                mark={<AppleMark />}
                tone="dark"
                onPress={() => void c.signInWithApple()}
                loading={c.activeProvider === 'apple'}
                disabled={c.isSigningIn}
              />
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <AppInput
            label={t('profile.displayNameLabel')}
            placeholder={t('profile.displayNamePlaceholder')}
            value={c.name}
            onChangeText={c.setName}
            leftIcon="profile"
          />
          {c.user?.email ? (
            <AppInput
              label="Email"
              value={c.user.email}
              editable={false}
              leftIcon="link"
            />
          ) : null}
          {c.saved ? (
            <AppText variant="caption" color="success">
              {t('profile.profileSaved')}
            </AppText>
          ) : null}
          <AppButton
            label={t('common.save')}
            onPress={() => void c.onSave()}
            loading={c.saving}
            disabled={!c.name.trim() || c.saving}
          />
        </View>
      )}
    </AppScreenTemplate>
  );
}
