/**
 * speed_to_lead_minutes has extreme artefacts in live data — e.g. 306,447
 * minutes ≈ 213 days (§9.3). Headline stats use the MEDIAN, exclude
 * values over 14 days, and always show how many were excluded. Never a
 * raw mean.
 */

export const OUTLIER_THRESHOLD_MINUTES = 20_160; // 14 days

export interface SpeedToLeadStats {
  /** null when no usable values */
  medianMinutes: number | null;
  /** values excluded as outliers (> 14 days) */
  excludedCount: number;
  /** values that went into the median */
  sampleSize: number;
}

export function speedToLeadStats(
  values: readonly (number | null)[],
): SpeedToLeadStats {
  const present = values.filter(
    (v): v is number => v !== null && Number.isFinite(v) && v >= 0,
  );
  const included = present.filter((v) => v <= OUTLIER_THRESHOLD_MINUTES);
  const excludedCount = present.length - included.length;

  if (included.length === 0) {
    return { medianMinutes: null, excludedCount, sampleSize: 0 };
  }

  const sorted = [...included].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  return {
    medianMinutes: median,
    excludedCount,
    sampleSize: included.length,
  };
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${Math.round(mins)} min`;
  if (mins < 60 * 48) {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
  }
  const days = mins / (60 * 24);
  return `${days.toFixed(days < 10 ? 1 : 0)} days`;
}
