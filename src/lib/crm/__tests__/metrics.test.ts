import { describe, expect, it } from "vitest";
import {
  alertRate,
  currentStageRate,
  everReachedRate,
  leadsByAgent,
  speedToLeadByAgent,
  websiteFormLeads,
} from "../metrics";
import type { Lead, StageHistoryEntry } from "../types";

let nextId = 1;
function lead(overrides: Partial<Lead> = {}): Lead {
  return {
    uniqueId: String(nextId++),
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

describe("websiteFormLeads — the dashboard scope (B1)", () => {
  it("keeps only Website Form, honouring agent and date filters", () => {
    const leads = [
      lead({ agentEmail: "dave@meloyelo.nz" }),
      lead({ source: "AgentForm" }),
      lead({ dateAdded: "01/05/2026 09:00:00" }),
    ];
    expect(websiteFormLeads(leads)).toHaveLength(2);
    expect(
      websiteFormLeads(leads, { agentEmail: "Dave@meloyelo.nz" }),
    ).toHaveLength(1);
    expect(
      websiteFormLeads(leads, { from: new Date(2026, 5, 1) }),
    ).toHaveLength(1);
  });
});

describe("scorecards (B1)", () => {
  it("flag rate = flagged ÷ total", () => {
    const leads = [
      lead({ alert48Sent: "TRUE" }),
      lead({ alert48Sent: "TRUE" }),
      lead(),
      lead(),
    ];
    const r = alertRate(leads, "alert48Sent");
    expect(r.percent).toBe(50);
    expect(r.count).toBe(2);
  });

  it("current-stage rate counts today's state only", () => {
    const leads = [lead({ stage: "Test Ride Booked" }), lead(), lead(), lead()];
    expect(currentStageRate(leads, "Test Ride Booked").percent).toBe(25);
  });

  it("empty denominator yields null, never NaN", () => {
    expect(alertRate([], "alert48Sent").percent).toBeNull();
  });
});

describe("everReachedRate (B3) — events, not current state", () => {
  it("counts distinct leads that ever hit the stage via history", () => {
    const booked = lead({ stage: "MY Customer" }); // moved on long ago
    const current = lead({ stage: "Test Ride Booked" }); // no history row
    const never = lead();
    const history: StageHistoryEntry[] = [
      {
        uniqueId: booked.uniqueId,
        from: "Made contact",
        to: "Test Ride Booked",
        changedAt: "01/06/2026 10:00:00",
        agent: "X",
      },
      // duplicate event must not double-count
      {
        uniqueId: booked.uniqueId,
        from: "Made contact",
        to: "Test Ride Booked",
        changedAt: "02/06/2026 10:00:00",
        agent: "X",
      },
      // out-of-scope lead must not count
      {
        uniqueId: "999",
        from: "Lead",
        to: "Test Ride Booked",
        changedAt: "01/06/2026 10:00:00",
        agent: "X",
      },
    ];
    const r = everReachedRate(
      [booked, current, never],
      history,
      "Test Ride Booked",
    );
    expect(r.count).toBe(2);
    expect(r.percent).toBeCloseTo((2 / 3) * 100);
  });

  it("ever ≥ currently, on the same data", () => {
    const a = lead({ stage: "Test Ride Completed" });
    const b = lead({ stage: "Test Ride Booked" });
    const history: StageHistoryEntry[] = [
      {
        uniqueId: a.uniqueId,
        from: "Test Ride Booked",
        to: "Test Ride Completed",
        changedAt: "01/06/2026 10:00:00",
        agent: "X",
      },
      {
        uniqueId: a.uniqueId,
        from: "Made contact",
        to: "Test Ride Booked",
        changedAt: "20/05/2026 10:00:00",
        agent: "X",
      },
    ];
    const currently = currentStageRate([a, b], "Test Ride Booked");
    const ever = everReachedRate([a, b], history, "Test Ride Booked");
    expect(currently.count).toBe(1);
    expect(ever.count).toBe(2);
  });
});

describe("agent groupings (B4)", () => {
  it("counts leads per agent, largest first, Unassigned included", () => {
    const rows = leadsByAgent([
      lead({ agent: "Dave" }),
      lead({ agent: "Dave" }),
      lead({ agent: "Sarah" }),
      lead(),
    ]);
    expect(rows[0]).toMatchObject({ agent: "Dave", count: 2 });
    expect(rows.find((r) => r.agent === "Unassigned")?.count).toBe(1);
  });

  it("leaderboard uses the outlier-excluding median per agent", () => {
    const rows = speedToLeadByAgent([
      lead({ agent: "Dave", speedToLeadMinutes: 10 }),
      lead({ agent: "Dave", speedToLeadMinutes: 30 }),
      lead({ agent: "Dave", speedToLeadMinutes: 306447 }), // artefact
      lead({ agent: "Sarah", speedToLeadMinutes: 5 }),
      lead({ agent: "NoData" }),
    ]);
    expect(rows.map((r) => r.agent)).toEqual(["Sarah", "Dave"]);
    const dave = rows.find((r) => r.agent === "Dave")!;
    expect(dave.medianMinutes).toBe(20);
    expect(dave.excludedCount).toBe(1);
  });
});
