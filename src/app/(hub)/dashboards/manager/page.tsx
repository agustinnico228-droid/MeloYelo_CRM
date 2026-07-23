import type { Metadata } from "next";
import Link from "next/link";
import {
  alertRate,
  currentStageRate,
  everReachedRate,
  leadsByAgent,
  speedToLeadByAgent,
  websiteFormLeads,
  type Scorecard,
} from "@/lib/crm/metrics";
import { formatMinutes, speedToLeadStats } from "@/lib/crm/speed-to-lead";
import { hasRole } from "@/lib/session";
import { getCoreData, getLookupData } from "@/lib/sheets";
import { requireEffectiveUser } from "@/lib/view-as";

export const metadata: Metadata = { title: "Managers Dashboard" };
export const dynamic = "force-dynamic";

/**
 * Native replacement for the Looker Managers Dashboard (Phase 17 B4),
 * built on the B1 formulas verified against the CRM export. Scope:
 * Source = Website Form, as stated on the original report.
 */

function parseDateParam(v: string | undefined, endOfDay = false): Date | null {
  if (!v) return null;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return endOfDay
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59)
    : new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function pctLabel(s: Scorecard): string {
  return s.percent === null ? "—" : `${s.percent.toFixed(2)}%`;
}

function ScoreTile({
  label,
  card,
  formula,
  highlight,
}: {
  label: string;
  card: Scorecard;
  formula: string;
  highlight?: boolean;
}) {
  return (
    <div
      title={formula}
      className={`rounded-card border p-4 shadow-card ${
        highlight ? "border-my-yellow bg-my-yellow/20" : "border-my-line bg-my-surface"
      }`}
    >
      <p className="text-sm text-my-slate">{label}</p>
      <p className="mt-1 text-h3 font-bold">{pctLabel(card)}</p>
      <p className="text-sm text-my-slate">
        {card.count} of {card.total}
      </p>
    </div>
  );
}

