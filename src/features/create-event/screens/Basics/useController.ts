import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type { CreateEventStackParamList } from '../../../../navigation/types';
import type { EventCategory } from '../../../events';
import { useCreateEventContext } from '../../CreateEventProvider';
import { wizardSteps } from '../steps';

export function useBasicsController() {
  const { t } = useTranslation();
  useLanguage();
  const navigation =
    useNavigation<NavigationProp<CreateEventStackParamList>>();
  const { draft, update, basics } = useCreateEventContext();

  const steps = useMemo(() => wizardSteps(t), [t]);

  const setTitle = useCallback((title: string) => update({ title }), [update]);
  const setDescription = useCallback(
    (description: string) => update({ description }),
    [update],
  );
  const setCategory = useCallback(
    (category: EventCategory) => update({ category }),
    [update],
  );

  const goBack = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  const goNext = useCallback(() => {
    if (basics.valid) {
      navigation.navigate('WhenWhere');
    }
  }, [basics.valid, navigation]);

  return {
    t,
    draft,
    steps,
    basics,
    setTitle,
    setDescription,
    setCategory,
    goBack,
    goNext,
  };
}
