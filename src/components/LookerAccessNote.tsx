/**
 * Phase 17 A2/F1: a Looker permission failure renders inside the
 * cross-origin iframe, where the app cannot intercept it — so this
 * plain explanation always accompanies an embed, and nobody is left
 * staring at a bare Google error box wondering what to do.
 */
export default function LookerAccessNote() {
  return (
    <p className="rounded-control border border-my-line bg-my-paper px-4 py-3 text-sm text-my-slate">
      Seeing <em>&quot;Your current account can&apos;t access this
      report&quot;</em> above? The report hasn&apos;t been shared with your
      Google account — that&apos;s report sharing in Looker Studio, not a
      hub problem. Ask an administrator (crm@meloyelo.nz) to open the
      report → Share → add your email as Viewer. If the report no longer
      exists, ask them to remove this page instead of leaving a broken
      embed.
    </p>
  );
}
