import { describe, expect, it } from "vitest";
import { buildUtmUrl, isValidCampaignCode, normalizeUtmValue } from "../utm";

describe("normalizeUtmValue — correct inline, don't reject", () => {
  it("lowercases, hyphenates spaces, strips junk", () => {
    expect(normalizeUtmValue("Google Ads")).toBe("google-ads");
    expect(normalizeUtmValue("  Paid   Social!! ")).toBe("paid-social");
    expect(normalizeUtmValue("e--mail-")).toBe("e-mail");
  });
});

describe("isValidCampaignCode — YYMM-shortname", () => {
  it("accepts the real campaign codes", () => {
    expect(isValidCampaignCode("2604-fuel-crisis")).toBe(true);
    expect(isValidCampaignCode("2606-supertrail-champagne")).toBe(true);
    expect(isValidCampaignCode("2607-find-your-perfect-e-bike")).toBe(true);
  });

  it("rejects bad shapes and impossible months", () => {
    expect(isValidCampaignCode("fuel-crisis")).toBe(false);
    expect(isValidCampaignCode("2613-nope")).toBe(false); // month 13
    expect(isValidCampaignCode("2600-nope")).toBe(false); // month 00
    expect(isValidCampaignCode("26-04-fuel")).toBe(false);
    expect(isValidCampaignCode("2604-Fuel-Crisis")).toBe(false); // uppercase
  });
});

describe("buildUtmUrl", () => {
  it("assembles the minimum UTMs and preserves existing params", () => {
    const url = buildUtmUrl("https://meloyelo.nz/book-ebike-test-ride/?ref=x", {
      source: "Meta",
      medium: "Paid Social",
      campaign: "2607-find-your-perfect-e-bike",
    });
    expect(url).toContain("ref=x");
    expect(url).toContain("utm_source=meta");
    expect(url).toContain("utm_medium=paid-social");
    expect(url).toContain("utm_campaign=2607-find-your-perfect-e-bike");
    expect(url).not.toContain("utm_content");
  });

  it("A/B variants differ by utm_content only", () => {
    const base = {
      source: "meta",
      medium: "paid-social",
      campaign: "2607-find-your-perfect-e-bike",
    };
    const a = buildUtmUrl("https://meloyelo.nz/quiz", {
      ...base,
      content: "no-incentive",
    })!;
    const b = buildUtmUrl("https://meloyelo.nz/quiz", {
      ...base,
      content: "incentive",
    })!;
    expect(new URL(a).searchParams.get("utm_campaign")).toBe(
      new URL(b).searchParams.get("utm_campaign"),
    );
    expect(new URL(a).searchParams.get("utm_content")).toBe("no-incentive");
    expect(new URL(b).searchParams.get("utm_content")).toBe("incentive");
  });

  it("returns null for an unusable landing URL", () => {
    expect(
      buildUtmUrl("not a url", { source: "a", medium: "b", campaign: "c" }),
    ).toBeNull();
  });
});
