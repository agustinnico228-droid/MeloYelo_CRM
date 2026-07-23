"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { recordAudit } from "../audit";
import { canReassign } from "../roles";
import { getSessionUser } from "../session";
import { getLookupData } from "../sheets";
import { getViewAs, VIEW_AS_COOKIE } from "../view-as";

export async function startViewAs(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  // Manager/admin only, enforced here — never trust the UI (A5).
  if (!user || user.role === null || !canReassign(user.role)) return;

  const parsed = z.string().trim().email().safeParse(formData.get("agentEmail"));
  if (!parsed.success) return;
  const email = parsed.data.toLowerCase();

  const { agents } = await getLookupData();
  const agent = agents.find((a) => a.crmEmail === email);
  if (!agent) return;

  (await cookies()).set(VIEW_AS_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  await recordAudit([
    {
      actorEmail: user.email,
      action: "viewAs",
      uniqueId: "",
      field: "View as agent",
      oldValue: "",
      newValue: agent.crmEmail,
    },
  ]);

  revalidatePath("/", "layout");
  redirect("/");
}

export async function stopViewAs(): Promise<void> {
  const user = await getSessionUser();
  const viewingAs = user ? await getViewAs(user) : null;

  (await cookies()).delete(VIEW_AS_COOKIE);

  if (user && viewingAs) {
    await recordAudit([
      {
        actorEmail: user.email,
        action: "viewAs",
        uniqueId: "",
        field: "View as agent",
        oldValue: viewingAs.email,
        newValue: "",
      },
    ]);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
