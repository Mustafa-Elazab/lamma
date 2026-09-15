import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type { AppStackParamList } from '../../../../navigation/types';
import { useDeleteDraft, useDrafts } from '../../../create-event/core';
import { resolveDraftTheme } from '../../../create-event/core/draftEntity';
import { themeSource } from '../../../events';
import { formatDateShort } from '../../../../utils/format';

export function useMyDraftsController() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { data: drafts = [] } = useDrafts();
  const deleteDraft = useDeleteDraft();

  const goCreateEvent = () => navigation.navigate('CreateEvent');
  const goEditDraft = (draftId: string) =>
    navigation.navigate('CreateEvent', { draftId });
  const handleDeleteDraft = (draftId: string) =>
    deleteDraft.mutate(draftId);

  const draftItems = drafts.map(draft => ({
    id: draft.id,
    title: draft.title.trim() || t('drafts.untitled'),
    lastEdited: t('drafts.lastEdited', {
      when: formatDateShort(draft.updatedAt, language),
    }),
    coverSource: themeSource(resolveDraftTheme(draft)),
  }));

  return {
    t,
    draftItems,
    goCreateEvent,
    goEditDraft,
    handleDeleteDraft,
    goBack: () => navigation.goBack(),
  };
}
