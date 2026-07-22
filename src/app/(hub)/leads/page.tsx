import type { Metadata } from "next";
import Link from "next/link";
import LeadCard from "@/components/LeadCard";
import { visibleLeads } from "@/lib/crm/access";
import { filterAndSortLeads, type LeadSort } from "@/lib/crm/filter";
import { STAGES } from "@/lib/crm/types";
import { canSeeAllLeads } from "@/lib/roles";
import { requireUser } from "@/lib/session";
import { getCoreData, getLookupData } from "@/lib/sheets";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const SOURCES = [
  "Website Form",
  "AgentForm",
  "Warranty Registration",
  "Call Centre",
];

type Params = {
  q?: string;
  stage?: string;
  source?: string;
  agent?: string;
  unassigned?: string;
  sort?: string;
  page?: string;
};

function pageUrl(params: Params, page: number): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  sp.set("page", String(page));
  return `/leads?${sp}`;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const [core, lookups] = await Promise.all([getCoreData(), getLookupData()]);

  const seesAll = user.role !== null && canSeeAllLeads(user.role);
  const mine = visibleLeads(user, core.leads);

  const filtered = filterAndSortLeads(mine, {
    q: params.q,
    stage: params.stage,
    source: params.source,
    agentEmail: seesAll ? params.agent : undefined,
    unassigned: seesAll && params.unassigned === "1",
    sort: (["newest", "oldest", "untouched"] as const).includes(
      params.sort as LeadSort,
    )
      ? (params.sort as LeadSort)
      : "newest",
  });

  const page = Math.max(1, Number(params.page) || 1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageLeads = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h3">Leads</h1>
        <p className="text-sm text-my-slate">
          {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
          {core.source === "mock" ? " · sample data" : null}
        </p>
      </div>

      {core.stale ? (
        <p className="mt-3 rounded-control border border-my-warn/40 bg-my-warn/10 px-4 py-2 text-sm">
          Data last updated {Math.round(core.ageMs / 60000)} min ago — the
          sheet isn&apos;t responding right now.
        </p>
      ) : null}

      <form
        method="get"
        className="mt-4 grid grid-cols-2 gap-2 rounded-card border border-my-line bg-my-surface p-3 shadow-card sm:grid-cols-4 lg:grid-cols-6"
      >
        <input
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search name, email, phone…"
          aria-label="Search leads"
          className="col-span-2 min-h-12 rounded-control border border-my-line bg-my-surface px-3 text-my-ink placeholder:text-my-slate"
        />
        <select
          name="stage"
          defaultValue={params.stage ?? ""}
          aria-label="Filter by stage"
          className="min-h-12 rounded-control border border-my-line bg-my-surface px-2"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          name="source"
          defaultValue={params.source ?? ""}
          aria-label="Filter by source"
          className="min-h-12 rounded-control border border-my-line bg-my-surface px-2"
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {seesAll ? (
          <select
            name="agent"
            defaultValue={params.agent ?? ""}
            aria-label="Filter by agent"
            className="min-h-12 rounded-control border border-my-line bg-my-surface px-2"
          >
            <option value="">All agents</option>
            {lookups.agents.map((a) => (
              <option key={a.crmEmail} value={a.crmEmail}>
                {a.name}
              </option>
            ))}
          </select>
        ) : null}
        <select
          name="sort"
          defaultValue={params.sort ?? "newest"}
          aria-label="Sort"
          className="min-h-12 rounded-control border border-my-line bg-my-surface px-2"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="untouched">Longest untouched</option>
        </select>
        <div className="col-span-2 flex items-center gap-3 sm:col-span-4 lg:col-span-1">
          {seesAll ? (
            <label className="flex min-h-12 items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="unassigned"
                value="1"
                defaultChecked={params.unassigned === "1"}
                className="h-5 w-5 accent-my-ink"
              />
              Unassigned
            </label>
          ) : null}
          <button
            type="submit"
            className="min-h-12 flex-1 rounded-control bg-my-ink px-4 font-medium text-white transition-opacity hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </form>

      {pageLeads.length === 0 ? (
        <div className="mt-8 rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
          <p className="font-medium">No leads match.</p>
          <p className="mt-2 text-sm text-my-slate">
            Try clearing a filter, or{" "}
            <Link href="/leads" className="underline">
              start over
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pageLeads.map((lead) => (
            <LeadCard key={lead.uniqueId} lead={lead} showAgent={seesAll} />
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <nav
          className="mt-6 flex items-center justify-center gap-4"
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link
              href={pageUrl(params, page - 1)}
              className="flex min-h-12 items-center rounded-control border border-my-line bg-my-surface px-4 font-medium"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-sm text-my-slate">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link
              href={pageUrl(params, page + 1)}
              className="flex min-h-12 items-center rounded-control border border-my-line bg-my-surface px-4 font-medium"
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
