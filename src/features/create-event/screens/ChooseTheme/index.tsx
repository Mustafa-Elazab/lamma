import React, { useMemo } from 'react';
import { ImageBackground, ScrollView, View } from 'react-native';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppSectionHeader } from '../../../../design-system/molecules/SectionHeader';
import { AppThemeSwatch } from '../../../../design-system/organisms/ThemeSwatch';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { CreateHeader } from '../../components/CreateHeader';
import { WIZARD_STEP } from '../steps';
import { createStyles } from './styles';
import { useChooseThemeController } from './useController';

export function ChooseThemeScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useChooseThemeController();

  return (
    <AppScreenTemplate
      edges={['top', 'bottom']}
      header={
        <CreateHeader
          title={c.t('create.chooseTheme')}
          steps={c.steps}
          currentStep={WIZARD_STEP.theme}
          onBack={c.goBack}
        />
      }
      footer={
        <AppButton
          label={c.t('create.useThisTheme')}
          rightIcon="navigation"
          onPress={c.goNext}
        />
      }
    >
      <ImageBackground
        source={c.heroImage}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay}>
          <AppText
            variant="heading"
            color="textInverse"
            numberOfLines={2}
            align="center"
          >
            {c.draft.title.trim() || c.t('create.eventTitle')}
          </AppText>
          {c.dateLabel ? (
            <View style={styles.metaRow}>
              <AppIcon name="calendar" size={16} color="textInverse" />
              <AppText variant="caption" color="textInverse">
                {c.dateLabel}
              </AppText>
            </View>
          ) : null}
          {c.locationLabel ? (
            <View style={styles.metaRow}>
              <AppIcon name="location" size={16} color="textInverse" />
              <AppText variant="caption" color="textInverse">
                {c.locationLabel}
              </AppText>
            </View>
          ) : null}
        </View>
      </ImageBackground>

      <View>
        <AppSectionHeader title={c.t('create.themes')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.swatchRow}
        >
          {c.themes.map(item => (
            <AppThemeSwatch
              key={item.key}
              label={item.label}
              image={item.image}
              selected={c.selected === item.key}
              onPress={() => c.setTheme(item.key)}
            />
          ))}
        </ScrollView>
      </View>
    </AppScreenTemplate>
  );
}
