import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '../../../../design-system/atoms/Icon';
import { Text } from '../../../../design-system/atoms/Text';
import { ScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { ThemeSwatch } from '../../../../design-system/organisms/ThemeSwatch';
import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
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
    <ScreenTemplate
      edges={['top']}
      header={
        <ScreenHeader
          title={t('settings.savedThemesTitle')}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <Text variant="caption" color="textMuted">
        {t('settings.savedThemesHint')}
      </Text>
      <View style={styles.grid}>
        {ALL_THEMES.map(key => {
          const saved = preferences.savedThemes.includes(key);
          return (
            <View key={key} style={styles.cell}>
              <ThemeSwatch
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
                <Icon
                  name="heart"
                  size={22}
                  color={saved ? 'primary' : 'textMuted'}
                />
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScreenTemplate>
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
