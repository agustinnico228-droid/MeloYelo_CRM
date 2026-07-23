import { describe, expect, it } from "vitest";
import { composeOutcome, UNSUBSCRIBE_FLAG } from "../call-outcomes";

describe("composeOutcome (§14.2) — documented wording, verbatim", () => {
  it("test ride booked", () => {
    const r = composeOutcome("booked", { currentStage: "Made contact" });
    expect(r.stageTo).toBe("Test Ride Booked");
    expect(r.noteText).toBe("Call outcome: Test ride booked");
    expect(r.stageSkipped).toBe(false);
  });

  it("follow up later interpolates the interval", () => {
    const r = composeOutcome("followUp", {
      currentStage: "Lead",
      n: 3,
      unit: "weeks",
    });
    expect(r.stageTo).toBe("Made contact");
    expect(r.noteText).toBe(
      "Call outcome: Follow up later - requested contact again in 3 weeks",
    );
  });

  it("email nurture", () => {
    const r = composeOutcome("emailNurture", { currentStage: "Lead" });
    expect(r.stageTo).toBe("Made contact");
    expect(r.noteText).toBe(
      "Call outcome: Email nurture only - not ready for a test ride",
    );
  });

  it("declines carry the unsubscribe flag when ticked", () => {
    const r = composeOutcome("declinedNotInterested", {
      currentStage: "Made contact",
      unsubscribe: true,
    });
    expect(r.stageTo).toBe("Test Ride Declined");
    expect(r.noteText).toBe(
      `Call outcome: Test ride declined - no longer interested\n${UNSUBSCRIBE_FLAG}`,
    );
  });

  it("declines omit the flag when the person asks to stay on the list", () => {
    const r = composeOutcome("declinedBoughtElsewhere", {
      currentStage: "Made contact",
      unsubscribe: false,
    });
    expect(r.noteText).toBe(
      "Call outcome: Test ride declined - bought elsewhere",
    );
  });

  it("no answer interpolates attempts", () => {
    const r = composeOutcome("noAnswer", { currentStage: "Lead", attempts: 2 });
    expect(r.stageTo).toBe("Contact Failed");
    expect(r.noteText).toBe("Call outcome: No answer after 2 attempts");
  });

  it("forward-only: a backwards outcome keeps the note, drops the stage", () => {
    const r = composeOutcome("noAnswer", {
      currentStage: "Test Ride Completed",
      attempts: 1,
    });
    expect(r.stageTo).toBeUndefined();
    expect(r.stageSkipped).toBe(true);
    expect(r.noteText).toBe("Call outcome: No answer after 1 attempts");
  });

  it("same-stage outcome records the note without a redundant change", () => {
    const r = composeOutcome("emailNurture", { currentStage: "Made contact" });
    expect(r.stageTo).toBeUndefined();
    expect(r.stageSkipped).toBe(false);
  });
});
