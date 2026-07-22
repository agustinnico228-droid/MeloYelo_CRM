"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Cards ⇄ grid switch, remembered per user via cookie (§11). */
export default function ViewToggle({ view }: { view: "cards" | "grid" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setView(next: "cards" | "grid") {
    if (next === view) return;
    document.cookie = `myhub-view=${next};path=/;max-age=31536000;samesite=lax`;
    const sp = new URLSearchParams(params);
    sp.set("view", next);
    sp.delete("page");
    router.push(`${pathname}?${sp}`);
  }

  const base =
    "min-h-12 px-4 font-medium transition-colors first:rounded-l-control last:rounded-r-control";
  return (
    <div
      role="group"
      aria-label="View mode"
      className="inline-flex overflow-hidden rounded-control border border-my-line"
    >
      <button
        type="button"
        onClick={() => setView("cards")}
        aria-pressed={view === "cards"}
        className={`${base} ${view === "cards" ? "bg-my-ink text-white" : "bg-my-surface text-my-ink hover:bg-my-paper"}`}
      >
        Cards
      </button>
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-pressed={view === "grid"}
        className={`${base} ${view === "grid" ? "bg-my-ink text-white" : "bg-my-surface text-my-ink hover:bg-my-paper"}`}
      >
        Grid
      </button>
    </div>
  );
}
