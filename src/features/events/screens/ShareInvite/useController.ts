import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Share } from 'react-native';

import { useLanguage } from '../../../../app/localization';
import { buildEventDeepLink } from '../../../../navigation/linking';
import { trackEvent } from '../../../../services/analytics';
import { reportError } from '../../../../services/crashReporting';
import { formatDateShort } from '../../../../utils/format';
import { useEvent } from '../../core/hooks';
import { eventCover } from '../../core/media';

export function useShareInviteController(eventId: string) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation = useNavigation();
  const query = useEvent(eventId);
  const [copied, setCopied] = useState(false);

  const event = query.data ?? null;
  const link = buildEventDeepLink(eventId);
  const heroImage = event ? eventCover(event) : undefined;

  const inviteMessage = event
    ? `${t('share.invitedTo', { title: event.title })}\n${formatDateShort(
        event.startAt,
        language,
      )} · ${event.venueName}\n${link}`
    : link;

  const copyLink = useCallback(() => {
    Clipboard.setString(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    void trackEvent('invite_shared', {
      event_id: eventId,
      method: 'clipboard',
    });
  }, [eventId, link]);

  const shareGeneric = useCallback(async () => {
    try {
      const result = await Share.share({ message: inviteMessage });
      if (result.action === Share.sharedAction) {
        await trackEvent('invite_shared', {
          event_id: eventId,
          method: result.activityType ?? 'system',
        });
      }
    } catch (error) {
      reportError(error, 'invite.share', { eventId, method: 'system' });
    }
  }, [eventId, inviteMessage]);

  const shareWhatsApp = useCallback(async () => {
    try {
      const encoded = encodeURIComponent(inviteMessage);
      const appUrl = `whatsapp://send?text=${encoded}`;
      const webUrl = `https://wa.me/?text=${encoded}`;
      const supported = await Linking.canOpenURL(appUrl);
      await Linking.openURL(supported ? appUrl : webUrl);
      await trackEvent('invite_shared', {
        event_id: eventId,
        method: 'whatsapp',
      });
    } catch (error) {
      reportError(error, 'invite.share', { eventId, method: 'whatsapp' });
    }
  }, [eventId, inviteMessage]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return {
    t,
    event,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    link,
    heroImage,
    copied,
    dateLabel: event ? formatDateShort(event.startAt, language) : '',
    copyLink,
    shareGeneric,
    shareWhatsApp,
    goBack,
  };
}
