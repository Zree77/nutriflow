import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import AdminDashboardHome from '../pages/AdminDashboardHome'
import AdminOrders from '../pages/AdminOrders'
import AdminSubscriptions from '../pages/AdminSubscriptions'
import AdminMenu from '../pages/AdminMenu'
import AdminCustomers from '../pages/AdminCustomers'

/* ── Icons (inline SVG so no extra dep) ───────────────────────── */
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const NAV_ITEMS = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    icon: <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />,
  },
  {
    to: '/admin/subscriptions',
    label: 'Subscriptions',
    icon: <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6v6l4 2" />,
  },
  {
    to: '/admin/menu',
    label: 'Menu',
    icon: <Icon d="M3 12h18 M3 6h18 M3 18h18" />,
  },
  {
    to: '/admin/customers',
    label: 'Customers',
    icon: <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z M16 3.13a4 4 0 0 1 0 7.75" />,
  },
]

/* ── Sidebar nav link styles ──────────────────────────────────── */
const navLinkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '11px 16px',
  borderRadius: '10px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: isActive ? 600 : 500,
  color: isActive ? '#10B981' : 'rgba(255,255,255,0.58)',
  background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
  borderLeft: isActive ? '3px solid #10B981' : '3px solid transparent',
  transition: 'all 0.18s',
  marginBottom: '2px',
  cursor: 'pointer',
})

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('nutriflow_admin_token')
    // Full page reload forces AdminApp's useState initializer to re-run → shows login
    window.location.replace('/admin')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F8FAFC' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: '240px',
        flexShrink: 0,
        background: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px 28px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, color: '#F8FAFC', fontSize: '15px', fontWeight: 700, lineHeight: 1.2 }}>NutriFlow</p>
            <p style={{ margin: 0, color: '#10B981', fontSize: '11px', fontWeight: 500 }}>Admin Portal</p>
          </div>
        </div>

        {/* Nav section label */}
        <p style={{ color: '#334155', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>
          Main Menu
        </p>

        {/* Nav links — NavLink isActive drives styling, no useState */}
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} style={navLinkStyle}
              onMouseEnter={e => { if (!e.currentTarget.style.background.includes('0.12')) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' } }}
              onMouseLeave={e => { /* re-apply via NavLink's own style fn on next render */ }}
            >
              {({ isActive }) => (
                <>
                  <span style={{ opacity: isActive ? 1 : 0.75, flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '11px 16px', borderRadius: '10px', border: 'none',
            background: 'rgba(239,68,68,0.08)', color: 'rgba(252,165,165,0.85)',
            fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.18s', fontFamily: 'inherit', width: '100%',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#FCA5A5' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgba(252,165,165,0.85)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* ── Main content area ───────────────────────────────── */}
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', background: '#F8FAFC' }}>
        <Routes>
          {/* /admin root → redirect to dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard"     element={<AdminDashboardHome />} />
          <Route path="/admin/orders"        element={<AdminOrders />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/menu"          element={<AdminMenu />} />
          <Route path="/admin/customers"     element={<AdminCustomers />} />
          {/* Catch-all within /admin */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
