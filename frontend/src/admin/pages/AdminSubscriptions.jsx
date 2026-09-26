import { useEffect, useState, useCallback } from 'react'
import adminApi from '../adminApi'
import StatusBadge from '../components/StatusBadge'
import Pagination from '../components/Pagination'

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', ...style }}>
    {children}
  </div>
)

// Backend enum values from subscriptionValidator.js (capitalized)
const SUB_STATUSES = ['Pending Payment', 'Active', 'Paused', 'Cancelled', 'Expired']

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(null) // subId being actioned

  const fetchSubs = useCallback(async (currentPage = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: currentPage, limit: 20, ...(statusFilter ? { status: statusFilter } : {}) }
      const res = await adminApi.get('/subscriptions/admin/all', { params })
      // Response shape: { success, data: { subscriptions: [...], pagination: {...} } }
      setSubs(res.data?.data?.subscriptions ?? [])
      setPagination(res.data?.data?.pagination ?? { page: 1, pages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscriptions.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchSubs(page) }, [fetchSubs, page])

  const handleAction = async (subId, action) => {
    setActionLoading(subId)
    try {
      await adminApi.post(`/subscriptions/admin/${subId}/${action}`)
      fetchSubs(page)
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} subscription.`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Subscriptions</h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>Manage active, paused, and cancelled subscriptions</p>
      </div>

      {/* Filter bar */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Status</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155', background: '#F8FAFC', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="">All</option>
              {SUB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{pagination.total} Subscriptions</h2>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

        {loading ? (
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>Loading…</p>
        ) : subs.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>No subscriptions found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {['Customer', 'Phone', 'Plan', 'Start Date', 'End Date', 'Status', 'Meals Left', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map(sub => {
                  const isLoading = actionLoading === sub._id
                  const canPause = sub.status === 'Active'
                  const canResume = sub.status === 'Paused'
                  return (
                    <tr key={sub._id} style={{ borderBottom: '1px solid #F8FAFC' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 12px', color: '#334155', fontWeight: 600 }}>
                        {sub.user?.name || '—'}
                      </td>
                      <td style={{ padding: '12px 12px', color: '#475569' }}>{sub.user?.phone || '—'}</td>
                      <td style={{ padding: '12px 12px', color: '#475569', textTransform: 'capitalize' }}>
                        {sub.plan?.name || sub.planType || '—'}
                      </td>
                      <td style={{ padding: '12px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '12px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td style={{ padding: '12px 12px', color: '#475569', textAlign: 'center' }}>
                        {sub.remainingMeals ?? sub.mealsRemaining ?? '—'}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {canPause && (
                            <button disabled={isLoading} onClick={() => handleAction(sub._id, 'pause')}
                              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #FEF3C7', background: '#FFFBEB', color: '#92400E', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: isLoading ? 0.6 : 1 }}>
                              {isLoading ? '…' : 'Pause'}
                            </button>
                          )}
                          {canResume && (
                            <button disabled={isLoading} onClick={() => handleAction(sub._id, 'resume')}
                              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #D1FAE5', background: '#ECFDF5', color: '#065F46', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: isLoading ? 0.6 : 1 }}>
                              {isLoading ? '…' : 'Resume'}
                            </button>
                          )}
                          {!canPause && !canResume && <span style={{ color: '#CBD5E1', fontSize: '12px' }}>—</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={pagination.pages} onPageChange={p => setPage(p)} />
      </Card>
    </div>
  )
}
