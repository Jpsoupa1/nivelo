interface StatusDotProps {
  status: 'confirmed' | 'pending' | 'failed'
}

const STATUS_COLORS = {
  confirmed: 'bg-success',
  pending: 'bg-warning',
  failed: 'bg-danger',
} as const

export function StatusDot({ status }: StatusDotProps) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status]}`}
      title={status}
    />
  )
}
