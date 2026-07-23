import Link from "next/link";
import { stopViewAs } from "@/lib/actions/view-as";
import type { NavNode } from "@/lib/nav";
import { hasRole, type SessionUser } from "@/lib/session";
import type { ViewAsTarget } from "@/lib/view-as";

/**
 * The one nav (§11). The tree comes from the CMS `navigation` global
 * (intranet-mirroring fallback); role-only items are appended in code.
 * Mobile keeps the four core actions on the bottom bar.
 */

const MOBILE_NAV = [
  { href: "/", label: "Today" },
  { href: "/leads", label: "Leads" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/leads/new", label: "Add lead" },
];

function SidebarLink({ node, indent }: { node: NavNode; indent?: boolean }) {
  if (!node.url) return null;
  return (
    <Link
      href={node.url}
      className={`block min-h-11 rounded-control px-3 py-2.5 text-sm font-medium text-my-ink transition-colors hover:bg-my-paper ${
        indent ? "pl-6" : ""
      }`}
    >
      {node.label}
    </Link>
  );
}

export default function AppShell({
  user,
  viewingAs,
  nav,
  children,
}: {
  /** The effective user — the lens everything renders through. */
  user: SessionUser;
  viewingAs: ViewAsTarget | null;
  nav: NavNode[];
  children: React.ReactNode;
}) {
  const isManager = hasRole(user, "manager", "admin");
  const isRideGuide = hasRole(user, "ride_guide", "manager", "admin");

  return (
    <div className="min-h-svh">
      {viewingAs ? (
        <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 bg-my-ink px-4 py-2 text-white">
          <p className="text-sm font-medium">
            Viewing as {viewingAs.name} — you see exactly what they see.
            Read-only.
          </p>
          <form action={stopViewAs}>
            <button
              type="submit"
              className="min-h-10 rounded-control bg-my-yellow px-4 text-sm font-bold text-my-ink transition-opacity hover:opacity-90"
            >
              Exit
            </button>
          </form>
        </div>
      ) : null}

      <div className="md:flex">
        {/* Sidebar — desktop */}
        <aside className="hidden w-64 shrink-0 border-r border-my-line bg-my-surface md:flex md:flex-col">
          <Link href="/" className="flex items-center gap-3 px-5 py-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-my-yellow">
              <span className="font-display font-bold text-my-ink">MY</span>
            </span>
            <span className="font-display font-bold">mY Hub</span>
          </Link>
          <nav
            className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2"
            aria-label="Main"
          >
            {nav.map((node) =>
              node.children && node.children.length > 0 ? (
                <details key={node.label} open={node.label === "CRM"}>
                  <summary className="min-h-11 cursor-pointer list-none rounded-control px-3 py-2.5 text-sm font-bold text-my-ink transition-colors hover:bg-my-paper">
                    {node.label}
                  </summary>
                  {node.url ? (
                    <SidebarLink
                      node={{ ...node, label: `${node.label} home` }}
                      indent
                    />
                  ) : null}
                  {node.children.map((child) => (
                    <SidebarLink key={child.label} node={child} indent />
                  ))}
                </details>
              ) : (
                <SidebarLink key={node.label} node={node} />
              ),
            )}

            {isRideGuide || isManager ? (
              <div className="mt-2 border-t border-my-line pt-2">
                {isRideGuide ? (
                  <SidebarLink
                    node={{
                      label: "Ride Guide queue",
                      url: "/ride-guide/queue",
                      audience: "all",
                    }}
                  />
                ) : null}
                {isManager ? (
                  <>
                    <SidebarLink
                      node={{
                        label: "View as agent",
                        url: "/view-as",
                        audience: "managers",
                      }}
                    />
                    <SidebarLink
                      node={{
                        label: "System",
                        url: "/system",
                        audience: "managers",
                      }}
                    />
                  </>
                ) : null}
              </div>
            ) : null}
          </nav>
          <div className="border-t border-my-line px-5 py-4 text-sm text-my-slate">
            {user.name}
            {user.role ? (
              <span className="block capitalize">
                {user.role.replace("_", " ")}
              </span>
            ) : null}
          </div>
        </aside>

        {/* Top bar — mobile */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-my-line bg-my-surface px-4 py-3 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-my-yellow">
              <span className="font-display text-sm font-bold text-my-ink">
                MY
              </span>
            </span>
            <span className="font-display font-bold">mY Hub</span>
          </Link>
        </header>

        <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>

        {/* Bottom nav — mobile, thumb-friendly */}
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-20 flex border-t border-my-line bg-my-surface md:hidden"
        >
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-14 flex-1 items-center justify-center text-sm font-medium text-my-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
