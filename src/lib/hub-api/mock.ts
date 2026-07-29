import "server-only";
import { isForwardMove } from "../crm/stages";
import { parseCrmDate } from "../crm/dates";
import { normalizePostcode } from "../crm/postcode";
import { MOCK_TABS } from "../sheets/mock-data";
import { LEAD_HEADERS } from "../sheets/mappers";
import type {
  AddLeadRequest,
  HubActor,
  HubResult,
  LeadChanges,
  ReassignRequest,
  UpdateLeadRequest,
} from "./types";

/**
 * DEV-ONLY simulator of HubApi.gs, mutating the in-memory mock tabs so
 * writes survive a refresh during development. It mirrors the §10
 * behaviour contract (forward-only stages, append-only notes, first-move
 * speed-to-lead, postcode re-routing) so the UI can be exercised
 * honestly. The real business rules live in Apps Script — this file is
 * never used once HUB_API_URL is configured.
 */

function tab(name: string): string[][] {
  return MOCK_TABS[name];
}

function colIndex(tabName: string, header: string): number {
  return tab(tabName)[0].indexOf(header);
}

function findLeadRow(uniqueId: string): string[] | null {
  const rows = tab("All data");
  const idCol = colIndex("All data", LEAD_HEADERS.uniqueId);
  return (
    rows.slice(1).find((r) => (r[idCol] ?? "").trim() === uniqueId) ?? null
  );
}

function noteStamp(now: Date): string {
  let h = now.getHours() % 12;
  if (h === 0) h = 12;
  const ampm = now.getHours() < 12 ? "am" : "pm";
  const mm = String(now.getMinutes()).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear() % 100).padStart(2, "0");
  return `${h}:${mm}${ampm} ${dd}/${mo}/${yy}`;
}

function stampFull(now: Date): string {
  const dd = String(now.getDate()).padStart(2, "0");
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const time = now.toTimeString().slice(0, 8);
  return `${dd}/${mo}/${now.getFullYear()} ${time}`;
}

function appendLog(message: string): void {
  tab("Logs").push([stampFull(new Date()), "HUB", message]);
}

function set(row: string[], header: string, value: string): void {
  row[colIndex("All data", header)] = value;
}

function get(row: string[], header: string): string {
  return row[colIndex("All data", header)] ?? "";
}

const EDITABLE: Record<keyof LeadChanges, string> = {
  firstName: LEAD_HEADERS.firstName,
  lastName: LEAD_HEADERS.lastName,
  email: LEAD_HEADERS.email,
  phone: LEAD_HEADERS.phone,
  postCode: LEAD_HEADERS.postCode,
  city: LEAD_HEADERS.city,
  model: LEAD_HEADERS.model,
  serial: LEAD_HEADERS.serial,
};

function routeByPostcode(row: string[]): void {
  const wanted = normalizePostcode(get(row, LEAD_HEADERS.postCode));
  if (!wanted) return;
  const pcTab = tab("Postcodes");
  const match = pcTab
    .slice(1)
    .find((r) => normalizePostcode(r[0] ?? "") === wanted);
  if (match) {
    set(row, LEAD_HEADERS.agent, match[1] ?? "");
    set(row, LEAD_HEADERS.agentEmail, (match[2] ?? "").toLowerCase());
  }
}

