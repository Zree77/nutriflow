import { useEffect, useState, useCallback } from 'react'
import adminApi from '../adminApi'
import StatusBadge from '../components/StatusBadge'
import Pagination from '../components/Pagination'

// Valid status transitions — exact copy of VALID_TRANSITIONS from orderService.js
const VALID_TRANSITIONS = {
  'Pending':          ['Confirmed', 'Cancelled'],
  'Confirmed':        ['Preparing', 'Cancelled'],
  'Preparing':        ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered'],
  'Delivered':        [],
  'Cancelled':        [],
}

const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']
const ORDER_TYPES = ['order', 'subscription']
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded']

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', ...style }}>
    {children}
  </div>
)

const FilterSelect = ({ label, value, onChange, options, placeholder = 'All' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155', background: '#F8FAFC', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
)

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [filters, setFilters] = useState({ status: '', orderType: '', paymentStatus: '', search: '', startDate: '', endDate: '' })
  const [page, setPage] = useState(1)

  // Status update modal state
  const [updating, setUpdating] = useState(null) // { orderId, currentStatus }
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)

  const fetchOrders = useCallback(async (currentPage = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: currentPage, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const res = await adminApi.get('/orders/admin', { params })
      setOrders(res.data?.data ?? [])
      setPagination(res.data?.pagination ?? { page: 1, pages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchOrders(page)
  }, [fetchOrders, page])

  const applyFilters = (e) => { e.preventDefault(); setPage(1); fetchOrders(1) }

  const openUpdateModal = (order) => {
    setUpdating({ orderId: order._id, currentStatus: order.status })
    setNewStatus('')
    setNote('')
    setUpdateError('')
  }

  const submitStatusUpdate = async () => {
    if (!newStatus) { setUpdateError('Select a target status.'); return }
    setUpdateLoading(true)
    setUpdateError('')
    try {
      await adminApi.put(`/orders/admin/${updating.orderId}/status`, { status: newStatus, note })
      setUpdating(null)
      fetchOrders(page)
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Update failed.')
    } finally {
      setUpdateLoading(false)
    }
  }

  const allowedNext = updating ? (VALID_TRANSITIONS[updating.currentStatus] ?? []) : []

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Orders</h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>Manage and update order statuses</p>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <form onSubmit={applyFilters} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 180px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</label>
            <input placeholder="Name, phone, order #"
              value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <FilterSelect label="Status" value={filters.status} onChange={v => setFilters(f => ({ ...f, status: v }))} options={STATUSES} />
          <FilterSelect label="Order Type" value={filters.orderType} onChange={v => setFilters(f => ({ ...f, orderType: v }))} options={ORDER_TYPES} />
          <FilterSelect label="Payment" value={filters.paymentStatus} onChange={v => setFilters(f => ({ ...f, paymentStatus: v }))} options={PAYMENT_STATUSES} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <button type="submit" style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#10B981', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', height: '36px' }}>
            Apply
          </button>
          <button type="button" onClick={() => { setFilters({ status: '', orderType: '', paymentStatus: '', search: '', startDate: '', endDate: '' }); setPage(1); }}
            style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontWeight: 500, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', height: '36px' }}>
            Clear
          </button>
        </form>
      </Card>

      {/* Table */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
            {pagination.total} Orders
          </h2>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

        {loading ? (
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>Loading…</p>
        ) : orders.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>No orders match your filters.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {['Order', 'Customer', 'Type', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const isTerminal = order.status === 'Delivered' || order.status === 'Cancelled'
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid #F8FAFC' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 12px', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ padding: '12px 12px', color: '#475569' }}>
                        <div>{order.user?.name || order.deliveryAddress?.fullName || '—'}</div>
                        <div style={{ color: '#94A3B8', fontSize: '12px' }}>{order.user?.phone || order.deliveryAddress?.phone || ''}</div>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#475569', textTransform: 'capitalize' }}>{order.orderType}</td>
                      <td style={{ padding: '12px 12px', color: '#475569', textAlign: 'center' }}>{order.items?.length ?? 0}</td>
                      <td style={{ padding: '12px 12px', color: '#0F172A', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ₹{order.totalAmount?.toLocaleString('en-IN') ?? '—'}
                      </td>
                      <td style={{ padding: '12px 12px' }}><StatusBadge status={order.paymentStatus} /></td>
                      <td style={{ padding: '12px 12px' }}><StatusBadge status={order.status} /></td>
                      <td style={{ padding: '12px 12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        {isTerminal ? (
                          <span style={{ color: '#CBD5E1', fontSize: '12px' }}>—</span>
                        ) : (
                          <button onClick={() => openUpdateModal(order)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#334155', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#10B981' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#E2E8F0' }}
                          >
                            Update
                          </button>
                        )}
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

      {/* ── Status Update Modal ── */}
      {updating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
          onClick={e => { if (e.target === e.currentTarget) setUpdating(null) }}
        >
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Update Order Status</h3>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '13px' }}>
              Current: <StatusBadge status={updating.currentStatus} />
            </p>

            {updateError && (
              <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>{updateError}</div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>New Status</label>
              {allowedNext.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>No further transitions available.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {allowedNext.map(s => (
                    <button key={s} onClick={() => setNewStatus(s)}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                        border: newStatus === s ? '2px solid #10B981' : '2px solid #E2E8F0',
                        background: newStatus === s ? '#D1FAE5' : '#F8FAFC',
                        color: newStatus === s ? '#065F46' : '#475569',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Note (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Add an admin note…"
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setUpdating(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={submitStatusUpdate} disabled={updateLoading || !newStatus}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: !newStatus || updateLoading ? '#E2E8F0' : '#10B981', color: !newStatus || updateLoading ? '#94A3B8' : '#fff', fontWeight: 600, fontSize: '14px', cursor: !newStatus || updateLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {updateLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
