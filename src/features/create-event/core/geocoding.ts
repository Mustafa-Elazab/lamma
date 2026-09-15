/**
 * OpenStreetMap Nominatim geocoding. Used by the Create Event location picker to
 * resolve real place names and coordinates — there are no hardcoded/fake
 * locations anywhere in the app.
 *
 * Nominatim usage policy requires an identifying User-Agent and asks callers to
 * keep request volume low; the picker debounces search input to comply.
 */
import { env } from '../../../config/env';

export type GeoPlace = {
  /** Full, human readable address, e.g. "Zooba, 26th of July St, Zamalek…". */
  displayName: string;
  /** Short label suitable for a venue/area field. */
  name: string;
  latitude: number;
  longitude: number;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
};

const BASE_URL = 'https://nominatim.openstreetmap.org';

function headers(): Record<string, string> {
  return {
    Accept: 'application/json',
    'User-Agent': `Lamma/1.0 (+https://${env.deepLinkHost})`,
  };
}

function shortName(displayName: string): string {
  const first = displayName.split(',')[0]?.trim();
  return first && first.length > 0 ? first : displayName;
}

/** Parses a raw Nominatim record into a {@link GeoPlace}. Exported for tests. */
export function parsePlace(raw: NominatimResult): GeoPlace {
  return {
    displayName: raw.display_name,
    name:
      raw.name && raw.name.trim().length > 0
        ? raw.name.trim()
        : shortName(raw.display_name),
    latitude: Number(raw.lat),
    longitude: Number(raw.lon),
  };
}

/** Forward geocode: search OSM for places matching a free-text query. */
export async function searchPlaces(
  query: string,
  limit = 8,
): Promise<GeoPlace[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return [];
  }
  const url =
    `${BASE_URL}/search?format=jsonv2&addressdetails=1&limit=${limit}` +
    `&q=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) {
    throw new Error(`Nominatim search failed (${response.status})`);
  }
  const data = (await response.json()) as NominatimResult[];
  return data.map(parsePlace);
}

/** Reverse geocode a lat/lng into a place name via OSM. */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GeoPlace | null> {
  const url =
    `${BASE_URL}/reverse?format=jsonv2&addressdetails=1` +
    `&lat=${latitude}&lon=${longitude}`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) {
    throw new Error(`Nominatim reverse geocoding failed (${response.status})`);
  }
  const data = (await response.json()) as NominatimResult | { error: string };
  if (!('display_name' in data) || !data.display_name) {
    return null;
  }
  return parsePlace({
    display_name: data.display_name,
    lat: data.lat ?? String(latitude),
    lon: data.lon ?? String(longitude),
    name: data.name,
  });
}
