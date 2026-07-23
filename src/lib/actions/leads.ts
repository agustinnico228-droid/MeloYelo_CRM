"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordAudit, type AuditEntry } from "../audit";
import { canViewLead } from "../crm/access";
import { isForwardMove } from "../crm/stages";
import type { Lead } from "../crm/types";
import { hubReassign, hubUpdateLead } from "../hub-api";
import { allowWrite } from "../rate-limit";
import { canReassign } from "../roles";
import { getSessionUser } from "../session";
import { getCoreData, invalidateCoreCache } from "../sheets";
import { getViewAs } from "../view-as";

/**
 * All writes flow through here: session + role checks, zod validation,
 * rate limit, forward-only guard, HubApi call, audit, cache bust (§10.5,
 * §14). Nothing client-supplied is trusted — the lead is re-read and
 * access re-checked server-side on every call.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const field = z.string().trim().max(300);

const changesSchema = z
  .object({
    firstName: field.optional(),
    lastName: field.optional(),
    email: field.optional(),
    phone: field.optional(),
    postCode: field.optional(),
    city: field.optional(),
    model: field.optional(),
    serial: field.optional(),
  })
  .strict();

const updateSchema = z
  .object({
    uniqueId: z.string().trim().min(1),
    changes: changesSchema.optional(),
    noteText: z.string().trim().max(5000).optional(),
    stageTo: z.string().trim().optional(),
  })
  .strict();

type Guarded =
  | { error: string }
  | { user: { email: string; name: string }; lead: Lead };

async function guard(uniqueId: string): Promise<Guarded> {
  const user = await getSessionUser();
  if (!user || user.role === null) {
    return { error: "You don't have access to change leads." };
  }
  // Read-only while impersonating (A5): a manager must never create
  // audit entries under another person's lens.
  const viewingAs = await getViewAs(user);
  if (viewingAs) {
    return {
      error: `You're viewing as ${viewingAs.name} — read-only. Exit view-as to make changes.`,
    };
  }
  if (!allowWrite(user.email)) {
    return { error: "Too many changes at once — wait a moment and try again." };
  }
  const core = await getCoreData();
  const lead = core.leads.find((l) => l.uniqueId === uniqueId);
  if (!lead || !canViewLead(user, lead)) {
    return { error: "That lead couldn't be found." };
  }
  return { user: { email: user.email, name: user.name }, lead };
}

function bust(uniqueId: string): void {
  invalidateCoreCache();
  revalidatePath("/leads");
  revalidatePath(`/leads/${uniqueId}`);
  revalidatePath("/");
}

const CHANGE_LABELS: Record<keyof z.infer<typeof changesSchema>, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  postCode: "Post Code",
  city: "City",
  model: "Model",
  serial: "Serial",
};

export async function saveLeadChanges(input: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That change didn't look right — nothing was saved." };
  }
  const { uniqueId, changes, noteText, stageTo } = parsed.data;
  if (!changes && !noteText && !stageTo) return { ok: true };

  const g = await guard(uniqueId);
  if ("error" in g) return { ok: false, error: g.error };
  const { user, lead } = g;

  // Forward-only, checked here as well as in Apps Script (hard rule 3).
  if (stageTo && !isForwardMove(lead.stage, stageTo)) {
    return {
      ok: false,
      error: `Stage can only move forward — this lead is already at "${lead.stage}".`,
    };
  }

  const result = await hubUpdateLead(
    { uniqueId, changes, noteText, stageTo },
    user,
  );
  if (!result.ok) {
    return { ok: false, error: result.error ?? "The change didn't save. Try again." };
  }

  const audits: Omit<AuditEntry, "timestamp">[] = [];
  if (stageTo && stageTo !== lead.stage) {
    audits.push({
      actorEmail: user.email,
      action: "updateLead",
      uniqueId,
      field: "Stage",
      oldValue: lead.stage,
      newValue: stageTo,
    });
  }
  if (noteText) {
    audits.push({
      actorEmail: user.email,
      action: "updateLead",
      uniqueId,
      field: "Notes",
      oldValue: "(appended)",
      newValue: noteText,
    });
  }
  for (const [key, label] of Object.entries(CHANGE_LABELS) as [
    keyof typeof CHANGE_LABELS,
    string,
  ][]) {
    if (changes && key in changes && changes[key] !== undefined) {
      const oldValue = lead[key];
      if (oldValue !== changes[key]) {
        audits.push({
          actorEmail: user.email,
          action: "updateLead",
          uniqueId,
          field: label,
          oldValue,
          newValue: changes[key],
        });
      }
    }
  }
  await recordAudit(audits);

  bust(uniqueId);
  return { ok: true };
}

const reassignSchema = z
  .object({
    uniqueId: z.string().trim().min(1),
    agentEmail: z.string().trim().email(),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export async function reassignLead(input: unknown): Promise<ActionResult> {
  const user = await getSessionUser();
  // Manager role enforced server-side (§10.4), never just in the UI.
  if (!user || user.role === null || !canReassign(user.role)) {
    return { ok: false, error: "Only managers can reassign leads." };
  }
  const parsed = reassignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That reassignment didn't look right." };
  }
  const viewingAs = await getViewAs(user);
  if (viewingAs) {
    return {
      ok: false,
      error: `You're viewing as ${viewingAs.name} — read-only. Exit view-as to make changes.`,
    };
  }
  if (!allowWrite(user.email)) {
    return { ok: false, error: "Too many changes at once — wait a moment and try again." };
  }

  const core = await getCoreData();
  const lead = core.leads.find((l) => l.uniqueId === parsed.data.uniqueId);
  if (!lead) return { ok: false, error: "That lead couldn't be found." };

  const result = await hubReassign(parsed.data, {
    email: user.email,
    name: user.name,
  });
  if (!result.ok) {
    return { ok: false, error: result.error ?? "The reassignment didn't save." };
  }

  await recordAudit([
    {
      actorEmail: user.email,
      action: "reassign",
      uniqueId: lead.uniqueId,
      field: "Agent Email",
      oldValue: lead.agentEmail,
      newValue: parsed.data.agentEmail.toLowerCase(),
    },
  ]);

  bust(lead.uniqueId);
  return { ok: true };
}
