import type { DealStage } from '../types'

const stageStyles: Record<DealStage, string> = {
  lead: 'bg-slate-100 text-slate-700',
  qualified: 'bg-sky-100 text-sky-700',
  proposal: 'bg-amber-100 text-amber-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-rose-100 text-rose-700',
}

export default function StageBadge({ stage }: { stage: DealStage }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${stageStyles[stage]}`}
    >
      {stage}
    </span>
  )
}
