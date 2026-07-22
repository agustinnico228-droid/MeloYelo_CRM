/**
 * Phone handling (§9.1). Live data holds at least six formats:
 * "21721560", "0274 471 988", "+64 272471230", "027-272-6680",
 * "640274332406". Normalise ONLY for tel: links — always display the
 * stored original, never rewrite stored data.
 */

/** E.164-ish NZ number for a tel: link, or null when there's nothing usable. */
export function phoneHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) return null;

  // Already carries a country code
  if (trimmed.startsWith("+")) return `tel:+${digits}`;

  // "64…" prefix, sometimes with the domestic 0 mistakenly kept (6402…)
  if (digits.startsWith("64") && digits.length >= 10) {
    let rest = digits.slice(2);
    if (rest.startsWith("0")) rest = rest.slice(1);
    return `tel:+64${rest}`;
  }

  // Domestic format "0…"
  if (digits.startsWith("0")) return `tel:+64${digits.slice(1)}`;

  // Bare number missing its leading 0 (e.g. "21721560")
  return `tel:+64${digits}`;
}
