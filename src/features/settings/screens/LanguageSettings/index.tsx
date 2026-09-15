import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { useLanguage, type AppLanguage } from '../../../../app/localization';
import { Icon } from '../../../../design-system/atoms/Icon';
import { Text } from '../../../../design-system/atoms/Text';
import { ScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';

export function LanguageSettingsScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { language, setLanguage } = useLanguage();

  const options: { value: AppLanguage; label: string }[] = [
    { value: 'en', label: t('language.english') },
    { value: 'ar', label: t('language.arabic') },
  ];

  return (
    <ScreenTemplate
      edges={['top']}
      header={
        <ScreenHeader
          title={t('language.title')}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <View style={styles.group}>
        {options.map((option, index) => (
          <React.Fragment key={option.value}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <Pressable
              style={styles.row}
              onPress={() => void setLanguage(option.value)}
            >
              <Text variant="body">{option.label}</Text>
              {language === option.value ? (
                <Icon name="check" size={22} color="primary" />
              ) : null}
            </Pressable>
          </React.Fragment>
        ))}
      </View>
      <Text variant="caption" color="textMuted">
        {t('language.restartHint')}
      </Text>
    </ScreenTemplate>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    group: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.lg,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  });
}
