import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';

import { Icon } from '../../../../design-system/atoms/Icon';
import { Text } from '../../../../design-system/atoms/Text';
import { ErrorState } from '../../../../design-system/molecules/ErrorState';
import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { AppStackParamList } from '../../../../navigation/types';
import { createStyles } from './styles';
import { useShareInviteController } from './useController';

type Props = NativeStackScreenProps<AppStackParamList, 'ShareInvite'>;

export function ShareInviteScreen({ route }: Props): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useShareInviteController(route.params.eventId);

  if (c.isError || (!c.isLoading && !c.event)) {
    return (
      <ScreenTemplate>
        <ErrorState onRetry={() => void c.refetch()} />
      </ScreenTemplate>
    );
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={c.goBack} hitSlop={8}>
        <Icon name="back" size={24} />
      </Pressable>
      <View style={styles.headerCenter}>
        <Text variant="subheading">{c.t('share.title')}</Text>
        <Text variant="caption" color="textMuted" style={styles.tagline}>
          {c.t('share.tagline')}
        </Text>
      </View>
      <View style={styles.spacer} />
    </View>
  );

  return (
    <ScreenTemplate edges={['top']} header={header}>
      {c.heroImage ? (
        <View style={styles.inviteCard}>
          <Image source={c.heroImage} style={styles.inviteImage} />
        </View>
      ) : null}

      <View style={styles.linkRow}>
        <Icon name="link" size={20} color="primary" />
        <Text variant="body" numberOfLines={1} style={styles.linkText}>
          {c.link.replace('https://', '')}
        </Text>
        <Pressable onPress={c.copyLink} hitSlop={8}>
          <Text variant="label" color="primary">
            {c.copied ? c.t('common.copied') : c.t('common.copy')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.action} onPress={() => void c.shareWhatsApp()}>
          <View style={[styles.actionCircle, styles.whatsapp]}>
            <Icon name="whatsapp" size={26} color="textInverse" />
          </View>
          <Text variant="caption" color="textMuted">
            {c.t('share.whatsapp')}
          </Text>
        </Pressable>
        <Pressable style={styles.action} onPress={c.copyLink}>
          <View style={[styles.actionCircle, styles.softCircle]}>
            <Icon name="copy" size={24} color="primary" />
          </View>
          <Text variant="caption" color="textMuted">
            {c.t('share.copyLink')}
          </Text>
        </Pressable>
        <Pressable style={styles.action} onPress={c.shareGeneric}>
          <View style={[styles.actionCircle, styles.primaryCircle]}>
            <Icon name="share" size={24} color="textInverse" />
          </View>
          <Text variant="caption" color="textMuted">
            {c.t('common.share')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.messageCard}>
        <View style={styles.messageHeader}>
          <Text variant="caption" color="textMuted">
            {c.t('share.messagePreview')}
          </Text>
          <Text variant="label" color="primary">
            {c.t('common.edit')}
          </Text>
        </View>
        <Text variant="bodyStrong">
          {c.event
            ? c.t('share.invitedTo', { title: c.event.title })
            : ''}
        </Text>
        <Text variant="caption" color="textMuted">
          {c.event ? `${c.dateLabel} · ${c.event.venueName}` : ''}
        </Text>
      </View>
    </ScreenTemplate>
  );
}
