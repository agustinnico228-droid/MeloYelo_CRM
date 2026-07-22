"use client";

import { useEffect, useState } from "react";

/**
 * Announcements on Today (§11). Critical ones can't be dismissed;
 * info/warning dismissals are remembered per browser.
 */

export interface AnnouncementView {
  id: string;
  title: string;
  bodyText: string;
  severity: "info" | "warning" | "critical";
}

const STORAGE_KEY = "myhub.dismissed-announcements";

function loadDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

const SEVERITY_CLASSES: Record<AnnouncementView["severity"], string> = {
  info: "border-my-line bg-my-surface",
  warning: "border-my-warn/40 bg-my-warn/10",
  critical: "border-my-alert/40 bg-my-alert/5",
};

export default function AnnouncementBanner({
  announcements,
}: {
  announcements: AnnouncementView[];
}) {
  const [dismissed, setDismissed] = useState<string[] | null>(null);
  useEffect(() => setDismissed(loadDismissed()), []);

  if (announcements.length === 0 || dismissed === null) return null;
  const visible = announcements.filter(
    (a) => a.severity === "critical" || !dismissed.includes(a.id),
  );
  if (visible.length === 0) return null;

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = [...(prev ?? []), id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {visible.map((a) => (
        <div
          key={a.id}
          className={`flex items-start gap-3 rounded-card border p-4 shadow-card ${SEVERITY_CLASSES[a.severity]}`}
        >
          <div className="min-w-0 flex-1">
            <p className="font-bold">{a.title}</p>
            {a.bodyText ? (
              <p className="mt-1 text-sm text-my-slate">{a.bodyText}</p>
            ) : null}
          </div>
          {a.severity !== "critical" ? (
            <button
              type="button"
              onClick={() => dismiss(a.id)}
              aria-label={`Dismiss announcement: ${a.title}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control text-my-slate transition-colors hover:bg-my-paper"
            >
              ✕
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
