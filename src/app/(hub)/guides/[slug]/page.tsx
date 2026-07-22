import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getGuide } from "@/lib/cms";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Guide" };
export const dynamic = "force-dynamic";

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();
  const guide = await getGuide(slug, user.role);
  if (!guide) notFound();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link href="/guides" className="text-sm text-my-slate underline">
        ← All guides
      </Link>
      <article className="mt-3 rounded-card border border-my-line bg-my-surface p-6 shadow-card">
        <h1 className="text-h2">{guide.title}</h1>
        {guide.summary ? (
          <p className="mt-2 text-my-slate">{guide.summary}</p>
        ) : null}
        <div className="rich-text mt-6">
          <RichText data={guide.content} />
        </div>
      </article>
    </main>
  );
}
