import { STAGES, type Stage } from "./types";

/**
 * The nine stages in canonical order (§8). Stage changes are forward-only
 * (hard rule 3): never offer or accept a stage earlier than the current one.
 */

export function isKnownStage(value: string): value is Stage {
  return (STAGES as readonly string[]).includes(value);
}

/** -1 for unknown values — live data may contain surprises. */
export function stageIndex(value: string): number {
  return (STAGES as readonly string[]).indexOf(value);
}

/**
 * Valid targets from the current stage: the current stage or anything
 * later. An unknown current stage can't be ordered, so all nine are
 * offered — moving dirty data forward must stay possible.
 */
export function allowedNextStages(current: string): Stage[] {
  const idx = stageIndex(current);
  if (idx === -1) return [...STAGES];
  return STAGES.slice(idx) as Stage[];
}

/** True when `to` is at or after `from`. Unvalidatable input → false. */
export function isForwardMove(from: string, to: string): boolean {
  const toIdx = stageIndex(to);
  if (toIdx === -1) return false;
  const fromIdx = stageIndex(from);
  if (fromIdx === -1) return true; // unknown origin: any known stage is allowed
  return toIdx >= fromIdx;
}

/** §5 stage colour progression, expressed as design tones. */
export type StageTone =
  "slate" | "blue" | "alert" | "yellow" | "green" | "deep";

const STAGE_TONES: Record<Stage, StageTone> = {
  Lead: "slate",
  "Made contact": "blue",
  "Contact Failed": "alert",
  "Test Ride Booked": "yellow",
  "Test Ride Completed": "green",
  "Test Ride Declined": "slate",
  "Offer Accepted": "green",
  "Offer Declined": "slate",
  "MY Customer": "deep",
};

export function stageTone(stage: string): StageTone {
  return isKnownStage(stage) ? STAGE_TONES[stage] : "slate";
}
