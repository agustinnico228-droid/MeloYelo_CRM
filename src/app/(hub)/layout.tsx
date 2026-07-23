import AppShell from "@/components/AppShell";
import { getNavigation } from "@/lib/cms";
import { requireEffectiveUser } from "@/lib/view-as";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { effective, viewingAs } = await requireEffectiveUser();
  const nav = await getNavigation(effective.role);
  return (
    <AppShell user={effective} viewingAs={viewingAs} nav={nav}>
      {children}
    </AppShell>
  );
}
