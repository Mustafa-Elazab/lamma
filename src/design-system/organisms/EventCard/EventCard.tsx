import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { Badge, type BadgeTone } from '../../atoms/Badge';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { AvatarStack, type StackAvatar } from '../AvatarStack';

export type EventCardStatus = {
  label: string;
  tone: BadgeTone;
  icon?: 'crown' | 'airplane' | 'check' | 'heart';
};

export type EventCardData = {
  id: string;
  title: string;
  coverImage: ImageSourcePropType;
  dateLabel: string;
  timeLabel?: string;
  locationLabel: string;
  attendees: ReadonlyArray<StackAvatar>;
  attendeeCount: number;
  description?: string;
  status?: EventCardStatus;
  rsvpLabel?: string;
  /** Localized "N going" summary; falls back to English when omitted. */
  attendeeSummary?: string;
};

export type EventCardProps = {
  data: EventCardData;
  variant?: 'featured' | 'compact';
  onPress?: () => void;
  onMore?: () => void;
};

export function EventCard({
  data,
  variant = 'compact',
  onPress,
  onMore,
}: EventCardProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (variant === 'featured') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.featured, pressed && styles.pressed]}
      >
        <Image source={data.coverImage} style={styles.featuredCover} />
        <View style={styles.featuredBody}>
          <View style={styles.featuredTopRow}>
            {data.rsvpLabel ? (
              <Badge label={data.rsvpLabel} tone="primary" icon="check" />
            ) : (
              <View />
            )}
            {onMore ? (
              <Pressable onPress={onMore} hitSlop={8}>
                <Icon name="more" size={20} color="textMuted" />
              </Pressable>
            ) : null}
          </View>
          <Text variant="heading">{data.title}</Text>
          <View style={styles.metaRow}>
            <Icon name="calendar" size={16} color="textMuted" />
            <Text variant="caption" color="textMuted">
              {data.timeLabel
                ? `${data.dateLabel}  ·  ${data.timeLabel}`
                : data.dateLabel}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Icon name="location" size={16} color="textMuted" />
            <Text variant="caption" color="textMuted">
              {data.locationLabel}
            </Text>
          </View>
          <View style={styles.attendeeRow}>
            <AvatarStack
              avatars={data.attendees}
              total={data.attendeeCount}
              size={30}
            />
            <Text variant="caption" color="textMuted">
              {data.attendeeSummary ?? `${data.attendeeCount} going`}
            </Text>
          </View>
          {data.description ? (
            <Text variant="caption" color="textMuted" numberOfLines={2}>
              {data.description}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.compact, pressed && styles.pressed]}
    >
      <Image source={data.coverImage} style={styles.compactCover} />
      <View style={styles.compactBody}>
        <View style={styles.compactTopRow}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.flex}>
            {data.title}
          </Text>
          {data.status ? (
            <Badge
              label={data.status.label}
              tone={data.status.tone}
              icon={data.status.icon}
            />
          ) : null}
        </View>
        <View style={styles.metaRow}>
          <Icon name="calendar" size={14} color="textMuted" />
          <Text variant="caption" color="textMuted">
            {data.timeLabel
              ? `${data.dateLabel}  ·  ${data.timeLabel}`
              : data.dateLabel}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="location" size={14} color="textMuted" />
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {data.locationLabel}
          </Text>
        </View>
        <View style={styles.attendeeRow}>
          <AvatarStack
            avatars={data.attendees}
            total={data.attendeeCount}
            size={24}
            max={4}
          />
          <Text variant="caption" color="textMuted">
            {data.attendeeSummary ?? `${data.attendeeCount} going`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    pressed: { opacity: 0.95 },
    flex: { flex: 1 },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    attendeeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    featured: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.card,
    },
    featuredCover: { width: 150, height: '100%', resizeMode: 'cover' },
    featuredBody: {
      flex: 1,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    featuredTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    compact: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      ...theme.shadows.soft,
    },
    compactCover: {
      width: 84,
      height: 84,
      borderRadius: theme.radius.md,
      resizeMode: 'cover',
    },
    compactBody: { flex: 1, gap: theme.spacing.xs, justifyContent: 'center' },
    compactTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
  });
}
