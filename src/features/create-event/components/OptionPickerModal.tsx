import React, { useMemo } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { AppIcon } from '../../../design-system/atoms/Icon';
import { AppText } from '../../../design-system/atoms/Text';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';

export type PickerOption = {
  label: string;
  value: string;
};

export type OptionPickerModalProps = {
  visible: boolean;
  title: string;
  options: ReadonlyArray<PickerOption>;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export function OptionPickerModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionPickerModalProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderItem = ({ item }: ListRenderItemInfo<PickerOption>) => {
    const selected = item.value === selectedValue;
    return (
      <Pressable
        style={styles.option}
        onPress={() => {
          onSelect(item.value);
          onClose();
        }}
      >
        <AppText variant="body" color={selected ? 'primary' : 'text'}>
          {item.label}
        </AppText>
        {selected ? <AppIcon name="check" size={20} color="primary" /> : null}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <AppText variant="subheading">{title}</AppText>
          <Pressable onPress={onClose} hitSlop={8}>
            <AppIcon name="close" size={22} color="textMuted" />
          </Pressable>
        </View>
        <FlatList
          data={options}
          renderItem={renderItem}
          keyExtractor={item => item.value}
          ItemSeparatorComponent={Separator}
          style={styles.list}
        />
      </View>
    </Modal>
  );
}

function Separator(): React.ReactElement {
  return <View style={separatorStyle} />;
}

const separatorStyle = { height: StyleSheet.hairlineWidth };

function createStyles(theme: Theme) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: theme.colors.overlay },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: '70%',
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      paddingTop: theme.spacing.sm,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    list: { flexGrow: 0 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
    },
  });
}
