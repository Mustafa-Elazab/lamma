import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '../../../design-system/atoms/Icon';
import { AppInput } from '../../../design-system/atoms/Input';
import { AppText } from '../../../design-system/atoms/Text';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';
import { searchPlaces, type GeoPlace } from '../core/geocoding';

export type LocationPickerModalProps = {
  visible: boolean;
  initialQuery?: string;
  onSelect: (place: GeoPlace) => void;
  onClose: () => void;
};

export function LocationPickerModal({
  visible,
  initialQuery,
  onSelect,
  onClose,
}: LocationPickerModalProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery ?? '');
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const trimmed = query.trim();
    if (debounce.current) {
      clearTimeout(debounce.current);
    }
    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    debounce.current = setTimeout(() => {
      let cancelled = false;
      void searchPlaces(trimmed)
        .then(places => {
          if (!cancelled) {
            setResults(places);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError(true);
            setResults([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }, 500);
    return () => {
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
    };
  }, [query, visible]);

  const handleSelect = useCallback(
    (place: GeoPlace) => {
      onSelect(place);
      onClose();
    },
    [onClose, onSelect],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<GeoPlace>) => (
      <Pressable
        style={({ pressed }) => [styles.result, pressed && styles.pressed]}
        onPress={() => handleSelect(item)}
      >
        <AppIcon name="location" size={20} color="primary" />
        <View style={styles.resultText}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {item.name}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {item.displayName}
          </AppText>
        </View>
      </Pressable>
    ),
    [handleSelect, styles],
  );

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
          <AppText variant="subheading">{t('create.chooseLocation')}</AppText>
          <Pressable onPress={onClose} hitSlop={8}>
            <AppIcon name="close" size={22} color="textMuted" />
          </Pressable>
        </View>
        <AppInput
          placeholder={t('create.searchLocation')}
          value={query}
          onChangeText={setQuery}
          leftIcon="search"
          autoFocus
        />
        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.state}>
            <AppText variant="caption" color="textMuted" align="center">
              {t('create.locationError')}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={item => `${item.latitude},${item.longitude}`}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              query.trim().length >= 3 ? (
                <View style={styles.state}>
                  <AppText variant="caption" color="textMuted" align="center">
                    {t('create.locationNoResults')}
                  </AppText>
                </View>
              ) : (
                <View style={styles.state}>
                  <AppText variant="caption" color="textMuted" align="center">
                    {t('create.locationHint')}
                  </AppText>
                </View>
              )
            }
          />
        )}
      </View>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: theme.colors.overlay },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '78%',
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    result: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    pressed: { opacity: 0.6 },
    resultText: { flex: 1, gap: 2 },
    state: { paddingVertical: theme.spacing.xl, alignItems: 'center' },
  });
}
