import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import EditPencil from "@/components/EditPencil";
import LivePreviewRefresh from "@/components/LivePreviewRefresh";
import { getGuide } from "@/lib/cms";
import { hasRole, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Guide" };
export const dynamic = "force-dynamic";

export default async function GuidePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const user = await requireUser();

  // ?preview=1 is the admin live-preview iframe: editors see the newest
  // draft as they type. Draft access is gated to managers/admins.
  const isPreview = preview === "1" && hasRole(user, "manager", "admin");
  const guide = await getGuide(slug, user.role, { draft: isPreview });
  if (!guide) notFound();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link href="/guides" className="text-sm text-my-slate underline">
        Back to all guides
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

      {isPreview ? <LivePreviewRefresh /> : null}
      <EditPencil href={`/admin/collections/guides/${guide.id}`} />
    </main>
  );
}
