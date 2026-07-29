import type { Metadata } from "next";
import AddLeadForm from "@/components/AddLeadForm";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Add lead" };
export const dynamic = "force-dynamic";

export default async function NewLeadPage() {
  const user = await requireUser();

  if (user.role === null) {
    return (
      <main className="mx-auto max-w-2xl p-4 sm:p-6">
        <h1 className="text-h3">Add lead</h1>
        <p className="mt-4 rounded-card border border-my-line bg-my-surface p-6 text-my-slate shadow-card">
          Your account doesn&apos;t have a CRM role yet, so it can&apos;t add
          leads. Ask a manager to add you to the Agents list.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="text-h3">Add lead</h1>
      <p className="mt-1 text-sm text-my-slate">
        The lead is routed by postcode and appears in the list within a few
        minutes.
      </p>
      <div className="mt-4">
        <AddLeadForm />
      </div>
    </main>
  );
}
