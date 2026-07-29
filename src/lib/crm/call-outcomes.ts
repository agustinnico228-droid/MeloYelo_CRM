import { isForwardMove } from "./stages";

/**
 * Ride Guide call outcomes (§14.2) — the documented wording, verbatim.
 * One outcome = one stage change + one note, through the normal
 * updateLead path. If the stage would move backwards (forward-only,
 * hard rule 3), the note is still recorded and the stage is left alone.
 */

export type OutcomeKey =
  | "booked"
  | "followUp"
  | "emailNurture"
  | "declinedNotInterested"
  | "declinedBoughtElsewhere"
  | "noAnswer";

export interface OutcomeDef {
  key: OutcomeKey;
  label: string;
  stageTo: string;
  /** follow-up interval inputs ({n} {unit}) */
  needsInterval?: boolean;
  /** attempts count input ({n} attempts) */
  needsAttempts?: boolean;
  /** offers the Campaign Monitor unsubscribe checkbox (§14.3) */
  offersUnsubscribe?: boolean;
}

export const OUTCOMES: OutcomeDef[] = [
  { key: "booked", label: "Test ride booked", stageTo: "Test Ride Booked" },
  {
    key: "followUp",
    label: "Follow up later",
    stageTo: "Made contact",
    needsInterval: true,
  },
  {
    key: "emailNurture",
    label: "Email nurture only",
    stageTo: "Made contact",
  },
  {
    key: "declinedNotInterested",
    label: "Declined - not interested",
    stageTo: "Test Ride Declined",
    offersUnsubscribe: true,
  },
  {
    key: "declinedBoughtElsewhere",
    label: "Declined - bought elsewhere",
    stageTo: "Test Ride Declined",
    offersUnsubscribe: true,
  },
  {
    key: "noAnswer",
    label: "No answer",
    stageTo: "Contact Failed",
    needsAttempts: true,
  },
];

export const UNSUBSCRIBE_FLAG = "Marketing: unsubscribe requested";

export interface OutcomeParams {
  currentStage: string;
  n?: number;
  unit?: string;
  attempts?: number;
  unsubscribe?: boolean;
}

export interface ComposedOutcome {
  stageTo?: string;
  noteText: string;
  /** true when forward-only blocked the stage change */
  stageSkipped: boolean;
}

function noteFor(key: OutcomeKey, p: OutcomeParams): string {
  switch (key) {
    case "booked":
      return "Call outcome: Test ride booked";
    case "followUp":
      return `Call outcome: Follow up later - requested contact again in ${p.n ?? 1} ${p.unit ?? "weeks"}`;
    case "emailNurture":
      return "Call outcome: Email nurture only - not ready for a test ride";
    case "declinedNotInterested":
      return "Call outcome: Test ride declined - no longer interested";
    case "declinedBoughtElsewhere":
      return "Call outcome: Test ride declined - bought elsewhere";
    case "noAnswer":
      return `Call outcome: No answer after ${p.attempts ?? 1} attempts`;
  }
}

export function composeOutcome(
  key: OutcomeKey,
  params: OutcomeParams,
): ComposedOutcome {
  const def = OUTCOMES.find((o) => o.key === key);
  if (!def) throw new Error(`Unknown outcome: ${key}`);

  let noteText = noteFor(key, params);
  if (def.offersUnsubscribe && params.unsubscribe) {
    noteText += `\n${UNSUBSCRIBE_FLAG}`;
  }

  const forward = isForwardMove(params.currentStage, def.stageTo);
  return {
    stageTo:
      forward && def.stageTo !== params.currentStage ? def.stageTo : undefined,
    noteText,
    stageSkipped: !forward,
  };
}
