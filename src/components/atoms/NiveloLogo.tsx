interface NiveloLogoProps {
  size?: number
}

export function NiveloLogoIcon({ size = 28 }: NiveloLogoProps) {
  const w = size
  const h = size
  const barW = w * 0.22
  const gap = w * 0.08
  const r = barW * 0.3

  const bar1H = h * 0.42
  const bar2H = h * 0.65
  const bar3H = h * 1.0

  const totalW = barW * 3 + gap * 2
  const offsetX = (w - totalW) / 2

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {/* Bar 1 — short, muted */}
      <rect
        x={offsetX}
        y={h - bar1H}
        width={barW}
        height={bar1H}
        rx={r}
        fill="currentColor"
        opacity={0.35}
      />
      {/* Bar 2 — medium, muted */}
      <rect
        x={offsetX + barW + gap}
        y={h - bar2H}
        width={barW}
        height={bar2H}
        rx={r}
        fill="currentColor"
        opacity={0.55}
      />
      {/* Bar 3 — tall, accent blue */}
      <rect
        x={offsetX + (barW + gap) * 2}
        y={h - bar3H}
        width={barW}
        height={bar3H}
        rx={r}
        fill="#58A6FF"
      />
    </svg>
  )
}
