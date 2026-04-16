interface BadgeProps {
  label: string
  color?: string
}

export function Badge({ label, color = '#8B949E' }: BadgeProps) {
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  )
}
