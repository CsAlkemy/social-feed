const UNITS: Array<{ max: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { max: 60, divisor: 1, unit: "second" },
  { max: 3_600, divisor: 60, unit: "minute" },
  { max: 86_400, divisor: 3_600, unit: "hour" },
  { max: 604_800, divisor: 86_400, unit: "day" },
  { max: 2_629_800, divisor: 604_800, unit: "week" },
  { max: 31_557_600, divisor: 2_629_800, unit: "month" },
  { max: Infinity, divisor: 31_557_600, unit: "year" },
];

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * Formats a date as a human-readable relative time, e.g. "5 minutes ago".
 */
export function formatRelativeTime(input: Date | string | number, now: Date = new Date()): string {
  const date = input instanceof Date ? input : new Date(input);
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const elapsed = Math.abs(seconds);

  for (const { max, divisor, unit } of UNITS) {
    if (elapsed < max) {
      return relativeTimeFormat.format(Math.trunc(seconds / divisor), unit);
    }
  }

  return relativeTimeFormat.format(Math.trunc(seconds / 31_557_600), "year");
}
