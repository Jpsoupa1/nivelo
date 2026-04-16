import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import type { CashFlowPoint } from '../../types/finance'
import { formatCurrency } from '../../utils/format'

interface CashFlowChartProps {
  data: CashFlowPoint[]
}

function CustomTooltip(props: TooltipProps<number, string> & { payload?: Array<{ dataKey?: string | number; color?: string; value?: number }>; label?: string }) {
  const { active, payload, label } = props
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-muted mb-1 font-medium">{label as string}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="capitalize text-white/60">{entry.dataKey}:</span>
          <span className="font-mono text-white">
            {formatCurrency(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="glass rounded-xl p-4 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted uppercase tracking-wider">
          Cash Flow — 6 Months
        </h3>
        <div className="flex items-center gap-4">
          {[
            { label: 'Income', color: '#3FB950' },
            { label: 'Expenses', color: '#F78166' },
            { label: 'Net', color: '#58A6FF' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              <span className="text-[11px] text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3FB950" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3FB950" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F78166" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F78166" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#58A6FF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

            <XAxis
              dataKey="month"
              tick={{ fill: '#8B949E', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8B949E', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={40}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#3FB950"
              strokeWidth={1.5}
              fill="url(#gradIncome)"
              dot={false}
              activeDot={{ r: 4, fill: '#3FB950' }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#F78166"
              strokeWidth={1.5}
              fill="url(#gradExpenses)"
              dot={false}
              activeDot={{ r: 4, fill: '#F78166' }}
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="#58A6FF"
              strokeWidth={2}
              fill="url(#gradNet)"
              dot={false}
              activeDot={{ r: 4, fill: '#58A6FF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
