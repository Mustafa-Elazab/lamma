import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../../../design-system/atoms/Button';
import { Icon } from '../../../../design-system/atoms/Icon';
import { Input } from '../../../../design-system/atoms/Input';
import { Text } from '../../../../design-system/atoms/Text';
import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import { CreateHeader } from '../../components/CreateHeader';
import { DetailRow } from '../../components/DetailRow';
import { OptionPickerModal } from '../../components/OptionPickerModal';
import { WIZARD_STEP } from '../steps';
import { createStyles } from './styles';
import { useWhenWhereController } from './useController';

export function WhenWhereScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const local = useMemo(() => createLocalStyles(theme), [theme]);
  const c = useWhenWhereController();

  return (
    <ScreenTemplate
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
        <Button
          label={c.t('common.next')}
          rightIcon="navigation"
          onPress={c.goNext}
          disabled={!c.whenWhere.valid}
        />
      }
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="subheading">{c.t('create.when')}</Text>
          <Text variant="caption" color="textMuted">
            {c.t('create.whenHint')}
          </Text>
        </View>
        <View style={styles.rows}>
          <DetailRow
            icon="calendar"
            label={c.t('create.date')}
            value={c.dateLabel ?? c.t('create.selectDate')}
            placeholder={!c.dateLabel}
            onPress={() => c.setPicker('date')}
          />
          <DetailRow
            icon="clock"
            label={c.t('create.startTime')}
            value={c.startLabel ?? c.t('create.selectTime')}
            placeholder={!c.startLabel}
            onPress={() => c.setPicker('start')}
          />
          <DetailRow
            icon="clock"
            label={c.t('create.endTime')}
            value={c.endLabel ?? c.t('create.selectTime')}
            placeholder={!c.endLabel}
            onPress={() => c.setPicker('end')}
          />
          <DetailRow
            icon="language"
            label={c.t('create.timezone')}
            value={c.tzLabel}
            onPress={() => c.setPicker('timezone')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="subheading">{c.t('create.where')}</Text>
          <Text variant="caption" color="textMuted">
            {c.t('create.whereHint')}
          </Text>
        </View>
        <Input
          label={c.t('create.venueName')}
          value={c.draft.venueName}
          onChangeText={c.setVenue}
          leftIcon="location"
        />
        <Input
          label={c.t('create.areaAddress')}
          value={c.draft.areaAddress}
          onChangeText={c.setAddress}
          leftIcon="map"
        />
        <View style={local.mapPreview}>
          <Icon name="location" size={28} color="primary" />
          <Text variant="caption" color="textMuted">
            {c.draft.areaAddress.trim() || c.t('create.locationTBD')}
          </Text>
        </View>
        <DetailRow
          icon="navigation"
          label={c.t('create.where')}
          value={c.t('create.useCurrentLocation')}
          onPress={c.useCurrentLocation}
        />
      </View>

      <OptionPickerModal
        visible={c.picker === 'date'}
        title={c.t('create.selectDate')}
        options={c.dateOptions}
        selectedValue={c.draft.startAt ? String(startOfDayValue(c.draft.startAt)) : null}
        onSelect={c.onSelectDate}
        onClose={() => c.setPicker(null)}
      />
      <OptionPickerModal
        visible={c.picker === 'start'}
        title={c.t('create.startTime')}
        options={c.timeOptions}
        selectedValue={null}
        onSelect={c.onSelectStart}
        onClose={() => c.setPicker(null)}
      />
      <OptionPickerModal
        visible={c.picker === 'end'}
        title={c.t('create.endTime')}
        options={c.timeOptions}
        selectedValue={null}
        onSelect={c.onSelectEnd}
        onClose={() => c.setPicker(null)}
      />
      <OptionPickerModal
        visible={c.picker === 'timezone'}
        title={c.t('create.selectTimezone')}
        options={c.timezoneOptions}
        selectedValue={c.draft.timezone}
        onSelect={c.onSelectTimezone}
        onClose={() => c.setPicker(null)}
      />
    </ScreenTemplate>
  );
}

function startOfDayValue(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function createLocalStyles(theme: Theme) {
  return StyleSheet.create({
    mapPreview: {
      height: 120,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceWarm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
  });
}
