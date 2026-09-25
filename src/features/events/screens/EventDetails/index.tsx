import React, { useMemo } from 'react';
import { ImageBackground, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAvatar } from '../../../../design-system/atoms/Avatar';
import { AppBadge } from '../../../../design-system/atoms/Badge';
import { AppButton } from '../../../../design-system/atoms/Button';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppErrorState } from '../../../../design-system/molecules/ErrorState';
import { AppRsvpButton } from '../../../../design-system/molecules/RsvpButton';
import { AppSectionHeader } from '../../../../design-system/molecules/SectionHeader';
import { AppAvatarStack } from '../../../../design-system/organisms/AvatarStack';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { formatDateShort } from '../../../../utils/format';
import { createStyles } from './styles';
import type { EventDetailsScreenProps } from './types';
import { useEventDetailsController } from './useController';

export function EventDetailsScreen({ route }: EventDetailsScreenProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useEventDetailsController(route.params.eventId);

  if (c.isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppErrorState onRetry={() => void c.refetch()} />
      </SafeAreaView>
    );
  }

  if (!c.isLoading && !c.event) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppErrorState
          title={c.t('event.notFoundTitle')}
          message={c.t('event.notFoundMessage')}
          retryLabel={c.t('common.back')}
          onRetry={c.goBack}
        />
      </SafeAreaView>
    );
  }

  const event = c.event;

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground source={c.heroImage} style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroButtons}>
              <Pressable style={styles.circleButton} onPress={c.goBack}>
                <AppIcon name="back" size={22} color="textInverse" />
              </Pressable>
              <View style={styles.heroActions}>
                <Pressable style={styles.circleButton} onPress={c.openShare}>
                  <AppIcon name="share" size={20} color="textInverse" />
                </Pressable>
                <Pressable style={styles.circleButton}>
                  <AppIcon name="more" size={20} color="textInverse" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {event ? (
          <View style={styles.sheet}>
            <View style={styles.titleBlock}>
              {event.viewerRsvp === 'going' && !c.isOwner ? (
                <AppBadge
                  label={c.t('home.youreGoing')}
                  tone="primary"
                  icon="check"
                />
              ) : null}
              <AppText variant="heading">{event.title}</AppText>
              <AppText variant="body" color="textMuted">
                {event.description}
              </AppText>
            </View>

            <View style={styles.hostRow}>
              <AppAvatar name={event.hostName} size={44} />
              <View style={styles.hostText}>
                <AppText variant="caption" color="textMuted">
                  {c.t('event.hostedBy')}
                </AppText>
                <AppText variant="bodyStrong">{event.hostName}</AppText>
              </View>
              <View style={styles.contactHost}>
                <AppText variant="label" color="textMuted">
                  {c.t('event.contactHost')}
                </AppText>
                <AppIcon name="back" size={16} color="textMuted" forward />
              </View>
            </View>

            <View style={styles.infoCard}>
              <AppIcon name="calendar" size={22} color="primary" />
              <View style={styles.infoText}>
                <AppText variant="bodyStrong">{c.dateLabel}</AppText>
                <AppText variant="caption" color="textMuted">
                  {c.timeRange}
                </AppText>
              </View>
            </View>

            <View style={styles.infoCard}>
              <AppIcon name="location" size={22} color="primary" />
              <View style={styles.infoText}>
                <AppText variant="bodyStrong">{event.venueName}</AppText>
                <AppText variant="caption" color="textMuted">
                  {event.areaAddress}
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={c.t('event.openInMaps')}
                hitSlop={8}
                onPress={c.openInMaps}
              >
                <AppText variant="label" color="primary">
                  {c.t('event.openInMaps')}
                </AppText>
              </Pressable>
            </View>

            {c.isOwner ? (
              <View style={styles.ownerBlock}>
                <View style={styles.ownerBadge}>
                  <AppBadge
                    label={c.t('event.youAreHosting')}
                    tone="primary"
                    icon="crown"
                  />
                </View>
                <View style={styles.rsvpRow}>
                  <AppButton
                    label={c.t('event.shareInvite')}
                    leftIcon="share"
                    size="md"
                    fullWidth={false}
                    style={styles.ownerButton}
                    onPress={c.openShare}
                  />
                  <AppButton
                    label={c.t('event.manageGuests')}
                    leftIcon="guests"
                    variant="outline"
                    size="md"
                    fullWidth={false}
                    style={styles.ownerButton}
                    onPress={c.openGuests}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.rsvpRow}>
                <AppRsvpButton
                  label={c.t('event.going')}
                  icon="check"
                  active={event.viewerRsvp === 'going'}
                  onPress={() => c.setRsvp('going')}
                />
                <AppRsvpButton
                  label={c.t('event.maybe')}
                  icon="help"
                  active={event.viewerRsvp === 'maybe'}
                  onPress={() => c.setRsvp('maybe')}
                />
                <AppRsvpButton
                  label={c.t('event.cantGo')}
                  icon="close"
                  active={event.viewerRsvp === 'declined'}
                  onPress={() => c.setRsvp('declined')}
                />
              </View>
            )}

            <View style={styles.goingCard}>
              <View style={styles.goingHeader}>
                <AppText variant="bodyStrong">{c.goingLabel}</AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={c.t('common.seeAll')}
                  hitSlop={12}
                  onPress={c.openGuests}
                  style={styles.seeAll}
                >
                  <AppText variant="label" color="primary">
                    {c.t('common.seeAll')}
                  </AppText>
                </Pressable>
              </View>
              <AppAvatarStack
                avatars={c.goingStack.map(a => ({ id: a.id, name: a.name }))}
                total={event.goingCount}
                size={40}
                max={7}
              />
            </View>

            {event.updates.length > 0 ? (
              <View>
                <AppSectionHeader title={c.t('event.eventUpdates')} />
                {event.updates.map(update => (
                  <View key={update.id} style={styles.updateItem}>
                    <AppAvatar name={update.authorName} size={40} />
                    <View style={styles.updateBody}>
                      <View style={styles.updateMetaRow}>
                        <AppText variant="bodyStrong">{update.authorName}</AppText>
                        {update.pinned ? (
                          <AppBadge
                            label={c.t('event.pinned')}
                            tone="neutral"
                            icon="location"
                          />
                        ) : null}
                      </View>
                      <AppText variant="caption" color="textMuted">
                        {formatDateShort(update.createdAt)}
                      </AppText>
                      <AppText variant="body">{update.message}</AppText>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.bottomSpace} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
