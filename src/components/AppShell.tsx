import Link from "next/link";
import { hasRole, type SessionUser } from "@/lib/session";

interface NavItem {
  href: string;
  label: string;
  managerOnly?: boolean;
}

// Grows as build phases land; §11 is the full map.
const NAV: NavItem[] = [
  { href: "/", label: "Today" },
  { href: "/leads", label: "Leads" },
  { href: "/system", label: "System", managerOnly: true },
];

function navFor(user: SessionUser): NavItem[] {
  return NAV.filter(
    (item) => !item.managerOnly || hasRole(user, "manager", "admin"),
  );
}

export default function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const items = navFor(user);

  return (
    <div className="min-h-svh md:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden w-56 shrink-0 border-r border-my-line bg-my-surface md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-my-yellow">
            <span className="font-display font-bold text-my-ink">MY</span>
          </span>
          <span className="font-display font-bold">CRM Hub</span>
        </Link>
        <nav className="flex-1 px-3 py-2" aria-label="Main">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block min-h-12 rounded-control px-3 py-3 font-medium text-my-ink transition-colors hover:bg-my-paper"
            >
              {item.label}
            </Link>
          ))}
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
          <span className="font-display font-bold">CRM Hub</span>
        </Link>
      </header>

      <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>

      {/* Bottom nav — mobile, thumb-friendly */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-my-line bg-my-surface md:hidden"
      >
        {items.map((item) => (
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
  );
}
