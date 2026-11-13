import type { DocStatus } from '../api.ts'

const OFFICER_DOCUMENT_STATUS = {
  PASS: { label: '적합', icon: '✓' },
  NEEDS_REVIEW: { label: '확인필요', icon: '?' },
  FAIL: { label: '부적합', icon: '!' },
} satisfies Record<DocStatus, { label: string; icon: string }>

export default function StatusBadge({
  status,
  compact = false,
}: {
  status: DocStatus
  compact?: boolean
}) {
  const presentation = OFFICER_DOCUMENT_STATUS[status]
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}${compact ? ' status-badge--compact' : ''}`} role="status">
      <span className="status-badge__icon" aria-hidden="true">{presentation.icon}</span>
      <span>{presentation.label}</span>
    </span>
  )
}
