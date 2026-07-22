/**
 * Postcode handling (§9.2). NZ postcodes are four digits and leading
 * zeros matter — always strings, never numbers.
 */

/** Canonical form for comparison: digits only, left-padded to 4. */
export function normalizePostcode(raw: string): string {
  const digits = raw.trim().replace(/\D/g, "");
  if (digits === "") return "";
  return digits.padStart(4, "0");
}

/**
 * Malformed = non-empty but not reducible to a sane 4-digit code
 * (e.g. the live "07020"). Flagged on /system, never a crash.
 */
export function isMalformedPostcode(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed === "") return false;
  if (!/^\d+$/.test(trimmed)) return true;
  return trimmed.length > 4;
}
