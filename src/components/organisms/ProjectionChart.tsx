import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Transaction, RecurringTransaction } from '../../types/finance'
import { formatCurrency } from '../../utils/format'

interface ProjectionChartProps {
  balance: number
  transactions: Transaction[]
  recurrings: RecurringTransaction[]
}

interface ProjectionPoint {
  month: string
  projected: number
  type: 'historical' | 'future'
}

function buildProjection(
  balance: number,
  transactions: Transaction[],
  recurrings: RecurringTransaction[],
): ProjectionPoint[] {
  const now = new Date()
  const points: ProjectionPoint[] = []

  // Historical: last 3 months average net
  const historyMonths: number[] = []
  for (let i = 3; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const monthTxs = transactions.filter((tx) => {
      const td = new Date(tx.date)
      return td.getMonth() + 1 === m && td.getFullYear() === y
    })
    const net = monthTxs.reduce((s, tx) => s + tx.amount, 0)
    historyMonths.push(net)
  }
  const avgNet = historyMonths.length > 0
    ? historyMonths.reduce((a, b) => a + b, 0) / historyMonths.length
    : 0

  // Monthly recurring net
  const recurringNet = recurrings
    .filter((r) => r.active)
    .reduce((s, r) => s + r.amount, 0)

  // Current month as base
  points.push({
    month: now.toLocaleString('en-US', { month: 'short' }),
    projected: balance,
    type: 'historical',
  })

  // Project 3 months ahead
  let runningBalance = balance
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthlyChange = recurringNet !== 0 ? recurringNet : avgNet
    runningBalance += monthlyChange
    points.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      projected: Math.round(runningBalance * 100) / 100,
      type: 'future',
    })
  }

  return points
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const isFuture = payload[0]?.payload?.type === 'future'
  return (
    <div className="bg-[#161B22] border border-white/[0.08] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted mb-0.5">{label} {isFuture ? '(projected)' : ''}</p>
      <p className="font-mono font-semibold text-white">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export function ProjectionChart({ balance, transactions, recurrings }: ProjectionChartProps) {
  const data = buildProjection(balance, transactions, recurrings)
  const max = Math.max(...data.map((d) => d.projected))
  const min = Math.min(...data.map((d) => d.projected))

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted uppercase tracking-wider">Balance Projection</h3>
        <span className="text-[10px] text-muted/50">3-month forecast</span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#58A6FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#58A6FF" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fill: '#8B949E', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[min * 0.95, max * 1.05]}
              tick={{ fill: '#8B949E', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(Math.round(v))}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#58A6FF"
              strokeWidth={2}
              fill="url(#projGrad)"
              strokeDasharray="0"
              dot={(props: any) => {
                const isFuture = props.payload?.type === 'future'
                return (
                  <circle
                    key={props.key}
                    cx={props.cx}
                    cy={props.cy}
                    r={3}
                    fill={isFuture ? 'transparent' : '#58A6FF'}
                    stroke="#58A6FF"
                    strokeWidth={isFuture ? 1.5 : 0}
                    strokeDasharray={isFuture ? '3 2' : '0'}
                  />
                )
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