export async function mockUpdateLead(
  req: UpdateLeadRequest,
  actor: HubActor,
): Promise<HubResult> {
  const row = findLeadRow(req.uniqueId);
  if (!row) return { ok: false, error: "not found" };

  const now = new Date();
  const updated: Record<string, unknown> = {};

  if (req.stageTo) {
    const current = get(row, LEAD_HEADERS.stage);
    if (!isForwardMove(current, req.stageTo)) {
      return {
        ok: false,
        error: `Stage can only move forward. This lead is already at "${current}".`,
      };
    }
    if (req.stageTo !== current) {
      set(row, LEAD_HEADERS.stage, req.stageTo);
      set(row, LEAD_HEADERS.stageUpdatedAt, stampFull(now));
      set(row, LEAD_HEADERS.stageUpdateFrom, current);
      set(row, LEAD_HEADERS.stageUpdateTo, req.stageTo);
      tab("Stage history").push([
        req.uniqueId,
        current,
        req.stageTo,
        stampFull(now),
        actor.name,
      ]);
      updated["Stage"] = req.stageTo;

      if (
        current === "Lead" &&
        get(row, LEAD_HEADERS.speedToLeadMinutes) === ""
      ) {
        const added = parseCrmDate(get(row, LEAD_HEADERS.dateAdded));
        if (added) {
          const mins = Math.round((now.getTime() - added.getTime()) / 60000);
          set(row, LEAD_HEADERS.speedToLeadMinutes, String(mins));
          updated["speed_to_lead_minutes"] = mins;
        }
      }
    }
  }

  if (req.noteText) {
    const existing = get(row, LEAD_HEADERS.notes);
    const entry = `${noteStamp(now)} ${actor.name}: ${req.noteText}`;
    set(row, LEAD_HEADERS.notes, existing ? `${existing}\n${entry}` : entry);
    updated["Notes appended"] = req.noteText;
  }

  let postcodeChanged = false;
  for (const [key, header] of Object.entries(EDITABLE) as [
    keyof LeadChanges,
    string,
  ][]) {
    if (req.changes && key in req.changes) {
      const value = req.changes[key] ?? "";
      if (get(row, header) !== value) {
        set(row, header, value);
        updated[header] = value;
        if (key === "postCode") postcodeChanged = true;
      }
    }
  }

  if (postcodeChanged && get(row, LEAD_HEADERS.agentEmail) === "") {
    routeByPostcode(row);
    updated["Agent"] = get(row, LEAD_HEADERS.agent);
    updated["Agent Email"] = get(row, LEAD_HEADERS.agentEmail);
  }

  appendLog(`updateLead ${req.uniqueId} by ${actor.email}`);
  return { ok: true, row: updated };
}

export async function mockAddLead(
  req: AddLeadRequest,
  actor: HubActor,
): Promise<HubResult> {
  tab("New contact submissions").push([
    stampFull(new Date()),
    req.firstName,
    req.lastName ?? "",
    req.email ?? "",
    req.phone ?? "",
    req.postCode ?? "",
    req.city ?? "",
    req.notes ?? "",
    "AgentForm",
    "",
  ]);

  // Dev has no 5-minute batch — process immediately so the flow can be
  // exercised. The UI still messages the real pending behaviour.
  const all = tab("All data");
  const idCol = colIndex("All data", LEAD_HEADERS.uniqueId);
  const maxId = Math.max(
    10100,
    ...all.slice(1).map((r) => Number(r[idCol]) || 0),
  );
  const row = new Array<string>(all[0].length).fill("");
  set(row, LEAD_HEADERS.uniqueId, String(maxId + 1));
  set(row, LEAD_HEADERS.dateAdded, stampFull(new Date()));
  set(row, LEAD_HEADERS.firstName, req.firstName);
  set(row, LEAD_HEADERS.lastName, req.lastName ?? "");
  set(row, LEAD_HEADERS.email, req.email ?? "");
  set(row, LEAD_HEADERS.phone, req.phone ?? "");
  set(row, LEAD_HEADERS.postCode, req.postCode ?? "");
  set(row, LEAD_HEADERS.city, req.city ?? "");
  set(row, LEAD_HEADERS.stage, "Lead");
  set(row, LEAD_HEADERS.source, "AgentForm");
  if (req.notes) {
    set(
      row,
      LEAD_HEADERS.notes,
      `${noteStamp(new Date())} ${actor.name}: ${req.notes}`,
    );
  }
  routeByPostcode(row);
  all.push(row);

  appendLog(
    `addLead by ${actor.email}: ${req.firstName} ${req.lastName ?? ""}`,
  );
  return { ok: true, pending: true };
}

export async function mockReassign(
  req: ReassignRequest,
  actor: HubActor,
): Promise<HubResult> {
  const row = findLeadRow(req.uniqueId);
  if (!row) return { ok: false, error: "not found" };

  const agents = tab("Agents");
  const target = agents
    .slice(1)
    .find((a) => (a[2] ?? "").toLowerCase() === req.agentEmail.toLowerCase());
  if (!target) return { ok: false, error: "agent not found in Agents tab" };

  const previous = get(row, LEAD_HEADERS.agent) || "unassigned";
  set(row, LEAD_HEADERS.agent, target[0]);
  set(row, LEAD_HEADERS.agentEmail, (target[2] ?? "").toLowerCase());

  const existing = get(row, LEAD_HEADERS.notes);
  const entry = `${noteStamp(new Date())} ${actor.name}: Reassigned from ${previous} to ${target[0]}${req.reason ? ` - ${req.reason}` : ""}`;
  set(row, LEAD_HEADERS.notes, existing ? `${existing}\n${entry}` : entry);

  appendLog(
    `reassign ${req.uniqueId} by ${actor.email}: ${previous} to ${target[0]}`,
  );
  return {
    ok: true,
    row: { Agent: target[0], "Agent Email": (target[2] ?? "").toLowerCase() },
  };
}
