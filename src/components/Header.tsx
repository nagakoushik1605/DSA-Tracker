import { Flame, KeyRound, LogOut, Menu, RotateCcw, ShieldCheck } from 'lucide-react'
import { ProgressCard } from './ProgressCard'

export function Header({
  variant,
  onToggleSidebar,
  streak,
  totalXp,
  overallPct,
  onReset,
  onAdmin,
  adminEmail,
  onChangePassword,
  onLogout,
}: {
  variant: 'student' | 'admin'
  onToggleSidebar?: () => void
  streak?: number
  totalXp?: number
  overallPct?: number
  onReset?: () => void
  onAdmin?: () => void
  adminEmail?: string
  onChangePassword?: () => void
  onLogout?: () => void
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {variant === 'student' && onToggleSidebar && (
          <button className="mobile-menu" onClick={onToggleSidebar} aria-label="Toggle topics">
            <Menu size={18} />
          </button>
        )}
        <div className="brand">
          <div className="brand-mark">DSA</div>
          <div>
            <div className="brand-title">{variant === 'admin' ? 'Problem Manager' : 'Progress Tracker'}</div>
            <div className="brand-subtitle">{variant === 'admin' ? 'Administrator only' : 'Solve · Track · Repeat'}</div>
          </div>
        </div>
      </div>

      {variant === 'student' && (
        <div className="topbar-progress">
          <div className="progress-track small"><div className="progress-fill" style={{ width: `${overallPct ?? 0}%` }} /></div>
          <span className="topbar-progress-label">{overallPct ?? 0}% complete</span>
        </div>
      )}

      <div className="top-actions">
        {variant === 'student' ? (
          <>
            <ProgressCard icon={<Flame size={14} />} label="day streak" value={streak ?? 0} tone="warm" />
            <ProgressCard label="XP" value={totalXp ?? 0} tone="accent" />
            <button className="icon-btn" onClick={onReset} title="Reset progress"><RotateCcw size={16} /></button>
            <button className="admin-entry" onClick={onAdmin}><ShieldCheck size={14} /> Admin</button>
          </>
        ) : (
          <>
            <span className="admin-name"><ShieldCheck size={14} /> {adminEmail}</span>
            <button className="icon-btn" onClick={onChangePassword} title="Change password"><KeyRound size={16} /></button>
            <button className="icon-btn" onClick={onLogout} title="Logout"><LogOut size={16} /></button>
          </>
        )}
      </div>
    </header>
  )
}
