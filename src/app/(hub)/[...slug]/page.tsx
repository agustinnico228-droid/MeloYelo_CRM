import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBlocks, { extractToc } from "@/components/PageBlocks";
import TocEnhancer from "@/components/TocEnhancer";
import { getPageBySlug } from "@/lib/cms";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * §13.2: any published CMS page renders here by its path slug —
 * /news, /conference, /ride-guide/call-flow, /growth/utm-convention…
 * Explicit app routes always win over this catch-all.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug.join("/"));
  return { title: page?.title ?? "Page" };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  await requireUser();

  const page = await getPageBySlug(slug.join("/"));
  if (!page) notFound();

  const blocks = page.layout ?? [];
  const toc = page.showToc ? extractToc(blocks) : [];

  return (
    <main className="mx-auto max-w-[72ch] p-4 sm:p-6">
      <article>
        <h1 className="text-h2">{page.title}</h1>
        {page.lastReviewed ? (
          <p className="mt-1 text-sm text-my-slate">
            Last reviewed{" "}
            {new Date(page.lastReviewed).toLocaleDateString("en-NZ", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        ) : null}

        {toc.length > 1 ? (
          <nav
            aria-label="On this page"
            className="mt-5 rounded-card border border-my-line bg-my-surface p-4 shadow-card"
          >
            <p className="font-bold">On this page</p>
            <ol className="mt-2 space-y-1 text-sm">
              {toc.map((entry) => (
                <li
                  key={entry.id}
                  className={entry.level === 3 ? "pl-4" : ""}
                >
                  <a href={`#${entry.id}`} className="underline">
                    {entry.text}
                  </a>
                </li>
              ))}
            </ol>
            <TocEnhancer ids={toc.map((e) => e.id)} />
          </nav>
        ) : null}

        <div id="page-content" className="mt-6">
          <PageBlocks blocks={blocks} />
        </div>
      </article>
    </main>
  );
}
