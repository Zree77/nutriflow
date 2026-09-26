/**
 * StatusBadge — pill badge that maps order/subscription status to a color
 *
 * Order statuses:    Pending | Confirmed | Preparing | Out for Delivery | Delivered | Cancelled
 * Subscription:      active  | paused    | cancelled  | expired
 */

const STATUS_MAP = {
  // Order statuses (from VALID_ORDER_STATUSES in orderService.js)
  Pending:           { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  Confirmed:         { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  Preparing:         { bg: '#FFEDD5', color: '#9A3412', dot: '#F97316' },
  'Out for Delivery':{ bg: '#EDE9FE', color: '#5B21B6', dot: '#8B5CF6' },
  Delivered:         { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  Cancelled:         { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  // Subscription statuses — capitalized values from backend enum
  // (subscriptionValidator.js: 'Pending Payment' | 'Active' | 'Paused' | 'Cancelled' | 'Expired')
  'Pending Payment': { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  Active:            { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  Paused:            { bg: '#FEF9C3', color: '#854D0E', dot: '#EAB308' },
  Expired:           { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' },
  // Lowercase aliases kept for any legacy usage
  active:            { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  paused:            { bg: '#FEF9C3', color: '#854D0E', dot: '#EAB308' },
  cancelled:         { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  expired:           { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' },
  // Payment statuses
  Paid:              { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  Refunded:          { bg: '#EDE9FE', color: '#5B21B6', dot: '#8B5CF6' },
  Failed:            { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  // Subscription payment
  Success:           { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
}

export default function StatusBadge({ status }) {
  const style = STATUS_MAP[status] ?? { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: style.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  )
}
