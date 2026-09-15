import React, { useMemo } from 'react';
import { ImageBackground, Pressable, View } from 'react-native';

import { Button } from '../../../../design-system/atoms/Button';
import { Icon } from '../../../../design-system/atoms/Icon';
import { Text } from '../../../../design-system/atoms/Text';
import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
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
    <ScreenTemplate
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
        <Button
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
          <Text variant="heading" color="textInverse" numberOfLines={2}>
            {c.draft.title.trim() || c.t('create.eventTitle')}
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.card}>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={22} color="primary" />
          <View style={styles.detailText}>
            <Text variant="bodyStrong">{c.dateLabel}</Text>
            {c.timeLabel ? (
              <Text variant="caption" color="textMuted">
                {c.timeLabel}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.detailRow}>
          <Icon name="location" size={22} color="primary" />
          <View style={styles.detailText}>
            <Text variant="bodyStrong">{c.locationLabel}</Text>
          </View>
        </View>
        {c.draft.description.trim() ? (
          <Text variant="body" color="textMuted">
            {c.draft.description.trim()}
          </Text>
        ) : null}
      </View>

      <View>
        <Text variant="label">{c.t('create.visibility')}</Text>
        <View style={styles.visibilityRow}>
          <Pressable
            style={[
              styles.visibilityOption,
              c.draft.visibility === 'private' &&
                styles.visibilityOptionActive,
            ]}
            onPress={() => c.setVisibility('private')}
          >
            <Icon name="shield" size={20} color="primary" />
            <Text variant="bodyStrong">{c.t('create.visibilityPrivate')}</Text>
            <Text variant="caption" color="textMuted">
              {c.t('create.visibilityPrivateHint')}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.visibilityOption,
              c.draft.visibility === 'public' &&
                styles.visibilityOptionActive,
            ]}
            onPress={() => c.setVisibility('public')}
          >
            <Icon name="group" size={20} color="primary" />
            <Text variant="bodyStrong">{c.t('create.visibilityPublic')}</Text>
            <Text variant="caption" color="textMuted">
              {c.t('create.visibilityPublicHint')}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenTemplate>
  );
}
