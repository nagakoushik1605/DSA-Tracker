import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, X } from 'lucide-react'
import { topics, type Difficulty, type Problem, type Progress } from './data'
import { addAttempt, markRevision, toggleSolved } from './progress'
import { changePassword, isSupabaseConfigured, listenForAuthChanges, loginAdmin, logoutAdmin, restoreAdminSession, type AppUser } from './auth'
import { createProblem, deleteProblem, fetchProblems, updateProblemPublished } from './api'
import { clearProgress, loadProgress, saveProgress } from './storage'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { TopicProgress } from './components/TopicProgress'
import { ProblemRow } from './components/ProblemRow'
import { AdminProblemForm, type AdminFormState } from './components/AdminProblemForm'
import { AdminProblemTable } from './components/AdminProblemTable'
import './styles.css'

const STATUS_LABELS = { ALL: 'All', NOT_STARTED: 'Not started', ATTEMPTED: 'Attempted', SOLVED: 'Solved', REVISION: 'Revision' } as const
type StatusFilter = keyof typeof STATUS_LABELS

function leetcodeUrl(title: string) {
  const slug = title.trim().toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `https://leetcode.com/problems/${slug}/`
}

function App() {
  const [admin, setAdmin] = useState<AppUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [setupError, setSetupError] = useState('')
  const [adminLoginOpen, setAdminLoginOpen] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false)
      setLoading(false)
      return
    }
    restoreAdminSession().then(setAdmin).catch(() => setAdmin(null)).finally(() => setAuthLoading(false))
    return listenForAuthChanges(setAdmin)
  }, [])

  const refreshProblems = async () => {
    setLoading(true)
    setSetupError('')
    try { setProblems(await fetchProblems()) }
    catch (err) { setSetupError(err instanceof Error ? err.message : 'Could not load problems') }
    finally { setLoading(false) }
  }

  useEffect(() => { refreshProblems() }, [])

  if (authLoading) return <div className="auth-loading">Loading DSA Tracker…</div>
  if (!isSupabaseConfigured()) return <SetupScreen />
  if (admin) return <AdminConsole admin={admin} problems={problems} setProblems={setProblems} onLogout={async () => { await logoutAdmin(); setAdmin(null) }} />
  if (adminLoginOpen) return <AdminLogin onLogin={setAdmin} onBack={() => setAdminLoginOpen(false)} />
  return <PublicTracker problems={problems} loading={loading} setupError={setupError} onAdmin={() => setAdminLoginOpen(true)} onRefresh={refreshProblems} />
}

function SetupScreen() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><div className="brand-mark">DSA</div><div><b>Progress Tracker</b><span>Supabase connection required</span></div></div>
        <div className="eyebrow">Setup required</div>
        <h1>Connect Supabase.</h1>
        <p className="auth-subtitle">Create <code>.env.local</code> in the project root.</p>
        <pre className="setup-code">VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co{`\n`}VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY{`\n`}VITE_ADMIN_EMAIL=admin@example.com</pre>
        <p className="auth-subtitle">Then restart with <code>npm run dev</code>.</p>
      </div>
    </div>
  )
}

