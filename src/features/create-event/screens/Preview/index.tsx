import React, { useMemo } from 'react';
import { ImageBackground, Pressable, View } from 'react-native';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { CreateHeader } from '../../components/CreateHeader';
import { WIZARD_STEP } from '../steps';
import { createStyles } from './styles';
import { usePreviewController } from './useController';

export function PreviewScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = usePreviewController();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <CreateHeader
          title={c.t('create.preview')}
          steps={c.steps}
          currentStep={WIZARD_STEP.preview}
          onBack={c.goBack}
        />
      }
      footer={
        <AppButton
          label={
            c.isPublishing ? c.t('create.publishing') : c.t('create.publish')
          }
          leftIcon="heart"
          onPress={() => void c.onPublish()}
          loading={c.isPublishing}
          disabled={!c.publishable}
        />
      }
    >
      <ImageBackground
        source={c.heroImage}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay}>
          <AppText variant="heading" color="textInverse" numberOfLines={2}>
            {c.draft.title.trim() || c.t('create.eventTitle')}
          </AppText>
        </View>
      </ImageBackground>

      <View style={styles.card}>
        <View style={styles.detailRow}>
          <AppIcon name="calendar" size={22} color="primary" />
          <View style={styles.detailText}>
            <AppText variant="bodyStrong">{c.dateLabel}</AppText>
            {c.timeLabel ? (
              <AppText variant="caption" color="textMuted">
                {c.timeLabel}
              </AppText>
            ) : null}
          </View>
        </View>
        <View style={styles.detailRow}>
          <AppIcon name="location" size={22} color="primary" />
          <View style={styles.detailText}>
            <AppText variant="bodyStrong">{c.locationLabel}</AppText>
          </View>
        </View>
        {c.draft.description.trim() ? (
          <AppText variant="body" color="textMuted">
            {c.draft.description.trim()}
          </AppText>
        ) : null}
      </View>

      <View>
        <AppText variant="label">{c.t('create.visibility')}</AppText>
        <View style={styles.visibilityRow}>
          <Pressable
            style={[
              styles.visibilityOption,
              c.draft.visibility === 'private' &&
                styles.visibilityOptionActive,
            ]}
            onPress={() => c.setVisibility('private')}
          >
            <AppIcon name="shield" size={20} color="primary" />
            <AppText variant="bodyStrong">{c.t('create.visibilityPrivate')}</AppText>
            <AppText variant="caption" color="textMuted">
              {c.t('create.visibilityPrivateHint')}
            </AppText>
          </Pressable>
          <Pressable
            style={[
              styles.visibilityOption,
              c.draft.visibility === 'public' &&
                styles.visibilityOptionActive,
            ]}
            onPress={() => c.setVisibility('public')}
          >
            <AppIcon name="group" size={20} color="primary" />
            <AppText variant="bodyStrong">{c.t('create.visibilityPublic')}</AppText>
            <AppText variant="caption" color="textMuted">
              {c.t('create.visibilityPublicHint')}
            </AppText>
          </Pressable>
        </View>
      </View>
      {c.publishError ? (
        <AppText variant="caption" color="error" align="center">
          {c.publishError.includes('storage/unauthorized')
            ? c.t('create.storageUnauthorized')
            : c.t('create.publishError')}
        </AppText>
      ) : null}
    </AppScreenTemplate>
  );
}
