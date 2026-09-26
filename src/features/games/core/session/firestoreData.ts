/**
 * Firestore (RNFB and the web SDK) rejects `undefined` anywhere in a document
 * ("Unsupported field value: undefined"). Game engines use optional fields and
 * sometimes clear them with `field: undefined`, so every write goes through
 * this: undefined object fields are dropped, undefined array items become null.
 */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item =>
      item === undefined ? null : stripUndefined(item),
    ) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
      return value; // Timestamps, FieldValues, etc.
    }
    const out: Record<string, unknown> = {};
    Object.keys(value as Record<string, unknown>).forEach(key => {
      const item = (value as Record<string, unknown>)[key];
      if (item !== undefined) {
        out[key] = stripUndefined(item);
      }
    });
    return out as T;
  }
  return value;
}