function AdminLogin({ onLogin, onBack }: { onLogin: (u: AppUser) => void; onBack: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try { onLogin(await loginAdmin(password)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Admin login failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card admin-login-card">
        <div className="auth-brand"><div className="brand-mark">DSA</div><div><b>Progress Tracker</b><span>Private administrator access</span></div></div>
        <div className="eyebrow">Admin login</div>
        <h1>Administrator.</h1>
        <p className="auth-subtitle">Enter the admin password to manage the problem sheet.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoFocus autoComplete="current-password" />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="primary-btn auth-submit" disabled={busy}>{busy ? 'Checking…' : 'Admin login'}</button>
        </form>
        <button className="text-btn" onClick={onBack}>← Back to tracker</button>
      </div>
    </div>
  )
}

function PublicTracker({ problems, loading, setupError, onAdmin, onRefresh }: {
  problems: Problem[]; loading: boolean; setupError: string; onAdmin: () => void; onRefresh: () => void
}) {
  const [activeTopic, setActiveTopic] = useState('trees')
  const [activeConcept, setActiveConcept] = useState('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | Difficulty>('ALL')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const guestId = 'public-user'
  const [progress, setProgress] = useState<Record<string, Progress>>(() => loadProgress(guestId))

  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2400) }
  const commit = (next: Record<string, Progress>) => { setProgress(next); saveProgress(guestId, next) }

  const solved = useMemo(() => problems.filter(p => progress[p.id]?.status === 'SOLVED'), [problems, progress])
  const totalXp = useMemo(() => solved.reduce((s, p) => s + p.xp, 0), [solved])
  const firstIncomplete = useMemo(() => problems.find(p => progress[p.id]?.status !== 'SOLVED'), [problems, progress])
  const daysWithActivity = useMemo(() => new Set(Object.values(progress).map(p => p.completedAt).filter(Boolean).map(d => new Date(d as string).toDateString())), [progress])
  const streak = useMemo(() => {
    let c = 0
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    while (daysWithActivity.has(d.toDateString())) { c++; d.setDate(d.getDate() - 1) }
    return c
  }, [daysWithActivity])

  const topicProgress = (id: string) => {
    const ps = problems.filter(p => p.topicId === id)
    return { done: ps.filter(p => progress[p.id]?.status === 'SOLVED').length, total: ps.length }
  }

  const topic = topics.find(t => t.id === activeTopic) ?? topics[0]
  const topicProblems = useMemo(() => problems.filter(p => p.topicId === topic.id), [problems, topic])

  const filtered = useMemo(() => topicProblems.filter(p => {
    const q = search.trim().toLowerCase()
    const pr = progress[p.id]
    const matchesSearch = !q || `${p.title} ${p.difficulty}`.toLowerCase().includes(q)
    const matchesConcept = activeConcept === 'all' || p.subtopicId === activeConcept
    const matchesStatus = statusFilter === 'ALL'
      || (statusFilter === 'REVISION' && pr?.revisionRequired)
      || (statusFilter === 'SOLVED' && pr?.status === 'SOLVED')
      || (statusFilter === 'ATTEMPTED' && pr?.status === 'ATTEMPTED')
      || (statusFilter === 'NOT_STARTED' && (!pr || pr.status === 'NOT_STARTED'))
    const matchesDifficulty = difficultyFilter === 'ALL' || p.difficulty === difficultyFilter
    return matchesSearch && matchesConcept && matchesStatus && matchesDifficulty
  }), [topicProblems, search, activeConcept, statusFilter, difficultyFilter, progress])

  const handleToggle = (p: Problem) => {
    const was = progress[p.id]?.status === 'SOLVED'
    const next = toggleSolved(progress, p)
    commit(next)
    if (!was) {
      const n = problems.find(x => next[x.id]?.status !== 'SOLVED')
      showToast(n ? `+${p.xp} XP · Next: ${n.title}` : `+${p.xp} XP · All published problems complete!`)
    }
  }
  const onAttempt = (p: Problem) => { commit(addAttempt(progress, p)); showToast('Attempt recorded') }
  const onRevision = (p: Problem) => { const n = markRevision(progress, p); commit(n); showToast(n[p.id]?.revisionRequired ? 'Added to revision' : 'Revision removed') }
  const reset = () => { if (window.confirm('Reset your progress? This cannot be undone.')) { clearProgress(guestId); setProgress({}); showToast('Progress reset') } }

  const overallPct = problems.length ? Math.round(solved.length / problems.length * 100) : 0
  const currentTopicProgress = topicProgress(topic.id)
  const conceptDone = (subtopicId: string) => topicProblems.filter(p => p.subtopicId === subtopicId && progress[p.id]?.status === 'SOLVED').length
  const conceptTotal = (subtopicId: string) => topicProblems.filter(p => p.subtopicId === subtopicId).length

  return (
    <div className="app-shell">
      <Header
        variant="student"
        onToggleSidebar={() => setSidebarOpen(true)}
        streak={streak}
        totalXp={totalXp}
        overallPct={overallPct}
        onReset={reset}
        onAdmin={onAdmin}
      />
      <div className="layout">
        <Sidebar
          topics={topics}
          activeTopic={activeTopic}
          topicProgress={topicProgress}
          onSelect={id => { setActiveTopic(id); setActiveConcept('all') }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="main">
          {setupError && <div className="auth-error page-error">{setupError}<button className="text-btn" onClick={onRefresh}>Retry</button></div>}

          {loading ? (
            <div className="empty-state"><div className="empty-icon">···</div><p>Loading published problems…</p></div>
          ) : (
            <>
              <TopicProgress name={topic.name} done={currentTopicProgress.done} total={currentTopicProgress.total} />

              {topic.subtopics.length > 0 && (
                <div className="concept-chips">
                  <button className={`chip ${activeConcept === 'all' ? 'active' : ''}`} onClick={() => setActiveConcept('all')}>All concepts</button>
                  {topic.subtopics.map(s => (
                    <button key={s.id} className={`chip ${activeConcept === s.id ? 'active' : ''}`} onClick={() => setActiveConcept(s.id)}>
                      {s.name} <span className="chip-count">{conceptDone(s.id)}/{conceptTotal(s.id)}</span>
                    </button>
                  ))}
                </div>
              )}

              <section className="toolbar">
                <div className="search-box">
                  <Search size={16} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems…" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value as 'ALL' | Difficulty)}>
                  <option value="ALL">All difficulty</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </section>

              {!topicProblems.length ? (
                <div className="empty-state"><div className="empty-icon">✦</div><p>No problems have been published for this topic yet.</p></div>
              ) : !filtered.length ? (
                <div className="empty-state"><div className="empty-icon">✦</div><p>No problems match your filters.</p></div>
              ) : (
                <section className="panel problem-panel">
                  <div className="problem-table-head">
                    <span className="th-status">Status</span>
                    <span className="th-problem">Problem</span>
                    <span className="th-difficulty">Difficulty</span>
                    <span className="th-xp">XP</span>
                    <span className="th-actions">Action</span>
                  </div>
                  <div className="problem-list">
                    {filtered.map(p => (
                      <ProblemRow
                        key={p.id}
                        p={p}
                        concept={topic.subtopics.find(s => s.id === p.subtopicId)?.name}
                        progress={progress[p.id]}
                        isNext={firstIncomplete?.id === p.id}
                        onToggle={handleToggle}
                        onAttempt={onAttempt}
                        onRevision={onRevision}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

function AdminConsole({ admin, problems, setProblems, onLogout }: {
  admin: AppUser; problems: Problem[]; setProblems: React.Dispatch<React.SetStateAction<Problem[]>>; onLogout: () => void
}) {
  const [form, setForm] = useState<AdminFormState>({ title: '', difficulty: 'Easy', topicId: 'trees', subtopicId: 'trees-1', importance: 'Important', published: true })
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const visible = problems.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2400) }

  const updateTopic = (id: string) => {
    const t = topics.find(x => x.id === id) ?? topics[0]
    setForm(f => ({ ...f, topicId: t.id, subtopicId: t.subtopics[0]?.id ?? '' }))
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setBusy(true)
    try {
      const id = `problem-${crypto.randomUUID()}`
      const order = problems.length + 1
      const url = leetcodeUrl(form.title)
      const p: Problem = {
        id, number: `P${order}`, title: form.title.trim(), platform: 'LeetCode', url,
        difficulty: form.difficulty, topicId: form.topicId, subtopicId: form.subtopicId,
        xp: form.difficulty === 'Easy' ? 10 : form.difficulty === 'Medium' ? 20 : 30,
        order, importance: form.importance, source: 'admin', tags: [], published: form.published,
      }
      await createProblem({ ...p, published: form.published })
      setProblems(prev => [...prev, p])
      setForm(f => ({ ...f, title: '' }))
      showToast('Problem added')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not add problem')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (p: Problem) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return
    try {
      await deleteProblem(p.id)
      setProblems(prev => prev.filter(x => x.id !== p.id))
      showToast('Problem deleted')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete problem')
    }
  }

  const togglePublished = (p: Problem) => {
    const next = p.published === false
    updateProblemPublished(p.id, next)
      .then(() => { setProblems(prev => prev.map(x => x.id === p.id ? { ...x, published: next } : x)); showToast(next ? 'Problem published' : 'Problem hidden') })
      .catch(err => showToast(err instanceof Error ? err.message : 'Could not update problem'))
  }

  return (
    <div className="admin-only-page">
      <Header
        variant="admin"
        adminEmail={admin.email}
        onChangePassword={() => setPasswordOpen(true)}
        onLogout={onLogout}
      />
      <main className="admin-main">
        <div className="admin-title">
          <div>
            <div className="eyebrow">Admin · Problem insertion</div>
            <h1>Insert problems.</h1>
            <p>Add problems from your curated DSA problem list.</p>
          </div>
          <div className="admin-count">{problems.length} total</div>
        </div>

        <section className="panel admin-panel">
          <AdminProblemForm
            topics={topics}
            form={form}
            busy={busy}
            onTitleChange={title => setForm(f => ({ ...f, title }))}
            onTopicChange={updateTopic}
            onSubtopicChange={subtopicId => setForm(f => ({ ...f, subtopicId }))}
            onDifficultyChange={difficulty => setForm(f => ({ ...f, difficulty }))}
            onImportanceChange={importance => setForm(f => ({ ...f, importance }))}
            onPublishedChange={published => setForm(f => ({ ...f, published }))}
            onSubmit={add}
          />
        </section>

        <AdminProblemTable
          problems={visible}
          topics={topics}
          search={search}
          onSearchChange={setSearch}
          onTogglePublished={togglePublished}
          onDelete={remove}
        />
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} showToast={showToast} />}
    </div>
  )
}

function ChangePasswordModal({ onClose, showToast }: { onClose: () => void; showToast: (m: string) => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Use at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setBusy(true)
    try { await changePassword(password); showToast('Admin password changed successfully'); onClose() }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not change password') }
    finally { setBusy(false) }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div><div className="eyebrow">Security</div><h2>Change password</h2></div>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label>New password<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required autoFocus /></label>
          <label>Confirm password<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={8} required /></label>
          {error && <div className="auth-error">{error}</div>}
          <button className="primary-btn auth-submit" disabled={busy}>{busy ? 'Changing…' : 'Change password'}</button>
        </form>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
