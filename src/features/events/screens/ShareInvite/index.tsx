import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';

import { footerImages } from '../../../../assets';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppErrorState } from '../../../../design-system/molecules/ErrorState';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { AppStackParamList } from '../../../../navigation/types';
import { createStyles } from './styles';
import useShareInviteController from './useController';
import { autoIsolate, isolateValues, ltrIsolate } from '../../../../utils/bidi';

type Props = NativeStackScreenProps<AppStackParamList, 'ShareInvite'>;

export function ShareInviteScreen({ route }: Props): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const cardRef = useRef<ViewShotRef>(null);
  const [cardLayout, setCardLayout] = useState({ width: 0, height: 0 });
  const [cardImageLoaded, setCardImageLoaded] = useState(false);
  const inviteCardReady = {
    isReady: cardLayout.width > 0 && cardLayout.height > 0 && cardImageLoaded,
    imageLoaded: cardImageLoaded,
    width: cardLayout.width,
    height: cardLayout.height,
  };
  const c = useShareInviteController(
    route.params.eventId,
    cardRef,
    inviteCardReady,
  );

  // Reset the capture state only when the cover really changes. `heroKey` is
  // a string so this effect cannot re-fire on every render (a fresh
  // `{ uri }` object here caused "Maximum update depth exceeded").
  useEffect(() => {
    setCardLayout(prev =>
      prev.width === 0 && prev.height === 0 ? prev : { width: 0, height: 0 },
    );
    setCardImageLoaded(false);
  }, [route.params.eventId, c.heroKey]);

  const handleInviteCardLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = event.nativeEvent.layout;
      setCardLayout(prev =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    },
    [],
  );

  const handleImageLoaded = useCallback(() => setCardImageLoaded(true), []);

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

  const footer = (
    <Image
      source={footerImages.shareExact}
      style={styles.footerArt}
      resizeMode="contain"
    />
  );

  return (
    <AppScreenTemplate edges={['top']} header={header} footer={footer}>
      {c.heroImage ? (
        <ViewShot
          ref={cardRef}
          onLayout={handleInviteCardLayout}
          options={{ format: 'png', quality: 0.92, result: 'tmpfile' }}
          style={styles.inviteCard}
        >
          <View collapsable={false} style={styles.inviteCardInner}>
            <Image
              source={c.heroImage}
              style={styles.inviteImage}
              resizeMode="cover"
              onLoadEnd={handleImageLoaded}
            />
            <View style={styles.inviteOverlay} pointerEvents="none">
              <AppText
                variant="bodyStrong"
                color="textInverse"
                numberOfLines={1}
              >
                {c.event?.title ?? ''}
              </AppText>
              <AppText variant="caption" color="textInverse" numberOfLines={1}>
                {c.event
                  ? `${c.dateLabel} · ${autoIsolate(c.event.venueName)}`
                  : ''}
              </AppText>
            </View>
          </View>
        </ViewShot>
      ) : null}

      <View style={styles.linkRow}>
        <AppIcon name="link" size={20} color="primary" />
        <AppText variant="body" numberOfLines={1} style={styles.linkText}>
          {ltrIsolate(c.link.replace('https://', ''))}
        </AppText>
        <Pressable onPress={c.copyLink} hitSlop={8}>
          <AppText variant="label" color="primary">
            {c.copied ? c.t('common.copied') : c.t('common.copy')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          disabled={!c.canShareInvite}
          style={[styles.action, !c.canShareInvite && styles.actionDisabled]}
          onPress={() => void c.shareWhatsApp()}
        >
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
        <Pressable
          disabled={!c.canShareInvite}
          style={[styles.action, !c.canShareInvite && styles.actionDisabled]}
          onPress={() => {
            void c.shareGeneric();
          }}
        >
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
            ? c.t('share.invitedTo', isolateValues({ title: c.event.title }))
            : ''}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {c.event
            ? `${c.dateLabel} · ${autoIsolate(c.event.venueName)}`
            : ''}
        </AppText>
      </View>
    </AppScreenTemplate>
  );
}
