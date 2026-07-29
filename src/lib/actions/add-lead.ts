"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordAudit } from "../audit";
import { normalizePostcode } from "../crm/postcode";
import { hubAddLead } from "../hub-api";
import { allowWrite } from "../rate-limit";
import { getSessionUser } from "../session";
import { getLookupData, invalidateCoreCache } from "../sheets";
import { getViewAs } from "../view-as";
import type { ActionResult } from "./leads";

const addLeadSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is needed").max(200),
    lastName: z.string().trim().max(200).optional(),
    email: z
      .string()
      .trim()
      .email("That email doesn't look right")
      .max(320)
      .or(z.literal("")),
    phone: z.string().trim().max(50).optional(),
    postCode: z
      .string()
      .trim()
      .regex(/^\d{0,4}$/, "Postcodes are 4 digits")
      .optional(),
    city: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(5000).optional(),
  })
  .strict();

export async function addLead(input: unknown): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || user.role === null) {
    return { ok: false, error: "You don't have access to add leads." };
  }
  const viewingAs = await getViewAs(user);
  if (viewingAs) {
    return {
      ok: false,
      error: `You're viewing as ${viewingAs.name}. Read-only. Exit view-as to make changes.`,
    };
  }
  const parsed = addLeadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the highlighted fields.",
    };
  }
  const data = parsed.data;
  if (!data.email && !data.phone?.trim()) {
    return {
      ok: false,
      error: "Add a phone number or an email so the lead can be contacted.",
    };
  }
  if (!allowWrite(user.email)) {
    return {
      ok: false,
      error: "Too many changes at once. Wait a moment and try again.",
    };
  }

  const result = await hubAddLead(
    {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone,
      postCode: data.postCode,
      city: data.city,
      notes: data.notes,
    },
    { email: user.email, name: user.name },
  );
  if (!result.ok) {
    return {
      ok: false,
      error: result.error ?? "The lead didn't save. Try again.",
    };
  }

  await recordAudit([
    {
      actorEmail: user.email,
      action: "addLead",
      uniqueId: "(pending)",
      field: "New lead",
      oldValue: "",
      newValue: `${data.firstName} ${data.lastName ?? ""}`.trim(),
    },
  ]);

  invalidateCoreCache();
  revalidatePath("/leads");
  return { ok: true };
}

export interface RoutingPreview {
  agentName: string;
  region: string;
}

/** Live "who will this route to" lookup for the add-lead form (§11). */
export async function previewPostcodeRouting(
  postcode: string,
): Promise<RoutingPreview | null> {
  const user = await getSessionUser();
  if (!user || user.role === null) return null;

  const wanted = normalizePostcode(postcode);
  if (wanted === "" || postcode.trim().length < 4) return null;

  const { postcodes, agents } = await getLookupData();
  const route = postcodes.find((p) => normalizePostcode(p.postcode) === wanted);
  if (!route) return null;

  const agent = agents.find(
    (a) => a.crmEmail === route.agentEmail || a.name === route.agentName,
  );
  return {
    agentName: route.agentName || agent?.name || "",
    region: agent?.region ?? "",
  };
}
