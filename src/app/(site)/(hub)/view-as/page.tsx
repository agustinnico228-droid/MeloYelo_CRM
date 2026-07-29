import type { Metadata } from "next";
import { startViewAs } from "@/lib/actions/view-as";
import { hasRole, requireUser } from "@/lib/session";
import { getLookupData } from "@/lib/sheets";
import { getViewAs } from "@/lib/view-as";

export const metadata: Metadata = { title: "View as agent" };
export const dynamic = "force-dynamic";

export default async function ViewAsPage() {
  const user = await requireUser();

  if (!hasRole(user, "manager", "admin")) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-h3">View as agent</h1>
        <p className="mt-4 rounded-card border border-my-line bg-my-surface p-6 text-my-slate shadow-card">
          This tool is for managers diagnosing what an agent can see.
        </p>
      </main>
    );
  }

  const [{ agents }, active] = await Promise.all([
    getLookupData(),
    getViewAs(user),
  ]);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
      <h1 className="text-h3">View as agent</h1>
      <p className="text-sm text-my-slate">
        See exactly what an agent sees: their leads, their Today page, nothing
        else. While active the hub is <strong>read-only</strong> and both entry
        and exit are recorded in the audit log. This is how you answer &quot;an
        agent says they can&apos;t see their lead&quot; without weakening any
        filter or signing in as anyone.
      </p>

      {active ? (
        <p className="rounded-card border border-my-warn/40 bg-my-warn/10 p-4 text-sm">
          Currently viewing as <strong>{active.name}</strong>. Use the banner at
          the top of any page to exit.
        </p>
      ) : null}

      <ul className="space-y-2">
        {agents.map((agent) => (
          <li
            key={agent.crmEmail}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-my-line bg-my-surface p-4 shadow-card"
          >
            <div>
              <p className="font-medium">{agent.name}</p>
              <p className="text-sm text-my-slate">
                {agent.crmEmail}
                {agent.region ? ` - ${agent.region}` : ""}
              </p>
            </div>
            <form action={startViewAs}>
              <input type="hidden" name="agentEmail" value={agent.crmEmail} />
              <button type="submit" className="btn-quiet">
                View as {agent.name.split(" ")[0]}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
