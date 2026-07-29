import type { Metadata } from "next";
import Link from "next/link";
import StagePill from "@/components/StagePill";
import { leadDisplayName } from "@/components/LeadCard";
import { timeSince } from "@/lib/crm/dates";
import { isDormant, isRideGuideLead, queueOrder } from "@/lib/crm/ride-guide";
import { hasRole } from "@/lib/session";
import { getCoreData } from "@/lib/sheets";
import { requireEffectiveUser } from "@/lib/view-as";

export const metadata: Metadata = { title: "Dormant leads" };
export const dynamic = "force-dynamic";

export default async function DormantLeadsPage() {
  const { effective: user } = await requireEffectiveUser();

  if (!hasRole(user, "ride_guide", "manager", "admin")) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-h3">Dormant leads</h1>
        <p className="mt-4 rounded-card border border-my-line bg-my-surface p-6 text-my-slate shadow-card">
          This view is part of the Ride Guide&apos;s toolkit.
        </p>
      </main>
    );
  }

  const core = await getCoreData();
  const now = new Date();
  const dormant = queueOrder(
    core.leads.filter((l) => isRideGuideLead(l) && isDormant(l, now)),
  );

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="text-h3">Dormant leads</h1>
      <p className="mt-1 text-sm text-my-slate">
        Website leads stuck in an early stage with no movement for over two
        weeks. Worth a fresh call.{" "}
        <Link href="/ride-guide/queue" className="underline">
          Back to the queue
        </Link>
      </p>

      {dormant.length === 0 ? (
        <div className="mt-4 rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
          <p className="font-medium">Nothing dormant.</p>
          <p className="mt-2 text-sm text-my-slate">
            Every website lead has moved recently.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {dormant.map((lead) => (
            <li
              key={lead.uniqueId}
              className="flex flex-wrap items-center gap-3 rounded-card border border-my-line bg-my-surface p-3 shadow-card"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{leadDisplayName(lead)}</p>
                <p className="text-sm text-my-slate">
                  {[
                    lead.city || null,
                    lead.agent ? `Agent: ${lead.agent}` : "Unassigned",
                    timeSince(lead.dateAdded)
                      ? `waiting ${timeSince(lead.dateAdded)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              </div>
              <StagePill stage={lead.stage} />
              <Link href={`/leads/${lead.uniqueId}`} className="btn-quiet">
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
