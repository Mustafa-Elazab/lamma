import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, NativeModules, Platform } from 'react-native';
import type { ViewShotRef } from 'react-native-view-shot';

import { useLanguage } from '../../../../app/localization';
import { buildEventDeepLink } from '../../../../navigation/linking';
import { trackEvent } from '../../../../services/analytics';
import { reportError } from '../../../../services/crashReporting';
import { appLogger } from '../../../../services/logger';
import { formatDateShort } from '../../../../utils/format';
import { useEvent } from '../../core/hooks';
import { eventCover } from '../../core/media';
import { loadShareApi, whatsappSocial } from '../../core/shareNative';
import {
  asFileUrl,
  openStoreListing,
  shareWhatsAppNative,
  whatsappStoreUrls,
} from '../../core/shareTarget';

type InviteCardHandle = ViewShotRef;

type NativeIntentModule = {
  statFile?: (uri: string) => Promise<{ exists?: boolean; size?: number }>;
};

type CaptureReadyState = {
  isReady: boolean;
  imageLoaded: boolean;
  width: number;
  height: number;
};

function describeError(error: unknown): unknown {
  if (error instanceof Error) {
    const extra = error as Error & Record<string, unknown>;
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      code: extra.code,
      nativeStackAndroid: extra.nativeStackAndroid,
      userInfo: extra.userInfo,
      domain: extra.domain,
    };
  }
  return error;
}

function waitForNextFrame(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => resolve());
  });
}

function waitForUiTick(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}

async function ensureCapturedFileExists(uri: string): Promise<void> {
  const nativeIntent = NativeModules.NativeIntent as NativeIntentModule | undefined;
  if (!nativeIntent?.statFile) {
    return;
  }
  const stat = await nativeIntent.statFile(uri);
  if (!stat.exists || !stat.size || stat.size <= 0) {
    throw new Error(
      `invite.capture-file-missing exists=${String(stat.exists)} size=${String(
        stat.size,
      )}`,
    );
  }
}

async function captureInviteFile(
  cardRef: RefObject<InviteCardHandle | null>,
  captureReady: CaptureReadyState,
): Promise<string> {
  if (!cardRef.current) {
    throw new Error('invite.capture-ref-missing');
  }
  if (!captureReady.isReady) {
    throw new Error(
      `invite.capture-card-not-ready imageLoaded=${String(
        captureReady.imageLoaded,
      )} width=${captureReady.width} height=${captureReady.height}`,
    );
  }
  if (typeof cardRef.current.capture !== 'function') {
    throw new Error('invite.capture-method-missing');
  }
  await waitForUiTick();
  await waitForNextFrame();
  await waitForNextFrame();
  const path = await cardRef.current.capture();
  if (!path) {
    throw new Error('invite.capture-empty');
  }
  await ensureCapturedFileExists(path);
  return asFileUrl(path);
}

/**
 * Captures the invite card when it is ready; returns null (text-only share)
 * instead of failing when the snapshot is not available.
 */
async function tryCaptureInviteFile(
  cardRef: RefObject<InviteCardHandle | null>,
  captureReady: CaptureReadyState,
): Promise<string | null> {
  if (!cardRef.current || !captureReady.isReady) {
    return null;
  }
  try {
    return await captureInviteFile(cardRef, captureReady);
  } catch (error) {
    appLogger.error('[invite.share] Card capture failed, sharing text', error);
    return null;
  }
}

