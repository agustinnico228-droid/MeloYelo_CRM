import { describe, expect, it } from "vitest";
import {
  agentHasMadeContact,
  isDormant,
  isRideGuideLead,
  queueOrder,
} from "../ride-guide";
import type { Lead } from "../types";

function lead(overrides: Partial<Lead> & { uniqueId: string }): Lead {
  return {
    dateAdded: "01/07/2026 09:00:00",
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
    source: "Website Form",
    liveUpdateLink: "",
    trackingDetails: "",
    ...overrides,
  };
}

describe("isRideGuideLead — the hard source rule (§14.1)", () => {
  it("accepts only Website Form", () => {
    expect(isRideGuideLead(lead({ uniqueId: "1" }))).toBe(true);
    expect(isRideGuideLead(lead({ uniqueId: "2", source: "AgentForm" }))).toBe(
      false,
    );
    expect(
      isRideGuideLead(lead({ uniqueId: "3", source: "Call Centre" })),
    ).toBe(false);
  });
});

describe("agentHasMadeContact", () => {
  it("true when the notes hold an attributed entry", () => {
    expect(
      agentHasMadeContact(
        lead({
          uniqueId: "1",
          notes: "9:00am 01/07/26 Dave Thompson: Called.",
        }),
      ),
    ).toBe(true);
  });

  it("false for empty notes or unattributed legacy scribbles", () => {
    expect(agentHasMadeContact(lead({ uniqueId: "1" }))).toBe(false);
    expect(
      agentHasMadeContact(lead({ uniqueId: "2", notes: "old free text" })),
    ).toBe(false);
  });
});

describe("queueOrder — never-contacted first, then longest-stuck", () => {
  it("puts untouched Leads before later stages, oldest first", () => {
    const ordered = queueOrder([
      lead({
        uniqueId: "stuck",
        stage: "Made contact",
        stageUpdatedAt: "10/06/2026 09:00:00",
      }),
      lead({ uniqueId: "newLead", dateAdded: "20/07/2026 09:00:00" }),
      lead({ uniqueId: "oldLead", dateAdded: "01/07/2026 09:00:00" }),
    ]);
    expect(ordered.map((l) => l.uniqueId)).toEqual([
      "oldLead",
      "newLead",
      "stuck",
    ]);
  });
});

describe("isDormant", () => {
  const now = new Date(2026, 6, 22);

  it("early-stage lead untouched for over 14 days", () => {
    expect(
      isDormant(lead({ uniqueId: "1", dateAdded: "01/06/2026 09:00:00" }), now),
    ).toBe(true);
    expect(
      isDormant(lead({ uniqueId: "2", dateAdded: "20/07/2026 09:00:00" }), now),
    ).toBe(false);
  });

  it("never flags progressed leads", () => {
    expect(
      isDormant(
        lead({
          uniqueId: "1",
          stage: "MY Customer",
          dateAdded: "01/01/2026 09:00:00",
        }),
        now,
      ),
    ).toBe(false);
  });
});
