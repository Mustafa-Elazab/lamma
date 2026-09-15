import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppInput } from '../../../../design-system/atoms/Input';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import { CreateHeader } from '../../components/CreateHeader';
import { DetailRow } from '../../components/DetailRow';
import { LocationPickerModal } from '../../components/LocationPickerModal';
import { WIZARD_STEP } from '../steps';
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
        <CreateHeader
          title={c.t('create.whenWhere')}
          steps={c.steps}
          currentStep={WIZARD_STEP.whenWhere}
          onBack={c.goBack}
        />
      }
      footer={
        <AppButton
          label={c.t('common.next')}
          rightIcon="navigation"
          onPress={c.goNext}
          disabled={!c.whenWhere.valid}
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
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="subheading">{c.t('create.where')}</AppText>
          <AppText variant="caption" color="textMuted">
            {c.t('create.whereHint')}
          </AppText>
        </View>
        <AppInput
          label={c.t('create.venueName')}
          value={c.draft.venueName}
          onChangeText={c.setVenue}
          leftIcon="location"
        />
        <AppInput
          label={c.t('create.areaAddress')}
          value={c.draft.areaAddress}
          onChangeText={c.setAddress}
          leftIcon="map"
        />
        <DetailRow
          icon="map"
          label={c.t('create.where')}
          value={c.t('create.pickOnMap')}
          onPress={() => setPicker('location')}
        />
        {c.hasCoordinates ? (
          <View style={local.mapPreview}>
            <AppIcon name="navigation" size={22} color="primary" />
            <AppText variant="caption" color="textMuted">
              {c.draft.latitude?.toFixed(5)}, {c.draft.longitude?.toFixed(5)}
            </AppText>
          </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      height: 56,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceWarm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
}
