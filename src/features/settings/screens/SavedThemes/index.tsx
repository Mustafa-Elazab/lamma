import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { AppThemeSwatch } from '../../../../design-system/organisms/ThemeSwatch';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { themeSource } from '../../../events';
import { createStyles } from './styles';
import { useSavedThemesController } from './useController';

export function SavedThemesScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useSavedThemesController();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={c.t('settings.savedThemesTitle')}
          onBack={c.goBack}
        />
      }
    >
      <AppText variant="caption" color="textMuted">
        {c.t('settings.savedThemesHint')}
      </AppText>
      <View style={styles.grid}>
        {c.themeItems.map(item => (
          <View key={item.key} style={styles.cell}>
            <AppThemeSwatch
              label={item.label}
              image={themeSource(item.key)}
              selected={item.saved}
              width={96}
            />
            <Pressable
              style={styles.heart}
              hitSlop={8}
              onPress={() => c.onToggle(item.key)}
            >
              <AppIcon
                name="heart"
                size={22}
                color={item.saved ? 'primary' : 'textMuted'}
              />
            </Pressable>
          </View>
        ))}
      </View>
    </AppScreenTemplate>
  );
}
