import type { Importance } from '../data'

export function ImportanceBadge({ importance }: { importance?: Importance }) {
  if (!importance) return null
  return <span className={`badge badge-importance imp-${importance.toLowerCase()}`}>{importance}</span>
}
