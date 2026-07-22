import "server-only";
import type {
  Agent,
  Lead,
  LogEntry,
  PostcodeRoute,
  StageHistoryEntry,
} from "../crm/types";
import { cached, invalidate } from "./cache";
import { batchGetValues, isSheetsConfigured } from "./client";
import { MOCK_TABS } from "./mock-data";
import { pickByAlias, rowsToRecords } from "./mappers";
import { parseLeadRecords, type InvalidRow } from "./schemas";

/**
 * The single read-side access point for CRM data (§13).
 * Whole tabs via batchGet, 60s cache for All data, 10 min for lookups,
 * stale-on-error, zod-validated rows, header-name mapping.
 */

const CORE_TABS = ["All data", "Stage history", "Logs"] as const;
const LOOKUP_TABS = ["Agents", "Postcodes", "Config"] as const;

const CORE_TTL_MS = 60_000;
const LOOKUP_TTL_MS = 600_000;

export type DataSource = "live" | "mock";

/**
 * Mock data is served ONLY when the service account is absent, and never
 * silently in production (explicit SHEETS_ALLOW_MOCK=1 required there).
 */
function useMock(): boolean {
  if (isSheetsConfigured()) return false;
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.SHEETS_ALLOW_MOCK === "1";
}

async function fetchTabs(
  tabs: readonly string[],
): Promise<Record<string, string[][]>> {
  if (useMock()) {
    return Object.fromEntries(tabs.map((t) => [t, MOCK_TABS[t] ?? []]));
  }
  const ranges = tabs.map((t) => `'${t}'`);
  const values = await batchGetValues(ranges);
  return Object.fromEntries(tabs.map((t, i) => [t, values[i] ?? []]));
}

interface CoreData {
  leads: Lead[];
  invalidRows: InvalidRow[];
  stageHistory: StageHistoryEntry[];
  logs: LogEntry[];
}

interface LookupData {
  agents: Agent[];
  postcodes: PostcodeRoute[];
  config: Record<string, string>;
  unmappedAgentHeaders: string[];
}

async function fetchCore(): Promise<CoreData> {
  const tabs = await fetchTabs(CORE_TABS);

  const { records } = rowsToRecords(tabs["All data"]);
  const { leads, invalid } = parseLeadRecords(records);

  const historyRecords = rowsToRecords(tabs["Stage history"]).records;
  const stageHistory: StageHistoryEntry[] = historyRecords
    .filter((r) => (r["Unique ID"] ?? "").trim() !== "")
    .map((r) => ({
      uniqueId: r["Unique ID"] ?? "",
      from: r["From"] ?? "",
      to: r["To"] ?? "",
      changedAt: r["Changed At"] ?? "",
      agent: r["Agent"] ?? "",
    }));

  const logs: LogEntry[] = (tabs["Logs"] ?? [])
    .slice(1)
    .filter((row) => row.some((c) => (c ?? "").trim() !== ""))
    .map((row) => ({ raw: row }));

  return { leads, invalidRows: invalid, stageHistory, logs };
}

async function fetchLookups(): Promise<LookupData> {
  const tabs = await fetchTabs(LOOKUP_TABS);

  const AGENT_ALIASES = {
    name: ["agentname", "name", "agent"],
    notificationEmail: ["notificationemail", "notifyemail"],
    crmEmail: ["crmemail", "agentemail", "email"],
    region: ["region", "area"],
  } as const;

  const agentTab = rowsToRecords(tabs["Agents"]);
  const agents: Agent[] = agentTab.records
    .map((rec) => ({
      name: pickByAlias(rec, AGENT_ALIASES.name),
      notificationEmail:
        pickByAlias(rec, AGENT_ALIASES.notificationEmail) ||
        pickByAlias(rec, ["email"]),
      crmEmail: pickByAlias(rec, AGENT_ALIASES.crmEmail).toLowerCase(),
      region: pickByAlias(rec, AGENT_ALIASES.region),
    }))
    .filter((a) => a.name !== "" || a.crmEmail !== "");

  // Headers the alias map didn't recognise — surfaced on /system so a
  // silently-unmapped Agents column can't go unnoticed.
  const known = Object.values(AGENT_ALIASES).flat() as string[];
  const unmappedAgentHeaders = agentTab.headers.filter(
    (h) => h && !known.includes(h.toLowerCase().replace(/[^a-z0-9]/g, "")),
  );

  const postcodeTab = rowsToRecords(tabs["Postcodes"]);
  const postcodes: PostcodeRoute[] = postcodeTab.records
    .map((rec) => ({
      postcode: pickByAlias(rec, ["postcode", "postcodes"]),
      agentName: pickByAlias(rec, ["agent", "agentname", "name"]),
      agentEmail: pickByAlias(rec, [
        "agentemail",
        "crmemail",
        "email",
      ]).toLowerCase(),
    }))
    .filter((p) => p.postcode !== "");

  // Config is key/value in the first two columns regardless of headers.
  const config: Record<string, string> = {};
  for (const row of (tabs["Config"] ?? []).slice(1)) {
    const key = (row[0] ?? "").trim();
    if (key) config[key] = (row[1] ?? "").trim();
  }

  return { agents, postcodes, config, unmappedAgentHeaders };
}

export interface CoreResult extends CoreData {
  ageMs: number;
  stale: boolean;
  source: DataSource;
}

export async function getCoreData(): Promise<CoreResult> {
  const source: DataSource = useMock() ? "mock" : "live";
  const { value, ageMs, stale } = await cached("core", CORE_TTL_MS, fetchCore);
  return { ...value, ageMs, stale, source };
}

export interface LookupResult extends LookupData {
  ageMs: number;
  stale: boolean;
  source: DataSource;
}

export async function getLookupData(): Promise<LookupResult> {
  const source: DataSource = useMock() ? "mock" : "live";
  const { value, ageMs, stale } = await cached(
    "lookups",
    LOOKUP_TTL_MS,
    fetchLookups,
  );
  return { ...value, ageMs, stale, source };
}

/** After a successful write the user must see their change immediately (§13). */
export function invalidateCoreCache(): void {
  invalidate("core");
}
