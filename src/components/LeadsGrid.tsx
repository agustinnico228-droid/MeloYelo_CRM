"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveLeadChanges } from "@/lib/actions/leads";
import { allowedNextStages } from "@/lib/crm/stages";

/**
 * The spreadsheet replacement (§11): sticky header + first column,
 * inline editing (double-click or Enter), keyboard navigation (arrows,
 * Tab, Enter, Esc), column show/hide, CSV export, windowed rendering
 * for large sets. Writes go through the same server action as the
 * record page — optimistic, with rollback and a visible error.
 */

export interface GridLead {
  uniqueId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postCode: string;
  city: string;
  stage: string;
  model: string;
  serial: string;
  agent: string;
  dateAdded: string;
  speedToLeadMinutes: number | null;
  source: string;
}

type ColKey = keyof GridLead;

interface ColDef {
  key: ColKey;
  label: string;
  editable: boolean;
  width: string;
}

const COLUMNS: ColDef[] = [
  { key: "uniqueId", label: "ID", editable: false, width: "w-20" },
  { key: "firstName", label: "First name", editable: true, width: "w-32" },
  { key: "lastName", label: "Last name", editable: true, width: "w-32" },
  { key: "email", label: "Email", editable: true, width: "w-56" },
  { key: "phone", label: "Phone", editable: true, width: "w-36" },
  { key: "postCode", label: "Postcode", editable: true, width: "w-24" },
  { key: "city", label: "City", editable: true, width: "w-32" },
  { key: "stage", label: "Stage", editable: true, width: "w-44" },
  { key: "model", label: "Model", editable: true, width: "w-32" },
  { key: "serial", label: "Serial", editable: true, width: "w-32" },
  { key: "agent", label: "Agent", editable: false, width: "w-36" },
  { key: "dateAdded", label: "Added", editable: false, width: "w-40" },
  { key: "speedToLeadMinutes", label: "Speed (min)", editable: false, width: "w-28" },
  { key: "source", label: "Source", editable: false, width: "w-36" },
];

const STORAGE_KEY = "myhub.grid.columns";
const ROW_H = 44;
const OVERSCAN = 10;

