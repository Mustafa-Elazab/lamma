import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { createStyles } from './styles';
import { useAppearanceController } from './useController';

export function AppearanceScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useAppearanceController();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={c.t('settings.appearanceTitle')}
          onBack={c.goBack}
        />
      }
    >
      <AppText variant="caption" color="textMuted">
        {c.t('settings.appearanceHint')}
      </AppText>
      <View style={styles.group}>
        {c.options.map((option, index) => (
          <React.Fragment key={option.value}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <Pressable
              style={styles.row}
              onPress={() => c.setAppearance(option.value)}
            >
              <AppIcon name={option.icon} size={20} color="primary" />
              <AppText variant="body" style={styles.rowLabel}>
                {option.label}
              </AppText>
              {c.currentAppearance === option.value ? (
                <AppIcon name="check" size={22} color="primary" />
              ) : null}
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </AppScreenTemplate>
  );
}
