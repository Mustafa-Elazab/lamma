import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../design-system/atoms/Text';
import { AppListItem } from '../../../../design-system/molecules/ListItem';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import type { IconName } from '../../../../design-system/atoms/Icon';

const APP_VERSION = '1.0.0';

export function HelpSupportScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();

  const items: { key: string; label: string; icon: IconName; onPress: () => void }[] =
    [
      {
        key: 'faq',
        label: t('settings.faq'),
        icon: 'help',
        onPress: () => undefined,
      },
      {
        key: 'contact',
        label: t('settings.contactUs'),
        icon: 'comment',
        onPress: () => void Linking.openURL('mailto:hello@lamma.app'),
      },
      {
        key: 'terms',
        label: t('settings.terms'),
        icon: 'draft',
        onPress: () => undefined,
      },
      {
        key: 'privacy',
        label: t('settings.privacy'),
        icon: 'shield',
        onPress: () => undefined,
      },
    ];

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={t('settings.helpTitle')}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <View style={styles.group}>
        {items.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <AppListItem
              title={item.label}
              leadingIcon={item.icon}
              showChevron
              onPress={item.onPress}
            />
          </React.Fragment>
        ))}
      </View>
      <AppText variant="caption" color="textMuted" align="center">
        {t('settings.appVersion', { version: APP_VERSION })}
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
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  });
}
