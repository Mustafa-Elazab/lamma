import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { useLanguage, type AppLanguage } from '../../../../app/localization';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
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
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
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
              <AppText variant="body">{option.label}</AppText>
              {language === option.value ? (
                <AppIcon name="check" size={22} color="primary" />
              ) : null}
            </Pressable>
          </React.Fragment>
        ))}
      </View>
      <AppText variant="caption" color="textMuted">
        {t('language.restartHint')}
      </AppText>
    </AppScreenTemplate>
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
