import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav style={{
      background: 'rgba(250, 249, 247, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="white" strokeWidth="1.5"/>
              <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            ExpertConnect
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavLink to="/" active={pathname === '/'}>Experts</NavLink>
          <NavLink to="/my-bookings" active={pathname === '/my-bookings'}>My bookings</NavLink>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 14,
        fontWeight: 500,
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-light)' : 'transparent',
        transition: 'all var(--transition)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-elevated)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
    >
      {children}
    </Link>
  )
}
