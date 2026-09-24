import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useCallback, useMemo } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { branding, headerImages } from '../../../../assets';
import { AppButton } from '../../../../design-system/atoms/Button';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import { DetailRow } from '../../components/DetailRow';
import { LocationPickerModal } from '../../components/LocationPickerModal';
import { createStyles } from './styles';
import { useWhenWhereController, type ActivePicker } from './useController';

export function WhenWhereScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const local = useMemo(() => createLocalStyles(theme), [theme]);
  const c = useWhenWhereController();

  const { picker, setPicker, onPickDate, onPickStart, onPickEnd } = c;

  const handleNativeChange = useCallback(
    (mode: Exclude<ActivePicker, 'location' | null>) =>
      (event: DateTimePickerEvent, selected?: Date) => {
        // Android renders a dialog and fires once; close it either way.
        if (Platform.OS !== 'ios') {
          setPicker(null);
        }
        if (event.type === 'dismissed' || !selected) {
          return;
        }
        if (mode === 'date') {
          onPickDate(selected);
        } else if (mode === 'start') {
          onPickStart(selected);
        } else {
          onPickEnd(selected);
        }
      },
    [onPickDate, onPickEnd, onPickStart, setPicker],
  );

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <ImageBackground
          source={headerImages.egyptMotif}
          resizeMode="contain"
          imageStyle={local.headerMotif}
          style={local.brandedHeader}
        >
          <View style={local.headerTitleRow}>
            <Pressable onPress={c.goBack} hitSlop={8} style={local.backButton}>
              <AppIcon name="back" size={28} color="textMuted" />
            </Pressable>
            <View>
              <AppText variant="heading">{c.t('create.whenWhere')}</AppText>
              <AppText variant="caption" color="textMuted" style={local.eyebrow}>
                {c.t('create.title').toUpperCase()}
              </AppText>
            </View>
          </View>
          <Image source={branding.logo} style={local.headerLogo} />
        </ImageBackground>
      }
      footer={
        <AppButton
          label={c.t('common.next')}
          rightIcon="navigation"
          onPress={c.goNext}
        />
      }
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="subheading">{c.t('create.when')}</AppText>
          <AppText variant="caption" color="textMuted">
            {c.t('create.whenHint')}
          </AppText>
        </View>
        <View style={styles.rows}>
          <DetailRow
            icon="calendar"
            label={c.t('create.date')}
            value={c.dateLabel ?? c.t('create.selectDate')}
            placeholder={!c.dateLabel}
            onPress={() => setPicker('date')}
          />
          <DetailRow
            icon="clock"
            label={c.t('create.startTime')}
            value={c.startLabel ?? c.t('create.selectTime')}
            placeholder={!c.startLabel}
            onPress={() => setPicker('start')}
          />
          <DetailRow
            icon="clock"
            label={c.t('create.endTime')}
            value={c.endLabel ?? c.t('create.selectTime')}
            placeholder={!c.endLabel}
            onPress={() => setPicker('end')}
          />
        </View>
        {c.attemptedNext && !c.draft.startAt ? (
          <AppText variant="caption" color="error">
            {c.t('create.errorDateRequired')}
          </AppText>
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="subheading">{c.t('create.where')}</AppText>
          <AppText variant="caption" color="textMuted">
            {c.t('create.whereHint')}
          </AppText>
        </View>
        <DetailRow
          icon="location"
          label={c.t('create.venueName')}
          value={c.draft.venueName || c.t('create.pickOnMap')}
          placeholder={!c.draft.venueName}
          onPress={() => setPicker('location')}
        />
        <DetailRow
          icon="map"
          label={c.t('create.areaAddress')}
          value={c.draft.areaAddress || c.t('create.pickOnMap')}
          placeholder={!c.draft.areaAddress}
          onPress={() => setPicker('location')}
        />
        {c.attemptedNext && (!c.draft.venueName || !c.draft.areaAddress) ? (
          <AppText variant="caption" color="error">
            {c.t('create.errorAddressRequired')}
          </AppText>
        ) : null}
        {c.hasCoordinates ? (
          <Pressable
            style={local.mapPreview}
            onPress={() => setPicker('location')}
          >
            <MapView
              key={`${c.draft.latitude},${c.draft.longitude}`}
              provider={PROVIDER_GOOGLE}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              initialRegion={{
                latitude: c.draft.latitude!,
                longitude: c.draft.longitude!,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              toolbarEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: c.draft.latitude!,
                  longitude: c.draft.longitude!,
                }}
              />
            </MapView>
            <View style={local.mapLabel}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {c.draft.venueName}
              </AppText>
              <AppText variant="caption" color="textMuted" numberOfLines={1}>
                {c.draft.areaAddress}
              </AppText>
            </View>
          </Pressable>
        ) : null}
      </View>

      {picker === 'date' ? (
        <DateTimePicker
          value={c.dateValue}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleNativeChange('date')}
        />
      ) : null}
      {picker === 'start' ? (
        <DateTimePicker
          value={c.startValue}
          mode="time"
          display="default"
          onChange={handleNativeChange('start')}
        />
      ) : null}
      {picker === 'end' ? (
        <DateTimePicker
          value={c.endValue}
          mode="time"
          display="default"
          onChange={handleNativeChange('end')}
        />
      ) : null}

      <LocationPickerModal
        visible={picker === 'location'}
        initialQuery={c.draft.areaAddress || c.draft.venueName}
        initialLocation={
          c.hasCoordinates
            ? {
                label: c.draft.venueName,
                address: c.draft.areaAddress,
                lat: c.draft.latitude!,
                lng: c.draft.longitude!,
              }
            : undefined
        }
        onConfirm={c.onConfirmLocation}
        onClose={() => setPicker(null)}
      />
    </AppScreenTemplate>
  );
}

function createLocalStyles(theme: Theme) {
  return StyleSheet.create({
    mapPreview: {
      height: 136,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
    },
    mapLabel: {
      position: 'absolute',
      top: theme.spacing.lg,
      right: theme.spacing.lg,
      maxWidth: '56%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.soft,
    },
    brandedHeader: {
      minHeight: 108,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    headerMotif: {
      opacity: 0.18,
      left: 120,
      width: '72%',
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    backButton: {
      width: 36,
      height: 44,
      justifyContent: 'center',
    },
    eyebrow: { letterSpacing: 2.5, fontSize: 10 },
    headerLogo: {
      width: 90,
      height: 48,
      resizeMode: 'contain',
    },
  });
}
