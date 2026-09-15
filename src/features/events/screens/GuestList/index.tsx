import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';

import { Icon } from '../../../../design-system/atoms/Icon';
import { Text } from '../../../../design-system/atoms/Text';
import { ErrorState } from '../../../../design-system/molecules/ErrorState';
import { SectionHeader } from '../../../../design-system/molecules/SectionHeader';
import { SegmentedTabs } from '../../../../design-system/molecules/SegmentedTabs';
import { GuestRow } from '../../../../design-system/organisms/GuestRow';
import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
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
      <ScreenTemplate>
        <ErrorState onRetry={() => void c.refetch()} />
      </ScreenTemplate>
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
        <Icon name="back" size={24} />
      </Pressable>
      {c.cover ? <Image source={c.cover} style={styles.cover} /> : null}
      <View style={styles.headerText}>
        <Text variant="subheading" numberOfLines={1}>
          {event?.title ?? ''}
        </Text>
        <Text variant="caption" color="textMuted">
          {c.dateLabel}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenTemplate edges={['top']} header={header}>
      <SegmentedTabs items={c.tabs} value={c.tab} onChange={c.setTab} />

      {event ? (
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Icon name="guests" size={22} color="primary" />
          </View>
          <View style={styles.summaryText}>
            <Text variant="subheading">
              {`${event.goingCount} ${c.t('home.going')}`}
            </Text>
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {event.description}
            </Text>
          </View>
        </View>
      ) : null}

      {c.groups ? (
        <>
          {c.groups.hosts.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader
                title={`${c.t('event.hosts')} (${c.groups.hosts.length})`}
              />
              <View style={styles.sectionCard}>
                {c.groups.hosts.map(guest => (
                  <GuestRow
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
              <SectionHeader
                title={`${c.t('event.family')} (${c.groups.family.length})`}
              />
              <View style={styles.sectionCard}>
                {c.groups.family.map(guest => (
                  <GuestRow
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
              <SectionHeader
                title={`${c.t('event.friends')} (${c.groups.friends.length})`}
              />
              <View style={styles.sectionCard}>
                {c.groups.friends.map(guest => (
                  <GuestRow
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
    </ScreenTemplate>
  );
}
