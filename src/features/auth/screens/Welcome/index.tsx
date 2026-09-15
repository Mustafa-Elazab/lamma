import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { branding } from '../../../../assets';
import { Button } from '../../../../design-system/atoms/Button';
import { Text } from '../../../../design-system/atoms/Text';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { useAuth } from '../../AuthProvider';
import { GoogleMark, AppleMark } from '../../components/ProviderMarks';
import { LanguageToggle } from '../../components/LanguageToggle';
import { SocialButton } from '../../components/SocialButton';
import { createStyles } from './styles';

export function WelcomeScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const {
    continueAsGuest,
    signInWithGoogle,
    signInWithApple,
    isAppleSupported,
    isSigningIn,
    activeProvider,
    error,
  } = useAuth();

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
            <Image source={branding.logoTransparent} style={styles.heroLogo} />
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text variant="heading">{t('auth.welcomeTitle')}</Text>
          <Text variant="body" color="textMuted">
            {t('auth.welcomeSubtitle')}
          </Text>
        </View>

        <Button
          label={t('auth.continueAsGuest')}
          onPress={() => void continueAsGuest()}
          loading={activeProvider === 'guest'}
          disabled={isSigningIn}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text variant="caption" color="textMuted">
            {t('auth.or')}
          </Text>
          <View style={styles.dividerLine} />
        </View>

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

        <View style={styles.noPhoneBlock}>
          <Text variant="subheading" color="primary">
            {t('auth.noPhoneTitle')}
          </Text>
          <Text variant="caption" color="textMuted">
            {t('auth.noPhoneSubtitle')}
          </Text>
          {error ? (
            <Text variant="caption" color="error">
              {t('auth.errorGeneric')}
            </Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <LanguageToggle />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