const FIELD_KEYS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "postCode",
  "city",
  "model",
  "serial",
] as const;

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export default function LeadsGrid({ leads }: { leads: GridLead[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [rows, setRows] = useState(leads);
  useEffect(() => setRows(leads), [leads]);

  const [hidden, setHidden] = useState<Set<ColKey>>(new Set());
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHidden(new Set(JSON.parse(saved) as ColKey[]));
    } catch {
      /* first visit */
    }
  }, []);

  function toggleColumn(key: ColKey) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  const cols = useMemo(
    () => COLUMNS.filter((c) => c.key === "uniqueId" || !hidden.has(c.key)),
    [hidden],
  );

  // Focus + editing state
  const [focus, setFocus] = useState<{ r: number; c: number } | null>(null);
  const [editing, setEditing] = useState<{ r: number; c: number } | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Windowed rendering
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewH, setViewH] = useState(600);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setViewH(el.clientHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const first = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const visibleCount = Math.ceil(viewH / ROW_H) + OVERSCAN * 2;
  const last = Math.min(rows.length, first + visibleCount);

  const commit = useCallback(
    (r: number, c: number, value: string) => {
      const col = cols[c];
      const lead = rows[r];
      if (!col?.editable || !lead) return;
      const old =
        col.key === "speedToLeadMinutes"
          ? String(lead.speedToLeadMinutes ?? "")
          : String(lead[col.key] ?? "");
      if (value === old) return;

      // Optimistic
      setRows((prev) => {
        const next = [...prev];
        next[r] = { ...next[r], [col.key]: value };
        return next;
      });
      setError(null);

      const payload =
        col.key === "stage"
          ? { uniqueId: lead.uniqueId, stageTo: value }
          : { uniqueId: lead.uniqueId, changes: { [col.key]: value } };

      startTransition(async () => {
        const res = await saveLeadChanges(payload);
        if (!res.ok) {
          setRows((prev) => {
            const next = [...prev];
            next[r] = { ...next[r], [col.key]: old };
            return next;
          });
          setError(res.error ?? "The change didn't save.");
        } else {
          router.refresh();
        }
      });
    },
    [cols, rows, router, startTransition],
  );

  function startEdit(r: number, c: number) {
    const col = cols[c];
    if (!col?.editable) return;
    const lead = rows[r];
    setDraft(String(lead[col.key] ?? ""));
    setEditing({ r, c });
  }

  function stopEdit(save: boolean, move?: "down" | "right") {
    if (!editing) return;
    const { r, c } = editing;
    if (save) commit(r, c, draft);
    setEditing(null);
    if (move === "down" && r + 1 < rows.length) setFocus({ r: r + 1, c });
    else if (move === "right" && c + 1 < cols.length) setFocus({ r, c: c + 1 });
    else setFocus({ r, c });
    gridRef.current?.focus();
  }

  const gridRef = useRef<HTMLDivElement>(null);

  function onGridKeyDown(e: React.KeyboardEvent) {
    if (editing) return; // the editor input handles its own keys
    if (!focus) {
      if (["ArrowDown", "ArrowRight", "Enter"].includes(e.key)) {
        setFocus({ r: first, c: 0 });
        e.preventDefault();
      }
      return;
    }
    const { r, c } = focus;
    const clamp = (n: number, max: number) => Math.max(0, Math.min(n, max));
    switch (e.key) {
      case "ArrowDown":
        setFocus({ r: clamp(r + 1, rows.length - 1), c });
        e.preventDefault();
        break;
      case "ArrowUp":
        setFocus({ r: clamp(r - 1, rows.length - 1), c });
        e.preventDefault();
        break;
      case "ArrowRight":
        setFocus({ r, c: clamp(c + 1, cols.length - 1) });
        e.preventDefault();
        break;
      case "ArrowLeft":
        setFocus({ r, c: clamp(c - 1, cols.length - 1) });
        e.preventDefault();
        break;
      case "Tab":
        setFocus({ r, c: clamp(c + (e.shiftKey ? -1 : 1), cols.length - 1) });
        e.preventDefault();
        break;
      case "Enter":
        startEdit(r, c);
        e.preventDefault();
        break;
    }
  }

  // Keep the focused row scrolled into view
  useEffect(() => {
    if (!focus || !scrollRef.current) return;
    const el = scrollRef.current;
    const top = focus.r * ROW_H;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (top + ROW_H > el.scrollTop + el.clientHeight) {
      el.scrollTop = top + ROW_H - el.clientHeight;
    }
  }, [focus]);

  function exportCsv() {
    const header = cols.map((c) => csvEscape(c.label)).join(",");
    const lines = rows.map((lead) =>
      cols
        .map((c) =>
          csvEscape(
            c.key === "speedToLeadMinutes"
              ? String(lead.speedToLeadMinutes ?? "")
              : String(lead[c.key] ?? ""),
          ),
        )
        .join(","),
    );
    const blob = new Blob([header + "\n" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const d = new Date();
    a.download = `leads-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <details className="relative">
          <summary className="flex min-h-12 cursor-pointer list-none items-center rounded-control border border-my-line bg-my-surface px-4 font-medium">
            Columns
          </summary>
          <div className="absolute z-30 mt-1 w-56 rounded-card border border-my-line bg-my-surface p-3 shadow-card">
            {COLUMNS.filter((c) => c.key !== "uniqueId").map((c) => (
              <label key={c.key} className="flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  checked={!hidden.has(c.key)}
                  onChange={() => toggleColumn(c.key)}
                  className="h-5 w-5 accent-my-ink"
                />
                <span className="text-sm">{c.label}</span>
              </label>
            ))}
          </div>
        </details>
        <button
          type="button"
          onClick={exportCsv}
          className="min-h-12 rounded-control border border-my-line bg-my-surface px-4 font-medium transition-colors hover:bg-my-paper"
        >
          Export CSV
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-2 rounded-control border border-my-alert/40 bg-my-alert/5 px-4 py-2 text-sm text-my-alert"
        >
          {error}
        </p>
      ) : null}

      <p className="mt-2 text-sm text-my-slate">
        Double-click or press Enter to edit · arrows and Tab to move · Esc
        to cancel
      </p>

      <div
        ref={gridRef}
        tabIndex={0}
        role="grid"
        aria-rowcount={rows.length}
        onKeyDown={onGridKeyDown}
        className="mt-2 rounded-card border border-my-line bg-my-surface shadow-card outline-none focus-visible:ring-2 focus-visible:ring-my-ink"
      >
        <div
          ref={scrollRef}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          className="max-h-[70vh] overflow-auto"
        >
          <table className="w-max min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {cols.map((c, ci) => (
                  <th
                    key={c.key}
                    className={`sticky top-0 z-10 border-b border-my-line bg-my-paper px-3 py-2 text-left font-bold ${c.width} ${
                      ci === 0 ? "left-0 z-20" : ""
                    }`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {first > 0 ? (
                <tr style={{ height: first * ROW_H }} aria-hidden>
                  <td colSpan={cols.length} />
                </tr>
              ) : null}
              {rows.slice(first, last).map((lead, i) => {
                const r = first + i;
                return (
                  <tr key={lead.uniqueId} style={{ height: ROW_H }}>
                    {cols.map((c, ci) => {
                      const isFocus = focus?.r === r && focus?.c === ci;
                      const isEditing = editing?.r === r && editing?.c === ci;
                      const raw =
                        c.key === "speedToLeadMinutes"
                          ? String(lead.speedToLeadMinutes ?? "")
                          : String(lead[c.key] ?? "");
                      return (
                        <td
                          key={c.key}
                          role="gridcell"
                          onClick={() => setFocus({ r, c: ci })}
                          onDoubleClick={() => startEdit(r, ci)}
                          className={`border-b border-my-line px-3 py-0 whitespace-nowrap ${c.width} ${
                            ci === 0
                              ? "sticky left-0 z-10 bg-my-surface font-medium"
                              : ""
                          } ${isFocus ? "outline outline-2 -outline-offset-2 outline-my-ink" : ""} ${
                            c.editable ? "" : "text-my-slate"
                          }`}
                        >
                          {isEditing ? (
                            c.key === "stage" ? (
                              <select
                                autoFocus
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onBlur={() => stopEdit(true)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") stopEdit(true, "down");
                                  if (e.key === "Escape") stopEdit(false);
                                }}
                                className="w-full bg-my-surface py-2 outline-none"
                              >
                                {allowedNextStages(lead.stage).map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                autoFocus
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onBlur={() => stopEdit(true)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") stopEdit(true, "down");
                                  if (e.key === "Tab") {
                                    e.preventDefault();
                                    stopEdit(true, "right");
                                  }
                                  if (e.key === "Escape") stopEdit(false);
                                }}
                                className="w-full bg-my-surface py-2 outline-none"
                              />
                            )
                          ) : ci === 0 ? (
                            <Link
                              href={`/leads/${lead.uniqueId}`}
                              className="underline"
                            >
                              {raw}
                            </Link>
                          ) : (
                            <span className="block overflow-hidden text-ellipsis">
                              {raw}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {last < rows.length ? (
                <tr style={{ height: (rows.length - last) * ROW_H }} aria-hidden>
                  <td colSpan={cols.length} />
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
