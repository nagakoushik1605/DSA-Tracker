import { Plus } from 'lucide-react'
import type { Difficulty, Importance, Topic } from '../data'

export type AdminFormState = {
  title: string
  difficulty: Difficulty
  topicId: string
  subtopicId: string
  importance: Importance
  published: boolean
}

export function AdminProblemForm({
  topics,
  form,
  busy,
  onTitleChange,
  onTopicChange,
  onSubtopicChange,
  onDifficultyChange,
  onImportanceChange,
  onPublishedChange,
  onSubmit,
}: {
  topics: Topic[]
  form: AdminFormState
  busy: boolean
  onTitleChange: (v: string) => void
  onTopicChange: (id: string) => void
  onSubtopicChange: (id: string) => void
  onDifficultyChange: (d: Difficulty) => void
  onImportanceChange: (i: Importance) => void
  onPublishedChange: (v: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  const topic = topics.find(t => t.id === form.topicId) ?? topics[0]

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <label className="admin-form-title">
        Problem title
        <input
          value={form.title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Enter the exact LeetCode problem title"
          required
        />
        <span className="field-hint">The LeetCode link is generated automatically from this title.</span>
      </label>

      <div className="admin-form-grid">
        <label>
          Topic
          <select value={form.topicId} onChange={e => onTopicChange(e.target.value)}>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label>
          Concept
          <select value={form.subtopicId} onChange={e => onSubtopicChange(e.target.value)}>
            {topic.subtopics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label>
          Difficulty
          <select value={form.difficulty} onChange={e => onDifficultyChange(e.target.value as Difficulty)}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </label>
        <label>
          Importance
          <select value={form.importance} onChange={e => onImportanceChange(e.target.value as Importance)}>
            <option>Essential</option>
            <option>Important</option>
            <option>Practice</option>
          </select>
        </label>
      </div>

      <label className="publish-check">
        <input type="checkbox" checked={form.published} onChange={e => onPublishedChange(e.target.checked)} />
        Show this problem to users immediately
      </label>

      <button className="primary-btn add-problem-btn" disabled={busy}>
        <Plus size={16} />{busy ? 'Adding…' : 'Add problem'}
      </button>
    </form>
  )
}
