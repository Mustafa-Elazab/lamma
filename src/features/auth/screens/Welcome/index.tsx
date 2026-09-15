import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppText } from '../../../../design-system/atoms/Text';
import { GoogleMark, AppleMark } from '../../../../design-system/atoms/ProviderMarks';
import { LanguageToggle } from '../../../../design-system/molecules/LanguageToggle';
import { SocialButton } from '../../../../design-system/molecules/SocialButton';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { createStyles } from './styles';
import { useWelcomeController } from './useController';

export function WelcomeScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const c = useWelcomeController();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroCircleOne} />
          <View style={styles.heroCircleTwo} />
          <View style={styles.heroBadge}>
            <View style={styles.heroMonogram}>
              <AppText
                variant="heading"
                color="textInverse"
                style={styles.heroLetter}
              >
                L
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <AppText variant="heading" style={styles.welcomeTitle}>
            {t('auth.welcomeTitle')}
          </AppText>
          <AppText variant="body" color="textMuted">
            {t('auth.welcomeSubtitle')}
          </AppText>
        </View>

        <AppButton
          label={t('auth.continueAsGuest')}
          style={styles.guestButton}
          onPress={() => void c.continueAsGuest()}
          loading={c.activeProvider === 'guest'}
          disabled={c.isSigningIn}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <AppText variant="caption" color="textMuted">
            {t('auth.or')}
          </AppText>
          <View style={styles.dividerLine} />
        </View>

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

        <View style={styles.noPhoneBlock}>
          <AppText variant="subheading" color="primary">
            {t('auth.noPhoneTitle')}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {t('auth.noPhoneSubtitle')}
          </AppText>
          {c.error ? (
            <AppText variant="caption" color="error">
              {t('auth.errorGeneric')}
            </AppText>
          ) : null}
        </View>

        <View style={styles.footer}>
          <LanguageToggle />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
