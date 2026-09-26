/**
 * StatCard — reusable metric card for the admin dashboard overview
 *
 * Props:
 *   title       {string}  — metric label
 *   value       {string|number} — main displayed value
 *   icon        {ReactNode}     — lucide or any icon element
 *   trend       {number}        — positive/negative % change (optional)
 *   trendLabel  {string}        — e.g. "vs last week" (optional)
 *   accentColor {string}        — CSS color for icon bg tint (optional, default emerald)
 */
export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  accentColor = '#10B981',
}) {
  const hasTrend = trend !== undefined && trend !== null
  const positive = hasTrend && trend >= 0

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#64748B', letterSpacing: '0.02em', margin: 0 }}>
          {title}
        </p>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${accentColor}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      <p style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1 }}>
        {value ?? '—'}
      </p>

      {hasTrend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: positive ? '#10B981' : '#EF4444',
              background: positive ? '#10B98115' : '#EF444415',
              padding: '2px 8px',
              borderRadius: '20px',
            }}
          >
            {positive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          {trendLabel && (
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
