import React, { useMemo } from 'react';
import { View } from 'react-native';

import { AppText } from '../../../../design-system/atoms/Text';
import { AppToggle } from '../../../../design-system/atoms/Toggle';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { createStyles } from './styles';
import { useNotificationSettingsController } from './useController';

export function NotificationSettingsScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useNotificationSettingsController();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={c.t('settings.notificationsTitle')}
          onBack={c.goBack}
        />
      }
    >
      <View style={styles.group}>
        {c.items.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.row}>
              <View style={styles.rowText}>
                <AppText variant="bodyStrong">{item.label}</AppText>
                <AppText variant="caption" color="textMuted">
                  {item.hint}
                </AppText>
              </View>
              <AppToggle
                value={c.notifications[item.key]}
                onValueChange={value => c.setKey(item.key, value)}
              />
            </View>
          </React.Fragment>
        ))}
      </View>
    </AppScreenTemplate>
  );
}
