"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  addLead,
  previewPostcodeRouting,
  type RoutingPreview,
} from "@/lib/actions/add-lead";

/**
 * Replaces the Add Contact Google Form (§11 /leads/new). Live postcode
 * lookup shows which agent the lead will route to before submitting.
 * On success the truthful pending message — the 5-minute batch does the
 * ID and assignment work.
 */

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  postCode: "",
  city: "",
  notes: "",
};

export default function AddLeadForm() {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const [routing, setRouting] = useState<RoutingPreview | null>(null);
  const [routingState, setRoutingState] = useState<"idle" | "looking" | "done">(
    "idle",
  );
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, []);

  function onPostcode(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setValues((v) => ({ ...v, postCode: cleaned }));
    setRouting(null);
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    if (cleaned.length !== 4) {
      setRoutingState("idle");
      return;
    }
    setRoutingState("looking");
    lookupTimer.current = setTimeout(async () => {
      const result = await previewPostcodeRouting(cleaned);
      setRouting(result);
      setRoutingState("done");
    }, 400);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (values.firstName.trim() === "") {
      setError("First name is needed.");
      return;
    }
    if (values.email.trim() === "" && values.phone.trim() === "") {
      setError("Add a phone number or an email so the lead can be contacted.");
      return;
    }
    startTransition(async () => {
      const res = await addLead(values);
      if (res.ok) {
        setAdded(true);
      } else {
        setError(res.error ?? "The lead didn't save. Try again.");
      }
    });
  }

  if (added) {
    return (
      <div className="rounded-card border border-my-green/40 bg-my-green/10 p-6 text-center shadow-card">
        <h2 className="text-h3">Lead added</h2>
        <p className="mt-2 text-my-slate">
          It&apos;ll appear in your list within a few minutes,
          {routing
            ? ` routed to ${routing.agentName}.`
            : " routed by postcode."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setValues(EMPTY);
              setRouting(null);
              setRoutingState("idle");
              setAdded(false);
            }}
            className="btn-brand"
          >
            Add another lead
          </button>
          <Link href="/leads" className="btn-quiet">
            Back to leads
          </Link>
        </div>
      </div>
    );
  }

  const inputCls =
    "mt-1 min-h-12 w-full rounded-control border border-my-line bg-my-surface px-3 text-my-ink placeholder:text-my-slate";

  return (
    <form
      onSubmit={submit}
      className="rounded-card border border-my-line bg-my-surface p-5 shadow-card"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-my-slate">First name *</span>
          <input
            required
            value={values.firstName}
            onChange={(e) =>
              setValues((v) => ({ ...v, firstName: e.target.value }))
            }
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-sm text-my-slate">Last name</span>
          <input
            value={values.lastName}
            onChange={(e) =>
              setValues((v) => ({ ...v, lastName: e.target.value }))
            }
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-sm text-my-slate">Email</span>
          <input
            type="email"
            value={values.email}
            onChange={(e) =>
              setValues((v) => ({ ...v, email: e.target.value }))
            }
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-sm text-my-slate">Phone</span>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) =>
              setValues((v) => ({ ...v, phone: e.target.value }))
            }
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-sm text-my-slate">Postcode</span>
          <input
            inputMode="numeric"
            value={values.postCode}
            onChange={(e) => onPostcode(e.target.value)}
            placeholder="e.g. 0110"
            className={inputCls}
          />
          {routingState === "looking" ? (
            <span className="mt-1 block text-sm text-my-slate">
              Checking who covers this postcode...
            </span>
          ) : routingState === "done" && routing ? (
            <span className="mt-1 block text-sm font-medium text-stage-deep">
              Will route to {routing.agentName}
              {routing.region ? ` (${routing.region})` : ""}
            </span>
          ) : routingState === "done" && !routing ? (
            <span className="mt-1 block text-sm text-my-warn">
              No agent covers this postcode yet, so the lead will need manual
              assignment.
            </span>
          ) : null}
        </label>
        <label className="block">
          <span className="text-sm text-my-slate">City</span>
          <input
            value={values.city}
            onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))}
            className={inputCls}
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-sm text-my-slate">Notes</span>
        <textarea
          rows={3}
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
          placeholder="Anything useful for the first call"
          className="mt-1 w-full rounded-control border border-my-line bg-my-surface p-3 text-my-ink placeholder:text-my-slate"
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-control border border-my-alert/40 bg-my-alert/5 px-4 py-2 text-sm text-my-alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn-brand mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {pending ? "Adding lead..." : "Add lead"}
      </button>
    </form>
  );
}
