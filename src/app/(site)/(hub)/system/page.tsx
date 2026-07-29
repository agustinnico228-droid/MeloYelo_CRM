import type { Metadata } from "next";
import Link from "next/link";
import { getQuickLinks } from "@/lib/cms";
import { UNSUBSCRIBE_FLAG } from "@/lib/crm/call-outcomes";
import { describeCrmDate, parseCrmDate } from "@/lib/crm/dates";
import { findLikelyDuplicates } from "@/lib/crm/duplicates";
import { isMalformedPostcode } from "@/lib/crm/postcode";
import type { Lead } from "@/lib/crm/types";
import { hasRole, requireUser } from "@/lib/session";
import { getCoreData, getLookupData } from "@/lib/sheets";

export const metadata: Metadata = { title: "System" };
export const dynamic = "force-dynamic";

function ageLabel(ageMs: number): string {
  const s = Math.round(ageMs / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  return `${m} min ago`;
}

function latestBy(leads: Lead[], pick: (l: Lead) => boolean): Lead | null {
  let best: Lead | null = null;
  let bestTime = -1;
  for (const l of leads) {
    if (!pick(l)) continue;
    const t = parseCrmDate(l.dateAdded)?.getTime() ?? -1;
    if (t > bestTime) {
      best = l;
      bestTime = t;
    }
  }
  return best;
}

function StatCard({
  label,
  value,
  tone = "ok",
}: {
  label: string;
  value: string | number;
  tone?: "ok" | "warn" | "alert";
}) {
  const toneClass =
    tone === "alert"
      ? "text-my-alert"
      : tone === "warn"
        ? "text-my-warn"
        : "text-my-ink";
  return (
    <div className="rounded-card border border-my-line bg-my-surface p-4 shadow-card">
      <div className="text-sm text-my-slate">{label}</div>
      <div className={`mt-1 text-h3 font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

const SOURCES = [
  "Website Form",
  "AgentForm",
  "Warranty Registration",
  "Call Centre",
];

/** The rare "must go to the underlying tool" links (§11). */
const TOOL_LINKS = [
  {
    label: "CRM sheet (working copy)",
    url: "https://docs.google.com/spreadsheets/d/17xpNY8t5GVAikMQRMc-MpnxJAqk6-JU4G2zAkacFG6I",
  },
  { label: "Zapier dashboard", url: "https://zapier.com/app/zaps" },
  { label: "Apps Script project", url: "https://script.google.com/home" },
  { label: "Looker Studio", url: "https://lookerstudio.google.com" },
];

export default async function SystemPage() {
  const user = await requireUser();

  if (!hasRole(user, "manager", "admin")) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-h3">System status</h1>
        <p className="mt-4 rounded-card border border-my-line bg-my-surface p-6 text-my-slate shadow-card">
          This page shows the health of the plumbing behind the hub and is for
          managers. If you think you need it, ask Greg or Andy.
        </p>
      </main>
    );
  }

  const [core, lookups, quickLinks] = await Promise.all([
    getCoreData(),
    getLookupData(),
    getQuickLinks(user.role),
  ]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const unassigned = core.leads.filter((l) => l.agentEmail === "");
  const malformed = core.leads.filter((l) => isMalformedPostcode(l.postCode));
  const duplicates = findLikelyDuplicates(core.leads);
  const lastLead = latestBy(core.leads, () => true);
  const todayBySource = SOURCES.map((s) => ({
    source: s,
    count: core.leads.filter((l) => {
      if (l.source !== s) return false;
      const d = parseCrmDate(l.dateAdded);
      return d !== null && d >= todayStart;
    }).length,
    last: latestBy(core.leads, (l) => l.source === s),
  }));

  const pendingUnsubscribes = core.leads.filter((l) =>
    l.notes.includes(UNSUBSCRIBE_FLAG),
  );
  const errorLogs = core.logs.filter((l) => l.raw[1] === "ERROR").slice(0, 5);
  const lastBatch = core.logs.find((l) =>
    (l.raw[2] ?? "").includes("processNewContactSubmissionsBatch"),
  );

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6">
      <h1 className="text-h3">System status</h1>

      {core.source === "mock" ? (
        <p className="rounded-card border border-my-warn/40 bg-my-warn/10 p-4 text-sm text-my-ink">
          <strong>Mock data.</strong> The Sheets service account isn&apos;t
          configured in this environment. Everything below is the built-in
          development fixture, not the CRM sheet.
        </p>
      ) : null}

      {core.stale ? (
        <p className="rounded-card border border-my-alert/40 bg-my-alert/5 p-4 text-sm text-my-alert">
          The Sheets API isn&apos;t responding. Showing the last good data,
          fetched {ageLabel(core.ageMs)}.
        </p>
      ) : null}

      <section>
        <h2 className="text-h3">Lead intake</h2>
        <p className="mt-2 text-sm text-my-slate">
          Last lead arrived:{" "}
          {lastLead ? (
            <>
              <Link
                href={`/leads/${lastLead.uniqueId}`}
                className="font-medium text-my-ink underline"
              >
                {describeCrmDate(lastLead.dateAdded)}
              </Link>{" "}
              via {lastLead.source || "unknown source"}
            </>
          ) : (
            "no leads yet"
          )}
        </p>
        <div className="mt-3 overflow-x-auto rounded-card border border-my-line bg-my-surface shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-my-line bg-my-paper">
                <th className="px-4 py-2 font-bold">Source</th>
                <th className="px-4 py-2 font-bold">Today</th>
                <th className="px-4 py-2 font-bold">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {todayBySource.map((row) => (
                <tr
                  key={row.source}
                  className="border-b border-my-line last:border-0"
                >
                  <td className="px-4 py-2">{row.source}</td>
                  <td className="px-4 py-2">{row.count}</td>
                  <td className="px-4 py-2 text-my-slate">
                    {row.last ? describeCrmDate(row.last.dateAdded) : "never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-my-slate">
          Website and Campaign Monitor leads arrive via Zapier; a quiet source
          above is the first sign a Zap needs attention.{" "}
          <a
            href="https://zapier.com/app/zaps"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Manage Zaps
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-h3">Apps Script</h2>
        <p className="mt-2 text-sm text-my-slate">
          Last batch run:{" "}
          {lastBatch
            ? `${lastBatch.raw[0]} - ${lastBatch.raw[2]}`
            : "not seen in the recent log"}
        </p>
        {errorLogs.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {errorLogs.map((log, i) => (
              <li
                key={i}
                className="rounded-control border border-my-alert/40 bg-my-alert/5 px-4 py-2 text-sm"
              >
                <span className="font-bold text-my-alert">{log.raw[0]}</span>{" "}
                {log.raw[2]}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-my-slate">
            No recent errors in the script log.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-h3">Data health</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Leads" value={core.leads.length} />
          <StatCard
            label="Unassigned"
            value={unassigned.length}
            tone={unassigned.length > 0 ? "alert" : "ok"}
          />
          <StatCard
            label="Malformed postcodes"
            value={malformed.length}
            tone={malformed.length > 0 ? "warn" : "ok"}
          />
          <StatCard
            label="Likely duplicates"
            value={duplicates.length}
            tone={duplicates.length > 0 ? "warn" : "ok"}
          />
        </div>
        <p className="mt-3 text-sm text-my-slate">
          Lead data refreshed {ageLabel(core.ageMs)} - lookup tabs{" "}
          {ageLabel(lookups.ageMs)} - {lookups.agents.length} agents - source:{" "}
          {core.source}
        </p>
        {unassigned.length > 0 ? (
          <p className="mt-2 text-sm">
            <Link href="/leads?unassigned=1" className="underline">
              Review unassigned leads
            </Link>
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-h3">Pending unsubscribes</h2>
        <p className="mt-2 text-sm text-my-slate">
          Declined test rides flagged for removal from marketing emails. Action
          these in Campaign Monitor. Nothing is unsubscribed automatically (spec
          14.3), so an accidental bulk unsubscribe can&apos;t happen.
        </p>
        {pendingUnsubscribes.length === 0 ? (
          <p className="mt-3 text-sm text-my-slate">Nothing pending.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pendingUnsubscribes.map((l) => (
              <li
                key={l.uniqueId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-my-warn/40 bg-my-warn/10 px-4 py-2 text-sm"
              >
                <span>
                  <Link
                    href={`/leads/${l.uniqueId}`}
                    className="font-medium underline"
                  >
                    {l.firstName} {l.lastName}
                  </Link>{" "}
                  - {l.email || "no email"}
                </span>
                <span className="text-my-slate">#{l.uniqueId}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {duplicates.length > 0 ? (
        <section>
          <h2 className="text-h3">Likely duplicates</h2>
          <p className="mt-2 text-sm text-my-slate">
            Candidates for a human to review. Nothing is merged automatically.
          </p>
          <ul className="mt-3 space-y-2">
            {duplicates.slice(0, 10).map((g) => (
              <li
                key={`${g.kind}:${g.key}`}
                className="rounded-control border border-my-line bg-my-surface px-4 py-2 text-sm shadow-card"
              >
                <span className="font-medium capitalize">{g.kind}</span> match
                on <span className="font-medium">{g.key}</span>:{" "}
                {g.leads.map((l, i) => (
                  <span key={l.uniqueId}>
                    {i > 0 ? ", " : ""}
                    <Link href={`/leads/${l.uniqueId}`} className="underline">
                      {l.firstName} {l.lastName} (#{l.uniqueId})
                    </Link>
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="text-h3">Skipped rows</h2>
        {core.invalidRows.length === 0 ? (
          <p className="mt-2 text-sm text-my-slate">
            Every row in <em>All data</em> parsed cleanly.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {core.invalidRows.map((r) => (
              <li
                key={r.rowNumber}
                className="rounded-control border border-my-warn/40 bg-my-warn/10 px-4 py-2 text-sm"
              >
                Sheet row {r.rowNumber}: {r.reason}
              </li>
            ))}
          </ul>
        )}
        {lookups.unmappedAgentHeaders.length > 0 ? (
          <p className="mt-3 rounded-control border border-my-warn/40 bg-my-warn/10 px-4 py-2 text-sm">
            Unrecognised Agents-tab columns:{" "}
            {lookups.unmappedAgentHeaders.join(", ")}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-h3">The underlying tools</h2>
        <p className="mt-2 text-sm text-my-slate">
          For the rare case someone must go there.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ...quickLinks.map((q) => ({ label: q.label, url: q.url })),
            ...TOOL_LINKS,
          ].map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-quiet"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
