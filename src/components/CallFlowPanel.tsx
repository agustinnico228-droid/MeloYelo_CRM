"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveLeadChanges } from "@/lib/actions/leads";
import {
  composeOutcome,
  OUTCOMES,
  type OutcomeKey,
} from "@/lib/crm/call-outcomes";

/**
 * The guided Ride Guide call (§14.2): the five documented steps, then
 * one outcome that records the stage change AND the note in a single
 * audited updateLead action. Declines carry the unsubscribe checkbox
 * (§14.3) — flag only, nothing is sent to Campaign Monitor.
 */

const STEPS = [
  "Still interested in an e-bike?",
  "Already bought one?",
  "If still interested — aim to book a test ride",
  "If not ready — agree a follow-up, or offer email updates",
  "Always end with a clear outcome",
];

export default function CallFlowPanel({
  uniqueId,
  currentStage,
}: {
  uniqueId: string;
  currentStage: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<OutcomeKey | null>(null);
  const [n, setN] = useState(2);
  const [unit, setUnit] = useState("weeks");
  const [attempts, setAttempts] = useState(1);
  const [unsubscribe, setUnsubscribe] = useState(true);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saved"; text: string }
    | { kind: "error"; text: string }
  >({ kind: "idle" });

  const def = OUTCOMES.find((o) => o.key === selected) ?? null;

  function record() {
    if (!selected) return;
    const composed = composeOutcome(selected, {
      currentStage,
      n,
      unit,
      attempts,
      unsubscribe,
    });
    startTransition(async () => {
      const res = await saveLeadChanges({
        uniqueId,
        stageTo: composed.stageTo,
        noteText: composed.noteText,
      });
      if (res.ok) {
        setStatus({
          kind: "saved",
          text: composed.stageSkipped
            ? "Outcome noted. The stage was further along, so it wasn't moved back."
            : "Outcome recorded.",
        });
        setSelected(null);
        router.refresh();
      } else {
        setStatus({
          kind: "error",
          text: res.error ?? "The outcome didn't save.",
        });
      }
    });
  }

  const inputCls =
    "min-h-12 rounded-control border border-my-line bg-my-surface px-3 text-my-ink";

  return (
    <section className="rounded-card border-2 border-my-yellow bg-my-surface p-5 shadow-card">
      <h2 className="text-h3">Call flow</h2>
      <ol className="mt-3 list-inside list-decimal space-y-1 text-sm">
        {STEPS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <h3 className="mt-5 text-base font-bold">Outcome</h3>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OUTCOMES.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => {
              setSelected(o.key);
              setStatus({ kind: "idle" });
            }}
            aria-pressed={selected === o.key}
            className={`min-h-12 rounded-control border px-4 text-left font-medium transition-colors ${
              selected === o.key
                ? "border-my-ink bg-my-ink text-white"
                : "border-my-line bg-my-surface text-my-ink hover:bg-my-paper"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {def?.needsInterval ? (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span>Contact again in</span>
          <input
            type="number"
            min={1}
            value={n}
            onChange={(e) => setN(Math.max(1, Number(e.target.value) || 1))}
            aria-label="Follow-up amount"
            className={`${inputCls} w-20`}
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            aria-label="Follow-up unit"
            className={inputCls}
          >
            <option value="days">days</option>
            <option value="weeks">weeks</option>
            <option value="months">months</option>
          </select>
        </div>
      ) : null}

      {def?.needsAttempts ? (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span>No answer after</span>
          <input
            type="number"
            min={1}
            value={attempts}
            onChange={(e) =>
              setAttempts(Math.max(1, Number(e.target.value) || 1))
            }
            aria-label="Attempts"
            className={`${inputCls} w-20`}
          />
          <span>attempts</span>
        </div>
      ) : null}

      {def?.offersUnsubscribe ? (
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={unsubscribe}
            onChange={(e) => setUnsubscribe(e.target.checked)}
            className="h-5 w-5 accent-my-ink"
          />
          Also unsubscribe from marketing emails
        </label>
      ) : null}

      <button
        type="button"
        onClick={record}
        disabled={!selected || pending}
        className="mt-4 min-h-12 w-full rounded-control bg-my-yellow px-6 font-bold text-my-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {pending ? "Recording…" : "Record outcome"}
      </button>

      {status.kind !== "idle" ? (
        <p
          role="status"
          className={`mt-2 text-sm font-medium ${
            status.kind === "error" ? "text-my-alert" : "text-stage-deep"
          }`}
        >
          {status.text}
        </p>
      ) : null}
    </section>
  );
}
