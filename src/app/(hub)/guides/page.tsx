import type { Metadata } from "next";
import Link from "next/link";
import { getGuides, isCmsConfigured } from "@/lib/cms";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Guides" };
export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const user = await requireUser();
  const guides = await getGuides(user.role);

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-h3">Guides</h1>
      {guides.length === 0 ? (
        <div className="mt-4 rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
          <p className="font-medium">No guides yet.</p>
          <p className="mt-2 text-sm text-my-slate">
            {isCmsConfigured()
              ? "An admin can publish guides from the admin area."
              : "The content database isn't connected in this environment."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {guides.map((g) => (
            <li key={g.id}>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-card border border-my-line bg-my-surface p-5 shadow-card transition-colors hover:bg-my-paper"
              >
                <span className="font-display text-h3">{g.title}</span>
                {g.summary ? (
                  <span className="mt-1 block text-sm text-my-slate">
                    {g.summary}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
