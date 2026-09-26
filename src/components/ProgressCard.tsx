import type { ReactNode } from 'react'

export function ProgressCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon?: ReactNode
  label: string
  value: string | number
  tone?: 'default' | 'accent' | 'warm'
}) {
  return (
    <div className={`stat-pill stat-pill-${tone}`}>
      {icon && <span className="stat-pill-icon">{icon}</span>}
      <div className="stat-pill-text">
        <span className="stat-pill-value">{value}</span>
        <span className="stat-pill-label">{label}</span>
      </div>
    </div>
  )
}
