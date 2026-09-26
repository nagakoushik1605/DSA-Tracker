import { FileSpreadsheet, Upload } from 'lucide-react'
import type { Topic } from '../data'

export function AdminProblemForm({
  topics,
  topicId,
  fileName,
  busy,
  onTopicChange,
  onFileChange,
}: {
  topics: Topic[]
  topicId: string
  fileName: string
  busy: boolean
  onTopicChange: (id: string) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="admin-form">
      <div className="excel-upload-head">
        <div>
          <h2>Upload an Excel sheet</h2>
          <p>One upload adds every problem in the sheet to the selected topic.</p>
        </div>
        <div className="excel-icon"><FileSpreadsheet size={22} /></div>
      </div>

      <div className="admin-form-grid excel-upload-grid">
        <label>
          Topic
          <select value={topicId} onChange={e => onTopicChange(e.target.value)} disabled={busy}>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>

        <div className="excel-format-note">
          <span>Excel format</span>
          <strong>.xlsx</strong>
          <small>One sheet · one row per problem</small>
        </div>
      </div>

      <div className="excel-template-box">
        <strong>Required columns:</strong> Title, Concept, Difficulty
        <br />
        <span>Optional: Number, Importance, URL, XP, Published, Tags</span>
        <br />
        <span>Concept must exactly match one of the concepts under the selected topic.</span>
      </div>

      {fileName && <div className="selected-file"><FileSpreadsheet size={15} /> {fileName}</div>}

      <div className="excel-upload-action">
        <label className={`primary-btn upload-label ${busy ? 'disabled' : ''}`}>
          <Upload size={16} />
          {busy ? 'Uploading…' : 'Choose Excel & Upload'}
          <input type="file" accept=".xlsx" onChange={onFileChange} disabled={busy} />
        </label>
      </div>
    </div>
  )
}
