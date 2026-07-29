import AnnouncementBanner from "@/components/AnnouncementBanner";
import AppShell from "@/components/AppShell";
import { getActiveAnnouncements, getNavigation } from "@/lib/cms";
import { lexicalToPlainText } from "@/lib/lexical-text";
import { requireEffectiveUser } from "@/lib/view-as";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { effective, viewingAs } = await requireEffectiveUser();
  const [nav, announcements] = await Promise.all([
    getNavigation(effective.role),
    getActiveAnnouncements(effective.role),
  ]);
  return (
    <AppShell user={effective} viewingAs={viewingAs} nav={nav}>
      {/* Site-wide announcements — every page, like the intranet's top strip */}
      {announcements.length > 0 ? (
        <div className="px-4 pt-4 sm:px-6">
          <AnnouncementBanner
            announcements={announcements.map((a) => ({
              id: String(a.id),
              title: a.title,
              bodyText: lexicalToPlainText(a.body),
              severity: a.severity,
            }))}
          />
        </div>
      ) : null}
      {children}
    </AppShell>
  );
}
