import { ExternalLink, Search, Trash2 } from 'lucide-react'
import type { Problem, Topic } from '../data'
import { DifficultyBadge } from './DifficultyBadge'

export function AdminProblemTable({
  problems,
  topics,
  search,
  onSearchChange,
  onTogglePublished,
  onDelete,
}: {
  problems: Problem[]
  topics: Topic[]
  search: string
  onSearchChange: (v: string) => void
  onTogglePublished: (p: Problem) => void
  onDelete: (p: Problem) => void
}) {
  const topicName = (id: string) => topics.find(t => t.id === id)?.name ?? id
  const conceptName = (topicId: string, subtopicId: string) =>
    topics.find(t => t.id === topicId)?.subtopics.find(s => s.id === subtopicId)?.name ?? subtopicId

  return (
    <section className="panel admin-panel">
      <div className="admin-section-head">
        <div>
          <h2>Inserted problems</h2>
          <p>Only published problems appear on the student tracker.</p>
        </div>
        <div className="search-box">
          <Search size={15} />
          <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search problems…" />
        </div>
      </div>

      <div className="admin-table">
        <div className="admin-table-head">
          <span>Problem</span>
          <span>Topic</span>
          <span>Concept</span>
          <span>Difficulty</span>
          <span>Published</span>
          <span className="admin-table-head-actions">Actions</span>
        </div>
        <div className="admin-table-body">
          {problems.map(p => (
            <div className="admin-table-row" key={p.id}>
              <div className="admin-row-title">{p.title}</div>
              <div className="admin-row-cell">{topicName(p.topicId)}</div>
              <div className="admin-row-cell">{conceptName(p.topicId, p.subtopicId)}</div>
              <div className="admin-row-cell"><DifficultyBadge difficulty={p.difficulty} /></div>
              <div className="admin-row-cell">
                <button
                  className={`publish-toggle ${p.published === false ? 'hidden-state' : 'published-state'}`}
                  onClick={() => onTogglePublished(p)}
                  title={p.published === false ? 'Publish to students' : 'Hide from students'}
                >
                  {p.published === false ? 'Hidden' : 'Published'}
                </button>
              </div>
              <div className="admin-row-actions">
                <a className="icon-btn" href={p.url} target="_blank" rel="noopener noreferrer" title="Open generated LeetCode link">
                  <ExternalLink size={15} />
                </a>
                <button className="icon-btn danger" onClick={() => onDelete(p)} title="Delete problem">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {!problems.length && <div className="empty-inline">No problems inserted yet.</div>}
        </div>
      </div>
    </section>
  )
}
