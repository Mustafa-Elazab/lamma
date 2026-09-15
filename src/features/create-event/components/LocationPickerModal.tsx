import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type LatLng,
  type MapPressEvent,
  type Region,
} from 'react-native-maps';

import { AppButton } from '../../../design-system/atoms/Button';
import { AppIcon } from '../../../design-system/atoms/Icon';
import { AppInput } from '../../../design-system/atoms/Input';
import { AppText } from '../../../design-system/atoms/Text';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';
import {
  reverseGeocode,
  searchPlaces,
  type GeoPlace,
} from '../core/geocoding';

export type EventLocation = {
  label: string;
  address: string;
  lat: number;
  lng: number;
};

export type LocationPickerModalProps = {
  visible: boolean;
  initialQuery?: string;
  initialLocation?: EventLocation;
  onConfirm: (location: EventLocation) => void;
  onClose: () => void;
};

const DEFAULT_COORDINATE: LatLng = {
  latitude: 30.0444,
  longitude: 31.2357,
};
const LATITUDE_DELTA = 0.035;
const LONGITUDE_DELTA = 0.035;

export function LocationPickerModal({
  visible,
  initialQuery,
  initialLocation,
  onConfirm,
  onClose,
}: LocationPickerModalProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [query, setQuery] = useState(initialQuery ?? '');
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [coordinate, setCoordinate] = useState<LatLng>(
    initialLocation
      ? {
          latitude: initialLocation.lat,
          longitude: initialLocation.lng,
        }
      : DEFAULT_COORDINATE,
  );
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setQuery(initialQuery ?? '');
    setResults([]);
    setError(false);
    if (initialLocation) {
      setCoordinate({
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
      });
    }
  }, [initialLocation, initialQuery, visible]);

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
    let cancelled = false;
    debounce.current = setTimeout(() => {
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
    }, 500);
    return () => {
      cancelled = true;
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
    };
  }, [query, visible]);

  const moveMap = useCallback((next: LatLng) => {
    setCoordinate(next);
    const region: Region = {
      ...next,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
    mapRef.current?.animateToRegion(region, 350);
  }, []);

  const handleSelectResult = useCallback(
    (place: GeoPlace) => {
      setQuery(place.name);
      setResults([]);
      moveMap({
        latitude: place.latitude,
        longitude: place.longitude,
      });
    },
    [moveMap],
  );

  const handleMapPress = useCallback((event: MapPressEvent) => {
    setCoordinate(event.nativeEvent.coordinate);
  }, []);

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    setError(false);
    try {
      const place = await reverseGeocode(
        coordinate.latitude,
        coordinate.longitude,
      );
      if (!place) {
        throw new Error('No address found for selected coordinate');
      }
      onConfirm({
        label: place.name,
        address: place.displayName,
        lat: coordinate.latitude,
        lng: coordinate.longitude,
      });
      onClose();
    } catch {
      setError(true);
    } finally {
      setConfirming(false);
    }
  }, [coordinate, onClose, onConfirm]);

  const initialRegion = useMemo<Region>(
    () => ({
      ...coordinate,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
    // The map is deliberately uncontrolled after it mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<GeoPlace>) => (
      <Pressable
        style={({ pressed }) => [styles.result, pressed && styles.pressed]}
        onPress={() => handleSelectResult(item)}
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
    [handleSelectResult, styles],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={styles.headerButton}
            onPress={onClose}
          >
            <AppIcon name="back" size={24} color="text" />
          </Pressable>
          <AppText variant="subheading">{t('create.chooseLocation')}</AppText>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            onPress={handleMapPress}
            showsCompass
            showsMyLocationButton
            toolbarEnabled={false}
          >
            <Marker
              coordinate={coordinate}
              draggable
              pinColor={theme.colors.primary}
              onDragEnd={event => setCoordinate(event.nativeEvent.coordinate)}
            />
          </MapView>

          <View style={styles.search}>
            <AppInput
              placeholder={t('create.searchLocation')}
              value={query}
              onChangeText={setQuery}
              leftIcon="search"
              returnKeyType="search"
            />
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : null}
            {results.length > 0 ? (
              <FlatList
                style={styles.results}
                data={results}
                renderItem={renderItem}
                keyExtractor={item => `${item.latitude},${item.longitude}`}
                keyboardShouldPersistTaps="handled"
              />
            ) : null}
          </View>

          <View style={styles.coordinateCard}>
            <AppIcon name="location" size={20} color="primary" />
            <AppText variant="caption" color="textMuted">
              {coordinate.latitude.toFixed(5)}, {coordinate.longitude.toFixed(5)}
            </AppText>
          </View>
        </View>

        {error ? (
          <AppText
            variant="caption"
            color="error"
            align="center"
            style={styles.error}
          >
            {t('create.locationError')}
          </AppText>
        ) : null}
        <View style={styles.footer}>
          <AppButton
            label={t('create.confirmLocation')}
            rightIcon="navigation"
            loading={confirming}
            onPress={() => void handleConfirm()}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
      paddingHorizontal: theme.spacing.lg,
    },
    headerButton: { width: 40, alignItems: 'center' },
    mapContainer: { flex: 1, overflow: 'hidden' },
    search: {
      position: 'absolute',
      top: theme.spacing.lg,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
    },
    loading: {
      position: 'absolute',
      right: theme.spacing.lg,
      top: 18,
    },
    results: {
      maxHeight: 280,
      marginTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.card,
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
    coordinateCard: {
      position: 'absolute',
      bottom: theme.spacing.lg,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.soft,
    },
    error: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
  });
}
