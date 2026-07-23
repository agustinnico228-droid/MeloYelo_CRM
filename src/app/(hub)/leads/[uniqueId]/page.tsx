import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StagePill from "@/components/StagePill";
import LeadEditor from "@/components/LeadEditor";
import { leadDisplayName } from "@/components/LeadCard";
import { canViewLead } from "@/lib/crm/access";
import { describeCrmDate, timeSince } from "@/lib/crm/dates";
import { notesNewestFirst, parseNotes } from "@/lib/crm/notes";
import { phoneHref } from "@/lib/crm/phone";
import { isMalformedPostcode } from "@/lib/crm/postcode";
import { formatMinutes } from "@/lib/crm/speed-to-lead";
import { allowedNextStages } from "@/lib/crm/stages";
import { canReassign } from "@/lib/roles";
import { getCoreData, getLookupData } from "@/lib/sheets";
import { requireEffectiveUser } from "@/lib/view-as";

export const metadata: Metadata = { title: "Lead" };
export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-my-slate">{label}</dt>
      <dd className="mt-0.5 break-words">{value || "—"}</dd>
    </div>
  );
}

function NoteText({ text }: { text: string }) {
  if (text.length <= 400) return <p className="whitespace-pre-line">{text}</p>;
  return (
    <details>
      <summary className="cursor-pointer">
        <span className="whitespace-pre-line">{text.slice(0, 400)}…</span>{" "}
        <span className="font-medium underline">Show more</span>
      </summary>
      <p className="mt-2 whitespace-pre-line">{text.slice(400)}</p>
    </details>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ uniqueId: string }>;
}) {
  const { uniqueId } = await params;
  const { effective: user, viewingAs } = await requireEffectiveUser();
  const core = await getCoreData();

  const lead = core.leads.find((l) => l.uniqueId === uniqueId);
  // Not found and not-yours look identical — nothing leaks (§14).
  if (!lead || !canViewLead(user, lead)) notFound();

  const managerCanReassign = user.role !== null && canReassign(user.role);
  const agents = managerCanReassign ? (await getLookupData()).agents : [];

  const name = leadDisplayName(lead);
  const tel = phoneHref(lead.phone);
  const waiting = timeSince(lead.dateAdded);
  const notes = notesNewestFirst(parseNotes(lead.notes));
  const history = core.stageHistory
    .filter((h) => h.uniqueId === lead.uniqueId)
    .reverse();
  const unassigned = lead.agentEmail === "";

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="rounded-card border border-my-line bg-my-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-h3">{name}</h1>
            <p className="mt-1 text-sm text-my-slate">
              {[
                lead.agent ? `Agent: ${lead.agent}` : "Unassigned",
                waiting ? `added ${waiting} ago` : null,
                lead.source || null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <StagePill stage={lead.stage} />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {tel ? (
            <a
              href={tel}
              className="flex min-h-12 flex-1 items-center justify-center rounded-control bg-my-yellow px-4 font-bold text-my-ink transition-opacity hover:opacity-90"
            >
              Call {lead.firstName || "lead"}
            </a>
          ) : (
            <span className="flex min-h-12 flex-1 items-center justify-center rounded-control border border-my-line px-4 text-sm text-my-slate">
              No phone number
            </span>
          )}
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="flex min-h-12 flex-1 items-center justify-center rounded-control border border-my-line bg-my-surface px-4 font-medium text-my-ink transition-colors hover:bg-my-paper"
            >
              Email {lead.firstName || "lead"}
            </a>
          ) : null}
        </div>
      </header>

      {unassigned ? (
        <section className="rounded-card border border-my-alert/40 bg-my-alert/5 p-5 shadow-card">
          <h2 className="text-h3 text-my-alert">Unassigned lead</h2>
          <p className="mt-2 text-sm">
            {lead.postCode === ""
              ? "No postcode on the record, so it couldn't be routed to an agent."
              : isMalformedPostcode(lead.postCode)
                ? `The postcode "${lead.postCode}" doesn't look right, so routing failed.`
                : `The postcode "${lead.postCode}" isn't in the routing table.`}{" "}
            Fix the postcode in the details below and it will be routed
            automatically.
          </p>
        </section>
      ) : null}

      {viewingAs ? (
        <section className="rounded-card border border-my-line bg-my-paper p-5 shadow-card">
          <p className="text-sm text-my-slate">
            Read-only while viewing as {viewingAs.name} — stage changes,
            notes and edits are disabled. Exit view-as (banner above) to
            make changes as yourself.
          </p>
        </section>
      ) : (
      <LeadEditor
        key={lead.uniqueId}
        uniqueId={lead.uniqueId}
        stage={lead.stage}
        allowedStages={allowedNextStages(lead.stage)}
        fields={{
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          postCode: lead.postCode,
          city: lead.city,
          model: lead.model,
          serial: lead.serial,
        }}
        agents={agents.map((a) => ({ name: a.name, email: a.crmEmail }))}
        currentAgentEmail={lead.agentEmail}
        canReassignLead={managerCanReassign}
      />
      )}

      <section className="rounded-card border border-my-line bg-my-surface p-5 shadow-card">
        <h2 className="text-h3">Record</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Added" value={describeCrmDate(lead.dateAdded)} />
          <Field
            label="Speed to lead"
            value={
              lead.speedToLeadMinutes === null
                ? "—"
                : formatMinutes(lead.speedToLeadMinutes)
            }
          />
          <Field label="Source" value={lead.source} />
          <Field label="Unique ID" value={lead.uniqueId} />
          {lead.trackingDetails ? (
            <Field label="Tracking" value={lead.trackingDetails} />
          ) : null}
        </dl>
        {[lead.alert48Sent, lead.alert5DaySent, lead.finalFollowUpSent].some(
          (f) => f !== "",
        ) ? (
          <p className="mt-4 flex flex-wrap gap-2 text-sm">
            {lead.alert48Sent ? (
              <span className="rounded-full border border-my-warn/40 bg-my-warn/10 px-2.5 py-0.5">
                48 h alert sent
              </span>
            ) : null}
            {lead.alert5DaySent ? (
              <span className="rounded-full border border-my-warn/40 bg-my-warn/10 px-2.5 py-0.5">
                5 day alert sent
              </span>
            ) : null}
            {lead.finalFollowUpSent ? (
              <span className="rounded-full border border-my-warn/40 bg-my-warn/10 px-2.5 py-0.5">
                Final follow-up sent
              </span>
            ) : null}
          </p>
        ) : null}
      </section>

      <section className="rounded-card border border-my-line bg-my-surface p-5 shadow-card">
        <h2 className="text-h3">Notes</h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-my-slate">
            No notes yet — the first call is a great time to add one.
          </p>
        ) : (
          <ol className="mt-4 space-y-4">
            {notes.map((note, i) => (
              <li key={i} className="border-l-2 border-my-line pl-4">
                <p className="text-sm text-my-slate">
                  {note.date
                    ? note.date.toLocaleString("en-NZ", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : (note.timestampRaw ?? "Earlier")}
                  {note.author ? ` · ${note.author}` : null}
                </p>
                <div className="mt-1">
                  <NoteText text={note.text} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-card border border-my-line bg-my-surface p-5 shadow-card">
        <h2 className="text-h3">Stage history</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-my-slate">
            No stage changes recorded yet.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {history.map((h, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <StagePill stage={h.to} />
                <span className="text-sm text-my-slate">
                  from {h.from || "—"} · {describeCrmDate(h.changedAt)}
                  {h.agent ? ` · ${h.agent}` : null}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
