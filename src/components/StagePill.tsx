import { stageTone, type StageTone } from "@/lib/crm/stages";

/**
 * Stage pill per the §5 colour progression. Ink text throughout for
 * contrast; the tone lives in the dot and surface. Test Ride Booked is
 * the one full-yellow moment (ink on yellow — never white).
 */

const TONE_CLASSES: Record<StageTone, { pill: string; dot: string }> = {
  slate: { pill: "border-my-slate/30 bg-my-slate/10", dot: "bg-my-slate" },
  blue: { pill: "border-stage-blue/30 bg-stage-blue/10", dot: "bg-stage-blue" },
  alert: { pill: "border-my-alert/30 bg-my-alert/10", dot: "bg-my-alert" },
  yellow: { pill: "border-my-yellow bg-my-yellow", dot: "bg-my-ink" },
  green: { pill: "border-my-green/40 bg-my-green/15", dot: "bg-my-green" },
  deep: { pill: "border-stage-deep/40 bg-stage-deep/15", dot: "bg-stage-deep" },
};

export default function StagePill({ stage }: { stage: string }) {
  const tone = TONE_CLASSES[stageTone(stage)];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-medium text-my-ink ${tone.pill}`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${tone.dot}`} />
      {stage || "No stage"}
    </span>
  );
}
