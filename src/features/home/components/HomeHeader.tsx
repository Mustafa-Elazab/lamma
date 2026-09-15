import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';

import { branding, headerImages } from '../../../assets';
import { Avatar } from '../../../design-system/atoms/Avatar';
import { Text } from '../../../design-system/atoms/Text';
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
      source={headerImages.events}
      style={styles.container}
      imageStyle={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.row}>
        <View style={styles.logoBlock}>
          <Image source={branding.logo} style={styles.logo} />
          <View style={styles.underline} />
        </View>
        <View style={styles.userBlock}>
          <View style={styles.greeting}>
            <Text variant="caption" color="textMuted">
              {t('home.greeting')}
            </Text>
            <Text variant="bodyStrong">{greetingName}</Text>
          </View>
          <Avatar source={avatar} name={greetingName} size={44} showStatus />
        </View>
      </View>
      <Text variant="caption" color="textMuted" style={styles.tagline}>
        {t('onboarding.tagline')}
      </Text>
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
    bg: { opacity: 0.35 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoBlock: { gap: theme.spacing.xs },
    logo: { width: 118, height: 40, resizeMode: 'contain' },
    underline: {
      width: 46,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    userBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    greeting: { alignItems: 'flex-end' },
    tagline: { letterSpacing: 1.2, marginTop: theme.spacing.sm },
  });
}
