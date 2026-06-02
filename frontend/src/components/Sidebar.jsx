import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Ticket, PlusCircle, LogOut, Menu, X, Headphones } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/tickets',   label: 'All Tickets', icon: Ticket },
  { to: '/tickets/new', label: 'New Ticket', icon: PlusCircle },
]

function getInitials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  function handleLogout() { logout(); navigate('/login') }

  const inner = (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Headphones size={14} color="#fff" />
          </div>
          <div className="sidebar-logo-text">
            <div className="wordmark">Support<span>Desk</span></div>
            <div className="tagline">Customer Support CRM</div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} className="nav-icon" strokeWidth={1.8} />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="sidebar-user-text">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm sidebar-logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={13} />
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* ── Mobile top bar ── */}
      {/* ── Mobile top bar ── */}
<div className="mobile-topbar">
  <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
    <Menu size={20} />
  </button>

  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{
      width: 24, height: 24, borderRadius: 6,
      background: 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Headphones size={12} color="#fff" />
    </div>
    <div className="wordmark" style={{ fontSize: 15 }}>
      Support<span>Desk</span>
    </div>
  </div>

  <div style={{ width: 36 }} />
</div>

      {/* ── Desktop sidebar ── */}
      <div className="sidebar-desktop">{inner}</div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}
      <div className={`sidebar-drawer${mobileOpen ? ' open' : ''}`}>
        <button className="drawer-close-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
        {inner}
      </div>
    </>
  )
}