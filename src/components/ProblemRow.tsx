import { Check, CircleHelp, ExternalLink, RotateCcw } from 'lucide-react'
import type { Problem, Progress } from '../data'
import { DifficultyBadge } from './DifficultyBadge'
import { ImportanceBadge } from './ImportanceBadge'

export function ProblemRow({
  p,
  concept,
  progress,
  isNext,
  onToggle,
  onAttempt,
  onRevision,
}: {
  p: Problem
  concept?: string
  progress?: Progress
  isNext: boolean
  onToggle: (p: Problem) => void
  onAttempt: (p: Problem) => void
  onRevision: (p: Problem) => void
}) {
  const solved = progress?.status === 'SOLVED'
  return (
    <div className={`problem-row ${solved ? 'completed' : ''} ${isNext ? 'next' : ''}`}>
      <button
        className={`check ${solved ? 'checked' : ''}`}
        onClick={() => onToggle(p)}
        aria-label={`${solved ? 'Mark incomplete' : 'Mark complete'}: ${p.title}`}
      >
        {solved ? <Check size={14} /> : null}
      </button>

      <div className="cell-problem">
        <div className="problem-title-line">
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="problem-title" title="Open on LeetCode">
            {p.title}
          </a>
          {isNext && <span className="next-badge">Next</span>}
        </div>
        <div className="problem-meta-row">
          {concept && <span className="concept-tag">{concept}</span>}
          <ImportanceBadge importance={p.importance} />
          {progress?.revisionRequired && <span className="badge badge-revision">Revision</span>}
          {progress?.attempts ? (
            <span className="meta-note">{progress.attempts} attempt{progress.attempts === 1 ? '' : 's'}</span>
          ) : null}
        </div>
      </div>

      <div className="cell-difficulty"><DifficultyBadge difficulty={p.difficulty} /></div>
      <div className="cell-xp">+{p.xp} XP</div>

      <div className="cell-actions">
        <button className="icon-btn" onClick={() => onAttempt(p)} title="Record an attempt"><CircleHelp size={16} /></button>
        <button
          className={`icon-btn ${progress?.revisionRequired ? 'active' : ''}`}
          onClick={() => onRevision(p)}
          title="Toggle revision"
        >
          <RotateCcw size={16} />
        </button>
        <a className="leetcode-link" href={p.url} target="_blank" rel="noopener noreferrer">
          LeetCode <ExternalLink size={13} />
        </a>
      </div>
    </div>
  )
}
