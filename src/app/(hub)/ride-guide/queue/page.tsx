import type { Metadata } from "next";
import Link from "next/link";
import StagePill from "@/components/StagePill";
import { leadDisplayName } from "@/components/LeadCard";
import { timeSince } from "@/lib/crm/dates";
import {
  agentHasMadeContact,
  isRideGuideLead,
  queueOrder,
} from "@/lib/crm/ride-guide";
import { hasRole } from "@/lib/session";
import { getCoreData } from "@/lib/sheets";
import { requireEffectiveUser } from "@/lib/view-as";

export const metadata: Metadata = { title: "Ride Guide queue" };
export const dynamic = "force-dynamic";

export default async function RideGuideQueuePage() {
  const { effective: user } = await requireEffectiveUser();

  if (!hasRole(user, "ride_guide", "manager", "admin")) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-h3">Ride Guide queue</h1>
        <p className="mt-4 rounded-card border border-my-line bg-my-surface p-6 text-my-slate shadow-card">
          This queue is the Ride Guide&apos;s calling list. Your own leads
          are on Today and Leads.
        </p>
      </main>
    );
  }

  const core = await getCoreData();
  // Hard rule (§14.1): ONLY Website Form leads — agent-entered leads
  // never enter this queue.
  const queue = queueOrder(core.leads.filter(isRideGuideLead));

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="text-h3">Ride Guide queue</h1>
      <p className="mt-1 text-sm text-my-slate">
        Website leads only, most urgent first — never-contacted at the top,
        then longest since the last stage change. Leads the agent already
        contacted are marked so you can skip them.{" "}
        <Link href="/ride-guide/dormant" className="underline">
          Dormant leads
        </Link>{" "}
        ·{" "}
        <Link href="/ride-guide/call-flow" className="underline">
          Call flow
        </Link>
      </p>

      {queue.length === 0 ? (
        <div className="mt-4 rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
          <p className="font-medium">The queue is empty.</p>
          <p className="mt-2 text-sm text-my-slate">
            No website leads are waiting right now.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {queue.map((lead) => {
            const contacted = agentHasMadeContact(lead);
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
                    {[
                      lead.city || null,
                      lead.agent ? `Agent: ${lead.agent}` : "Unassigned",
                      waiting ? `waiting ${waiting}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {contacted ? (
                  <span className="rounded-full border border-my-green/40 bg-my-green/10 px-2.5 py-0.5 text-sm font-medium">
                    Agent already contacted
                  </span>
                ) : (
                  <span className="rounded-full border border-my-alert/30 bg-my-alert/5 px-2.5 py-0.5 text-sm font-medium text-my-alert">
                    Not yet contacted
                  </span>
                )}
                <StagePill stage={lead.stage} />
                <Link
                  href={`/leads/${lead.uniqueId}`}
                  className="flex min-h-12 items-center rounded-control bg-my-yellow px-4 font-bold text-my-ink transition-opacity hover:opacity-90"
                >
                  Open
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
