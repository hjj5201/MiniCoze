const SHANGHAI_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000;

export function formatShanghaiDateTime(date: Date): string {
  return new Date(date.getTime() + SHANGHAI_TIMEZONE_OFFSET)
    .toISOString()
    .replace('Z', '+08:00');
}