export default async function ManagerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; agent?: string }>;
}) {
  const params = await searchParams;
  const { effective: user } = await requireEffectiveUser();

  if (!hasRole(user, "manager", "admin")) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-h3">Managers Dashboard</h1>
        <p className="mt-4 rounded-card border border-my-line bg-my-surface p-6 text-my-slate shadow-card">
          This dashboard shows every agent&apos;s numbers and is for
          managers. Your own pipeline is on Today and Dashboards.
        </p>
      </main>
    );
  }

  const [core, lookups] = await Promise.all([getCoreData(), getLookupData()]);

  const from = parseDateParam(params.from);
  const to = parseDateParam(params.to, true);
  const leads = websiteFormLeads(core.leads, {
    from,
    to,
    agentEmail: params.agent,
  });

  const trbCurrently = currentStageRate(leads, "Test Ride Booked");
  const trbEver = everReachedRate(leads, core.stageHistory, "Test Ride Booked");
  const stl = speedToLeadStats(leads.map((l) => l.speedToLeadMinutes));
  const agentTable = leadsByAgent(leads);
  const leaderboard = speedToLeadByAgent(leads);

  const totalDenominator = `of ${leads.length} Website Form leads in the current filter`;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-h3">Managers Dashboard</h1>
        <Link
          href="/dashboards/manager/legacy"
          className="text-sm text-my-slate underline"
        >
          Old Looker version
        </Link>
      </div>
      <p className="text-sm text-my-slate">
        Website Form leads only, matching the original report&apos;s scope.
        Hover any tile for its exact formula.
      </p>

      <form
        method="get"
        className="grid grid-cols-2 gap-2 rounded-card border border-my-line bg-my-surface p-3 shadow-card sm:grid-cols-4"
      >
        <label className="block text-sm text-my-slate">
          From
          <input
            type="date"
            name="from"
            defaultValue={params.from ?? ""}
            className="mt-1 min-h-12 w-full rounded-control border border-my-line bg-my-surface px-3 text-my-ink"
          />
        </label>
        <label className="block text-sm text-my-slate">
          To
          <input
            type="date"
            name="to"
            defaultValue={params.to ?? ""}
            className="mt-1 min-h-12 w-full rounded-control border border-my-line bg-my-surface px-3 text-my-ink"
          />
        </label>
        <label className="block text-sm text-my-slate">
          Agent
          <select
            name="agent"
            defaultValue={params.agent ?? ""}
            className="mt-1 min-h-12 w-full rounded-control border border-my-line bg-my-surface px-2 text-my-ink"
          >
            <option value="">All agents</option>
            {lookups.agents.map((a) => (
              <option key={a.crmEmail} value={a.crmEmail}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="min-h-12 w-full rounded-control bg-my-ink px-4 font-medium text-white transition-opacity hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </form>

      <section>
        <h2 className="text-h3">Scorecards</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ScoreTile
            label="48 Hour Reminder"
            card={alertRate(leads, "alert48Sent")}
            formula={`Leads with the 48 hour alert sent flag, ${totalDenominator}`}
          />
          <ScoreTile
            label="5 Day Reminder"
            card={alertRate(leads, "alert5DaySent")}
            formula={`Leads with the 5 day alert sent flag, ${totalDenominator}`}
          />
          <ScoreTile
            label="Offer Accepted (currently)"
            card={currentStageRate(leads, "Offer Accepted")}
            formula={`Leads whose stage is Offer Accepted today, ${totalDenominator}`}
          />
          <ScoreTile
            label="Offer Accepted (ever)"
            card={everReachedRate(leads, core.stageHistory, "Offer Accepted")}
            formula={`Distinct leads that ever reached Offer Accepted (Stage history), ${totalDenominator}`}
          />
          <ScoreTile
            label="Test Ride Completed (currently)"
            card={currentStageRate(leads, "Test Ride Completed")}
            formula={`Leads whose stage is Test Ride Completed today, ${totalDenominator}`}
          />
          <ScoreTile
            label="Test Ride Completed (ever)"
            card={everReachedRate(leads, core.stageHistory, "Test Ride Completed")}
            formula={`Distinct leads that ever reached Test Ride Completed (Stage history), ${totalDenominator}`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-h3">Test ride bookings — two numbers, on purpose</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ScoreTile
            label="Test rides booked (ever) — the booking rate"
            card={trbEver}
            formula={`Distinct leads that ever reached Test Ride Booked, from the Stage history tab, ${totalDenominator}`}
            highlight
          />
          <ScoreTile
            label="Test rides booked (currently) — matches the old dashboard"
            card={trbCurrently}
            formula={`Leads whose stage is Test Ride Booked today, ${totalDenominator}`}
          />
        </div>
        <p className="mt-2 text-sm text-my-slate">
          The old dashboard counts only leads sitting at Test Ride Booked
          right now — the moment a ride completes, the lead leaves that
          figure, so it understates the real booking rate. The
          &quot;ever&quot; number counts booking events from Stage history
          and is the commercially meaningful one.
        </p>
      </section>

      <section>
        <h2 className="text-h3">Speed to lead</h2>
        <div className="mt-3 max-w-md rounded-card border border-my-warn/60 bg-my-surface p-4 shadow-card">
          <p className="flex flex-wrap items-center gap-2 text-sm text-my-slate">
            Median (stored column, outliers over 14 days excluded)
            <span className="rounded-full border border-my-warn/60 bg-my-warn/10 px-2.5 py-0.5 font-medium text-my-ink">
              Formula pending confirmation
            </span>
          </p>
          <p className="mt-1 text-h3 font-bold">
            {stl.medianMinutes === null ? "—" : formatMinutes(stl.medianMinutes)}
          </p>
          <p className="text-sm text-my-slate">
            median of {stl.sampleSize}
            {stl.excludedCount > 0 ? ` · ${stl.excludedCount} outliers excluded` : ""}
          </p>
          <p className="mt-2 text-sm text-my-slate">
            The old Looker tile shows a different figure and its formula
            couldn&apos;t be reproduced from the data — Greg has been asked
            for the exact definition. Until then, treat neither number as
            authoritative.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-h3">Leads per agent</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-my-line bg-my-surface shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-my-line bg-my-paper">
                <th className="px-4 py-2 font-bold">Agent</th>
                <th className="px-4 py-2 font-bold">Leads</th>
                <th className="px-4 py-2 font-bold" />
              </tr>
            </thead>
            <tbody>
              {agentTable.map((row) => (
                <tr key={row.agent} className="border-b border-my-line last:border-0">
                  <td className="px-4 py-2">{row.agent}</td>
                  <td className="px-4 py-2">{row.count}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={
                        row.agent === "Unassigned"
                          ? "/leads?unassigned=1&source=Website+Form"
                          : `/leads?agent=${encodeURIComponent(row.agentEmail)}&source=Website+Form`
                      }
                      className="underline"
                    >
                      View leads
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-h3">Speed-to-lead leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p className="mt-2 text-sm text-my-slate">
            No speed-to-lead values in the current filter.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-card border border-my-line bg-my-surface shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-my-line bg-my-paper">
                  <th className="px-4 py-2 font-bold">Agent</th>
                  <th className="px-4 py-2 font-bold">Median speed to lead</th>
                  <th className="px-4 py-2 font-bold">Sample</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.agent} className="border-b border-my-line last:border-0">
                    <td className="px-4 py-2">{row.agent}</td>
                    <td className="px-4 py-2 font-medium">
                      {row.medianMinutes === null
                        ? "—"
                        : formatMinutes(row.medianMinutes)}
                    </td>
                    <td className="px-4 py-2 text-my-slate">
                      {row.sampleSize}
                      {row.excludedCount > 0
                        ? ` (+${row.excludedCount} outliers excluded)`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-sm text-my-slate">
          Medians exclude values over 14 days as data artefacts — the old
          Looker leaderboard includes them, which is how it shows agents at
          125+ days.
        </p>
      </section>
    </main>
  );
}
