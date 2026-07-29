import Link from "next/link";
import StagePill from "./StagePill";
import type { Lead } from "@/lib/crm/types";
import { phoneHref } from "@/lib/crm/phone";
import { timeSince } from "@/lib/crm/dates";

export function leadDisplayName(lead: Lead): string {
  const name = `${lead.firstName} ${lead.lastName}`.trim();
  return name || lead.email || `Lead ${lead.uniqueId}`;
}

export default function LeadCard({
  lead,
  showAgent,
}: {
  lead: Lead;
  showAgent?: boolean;
}) {
  const tel = phoneHref(lead.phone);
  const waiting = timeSince(lead.dateAdded);
  const name = leadDisplayName(lead);

  return (
    <div className="rounded-card border border-my-line bg-my-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/leads/${lead.uniqueId}`}
            className="block truncate font-display text-h3 leading-tight hover:underline"
          >
            {name}
          </Link>
          <p className="mt-1 text-sm text-my-slate">
            {[lead.city, waiting ? `waiting ${waiting}` : null]
              .filter(Boolean)
              .join(" - ")}
          </p>
        </div>
        <StagePill stage={lead.stage} />
      </div>

      {showAgent ? (
        <p className="mt-2 text-sm text-my-slate">
          {lead.agent ? `Agent: ${lead.agent}` : "Unassigned"}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        {tel ? (
          <a href={tel} className="btn-brand flex-1">
            Call {lead.firstName || "lead"}
          </a>
        ) : (
          <span className="flex min-h-12 flex-1 items-center justify-center rounded-control border border-my-line px-4 text-sm text-my-slate">
            No phone number
          </span>
        )}
        <Link href={`/leads/${lead.uniqueId}`} className="btn-quiet flex-1">
          Update
        </Link>
      </div>
    </div>
  );
}
