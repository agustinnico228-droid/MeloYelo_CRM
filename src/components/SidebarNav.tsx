"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavNode } from "@/lib/nav";

/**
 * Client half of the nav: highlights the item for the page you're on
 * (charcoal surface, yellow text, yellow left bar) and auto-opens the
 * group that contains it. Longest-matching URL wins, so /leads/new
 * lights up "Add lead", not "Leads".
 */

function collectUrls(nodes: NavNode[]): string[] {
  const urls: string[] = [];
  for (const n of nodes) {
    if (n.url) urls.push(n.url);
    if (n.children) urls.push(...collectUrls(n.children));
  }
  return urls;
}

function bestMatch(pathname: string, urls: string[]): string | null {
  let best: string | null = null;
  for (const url of urls) {
    const matches =
      url === "/"
        ? pathname === "/"
        : pathname === url || pathname.startsWith(`${url}/`);
    if (matches && (best === null || url.length > best.length)) {
      best = url;
    }
  }
  return best;
}

function containsUrl(node: NavNode, url: string | null): boolean {
  if (!url) return false;
  if (node.url === url) return true;
  return (node.children ?? []).some((c) => c.url === url);
}

function NavLink({
  node,
  indent,
  activeUrl,
}: {
  node: NavNode;
  indent?: boolean;
  activeUrl: string | null;
}) {
  if (!node.url) return null;
  const active = node.url === activeUrl;
  return (
    <Link
      href={node.url}
      aria-current={active ? "page" : undefined}
      className={`block min-h-11 rounded-control px-3 py-2.5 text-sm transition-colors ${
        indent ? "pl-6" : ""
      } ${
        active
          ? "border-l-4 border-my-yellow bg-my-charcoal font-bold text-my-yellow"
          : "font-medium text-white/90 hover:bg-my-charcoal hover:text-my-yellow"
      }`}
    >
      {node.label}
    </Link>
  );
}

export default function SidebarNav({
  nav,
  extras,
}: {
  nav: NavNode[];
  /** Role-gated flat items appended below the tree (queue, system…) */
  extras: NavNode[];
}) {
  const pathname = usePathname();
  const activeUrl = bestMatch(pathname, [
    ...collectUrls(nav),
    ...collectUrls(extras),
  ]);

  return (
    <nav
      className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3"
      aria-label="Main"
    >
      {nav.map((node) =>
        node.children && node.children.length > 0 ? (
          <details
            key={node.label}
            open={node.label === "CRM" || containsUrl(node, activeUrl)}
          >
            <summary
              className={`min-h-11 cursor-pointer list-none rounded-control px-3 py-2.5 font-display text-sm font-bold uppercase tracking-widest transition-colors hover:bg-my-charcoal ${
                containsUrl(node, activeUrl)
                  ? "bg-my-charcoal text-my-yellow"
                  : "text-my-yellow"
              }`}
            >
              {node.label}
            </summary>
            {node.url ? (
              <NavLink
                node={{ ...node, label: `${node.label} home` }}
                indent
                activeUrl={activeUrl}
              />
            ) : null}
            {node.children.map((child) => (
              <NavLink
                key={child.label}
                node={child}
                indent
                activeUrl={activeUrl}
              />
            ))}
          </details>
        ) : (
          <NavLink key={node.label} node={node} activeUrl={activeUrl} />
        ),
      )}

      {extras.length > 0 ? (
        <div className="mt-2 border-t border-white/15 pt-2">
          {extras.map((node) => (
            <NavLink key={node.label} node={node} activeUrl={activeUrl} />
          ))}
        </div>
      ) : null}
    </nav>
  );
}

export function MobileNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const activeUrl = bestMatch(
    pathname,
    items.map((i) => i.href),
  );

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 flex border-t-2 border-my-yellow bg-my-ink md:hidden"
    >
      {items.map((item) => {
        const active = item.href === activeUrl;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 flex-1 items-center justify-center text-sm font-bold transition-colors ${
              active
                ? "border-t-4 border-my-yellow bg-my-charcoal text-my-yellow"
                : "text-white hover:text-my-yellow"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
