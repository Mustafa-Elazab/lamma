import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useLanguage } from '../../../app/localization';
import { AppText } from '../../atoms/Text';
import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';

export function LanguageToggle(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.row}>
      <Pressable onPress={() => void setLanguage('en')} hitSlop={8}>
        <AppText
          variant="label"
          color={language === 'en' ? 'text' : 'textMuted'}
          weight={language === 'en' ? '700' : '500'}
        >
          English
        </AppText>
      </Pressable>
      <View style={styles.dot} />
      <Pressable onPress={() => void setLanguage('ar')} hitSlop={8}>
        <AppText
          variant="label"
          color={language === 'ar' ? 'text' : 'textMuted'}
          weight={language === 'ar' ? '700' : '500'}
        >
          العربية
        </AppText>
      </Pressable>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textMuted,
    },
  });
}
