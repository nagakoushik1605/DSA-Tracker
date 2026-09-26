import { X } from 'lucide-react'
import type { Topic } from '../data'

export function Sidebar({
  topics,
  activeTopic,
  topicProgress,
  onSelect,
  isOpen,
  onClose,
}: {
  topics: Topic[]
  activeTopic: string
  topicProgress: (id: string) => { done: number; total: number }
  onSelect: (id: string) => void
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-mobile-head">
          <span className="sidebar-label">DSA Topics</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close topics"><X size={16} /></button>
        </div>
        <div className="sidebar-label sidebar-label-desktop">DSA Topics</div>
        <nav className="sidebar-nav">
          {topics.map(t => {
            const tp = topicProgress(t.id)
            const pct = tp.total ? Math.round((tp.done / tp.total) * 100) : 0
            const complete = tp.total > 0 && tp.done === tp.total
            return (
              <button
                key={t.id}
                className={`topic-nav ${activeTopic === t.id ? 'active' : ''} ${complete ? 'complete' : ''}`}
                onClick={() => { onSelect(t.id); onClose() }}
              >
                <span className="topic-icon">{t.icon}</span>
                <span className="topic-name">{t.name}</span>
                <span className="topic-nav-progress">
                  <span className="topic-nav-track"><span className="topic-nav-fill" style={{ width: `${pct}%` }} /></span>
                  <span className="topic-count">{tp.total ? `${tp.done}/${tp.total}` : '—'}</span>
                </span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
