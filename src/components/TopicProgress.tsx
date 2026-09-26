export function TopicProgress({
  name,
  done,
  total,
}: {
  name: string
  done: number
  total: number
}) {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div className="topic-progress">
      <div className="topic-progress-head">
        <div className="topic-progress-name">{name}</div>
        <div className="topic-progress-stats">
          <span className="topic-progress-pct">{pct}%</span>
          <span className="topic-progress-count">{done} / {total} solved</span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
