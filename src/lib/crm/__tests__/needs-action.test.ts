import { describe, expect, it } from "vitest";
import { needsActionNow } from "../needs-action";
import type { Lead } from "../types";

const base: Lead = {
  uniqueId: "1",
  dateAdded: "20/07/2026 09:00:00",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  postCode: "",
  stage: "Lead",
  agentManual: "",
  agent: "",
  agentEmail: "",
  notes: "",
  city: "",
  model: "",
  serial: "",
  viewUpdateUrl: "",
  regMatchKey: "",
  stageUpdatedAt: "",
  stageUpdateFrom: "",
  stageUpdateTo: "",
  alert48Sent: "",
  alert5DaySent: "",
  finalFollowUpSent: "",
  speedToLeadMinutes: null,
  source: "",
  liveUpdateLink: "",
  trackingDetails: "",
};

const now = new Date(2026, 6, 22, 12, 0, 0);

describe("needsActionNow (§11)", () => {
  it("every untouched Lead qualifies", () => {
    expect(needsActionNow(base, now)).toBe(true);
  });

  it("48h alert flag qualifies at any stage", () => {
    expect(
      needsActionNow(
        { ...base, stage: "Contact Failed", alert48Sent: "TRUE" },
        now,
      ),
    ).toBe(true);
  });

  it("Made contact goes stale after 48h without a stage change", () => {
    expect(
      needsActionNow(
        { ...base, stage: "Made contact", stageUpdatedAt: "12/07/2026 09:18:26" },
        now,
      ),
    ).toBe(true);
    expect(
      needsActionNow(
        { ...base, stage: "Made contact", stageUpdatedAt: "21/07/2026 15:00:00" },
        now,
      ),
    ).toBe(false);
  });

  it("Made contact with an unparseable date is shown, not hidden", () => {
    expect(
      needsActionNow(
        { ...base, stage: "Made contact", stageUpdatedAt: "??", dateAdded: "??" },
        now,
      ),
    ).toBe(true);
  });

  it("later stages don't qualify without a flag", () => {
    expect(needsActionNow({ ...base, stage: "MY Customer" }, now)).toBe(false);
    expect(needsActionNow({ ...base, stage: "Test Ride Booked" }, now)).toBe(false);
  });
});
