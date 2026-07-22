import Link from "next/link";
import StagePill from "@/components/StagePill";
import { leadDisplayName } from "@/components/LeadCard";
import { visibleLeads } from "@/lib/crm/access";
import { parseCrmDate, timeSince } from "@/lib/crm/dates";
import { needsActionNow, sortByWaiting } from "@/lib/crm/needs-action";
import { phoneHref } from "@/lib/crm/phone";
import { formatMinutes, speedToLeadStats } from "@/lib/crm/speed-to-lead";
import { STAGES } from "@/lib/crm/types";
import { canSeeAllLeads } from "@/lib/roles";
import { requireUser } from "@/lib/session";
import { getCoreData } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const user = await requireUser();

  if (user.role === null) {
    return (
      <main className="mx-auto max-w-2xl p-4 sm:p-6">
        <h1 className="text-h3">Welcome</h1>
        <p className="mt-4 rounded-card border border-my-warn/40 bg-my-warn/10 p-6 shadow-card">
          You&apos;re signed in, but your account doesn&apos;t have a CRM role
          yet. Ask Greg or Andy to add you to the Agents list.
        </p>
      </main>
    );
  }

  const core = await getCoreData();
  const mine = visibleLeads(user, core.leads);
  const seesAll = canSeeAllLeads(user.role);
  const now = new Date();

  const urgent = sortByWaiting(mine.filter((l) => needsActionNow(l, now)));
  const unassignedCount = seesAll
    ? core.leads.filter((l) => l.agentEmail === "").length
    : 0;

  const stageCounts = new Map<string, number>(STAGES.map((s) => [s, 0]));
  for (const l of mine) {
    if (stageCounts.has(l.stage)) {
      stageCounts.set(l.stage, (stageCounts.get(l.stage) ?? 0) + 1);
    }
  }

  // This month (§11.4)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = mine.filter((l) => {
    const d = parseCrmDate(l.dateAdded);
    return d !== null && d >= monthStart;
  });
  const ridesBooked = core.stageHistory.filter((h) => {
    if (h.to !== "Test Ride Booked") return false;
    if (!seesAll && !mine.some((l) => l.uniqueId === h.uniqueId)) return false;
    const d = parseCrmDate(h.changedAt);
    return d !== null && d >= monthStart;
  }).length;
  const stl = speedToLeadStats(thisMonth.map((l) => l.speedToLeadMinutes));

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-h3">Today</h1>
        <p className="text-sm text-my-slate">
          {now.toLocaleDateString("en-NZ", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {core.stale ? (
        <p className="rounded-control border border-my-warn/40 bg-my-warn/10 px-4 py-2 text-sm">
          Data last updated {Math.round(core.ageMs / 60000)} min ago — the
          sheet isn&apos;t responding right now.
        </p>
      ) : null}

      {unassignedCount > 0 ? (
        <Link
          href="/leads?unassigned=1"
          className="block rounded-card border border-my-alert/40 bg-my-alert/5 p-4 shadow-card transition-colors hover:bg-my-alert/10"
        >
          <span className="font-bold text-my-alert">
            {unassignedCount} unassigned{" "}
            {unassignedCount === 1 ? "lead" : "leads"}
          </span>{" "}
          <span className="text-sm text-my-slate">
            — falling through the cracks. Tap to review and route them.
          </span>
        </Link>
      ) : null}

      <section>
        <h2 className="text-h3">Needs action now</h2>
        {urgent.length === 0 ? (
          <div className="mt-3 rounded-card border border-my-line bg-my-surface p-6 text-center shadow-card">
            <p className="font-medium">All caught up.</p>
            <p className="mt-1 text-sm text-my-slate">
              No leads are waiting on you right now.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {urgent.slice(0, 8).map((lead) => {
              const tel = phoneHref(lead.phone);
              const waiting = timeSince(lead.dateAdded);
              return (
                <li
                  key={lead.uniqueId}
                  className="flex flex-wrap items-center gap-3 rounded-card border border-my-line bg-my-surface p-3 shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {leadDisplayName(lead)}
                    </p>
                    <p className="text-sm text-my-slate">
                      {[lead.city, waiting ? `waiting ${waiting}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <StagePill stage={lead.stage} />
                  <div className="flex gap-2">
                    {tel ? (
                      <a
                        href={tel}
                        className="flex min-h-12 items-center rounded-control bg-my-yellow px-4 font-bold text-my-ink transition-opacity hover:opacity-90"
                      >
                        Call
                      </a>
                    ) : null}
                    <Link
                      href={`/leads/${lead.uniqueId}`}
                      className="flex min-h-12 items-center rounded-control border border-my-line bg-my-surface px-4 font-medium transition-colors hover:bg-my-paper"
                    >
                      Update
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {urgent.length > 8 ? (
          <p className="mt-2 text-sm text-my-slate">
            Showing the 8 longest-waiting of {urgent.length}.{" "}
            <Link href="/leads?sort=untouched" className="underline">
              See all
            </Link>
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-h3">My pipeline</h2>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-9">
          {STAGES.map((s) => (
            <Link
              key={s}
              href={`/leads?stage=${encodeURIComponent(s)}`}
              className="rounded-card border border-my-line bg-my-surface p-3 text-center shadow-card transition-colors hover:bg-my-paper"
            >
              <span className="block text-h3 font-bold">
                {stageCounts.get(s)}
              </span>
              <span className="mt-1 block text-sm leading-tight text-my-slate">
                {s}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-2 text-sm text-my-slate">
          <Link href="/pipeline" className="underline">
            Open the pipeline board
          </Link>
        </p>
      </section>

      <section>
        <h2 className="text-h3">This month</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-card border border-my-line bg-my-surface p-4 shadow-card">
            <p className="text-sm text-my-slate">Leads received</p>
            <p className="mt-1 text-h2 font-bold">{thisMonth.length}</p>
          </div>
          <div className="rounded-card border border-my-line bg-my-surface p-4 shadow-card">
            <p className="text-sm text-my-slate">Test rides booked</p>
            <p className="mt-1 text-h2 font-bold">{ridesBooked}</p>
          </div>
          <div className="rounded-card border border-my-line bg-my-surface p-4 shadow-card">
            <p className="text-sm text-my-slate">Median speed to lead</p>
            <p className="mt-1 text-h2 font-bold">
              {stl.medianMinutes === null
                ? "—"
                : formatMinutes(stl.medianMinutes)}
            </p>
            {stl.excludedCount > 0 ? (
              <p className="text-sm text-my-slate">
                {stl.excludedCount} outlier
                {stl.excludedCount === 1 ? "" : "s"} excluded
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
