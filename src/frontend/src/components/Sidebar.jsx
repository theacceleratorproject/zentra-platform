// components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calculator, ArrowLeftRight,
  FileText, Play, Activity
} from 'lucide-react'

const NAV = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts',      icon: Users,           label: 'Accounts' },
  { to: '/loans',         icon: Calculator,      label: 'Loan Calculator' },
  { to: '/transactions',  icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/reports',       icon: FileText,        label: 'Reports' },
  { to: '/batch',         icon: Play,            label: 'Batch Pipeline' },
]

export default function Sidebar({ apiStatus }) {
  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      background: 'var(--navy-900)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--gold-400)',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}>
          ZENTRA
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '2px',
          color: 'var(--slate-500)',
          textTransform: 'uppercase',
          marginTop: 4,
        }}>
          Banking Platform
        </div>
        <div style={{ marginTop: 12 }} className="gold-line" />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              color: isActive ? 'var(--gold-400)' : 'var(--slate-300)',
              background: isActive ? 'var(--gold-glow)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--gold-500)' : '2px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            <Icon size={15} strokeWidth={isActive => isActive ? 2.5 : 1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* API Status */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Activity size={13} color={apiStatus === 'healthy' ? 'var(--green-400)' : 'var(--red-400)'} />
        <span style={{ fontSize: 11, color: 'var(--slate-500)', fontFamily: 'var(--font-mono)' }}>
          API {apiStatus === 'healthy' ? 'ONLINE' : 'OFFLINE'}
        </span>
        <span className="dot" style={{
          marginLeft: 'auto',
          background: apiStatus === 'healthy' ? 'var(--green-400)' : 'var(--red-400)',
          boxShadow: `0 0 6px ${apiStatus === 'healthy' ? 'var(--green-400)' : 'var(--red-400)'}`,
        }} />
      </div>

      {/* COBOL badge */}
      <div style={{ padding: '12px 20px 20px' }}>
        <div style={{
          background: 'var(--gold-glow)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--gold-400)',
          letterSpacing: '1px',
          textAlign: 'center',
        }}>
          COBOL CORE ENGINE v2.0
        </div>
      </div>
    </aside>
  )
}
