import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { createStyles } from './styles';
import { useLanguageSettingsController } from './useController';

export function LanguageSettingsScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useLanguageSettingsController();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={c.t('language.title')}
          onBack={c.goBack}
        />
      }
    >
      <View style={styles.group}>
        {c.options.map((option, index) => (
          <React.Fragment key={option.value}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <Pressable
              style={styles.row}
              onPress={() => void c.setLanguage(option.value)}
            >
              <AppText variant="body">{option.label}</AppText>
              {c.language === option.value ? (
                <AppIcon name="check" size={22} color="primary" />
              ) : null}
            </Pressable>
          </React.Fragment>
        ))}
      </View>
      <AppText variant="caption" color="textMuted">
        {c.t('language.restartHint')}
      </AppText>
    </AppScreenTemplate>
  );
}
