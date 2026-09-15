import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { ImageBackground, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../../../design-system/atoms/Avatar';
import { Badge } from '../../../../design-system/atoms/Badge';
import { Icon, type IconName } from '../../../../design-system/atoms/Icon';
import { Text } from '../../../../design-system/atoms/Text';
import { ErrorState } from '../../../../design-system/molecules/ErrorState';
import { SectionHeader } from '../../../../design-system/molecules/SectionHeader';
import { AvatarStack } from '../../../../design-system/organisms/AvatarStack';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { AppStackParamList } from '../../../../navigation/types';
import { formatDateShort } from '../../../../utils/format';
import { createStyles } from './styles';
import { useEventDetailsController } from './useController';

type Props = NativeStackScreenProps<AppStackParamList, 'EventDetails'>;

export function EventDetailsScreen({ route }: Props): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useEventDetailsController(route.params.eventId);

  if (c.isError || (!c.isLoading && !c.event)) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState onRetry={() => void c.refetch()} />
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
                <Icon name="back" size={22} color="textInverse" />
              </Pressable>
              <View style={styles.heroActions}>
                <Pressable style={styles.circleButton} onPress={c.openShare}>
                  <Icon name="share" size={20} color="textInverse" />
                </Pressable>
                <Pressable style={styles.circleButton}>
                  <Icon name="more" size={20} color="textInverse" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {event ? (
          <View style={styles.sheet}>
            <View style={styles.titleBlock}>
              {event.viewerRsvp === 'going' ? (
                <Badge
                  label={c.t('home.youreGoing')}
                  tone="primary"
                  icon="check"
                />
              ) : null}
              <Text variant="heading">{event.title}</Text>
              <Text variant="body" color="textMuted">
                {event.description}
              </Text>
            </View>

            <View style={styles.hostRow}>
              <Avatar name={event.hostName} size={44} />
              <View style={styles.hostText}>
                <Text variant="caption" color="textMuted">
                  {c.t('event.hostedBy')}
                </Text>
                <Text variant="bodyStrong">{event.hostName}</Text>
              </View>
              <Pressable>
                <Text variant="label" color="primary">
                  {c.t('event.contactHost')}
                </Text>
              </Pressable>
            </View>

            <View style={styles.infoCard}>
              <Icon name="calendar" size={22} color="primary" />
              <View style={styles.infoText}>
                <Text variant="bodyStrong">{c.dateLabel}</Text>
                <Text variant="caption" color="textMuted">
                  {c.timeRange}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Icon name="location" size={22} color="primary" />
              <View style={styles.infoText}>
                <Text variant="bodyStrong">{event.venueName}</Text>
                <Text variant="caption" color="textMuted">
                  {event.areaAddress}
                </Text>
              </View>
              <Text variant="label" color="primary">
                {c.t('event.openInMaps')}
              </Text>
            </View>

            <View style={styles.rsvpRow}>
              <RsvpButton
                label={c.t('event.going')}
                icon="check"
                active={event.viewerRsvp === 'going'}
                onPress={() => c.setRsvp('going')}
              />
              <RsvpButton
                label={c.t('event.maybe')}
                icon="help"
                active={event.viewerRsvp === 'maybe'}
                onPress={() => c.setRsvp('maybe')}
              />
              <RsvpButton
                label={c.t('event.cantGo')}
                icon="close"
                active={event.viewerRsvp === 'declined'}
                onPress={() => c.setRsvp('declined')}
              />
            </View>

            <View style={styles.goingCard}>
              <View style={styles.goingHeader}>
                <Text variant="bodyStrong">{c.goingLabel}</Text>
                <Pressable onPress={c.openGuests}>
                  <Text variant="label" color="primary">
                    {c.t('common.seeAll')}
                  </Text>
                </Pressable>
              </View>
              <AvatarStack
                avatars={c.goingStack.map(a => ({ id: a.id, name: a.name }))}
                total={event.goingCount}
                size={40}
                max={7}
              />
            </View>

            {event.updates.length > 0 ? (
              <View>
                <SectionHeader
                  title={c.t('event.eventUpdates')}
                  actionLabel={c.t('common.seeAll')}
                  onPressAction={() => undefined}
                />
                {event.updates.map(update => (
                  <View key={update.id} style={styles.updateItem}>
                    <Avatar name={update.authorName} size={40} />
                    <View style={styles.updateBody}>
                      <View style={styles.updateMetaRow}>
                        <Text variant="bodyStrong">{update.authorName}</Text>
                        {update.pinned ? (
                          <Badge
                            label={c.t('event.pinned')}
                            tone="neutral"
                            icon="location"
                          />
                        ) : null}
                      </View>
                      <Text variant="caption" color="textMuted">
                        {formatDateShort(update.createdAt)}
                      </Text>
                      <Text variant="body">{update.message}</Text>
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

function RsvpButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
}): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.rsvpButton, active && styles.rsvpButtonActive]}
    >
      <Icon name={icon} size={18} color={active ? 'textInverse' : 'text'} />
      <Text variant="label" color={active ? 'textInverse' : 'text'}>
        {label}
      </Text>
    </Pressable>
  );
}
