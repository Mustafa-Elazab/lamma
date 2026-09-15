export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const MS_PER_MINUTE = 60 * 1000;

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function minutesOfDay(ts: number): number {
  const d = new Date(ts);
  return d.getHours() * 60 + d.getMinutes();
}

export function combineDateAndMinutes(dateTs: number, minutes: number): number {
  return startOfDay(dateTs) + minutes * MS_PER_MINUTE;
}
