import { useEffect, useState } from 'react'
import adminApi from '../adminApi'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

/* ── Page header shared style ────────────────────────────────── */
const PageHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: '28px' }}>
    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{title}</h1>
    {subtitle && <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>{subtitle}</p>}
  </div>
)

const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#fff', borderRadius: '16px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)', ...style,
  }}>
    {children}
  </div>
)

export default function AdminDashboardHome() {
  const [orderStats, setOrderStats] = useState(null)
  const [subStats, setSubStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError('')
      try {
        // Fetch both stat endpoints in parallel
        const [oRes, sRes, rRes] = await Promise.all([
          adminApi.get('/orders/admin/stats'),
          adminApi.get('/subscriptions/admin/statistics'),
          adminApi.get('/orders/admin', { params: { limit: 8, page: 1 } }),
        ])
        setOrderStats(oRes.data?.data ?? {})
        setSubStats(sRes.data?.data ?? {})
        setRecentOrders(rRes.data?.data ?? [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', sans-serif" }}>
      <PageHeader title="Dashboard" subtitle={`Today — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`} />

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#94A3B8', fontSize: '14px' }}>Loading stats…</div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <StatCard
              title="Total Orders"
              value={orderStats?.counts?.total ?? '—'}
              accentColor="#3B82F6"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/></svg>}
            />
            <StatCard
              title="Revenue (₹)"
              value={orderStats?.revenue?.total != null ? `₹${Number(orderStats.revenue.total).toLocaleString('en-IN')}` : '—'}
              accentColor="#10B981"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            />
            <StatCard
              title="Active Subscriptions"
              value={subStats?.overview?.activeSubscriptions ?? '—'}
              accentColor="#8B5CF6"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            />
            <StatCard
              title="Pending Orders"
              value={orderStats?.statusBreakdown?.Pending ?? '—'}
              accentColor="#F59E0B"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            />
            <StatCard
              title="Today's Orders"
              value={orderStats?.counts?.today ?? '—'}
              accentColor="#10B981"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
            />
            <StatCard
              title="Cancelled"
              value={orderStats?.statusBreakdown?.Cancelled ?? '—'}
              accentColor="#EF4444"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
            />
          </div>

          {/* ── Recent Orders Table ── */}
          <Card>
            <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>No orders found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id} style={{ borderBottom: '1px solid #F8FAFC' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 12px', color: '#334155', fontWeight: 600 }}>
                          #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                        </td>
                        <td style={{ padding: '12px 12px', color: '#475569' }}>
                          {order.user?.name || order.deliveryAddress?.fullName || '—'}
                        </td>
                        <td style={{ padding: '12px 12px', color: '#475569' }}>
                          {order.items?.length ?? 0}
                        </td>
                        <td style={{ padding: '12px 12px', color: '#0F172A', fontWeight: 600 }}>
                          ₹{order.totalAmount?.toLocaleString('en-IN') ?? '—'}
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <StatusBadge status={order.paymentStatus} />
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <StatusBadge status={order.status} />
                        </td>
                        <td style={{ padding: '12px 12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
