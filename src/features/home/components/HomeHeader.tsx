import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Image, ImageBackground, StyleSheet, View } from 'react-native';

import { branding, headerImages } from '../../../assets';
import { AppAvatar } from '../../../design-system/atoms/Avatar';
import { AppText } from '../../../design-system/atoms/Text';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';

export type HomeHeaderProps = {
  greetingName: string;
  avatar?: { uri: string } | undefined;
};

export function HomeHeader({
  greetingName,
  avatar,
}: HomeHeaderProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <ImageBackground
      source={headerImages.egyptMotif}
      style={styles.container}
      imageStyle={styles.bg}
      resizeMode="repeat"
    >
      <View style={styles.row}>
        <View style={styles.logoBlock}>
          <Image source={branding.logo} style={styles.logo} />
          <Image
            source={headerImages.egyptMotif}
            style={styles.motifBand}
            resizeMode="repeat"
          />
        </View>
        <View style={styles.userBlock}>
          <View style={styles.greeting}>
            <AppText variant="caption" color="textMuted">
              {t('home.greeting')}
            </AppText>
            <AppText variant="bodyStrong">{greetingName}</AppText>
          </View>
          <AppAvatar source={avatar} name={greetingName} size={44} showStatus />
        </View>
      </View>
      <AppText variant="caption" color="textMuted" style={styles.tagline}>
        {t('onboarding.tagline')}
      </AppText>
    </ImageBackground>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    // Subtle Egypt motif tile repeated behind the header content.
    bg: { opacity: 0.08 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoBlock: { gap: theme.spacing.xs },
    logo: { width: 130, height: 52, resizeMode: 'contain' },
    // A small motif band under the logo as a branded accent divider.
    motifBand: { width: 96, height: 12, opacity: 0.9 },
    userBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    greeting: {
      // Keep the name/greeting flush to the outer edge in both LTR and RTL.
      alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end',
    },
    tagline: {
      letterSpacing: 2,
      fontSize: 9,
      marginTop: theme.spacing.xs,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
      alignSelf: 'stretch',
    },
  });
}
