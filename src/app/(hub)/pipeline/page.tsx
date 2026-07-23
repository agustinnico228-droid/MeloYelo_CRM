import type { Metadata } from "next";
import Link from "next/link";
import { visibleLeads } from "@/lib/crm/access";
import { parseCrmDate } from "@/lib/crm/dates";
import { stageTone } from "@/lib/crm/stages";
import { STAGES } from "@/lib/crm/types";
import { leadDisplayName } from "@/components/LeadCard";
import { getCoreData } from "@/lib/sheets";
import { requireEffectiveUser } from "@/lib/view-as";

export const metadata: Metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

/**
 * Nine columns in canonical order (§11). Read-only board in v1 —
 * drag-between-columns is explicitly deferred to v2.
 */

const TONE_BAR: Record<string, string> = {
  slate: "bg-my-slate",
  blue: "bg-stage-blue",
  alert: "bg-my-alert",
  yellow: "bg-my-yellow",
  green: "bg-my-green",
  deep: "bg-stage-deep",
};

function daysInStage(stageUpdatedAt: string, dateAdded: string): string | null {
  const since = parseCrmDate(stageUpdatedAt) ?? parseCrmDate(dateAdded);
  if (!since) return null;
  const days = Math.floor((Date.now() - since.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export default async function PipelinePage() {
  const { effective: user } = await requireEffectiveUser();
  const core = await getCoreData();
  const mine = visibleLeads(user, core.leads);

  return (
    <main className="p-4 sm:p-6">
      <h1 className="text-h3">Pipeline</h1>
      <p className="mt-1 text-sm text-my-slate">
        {mine.length} {mine.length === 1 ? "lead" : "leads"} across nine
        stages. Open a card to update its stage.
      </p>

      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const leads = mine.filter((l) => l.stage === stage);
          return (
            <section
              key={stage}
              className="w-72 shrink-0 snap-start rounded-card border border-my-line bg-my-surface shadow-card"
            >
              <header className="flex items-center gap-2 border-b border-my-line px-4 py-3">
                <span
                  aria-hidden
                  className={`h-2.5 w-2.5 rounded-full ${TONE_BAR[stageTone(stage)]}`}
                />
                <h2 className="flex-1 truncate text-base font-bold">{stage}</h2>
                <span className="rounded-full bg-my-paper px-2 py-0.5 text-sm text-my-slate">
                  {leads.length}
                </span>
              </header>
              <div className="max-h-[65vh] space-y-2 overflow-y-auto p-3">
                {leads.length === 0 ? (
                  <p className="px-1 py-2 text-sm text-my-slate">
                    Nothing here right now.
                  </p>
                ) : (
                  leads.map((lead) => {
                    const days = daysInStage(lead.stageUpdatedAt, lead.dateAdded);
                    return (
                      <Link
                        key={lead.uniqueId}
                        href={`/leads/${lead.uniqueId}`}
                        className="block rounded-control border border-my-line bg-my-paper px-3 py-2.5 transition-colors hover:bg-my-surface"
                      >
                        <span className="block truncate font-medium">
                          {leadDisplayName(lead)}
                        </span>
                        <span className="block text-sm text-my-slate">
                          {days ? `in stage ${days}` : lead.city || "—"}
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
