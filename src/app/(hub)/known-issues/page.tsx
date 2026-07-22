import type { Metadata } from "next";
import { getKnownIssues, isCmsConfigured } from "@/lib/cms";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Known issues" };
export const dynamic = "force-dynamic";

const STATUS_CLASSES: Record<string, string> = {
  open: "border-my-alert/40 bg-my-alert/10",
  investigating: "border-my-warn/40 bg-my-warn/10",
  fixed: "border-my-green/40 bg-my-green/10",
};

export default async function KnownIssuesPage() {
  await requireUser();
  const issues = await getKnownIssues();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-h3">Known issues</h1>
      {issues.length === 0 ? (
        <div className="mt-4 rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
          <p className="font-medium">Nothing on the list.</p>
          <p className="mt-2 text-sm text-my-slate">
            {isCmsConfigured()
              ? "When something's up, it gets posted here with a workaround."
              : "The content database isn't connected in this environment."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {issues.map((issue) => (
            <li
              key={issue.id}
              className="rounded-card border border-my-line bg-my-surface p-5 shadow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-h3">{issue.title}</h2>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize ${STATUS_CLASSES[issue.status] ?? ""}`}
                >
                  {issue.status}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line">{issue.description}</p>
              {issue.affects ? (
                <p className="mt-2 text-sm text-my-slate">
                  Affects: {issue.affects}
                </p>
              ) : null}
              {issue.workaround ? (
                <p className="mt-3 rounded-control border border-my-line bg-my-paper px-4 py-3 text-sm">
                  <span className="font-bold">Workaround: </span>
                  {issue.workaround}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
