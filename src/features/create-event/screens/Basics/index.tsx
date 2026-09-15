import React, { useMemo } from 'react';
import { View } from 'react-native';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppInput } from '../../../../design-system/atoms/Input';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
} from '../../core/draftEntity';
import { CategoryPicker } from '../../components/CategoryPicker';
import { CreateHeader } from '../../components/CreateHeader';
import { LivePreviewCard } from '../../components/LivePreviewCard';
import { WIZARD_STEP } from '../steps';
import { createStyles } from './styles';
import { useBasicsController } from './useController';

export function BasicsScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useBasicsController();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <CreateHeader
          title={c.t('create.title')}
          steps={c.steps}
          currentStep={WIZARD_STEP.basics}
          onBack={c.goBack}
        />
      }
      footer={
        <AppButton
          label={c.t('common.next')}
          rightIcon="navigation"
          onPress={c.goNext}
          disabled={!c.basics.valid}
        />
      }
    >
      <View style={styles.section}>
        <AppInput
          label={c.t('create.eventTitle')}
          placeholder={c.t('create.eventTitlePlaceholder')}
          value={c.draft.title}
          onChangeText={c.setTitle}
          counterMax={MAX_TITLE_LENGTH}
          maxLength={MAX_TITLE_LENGTH}
        />
      </View>

      <View style={styles.section}>
        <AppText variant="label">{c.t('create.category')}</AppText>
        <AppText variant="caption" color="textMuted">
          {c.t('create.categoryHint')}
        </AppText>
        <CategoryPicker value={c.draft.category} onChange={c.setCategory} />
      </View>

      <View style={styles.section}>
        <AppInput
          label={c.t('create.description')}
          placeholder={c.t('create.descriptionPlaceholder')}
          value={c.draft.description}
          onChangeText={c.setDescription}
          counterMax={MAX_DESCRIPTION_LENGTH}
          maxLength={MAX_DESCRIPTION_LENGTH}
          multiline
        />
      </View>

      <View style={styles.section}>
        <View style={styles.previewHint}>
          <AppText variant="label">{c.t('create.livePreview')}</AppText>
          <AppText variant="caption" color="primary">
            {c.t('create.livePreviewHint')}
          </AppText>
        </View>
        <LivePreviewCard draft={c.draft} />
      </View>
    </AppScreenTemplate>
  );
}
