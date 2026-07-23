/**
 * Campaign naming & UTM convention (Phase 17 Part C) — the intranet's
 * actual rules:
 *
 *   Campaign naming format : YYMM-shortname
 *   Minimum UTMs           : utm_source, utm_medium, utm_campaign
 *   KEY RULE               : utm_campaign must EXACTLY match the
 *                            official campaign name
 */

/** Lowercase, hyphen-separated, no spaces — corrected, not rejected. */
export function normalizeUtmValue(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** YYMM-shortname, with a plausible month (01–12). */
export function isValidCampaignCode(code: string): boolean {
  const m = code.match(/^(\d{2})(\d{2})-[a-z0-9-]+$/);
  if (!m) return false;
  const month = Number(m[2]);
  return month >= 1 && month <= 12;
}

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
}

/** Assemble the tagged URL, preserving any params already on the page. */
export function buildUtmUrl(
  landingPage: string,
  params: UtmParams,
): string | null {
  let url: URL;
  try {
    url = new URL(landingPage);
  } catch {
    return null;
  }
  url.searchParams.set("utm_source", normalizeUtmValue(params.source));
  url.searchParams.set("utm_medium", normalizeUtmValue(params.medium));
  url.searchParams.set("utm_campaign", params.campaign);
  if (params.content && params.content.trim() !== "") {
    url.searchParams.set("utm_content", normalizeUtmValue(params.content));
  }
  return url.toString();
}
