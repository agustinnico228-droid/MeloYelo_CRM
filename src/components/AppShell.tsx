import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "@/lib/actions/sign-out";
import { stopViewAs } from "@/lib/actions/view-as";
import SidebarNav, { MobileNav } from "@/components/SidebarNav";
import type { NavNode } from "@/lib/nav";
import { hasRole, type SessionUser } from "@/lib/session";
import type { ViewAsTarget } from "@/lib/view-as";

/**
 * The one nav (§11). The tree comes from the CMS `navigation` global
 * (intranet-mirroring fallback); role-only items are appended in code.
 * Mobile keeps the four core actions on the bottom bar. SidebarNav
 * (client) highlights the current page and opens its group.
 *
 * Chrome mirrors meloyelo.nz: black bars with the yellow logo, a yellow
 * strip under the header, white links that hover to brand yellow.
 */

const MOBILE_NAV = [
  { href: "/", label: "Today" },
  { href: "/leads", label: "Leads" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/leads/new", label: "Add lead" },
];

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
        <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b-2 border-my-yellow bg-my-ink px-4 py-2 text-white">
          <p className="text-sm font-medium">
            Viewing as {viewingAs.name}: you see exactly what they see.
            Read-only.
          </p>
          <form action={stopViewAs}>
            <button type="submit" className="btn-brand min-h-10 px-4">
              Exit
            </button>
          </form>
        </div>
      ) : null}

      <div className="md:flex">
        {/* Sidebar — desktop. Black like the site header, yellow strip below the logo. */}
        <aside className="hidden w-64 shrink-0 bg-my-ink md:flex md:flex-col">
          <Link
            href="/"
            className="flex items-center border-b-4 border-my-yellow px-5 py-5"
          >
            <Image
              src="/meloyelo-logo.png"
              alt="MeloYelo mY Hub home"
              width={2560}
              height={452}
              priority
              className="h-12 w-auto"
            />
          </Link>
          <SidebarNav
            nav={nav}
            extras={[
              ...(isRideGuide
                ? [
                    {
                      label: "Ride Guide queue",
                      url: "/ride-guide/queue",
                      audience: "all" as const,
                    },
                  ]
                : []),
              ...(isManager
                ? [
                    {
                      label: "View as agent",
                      url: "/view-as",
                      audience: "managers" as const,
                    },
                    {
                      label: "System",
                      url: "/system",
                      audience: "managers" as const,
                    },
                    {
                      label: "Edit site",
                      url: "/admin",
                      audience: "managers" as const,
                    },
                  ]
                : []),
            ]}
          />
          <div className="flex items-center justify-between gap-3 border-t border-white/15 px-5 py-4 text-sm text-white/80">
            <div className="min-w-0">
              <span className="block truncate">{user.name}</span>
              {user.role ? (
                <span className="block capitalize text-white/60">
                  {user.role.replace("_", " ")}
                </span>
              ) : null}
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="min-h-10 shrink-0 rounded-control border border-white/25 px-3 text-sm font-medium text-white transition-colors hover:border-my-yellow hover:text-my-yellow"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Top bar — mobile. Same black-plus-yellow-strip header. */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b-4 border-my-yellow bg-my-ink px-4 py-3 md:hidden">
          <Link href="/" className="flex items-center">
            <Image
              src="/meloyelo-logo.png"
              alt="MeloYelo mY Hub"
              width={2560}
              height={452}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="min-h-10 rounded-control border border-white/25 px-3 text-sm font-medium text-white transition-colors hover:border-my-yellow hover:text-my-yellow"
            >
              Sign out
            </button>
          </form>
        </header>

        <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>

        {/* Bottom nav — mobile, thumb-friendly, black like the footer */}
        <MobileNav items={MOBILE_NAV} />
      </div>
    </div>
  );
}
