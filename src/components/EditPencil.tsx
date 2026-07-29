import Link from "next/link";
import { getSessionUser, hasRole } from "@/lib/session";

/**
 * The Google-Sites-style floating pencil: managers and admins see it on
 * every content page, and it deep-links to editing THAT document in the
 * CMS (/admin). Everyone else sees nothing. Payload separately enforces
 * its own login at /admin — this button is a door, not a lock.
 *
 * Sits above the mobile bottom nav; brand hover swap like every CTA.
 */
export default async function EditPencil({
  href,
  label = "Edit this page",
}: {
  /** Admin deep link, e.g. /admin/collections/pages/12 */
  href: string;
  label?: string;
}) {
  const user = await getSessionUser();
  if (!user || !hasRole(user, "manager", "admin")) return null;

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-my-yellow text-my-ink shadow-card transition-colors hover:bg-my-green-ink hover:text-white md:bottom-6 md:right-6"
    >
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    </Link>
  );
}
