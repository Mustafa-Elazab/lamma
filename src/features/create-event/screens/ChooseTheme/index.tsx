import React, { useMemo } from 'react';
import { ImageBackground, ScrollView, View } from 'react-native';

import { Button } from '../../../../design-system/atoms/Button';
import { Icon } from '../../../../design-system/atoms/Icon';
import { Text } from '../../../../design-system/atoms/Text';
import { SectionHeader } from '../../../../design-system/molecules/SectionHeader';
import { ThemeSwatch } from '../../../../design-system/organisms/ThemeSwatch';
import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
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
    <ScreenTemplate
      edges={['top']}
      header={
        <CreateHeader
          title={c.t('create.chooseTheme')}
          steps={c.steps}
          currentStep={WIZARD_STEP.theme}
          onBack={c.goBack}
        />
      }
      footer={
        <Button
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
          <Text variant="heading" color="textInverse" numberOfLines={2}>
            {c.draft.title.trim() || c.t('create.eventTitle')}
          </Text>
          {c.dateLabel ? (
            <View style={styles.metaRow}>
              <Icon name="calendar" size={16} color="textInverse" />
              <Text variant="caption" color="textInverse">
                {c.dateLabel}
              </Text>
            </View>
          ) : null}
          {c.locationLabel ? (
            <View style={styles.metaRow}>
              <Icon name="location" size={16} color="textInverse" />
              <Text variant="caption" color="textInverse">
                {c.locationLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </ImageBackground>

      <View>
        <SectionHeader title={c.t('create.themes')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.swatchRow}
        >
          {c.themes.map(item => (
            <ThemeSwatch
              key={item.key}
              label={item.label}
              image={item.image}
              selected={c.selected === item.key}
              onPress={() => c.setTheme(item.key)}
            />
          ))}
        </ScrollView>
      </View>
    </ScreenTemplate>
  );
}
