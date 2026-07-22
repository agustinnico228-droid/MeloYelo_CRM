import type { Metadata } from "next";
import { requireUser, hasRole } from "@/lib/session";
import { getCoreData, getLookupData } from "@/lib/sheets";
import { isMalformedPostcode } from "@/lib/crm/postcode";

export const metadata: Metadata = { title: "System" };
export const dynamic = "force-dynamic";

function ageLabel(ageMs: number): string {
  const s = Math.round(ageMs / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  return `${m} min ago`;
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

export default async function SystemPage() {
  const user = await requireUser();

  if (!hasRole(user, "manager", "admin")) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-h3">System status</h1>
        <p className="mt-4 rounded-card border border-my-line bg-my-surface p-6 text-my-slate shadow-card">
          This page shows the health of the plumbing behind the hub and is
          for managers. If you think you need it, ask Greg or Andy.
        </p>
      </main>
    );
  }

  const [core, lookups] = await Promise.all([getCoreData(), getLookupData()]);

  const unassigned = core.leads.filter((l) => l.agentEmail === "").length;
  const malformed = core.leads.filter((l) =>
    isMalformedPostcode(l.postCode),
  ).length;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-h3">System status</h1>

      {core.source === "mock" ? (
        <p className="rounded-card border border-my-warn/40 bg-my-warn/10 p-4 text-sm text-my-ink">
          <strong>Mock data.</strong> The Sheets service account isn&apos;t
          configured in this environment — everything below is the built-in
          development fixture, not the CRM sheet.
        </p>
      ) : null}

      {core.stale ? (
        <p className="rounded-card border border-my-alert/40 bg-my-alert/5 p-4 text-sm text-my-alert">
          The Sheets API isn&apos;t responding — showing the last good data,
          fetched {ageLabel(core.ageMs)}.
        </p>
      ) : null}

      <section>
        <h2 className="text-h3">Data</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Leads" value={core.leads.length} />
          <StatCard label="Agents" value={lookups.agents.length} />
          <StatCard
            label="Unassigned leads"
            value={unassigned}
            tone={unassigned > 0 ? "alert" : "ok"}
          />
          <StatCard
            label="Malformed postcodes"
            value={malformed}
            tone={malformed > 0 ? "warn" : "ok"}
          />
        </div>
        <p className="mt-3 text-sm text-my-slate">
          Lead data refreshed {ageLabel(core.ageMs)} · lookup tabs{" "}
          {ageLabel(lookups.ageMs)} · source: {core.source}
        </p>
      </section>

      <section>
        <h2 className="text-h3">Skipped rows</h2>
        {core.invalidRows.length === 0 ? (
          <p className="mt-3 text-sm text-my-slate">
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
      </section>

      {lookups.unmappedAgentHeaders.length > 0 ? (
        <section>
          <h2 className="text-h3">Unrecognised Agents columns</h2>
          <p className="mt-3 text-sm text-my-slate">
            These headers on the Agents tab aren&apos;t mapped:{" "}
            {lookups.unmappedAgentHeaders.join(", ")}
          </p>
        </section>
      ) : null}

      <section>
        <h2 className="text-h3">Recent script log</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-my-line bg-my-surface shadow-card">
          <table className="w-full text-left text-sm">
            <tbody>
              {core.logs.slice(0, 10).map((log, i) => (
                <tr key={i} className="border-b border-my-line last:border-0">
                  {log.raw.slice(0, 3).map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-2 ${
                        cell === "ERROR" ? "font-bold text-my-alert" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
