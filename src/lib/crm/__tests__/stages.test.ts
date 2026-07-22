import { describe, expect, it } from "vitest";
import {
  allowedNextStages,
  isForwardMove,
  isKnownStage,
  stageIndex,
  stageTone,
} from "../stages";
import { STAGES } from "../types";

describe("stage order", () => {
  it("knows all nine stages in canonical order", () => {
    expect(STAGES).toHaveLength(9);
    expect(stageIndex("Lead")).toBe(0);
    expect(stageIndex("MY Customer")).toBe(8);
  });

  it("rejects unknown stages", () => {
    expect(isKnownStage("Won")).toBe(false);
    expect(stageIndex("Won")).toBe(-1);
  });

  it("offers only current-or-later stages", () => {
    expect(allowedNextStages("Test Ride Booked")).toEqual([
      "Test Ride Booked",
      "Test Ride Completed",
      "Test Ride Declined",
      "Offer Accepted",
      "Offer Declined",
      "MY Customer",
    ]);
    expect(allowedNextStages("MY Customer")).toEqual(["MY Customer"]);
  });

  it("offers all stages when the current one is unrecognised", () => {
    expect(allowedNextStages("Garbage")).toEqual([...STAGES]);
  });

  it("refuses backwards moves and allows same-or-forward", () => {
    expect(isForwardMove("Test Ride Booked", "Made contact")).toBe(false);
    expect(isForwardMove("Lead", "MY Customer")).toBe(true);
    expect(isForwardMove("Made contact", "Made contact")).toBe(true);
  });

  it("refuses moves to unknown stages, allows from unknown ones", () => {
    expect(isForwardMove("Lead", "Garbage")).toBe(false);
    expect(isForwardMove("Garbage", "Lead")).toBe(true);
  });

  it("maps the §5 colour progression", () => {
    expect(stageTone("Lead")).toBe("slate");
    expect(stageTone("Made contact")).toBe("blue");
    expect(stageTone("Contact Failed")).toBe("alert");
    expect(stageTone("Test Ride Booked")).toBe("yellow");
    expect(stageTone("MY Customer")).toBe("deep");
    expect(stageTone("Garbage")).toBe("slate");
  });
});
