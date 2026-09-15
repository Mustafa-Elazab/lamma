import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { onboardingImages } from '../../../../assets';
import { useOnboardingContext } from '../../OnboardingProvider';
import type { OnboardingSlide } from './types';

export function useOnboardingController(width: number) {
  const { t } = useTranslation();
  const { complete } = useOnboardingContext();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);

  const slides = useMemo<OnboardingSlide[]>(
    () => [
      {
        key: 'slide1',
        image: onboardingImages.onboarding01,
        title: t('onboarding.slide1Title'),
        subtitle: t('onboarding.slide1Subtitle'),
      },
      {
        key: 'slide2',
        image: onboardingImages.onboarding03,
        title: t('onboarding.slide3Title'),
        subtitle: t('onboarding.slide3Subtitle'),
      },
      {
        key: 'slide3',
        image: onboardingImages.onboarding04,
        title: t('onboarding.slide4Title'),
        subtitle: t('onboarding.slide4Subtitle'),
      },
    ],
    [t],
  );

  const isLast = index === slides.length - 1;

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      if (next !== index) {
        setIndex(next);
      }
    },
    [index, width],
  );

  const goNext = useCallback(() => {
    if (isLast) {
      void complete();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    setIndex(next);
  }, [complete, index, isLast, width]);

  const skipToSignIn = useCallback(() => {
    void complete();
  }, [complete]);

  return { slides, index, isLast, listRef, onScroll, goNext, skipToSignIn };
}
