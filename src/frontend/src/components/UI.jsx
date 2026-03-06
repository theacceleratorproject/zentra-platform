// components/UI.jsx — Reusable components

export function StatCard({ label, value, sub, accent, icon: Icon, trend }) {
  return (
    <div className="card fade-up" style={{
      padding: '20px 24px',
      borderTop: accent ? `2px solid ${accent}` : '2px solid var(--gold-500)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="label">{label}</span>
        {Icon && (
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} color="var(--slate-300)" />
          </div>
        )}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 26,
        fontWeight: 700,
        color: 'var(--slate-100)',
        lineHeight: 1.2,
        marginTop: 4,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

export function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--slate-100)' }}>
          {title}
        </h2>
        {sub && <p style={{ fontSize: 13, color: 'var(--slate-500)', marginTop: 3 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--slate-500)' }}>
      {Icon && <Icon size={36} style={{ marginBottom: 16, opacity: 0.4 }} />}
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--slate-300)', marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13 }}>{sub}</div>}
    </div>
  )
}

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 20px' }}>
      <div className="spinner" />
      <span style={{ color: 'var(--slate-500)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div className="badge badge-red" style={{ marginBottom: 12 }}>Error</div>
      <div style={{ color: 'var(--slate-300)', fontSize: 13, marginBottom: 16 }}>{message}</div>
      {onRetry && <button className="btn-ghost" onClick={onRetry}>Retry</button>}
    </div>
  )
}

export function PageWrapper({ children }) {
  return (
    <main style={{
      marginLeft: 'var(--sidebar-w)',
      minHeight: '100vh',
      padding: '36px 40px',
      maxWidth: '1400px',
    }}>
      {children}
    </main>
  )
}

export function Grid({ cols = 4, gap = 20, children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
    }}>
      {children}
    </div>
  )
}

export function RunButton({ onClick, loading, label, icon: Icon }) {
  return (
    <button className="btn-primary" onClick={onClick} disabled={loading}
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {loading ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
               : Icon ? <Icon size={14} /> : null}
      {loading ? 'Running...' : label}
    </button>
  )
}
