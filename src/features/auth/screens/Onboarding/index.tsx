import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { branding } from '../../../../assets';
import { Button } from '../../../../design-system/atoms/Button';
import { Text } from '../../../../design-system/atoms/Text';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { LanguageToggle } from '../../components/LanguageToggle';
import { createStyles } from './styles';
import type { OnboardingSlide } from './types';
import { useOnboardingController } from './useController';

export function OnboardingScreen(): React.ReactElement {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);
  const { t } = useTranslation();
  const { slides, index, isLast, listRef, onScroll, goNext, skipToSignIn } =
    useOnboardingController(width);

  const renderItem = ({ item }: ListRenderItemInfo<OnboardingSlide>) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.heroImage} />
      <View style={styles.textBlock}>
        <Text variant="heading" align="center">
          {item.title}
        </Text>
        <Text variant="body" color="textMuted" align="center">
          {item.subtitle}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Image source={branding.logo} style={styles.logo} />
        <Text variant="caption" color="textMuted" style={styles.tagline}>
          {t('onboarding.tagline')}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.dots}>
        {slides.map((slide, i) => (
          <View
            key={slide.key}
            style={[
              styles.dot,
              { width: i === index ? 22 : 8 },
              i === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label={isLast ? t('onboarding.getStarted') : t('common.continue')}
          rightIcon="navigation"
          onPress={goNext}
        />
        <Button
          label={t('common.signIn')}
          variant="secondary"
          onPress={skipToSignIn}
        />
        <LanguageToggle />
      </View>
    </SafeAreaView>
  );
}
