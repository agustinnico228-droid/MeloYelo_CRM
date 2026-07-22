"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveLeadChanges, reassignLead } from "@/lib/actions/leads";

/**
 * The interactive half of the record page (§11): stage changer offering
 * only current-or-later stages, always-visible add-note, and inline
 * field editing with an ~800ms debounce. Optimistic with rollback — a
 * failed save reverts the fields and says what happened.
 */

export interface EditableFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postCode: string;
  city: string;
  model: string;
  serial: string;
}

type Status =
  | { kind: "idle" }
  | { kind: "saving"; text: string }
  | { kind: "saved"; text: string }
  | { kind: "error"; text: string };

function StatusLine({ status }: { status: Status }) {
  if (status.kind === "idle") return null;
  const cls =
    status.kind === "error"
      ? "text-my-alert"
      : status.kind === "saved"
        ? "text-stage-deep"
        : "text-my-slate";
  return (
    <p role="status" className={`mt-2 text-sm font-medium ${cls}`}>
      {status.text}
    </p>
  );
}

const FIELD_LABELS: { key: keyof EditableFields; label: string; type?: string }[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "postCode", label: "Postcode" },
  { key: "city", label: "City" },
  { key: "model", label: "Model" },
  { key: "serial", label: "Serial" },
];

export default function LeadEditor({
  uniqueId,
  stage,
  allowedStages,
  fields,
  agents,
  currentAgentEmail,
  canReassignLead,
}: {
  uniqueId: string;
  stage: string;
  allowedStages: string[];
  fields: EditableFields;
  agents: { name: string; email: string }[];
  currentAgentEmail: string;
  canReassignLead: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // ── Stage ────────────────────────────────────────────────────────────
  const [stageValue, setStageValue] = useState(stage);
  const [stageStatus, setStageStatus] = useState<Status>({ kind: "idle" });

  function saveStage() {
    if (stageValue === stage) return;
    setStageStatus({ kind: "saving", text: "Saving stage…" });
    startTransition(async () => {
      const res = await saveLeadChanges({ uniqueId, stageTo: stageValue });
      if (res.ok) {
        setStageStatus({ kind: "saved", text: "Stage updated." });
        router.refresh();
      } else {
        setStageValue(stage); // rollback
        setStageStatus({ kind: "error", text: res.error ?? "The stage didn't save." });
      }
    });
  }

  // ── Note ─────────────────────────────────────────────────────────────
  const [note, setNote] = useState("");
  const [noteStatus, setNoteStatus] = useState<Status>({ kind: "idle" });

  function saveNote() {
    const text = note.trim();
    if (text === "") return;
    setNoteStatus({ kind: "saving", text: "Saving note…" });
    startTransition(async () => {
      const res = await saveLeadChanges({ uniqueId, noteText: text });
      if (res.ok) {
        setNote("");
        setNoteStatus({ kind: "saved", text: "Note saved." });
        router.refresh();
      } else {
        setNoteStatus({ kind: "error", text: res.error ?? "The note didn't save." });
      }
    });
  }

  // ── Fields, debounced ~800ms with rollback ───────────────────────────
  const [values, setValues] = useState<EditableFields>(fields);
  const lastSaved = useRef<EditableFields>(fields);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fieldStatus, setFieldStatus] = useState<Status>({ kind: "idle" });

  function queueSave(next: EditableFields) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const changes: Partial<EditableFields> = {};
      for (const { key } of FIELD_LABELS) {
        if (next[key] !== lastSaved.current[key]) changes[key] = next[key];
      }
      if (Object.keys(changes).length === 0) return;
      setFieldStatus({ kind: "saving", text: "Saving…" });
      startTransition(async () => {
        const res = await saveLeadChanges({ uniqueId, changes });
        if (res.ok) {
          lastSaved.current = { ...lastSaved.current, ...changes };
          setFieldStatus({ kind: "saved", text: "Changes saved." });
          router.refresh();
        } else {
          setValues(lastSaved.current); // rollback
          setFieldStatus({ kind: "error", text: res.error ?? "The change didn't save." });
        }
      });
    }, 800);
  }

  function onField(key: keyof EditableFields, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    queueSave(next);
  }

  // ── Reassign (managers) ──────────────────────────────────────────────
  const [agentValue, setAgentValue] = useState(currentAgentEmail);
  const [reason, setReason] = useState("");
  const [reassignStatus, setReassignStatus] = useState<Status>({ kind: "idle" });

  function doReassign() {
    if (!agentValue || agentValue === currentAgentEmail) return;
    setReassignStatus({ kind: "saving", text: "Reassigning…" });
    startTransition(async () => {
      const res = await reassignLead({
        uniqueId,
        agentEmail: agentValue,
        reason: reason.trim() || undefined,
      });
      if (res.ok) {
        setReassignStatus({ kind: "saved", text: "Lead reassigned." });
        setReason("");
        router.refresh();
      } else {
        setAgentValue(currentAgentEmail); // rollback
        setReassignStatus({ kind: "error", text: res.error ?? "The reassignment didn't save." });
      }
    });
  }

  const inputCls =
    "min-h-12 w-full rounded-control border border-my-line bg-my-surface px-3 text-my-ink";

  return (
    <>
      <section className="rounded-card border border-my-line bg-my-surface p-5 shadow-card">
        <h2 className="text-h3">Stage</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select
            value={stageValue}
            onChange={(e) => setStageValue(e.target.value)}
            aria-label="Change stage"
            className={`${inputCls} sm:flex-1`}
          >
            {allowedStages.map((s) => (
              <option key={s} value={s}>
                {s === stage ? `${s} (current)` : s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={saveStage}
            disabled={stageValue === stage || stageStatus.kind === "saving"}
            className="min-h-12 rounded-control bg-my-yellow px-6 font-bold text-my-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save stage
          </button>
        </div>
        <p className="mt-2 text-sm text-my-slate">
          Stages only move forward — earlier stages aren&apos;t offered.
        </p>
        <StatusLine status={stageStatus} />
      </section>

      <section className="rounded-card border border-my-line bg-my-surface p-5 shadow-card">
        <h2 className="text-h3">Add note</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="What happened on the call?"
          aria-label="Add note"
          className="mt-3 w-full rounded-control border border-my-line bg-my-surface p-3 text-my-ink placeholder:text-my-slate"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={saveNote}
            disabled={note.trim() === "" || noteStatus.kind === "saving"}
            className="min-h-12 rounded-control bg-my-ink px-6 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save note
          </button>
        </div>
        <StatusLine status={noteStatus} />
      </section>

      <section className="rounded-card border border-my-line bg-my-surface p-5 shadow-card">
        <h2 className="text-h3">Details</h2>
        <p className="mt-1 text-sm text-my-slate">
          Edits save automatically as you type.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELD_LABELS.map(({ key, label, type }) => (
            <label key={key} className="block">
              <span className="text-sm text-my-slate">{label}</span>
              <input
                type={type ?? "text"}
                value={values[key]}
                onChange={(e) => onField(key, e.target.value)}
                className={`mt-1 ${inputCls}`}
              />
            </label>
          ))}
        </div>
        <StatusLine status={fieldStatus} />
      </section>

      {canReassignLead ? (
        <section className="rounded-card border border-my-line bg-my-surface p-5 shadow-card">
          <h2 className="text-h3">Reassign</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              value={agentValue}
              onChange={(e) => setAgentValue(e.target.value)}
              aria-label="Reassign to agent"
              className={inputCls}
            >
              <option value="">Choose an agent…</option>
              {agents.map((a) => (
                <option key={a.email} value={a.email}>
                  {a.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why? (recorded in notes)"
              aria-label="Reason for reassignment"
              className={inputCls}
            />
            <button
              type="button"
              onClick={doReassign}
              disabled={
                !agentValue ||
                agentValue === currentAgentEmail ||
                reassignStatus.kind === "saving"
              }
              className="min-h-12 rounded-control border border-my-line bg-my-surface px-6 font-medium text-my-ink transition-colors hover:bg-my-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reassign lead
            </button>
          </div>
          <StatusLine status={reassignStatus} />
        </section>
      ) : null}
    </>
  );
}