function useShareInviteController(
  eventId: string,
  cardRef: RefObject<InviteCardHandle | null>,
  captureReady: CaptureReadyState,
) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation = useNavigation();
  const query = useEvent(eventId);
  const [copied, setCopied] = useState(false);

  const event = query.data ?? null;
  const link = buildEventDeepLink(eventId);
  const coverImageUrl = event?.coverImageUrl ?? null;
  const coverKey = event?.coverKey;
  const themeKey = event?.themeKey;
  const hasEvent = Boolean(event);
  // Stable identity: eventCover() returns a new `{ uri }` object for photo
  // covers, which must not change on every render (effects depend on it).
  const heroImage = useMemo(
    () =>
      hasEvent && coverKey && themeKey
        ? eventCover({ coverImageUrl, coverKey, themeKey })
        : undefined,
    [hasEvent, coverImageUrl, coverKey, themeKey],
  );
  const heroKey = hasEvent
    ? `${coverImageUrl ? `photo:${coverImageUrl.length}:${coverImageUrl.slice(-32)}` : ''}|${themeKey}|${coverKey}`
    : '';

  const inviteMessage = event
    ? `${t('share.invitedTo', { title: event.title })}\n${formatDateShort(
        event.startAt,
        language,
      )} · ${event.venueName}\n${link}`
    : link;
  // Sharing never waits on the card snapshot: when the card image is ready it
  // is attached, otherwise the invite text + link is shared on its own.
  const canShareInvite = Boolean(event);

  const logShareError = useCallback(
    (error: unknown, method: 'system' | 'whatsapp') => {
      appLogger.error('[invite.share] Raw caught share error', error, {
        eventId,
        method,
        cardRefAttached: Boolean(cardRef.current),
        captureReady,
        rawError: describeError(error),
      });
      reportError(error, 'invite.share', { eventId, method });
    },
    [cardRef, captureReady, eventId],
  );

  const copyLink = useCallback(() => {
    Clipboard.setString(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    void trackEvent('event_share', {
      event_id: eventId,
      method: 'copy',
    });
  }, [eventId, link]);

  const shareGeneric = useCallback(async () => {
    const Share = loadShareApi();
    if (!Share) {
      Alert.alert(t('share.title'), t('share.shareError'));
      return;
    }
    try {
      appLogger.log('[invite.share] Capturing invite card', {
        eventId,
        method: 'system',
        captureReady,
      });
      const url = await tryCaptureInviteFile(cardRef, captureReady);
      const result = await Share.open({
        title: t('share.title'),
        message: inviteMessage,
        ...(url ? { url, type: 'image/png' } : {}),
        failOnCancel: false,
      });
      if (result.success) {
        await trackEvent('event_share', {
          event_id: eventId,
          method: 'share',
        });
      }
    } catch (error) {
      if ((error as { message?: string }).message === 'User did not share') {
        return;
      }
      logShareError(error, 'system');
      Alert.alert(t('share.title'), t('share.shareError'));
    }
  }, [cardRef, captureReady, eventId, inviteMessage, logShareError, t]);

  const shareWhatsApp = useCallback(async () => {
    const Share = loadShareApi();
    if (!Share) {
      Alert.alert(t('share.title'), t('share.shareError'));
      return;
    }
    try {
      appLogger.log('[invite.share] Capturing invite card', {
        eventId,
        method: 'whatsapp',
        captureReady,
      });
      const url = await tryCaptureInviteFile(cardRef, captureReady);
      const social = whatsappSocial(Share);
      const outcome = await shareWhatsAppNative({
        shareSingle: options =>
          Share.shareSingle({
            social,
            message: options.message,
            ...(options.url ? { url: options.url, type: 'image/png' } : {}),
          }),
        social,
        message: inviteMessage,
        url: url ?? '',
        openStore: () => openStoreListing(whatsappStoreUrls(Platform.OS)),
      });
      if (outcome === 'shared') {
        await trackEvent('event_share', {
          event_id: eventId,
          method: 'whatsapp',
        });
      }
    } catch (error) {
      logShareError(error, 'whatsapp');
      Alert.alert(t('share.title'), t('share.shareError'));
    }
  }, [cardRef, captureReady, eventId, inviteMessage, logShareError, t]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return {
    t,
    event,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    link,
    heroImage,
    heroKey,
    canShareInvite,
    copied,
    dateLabel: event ? formatDateShort(event.startAt, language) : '',
    copyLink,
    shareGeneric,
    shareWhatsApp,
    goBack,
  };
}

export default useShareInviteController;
export { useShareInviteController };
