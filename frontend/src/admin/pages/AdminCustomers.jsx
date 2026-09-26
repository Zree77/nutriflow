import { useEffect, useState, useCallback } from 'react'
import adminApi from '../adminApi'
import StatusBadge from '../components/StatusBadge'
import Pagination from '../components/Pagination'

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', ...style }}>
    {children}
  </div>
)

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  // detail = array of subscription history objects (each has .user, .plan, .status, dates)
  // detail[0] = most recent subscription
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const fetchCustomers = useCallback(async (currentPage = 1) => {
    setLoading(true)
    setError('')
    try {
      // Response shape: { success, data: { subscribers: [...], pagination: {...} } }
      const res = await adminApi.get('/subscriptions/admin/active-subscribers', {
        params: { page: currentPage, limit: 20 },
      })
      setCustomers(res.data?.data?.subscribers ?? [])
      setPagination(res.data?.data?.pagination ?? { page: 1, pages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCustomers(page) }, [fetchCustomers, page])

  const openDetail = async (userId) => {
    setDetail(null)
    setDetailError('')
    setDetailLoading(true)
    try {
      // Response shape: { success, data: [...] }
      // data is a plain array of subscription history, most recent first
      // Each item has: .user (populated), .plan (populated), .status, .startDate, .endDate
      const res = await adminApi.get(`/subscriptions/admin/customer/${userId}`)
      const arr = res.data?.data
      if (!Array.isArray(arr) || arr.length === 0) {
        setDetailError('No subscription history found for this customer.')
      } else {
        setDetail(arr)
      }
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Could not load customer details.')
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => { setDetail(null); setDetailError('') }

  // The current (most recent) subscription
  const current = detail?.[0] ?? null
  // Past subscriptions (all except the first, which is already shown as "current")
  const history = detail?.slice(1) ?? []

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Customers</h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>Active subscribers and their subscription details</p>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px' }}>{error}</div>
      )}

      <Card>
        <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
          {pagination.total} Active Subscribers
        </h2>

        {loading ? (
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>Loading…</p>
        ) : customers.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>No active subscribers found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {['Name', 'Phone', 'Plan', 'Status', 'Start Date', 'End Date', 'Details'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(sub => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid #F8FAFC' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 12px', color: '#334155', fontWeight: 600 }}>
                      {sub.user?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 12px', color: '#475569' }}>{sub.user?.phone || '—'}</td>
                    <td style={{ padding: '12px 12px', color: '#475569' }}>
                      {sub.plan?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td style={{ padding: '12px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <button
                        onClick={() => openDetail(sub.user?._id)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#334155', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#10B981' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#E2E8F0' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={pagination.pages} onPageChange={p => setPage(p)} />
      </Card>

      {/* ── Customer Detail Modal ── */}
      {(detailLoading || detail || detailError) && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
          onClick={e => { if (e.target === e.currentTarget) closeDetail() }}
        >
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Customer Details</h3>
              <button onClick={closeDetail}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
            </div>

            {detailLoading && <p style={{ color: '#94A3B8', fontSize: '14px' }}>Loading customer details…</p>}

            {detailError && (
              <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>{detailError}</div>
            )}

            {detail && !detailLoading && current && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* ── Account info (from detail[0].user) ── */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#334155' }}>Account</h4>
                  {[
                    ['Name', current.user?.name],
                    ['Phone', current.user?.phone],
                    ['Email', current.user?.email || '—'],
                    ['Member Since', current.user?.createdAt
                      ? new Date(current.user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: '#94A3B8', fontWeight: 500 }}>{label}</span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{val || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* ── Current / Most Recent Subscription (detail[0]) ── */}
                <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '16px', border: '1px solid #BBF7D0' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#065F46' }}>
                    Current Subscription
                  </h4>
                  {[
                    ['Plan', current.plan?.name],
                    ['Status', null],
                    ['Start', current.startDate ? new Date(current.startDate).toLocaleDateString('en-IN') : '—'],
                    ['End', current.endDate ? new Date(current.endDate).toLocaleDateString('en-IN') : '—'],
                    ['Payment', current.paymentStatus],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: '#065F46', fontWeight: 500 }}>{label}</span>
                      {label === 'Status'
                        ? <StatusBadge status={current.status} />
                        : <span style={{ color: '#0F172A', fontWeight: 600 }}>{val || '—'}</span>
                      }
                    </div>
                  ))}
                </div>

                {/* ── Subscription History (detail[1..]) ── */}
                {history.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                      Past Subscriptions ({history.length})
                    </h4>
                    {history.map((sub, i) => (
                      <div key={sub._id || i} style={{
                        padding: '12px', borderRadius: '10px', background: '#F8FAFC',
                        marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
                      }}>
                        <div>
                          <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '13px', color: '#334155' }}>
                            {sub.plan?.name || 'Unknown Plan'}
                          </p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                            {sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            {' → '}
                            {sub.endDate ? new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </p>
                        </div>
                        <StatusBadge status={sub.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
