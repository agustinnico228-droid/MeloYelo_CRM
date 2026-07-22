import "server-only";
import { mockAddLead, mockReassign, mockUpdateLead } from "./mock";
import type {
  AddLeadRequest,
  HubActor,
  HubResult,
  ReassignRequest,
  UpdateLeadRequest,
} from "./types";

export type * from "./types";

/**
 * Server-side client for the HubApi.gs Web App (§10.5). The shared
 * secret comes from Secret Manager / env and never reaches the browser —
 * this module is server-only and every call originates in the Next.js
 * server.
 */

export function isHubApiConfigured(): boolean {
  return Boolean(process.env.HUB_API_URL && process.env.HUB_API_SECRET);
}

function mockAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.SHEETS_ALLOW_MOCK === "1";
}

async function callHubApi(
  action: "updateLead" | "addLead" | "reassign",
  payload: Record<string, unknown>,
  actor: HubActor,
): Promise<HubResult> {
  const res = await fetch(process.env.HUB_API_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Apps Script answers via a 302 to googleusercontent — follow it.
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(35_000),
    body: JSON.stringify({
      secret: process.env.HUB_API_SECRET,
      action,
      actorEmail: actor.email,
      actorName: actor.name,
      ...payload,
    }),
  });

  if (!res.ok) {
    return { ok: false, error: `Hub API HTTP ${res.status}` };
  }

  try {
    return (await res.json()) as HubResult;
  } catch {
    return { ok: false, error: "Hub API returned a non-JSON response" };
  }
}

export async function hubUpdateLead(
  req: UpdateLeadRequest,
  actor: HubActor,
): Promise<HubResult> {
  if (isHubApiConfigured()) {
    return callHubApi("updateLead", { ...req }, actor);
  }
  if (mockAllowed()) return mockUpdateLead(req, actor);
  return { ok: false, error: "Write endpoint is not configured" };
}

export async function hubAddLead(
  req: AddLeadRequest,
  actor: HubActor,
): Promise<HubResult> {
  if (isHubApiConfigured()) {
    return callHubApi("addLead", { ...req, source: "AgentForm" }, actor);
  }
  if (mockAllowed()) return mockAddLead(req, actor);
  return { ok: false, error: "Write endpoint is not configured" };
}

export async function hubReassign(
  req: ReassignRequest,
  actor: HubActor,
): Promise<HubResult> {
  if (isHubApiConfigured()) {
    return callHubApi("reassign", { ...req }, actor);
  }
  if (mockAllowed()) return mockReassign(req, actor);
  return { ok: false, error: "Write endpoint is not configured" };
}
