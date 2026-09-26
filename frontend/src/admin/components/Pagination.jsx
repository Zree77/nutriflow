/**
 * Pagination — simple numbered pagination bar
 *
 * Props:
 *   page        {number}   — current page (1-indexed)
 *   totalPages  {number}   — total number of pages
 *   onPageChange{function} — called with new page number
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  // Build page number window: always show first, last, current ±1, with ellipsis
  const pages = []
  const delta = 1
  const left = Math.max(2, page - delta)
  const right = Math.min(totalPages - 1, page + delta)

  pages.push(1)
  if (left > 2) pages.push('...')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages - 1) pages.push('...')
  if (totalPages > 1) pages.push(totalPages)

  const btn = (label, target, disabled, isActive = false) => (
    <button
      key={`${label}-${target}`}
      onClick={() => !disabled && typeof target === 'number' && onPageChange(target)}
      disabled={disabled}
      style={{
        minWidth: '34px',
        height: '34px',
        padding: '0 10px',
        borderRadius: '8px',
        border: isActive ? '1.5px solid #10B981' : '1.5px solid #E2E8F0',
        background: isActive ? '#10B981' : disabled ? '#F8FAFC' : '#fff',
        color: isActive ? '#fff' : disabled ? '#CBD5E1' : '#334155',
        fontSize: '13px',
        fontWeight: isActive ? 700 : 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!disabled && !isActive) e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#10B981' }}
      onMouseLeave={e => { if (!disabled && !isActive) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0' } }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '16px 0' }}>
      {btn('←', page - 1, page === 1)}
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`ellipsis-${i}`} style={{ color: '#94A3B8', padding: '0 4px', fontSize: '13px' }}>…</span>
          : btn(p, p, false, p === page)
      )}
      {btn('→', page + 1, page === totalPages)}
    </div>
  )
}
