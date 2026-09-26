import type { Difficulty } from '../data'

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`badge badge-diff diff-${difficulty.toLowerCase()}`}>{difficulty}</span>
}
