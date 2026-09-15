import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';

import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppErrorState } from '../../../../design-system/molecules/ErrorState';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
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
      <AppScreenTemplate>
        <AppErrorState onRetry={() => void c.refetch()} />
      </AppScreenTemplate>
    );
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={c.goBack} hitSlop={8}>
        <AppIcon name="back" size={24} />
      </Pressable>
      <View style={styles.headerCenter}>
        <AppText variant="subheading">{c.t('share.title')}</AppText>
        <AppText variant="caption" color="textMuted" style={styles.tagline}>
          {c.t('share.tagline')}
        </AppText>
      </View>
      <View style={styles.spacer} />
    </View>
  );

  return (
    <AppScreenTemplate edges={['top']} header={header}>
      {c.heroImage ? (
        <View style={styles.inviteCard}>
          <Image source={c.heroImage} style={styles.inviteImage} />
        </View>
      ) : null}

      <View style={styles.linkRow}>
        <AppIcon name="link" size={20} color="primary" />
        <AppText variant="body" numberOfLines={1} style={styles.linkText}>
          {c.link.replace('https://', '')}
        </AppText>
        <Pressable onPress={c.copyLink} hitSlop={8}>
          <AppText variant="label" color="primary">
            {c.copied ? c.t('common.copied') : c.t('common.copy')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.action} onPress={() => void c.shareWhatsApp()}>
          <View style={[styles.actionCircle, styles.whatsapp]}>
            <AppIcon name="whatsapp" size={26} color="textInverse" />
          </View>
          <AppText variant="caption" color="textMuted">
            {c.t('share.whatsapp')}
          </AppText>
        </Pressable>
        <Pressable style={styles.action} onPress={c.copyLink}>
          <View style={[styles.actionCircle, styles.softCircle]}>
            <AppIcon name="copy" size={24} color="primary" />
          </View>
          <AppText variant="caption" color="textMuted">
            {c.t('share.copyLink')}
          </AppText>
        </Pressable>
        <Pressable style={styles.action} onPress={c.shareGeneric}>
          <View style={[styles.actionCircle, styles.primaryCircle]}>
            <AppIcon name="share" size={24} color="textInverse" />
          </View>
          <AppText variant="caption" color="textMuted">
            {c.t('common.share')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.messageCard}>
        <View style={styles.messageHeader}>
          <AppText variant="caption" color="textMuted">
            {c.t('share.messagePreview')}
          </AppText>
          <AppText variant="label" color="primary">
            {c.t('common.edit')}
          </AppText>
        </View>
        <AppText variant="bodyStrong">
          {c.event
            ? c.t('share.invitedTo', { title: c.event.title })
            : ''}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {c.event ? `${c.dateLabel} · ${c.event.venueName}` : ''}
        </AppText>
      </View>
    </AppScreenTemplate>
  );
}
