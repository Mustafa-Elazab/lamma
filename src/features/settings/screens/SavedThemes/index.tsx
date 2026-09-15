import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppThemeSwatch } from '../../../../design-system/organisms/ThemeSwatch';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import { themeSource, type EventThemeKey } from '../../../events';
import { toggleTheme, usePreferences } from '../../core';

const ALL_THEMES: EventThemeKey[] = [
  'wedding',
  'birthday',
  'dinner',
  'travel',
  'generic',
];

export function SavedThemesScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { preferences, update } = usePreferences();

  const onToggle = (key: EventThemeKey) => {
    update({
      ...preferences,
      savedThemes: toggleTheme(preferences.savedThemes, key),
    });
  };

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={t('settings.savedThemesTitle')}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <AppText variant="caption" color="textMuted">
        {t('settings.savedThemesHint')}
      </AppText>
      <View style={styles.grid}>
        {ALL_THEMES.map(key => {
          const saved = preferences.savedThemes.includes(key);
          return (
            <View key={key} style={styles.cell}>
              <AppThemeSwatch
                label={t(`themeNames.${key}`)}
                image={themeSource(key)}
                selected={saved}
                width={96}
              />
              <Pressable
                style={styles.heart}
                hitSlop={8}
                onPress={() => onToggle(key)}
              >
                <AppIcon
                  name="heart"
                  size={22}
                  color={saved ? 'primary' : 'textMuted'}
                />
              </Pressable>
            </View>
          );
        })}
      </View>
    </AppScreenTemplate>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.lg,
      justifyContent: 'space-between',
    },
    cell: { alignItems: 'center', gap: theme.spacing.xs },
    heart: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
  });
}
