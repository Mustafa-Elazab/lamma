import { en } from '../resources/en';
import { ar } from '../resources/ar';

type Nested = { [key: string]: string | Nested };

function collectKeys(obj: Nested, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string'
      ? [path]
      : collectKeys(value as Nested, path);
  });
}

describe('i18n resource parity', () => {
  it('has identical key sets for en and ar', () => {
    const enKeys = collectKeys(en as unknown as Nested).sort();
    const arKeys = collectKeys(ar as unknown as Nested).sort();
    expect(arKeys).toEqual(enKeys);
  });

  it('has non-empty Arabic translations', () => {
    const arKeys = collectKeys(ar as unknown as Nested);
    expect(arKeys.length).toBeGreaterThan(50);
  });
});
