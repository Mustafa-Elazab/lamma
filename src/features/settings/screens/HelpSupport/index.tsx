import React, { useMemo } from 'react';
import { View } from 'react-native';

import { AppText } from '../../../../design-system/atoms/Text';
import { AppListItem } from '../../../../design-system/molecules/ListItem';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { createStyles } from './styles';
import { useHelpSupportController } from './useController';

export function HelpSupportScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useHelpSupportController();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={c.t('settings.helpTitle')}
          onBack={c.goBack}
        />
      }
    >
      <View style={styles.group}>
        {c.items.map((item, index) => (
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
        {c.t('settings.appVersion', { version: c.appVersion })}
      </AppText>
    </AppScreenTemplate>
  );
}
