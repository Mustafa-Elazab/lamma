import { parsePlace, reverseGeocode, searchPlaces } from '../geocoding';

describe('OSM geocoding', () => {
  afterEach(() => {
    (globalThis.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it('derives a short name from the display name when name is absent', () => {
    const place = parsePlace({
      display_name: 'Zooba, 26th of July St, Zamalek, Cairo, Egypt',
      lat: '30.0609',
      lon: '31.2197',
    });
    expect(place.name).toBe('Zooba');
    expect(place.latitude).toBeCloseTo(30.0609);
    expect(place.longitude).toBeCloseTo(31.2197);
  });

  it('prefers an explicit name field', () => {
    const place = parsePlace({
      display_name: 'Some long address, Cairo, Egypt',
      lat: '30',
      lon: '31',
      name: 'Cairo Opera House',
    });
    expect(place.name).toBe('Cairo Opera House');
  });

  it('returns [] for an empty query without calling the network', async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    expect(await searchPlaces('   ')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps search results from Nominatim', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          display_name: 'Cairo Tower, Zamalek, Cairo, Egypt',
          lat: '30.0459',
          lon: '31.2243',
          name: 'Cairo Tower',
        },
      ],
    }) as unknown as typeof fetch;
    const results = await searchPlaces('cairo tower');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Cairo Tower');
    expect(results[0].latitude).toBeCloseTo(30.0459);
  });

  it('reverse geocodes a coordinate into a place', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: 'Maadi, Cairo, Egypt',
        lat: '29.9603',
        lon: '31.2569',
      }),
    }) as unknown as typeof fetch;
    const place = await reverseGeocode(29.9603, 31.2569);
    expect(place?.name).toBe('Maadi');
    expect(place?.displayName).toContain('Cairo');
  });

  it('returns null when reverse geocoding finds nothing', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ error: 'Unable to geocode' }),
    }) as unknown as typeof fetch;
    expect(await reverseGeocode(0, 0)).toBeNull();
  });
});
