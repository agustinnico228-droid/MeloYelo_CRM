import { describe, expect, it } from "vitest";
import { findLikelyDuplicates } from "../duplicates";
import type { Lead } from "../types";

function lead(overrides: Partial<Lead> & { uniqueId: string }): Lead {
  return {
    dateAdded: "",
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
    ...overrides,
  };
}

describe("findLikelyDuplicates (§9.5)", () => {
  it("groups two records sharing one email", () => {
    const groups = findLikelyDuplicates([
      lead({ uniqueId: "1", email: "shared@x.nz" }),
      lead({ uniqueId: "2", email: "SHARED@x.nz" }),
      lead({ uniqueId: "3", email: "other@x.nz" }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].kind).toBe("email");
    expect(groups[0].leads.map((l) => l.uniqueId)).toEqual(["1", "2"]);
  });

  it("matches phones across formats", () => {
    const groups = findLikelyDuplicates([
      lead({ uniqueId: "1", phone: "0272 471 230" }),
      lead({ uniqueId: "2", phone: "+64 272471230" }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].kind).toBe("phone");
  });

  it("matches the same full name under different emails", () => {
    const groups = findLikelyDuplicates([
      lead({ uniqueId: "1", firstName: "Grace", lastName: "Lin", email: "a@x.nz" }),
      lead({ uniqueId: "2", firstName: "Grace", lastName: "Lin", email: "b@x.nz" }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].kind).toBe("name");
  });

  it("does not double-report the same pair under two keys", () => {
    const groups = findLikelyDuplicates([
      lead({ uniqueId: "1", email: "s@x.nz", phone: "0272471230" }),
      lead({ uniqueId: "2", email: "s@x.nz", phone: "027 247 1230" }),
    ]);
    expect(groups).toHaveLength(1);
  });

  it("ignores blanks", () => {
    const groups = findLikelyDuplicates([
      lead({ uniqueId: "1" }),
      lead({ uniqueId: "2" }),
    ]);
    expect(groups).toHaveLength(0);
  });
});
