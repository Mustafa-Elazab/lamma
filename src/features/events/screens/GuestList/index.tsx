import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';

import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppEmptyState } from '../../../../design-system/molecules/EmptyState';
import { AppErrorState } from '../../../../design-system/molecules/ErrorState';
import { AppSectionHeader } from '../../../../design-system/molecules/SectionHeader';
import { AppSegmentedTabs } from '../../../../design-system/molecules/SegmentedTabs';
import { AppGuestRow } from '../../../../design-system/organisms/GuestRow';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { AppStackParamList } from '../../../../navigation/types';
import type { Attendee } from '../../core/entity';
import { createStyles } from './styles';
import { useGuestListController } from './useController';

type Props = NativeStackScreenProps<AppStackParamList, 'GuestList'>;

export function GuestListScreen({ route }: Props): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useGuestListController(route.params.eventId);

  if (c.isError || (!c.isLoading && !c.event)) {
    return (
      <AppScreenTemplate>
        <AppErrorState onRetry={() => void c.refetch()} />
      </AppScreenTemplate>
    );
  }

  const event = c.event;

  const guestSubtitle = (guest: Attendee): string | undefined => {
    if (guest.relation === 'host') {
      return c.t('event.eventCreator');
    }
    if (guest.plusOnes > 0) {
      return `+${guest.plusOnes}`;
    }
    return undefined;
  };

  const header = (
    <View style={styles.header}>
      <Pressable onPress={c.goBack} hitSlop={8}>
        <AppIcon name="back" size={24} />
      </Pressable>
      {c.cover ? <Image source={c.cover} style={styles.cover} /> : null}
      <View style={styles.headerText}>
        <AppText variant="subheading" numberOfLines={1}>
          {event?.title ?? ''}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {c.dateLabel}
        </AppText>
      </View>
    </View>
  );

  return (
    <AppScreenTemplate edges={['top']} header={header}>
      <AppSegmentedTabs items={c.tabs} value={c.tab} onChange={c.setTab} />

      {event ? (
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <AppIcon name="guests" size={22} color="primary" />
          </View>
          <View style={styles.summaryText}>
            <AppText variant="subheading">{c.summaryLabel}</AppText>
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {event.description}
            </AppText>
          </View>
        </View>
      ) : null}

      {c.isEmpty ? (
        <AppEmptyState
          title={c.emptyTitle}
          message={c.emptyMessage}
          icon="guests"
        />
      ) : null}

      {c.groups && !c.isEmpty ? (
        <>
          {c.groups.hosts.length > 0 ? (
            <View style={styles.section}>
              <AppSectionHeader
                title={`${c.t('event.hosts')} (${c.groups.hosts.length})`}
              />
              <View style={styles.sectionCard}>
                {c.groups.hosts.map(guest => (
                  <AppGuestRow
                    key={guest.id}
                    name={guest.name}
                    subtitle={
                      guest.relation === 'cohost'
                        ? c.t('event.coHost')
                        : c.t('event.eventCreator')
                    }
                    hostLabel={c.t('event.hosts')}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {c.groups.family.length > 0 ? (
            <View style={styles.section}>
              <AppSectionHeader
                title={`${c.t('event.family')} (${c.groups.family.length})`}
              />
              <View style={styles.sectionCard}>
                {c.groups.family.map(guest => (
                  <AppGuestRow
                    key={guest.id}
                    name={guest.name}
                    subtitle={guestSubtitle(guest)}
                    onPressMore={() => undefined}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {c.groups.friends.length > 0 ? (
            <View style={styles.section}>
              <AppSectionHeader
                title={`${c.t('event.friends')} (${c.groups.friends.length})`}
              />
              <View style={styles.sectionCard}>
                {c.groups.friends.map(guest => (
                  <AppGuestRow
                    key={guest.id}
                    name={guest.name}
                    subtitle={guestSubtitle(guest)}
                    onPressMore={() => undefined}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </AppScreenTemplate>
  );
}
