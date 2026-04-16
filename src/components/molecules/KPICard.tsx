import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { CurrencyDisplay } from '../atoms/CurrencyDisplay'

interface KPICardProps {
  title: string
  value: number
  subtitle?: string
  icon: ReactNode
  trend?: number // positive = up, negative = down
  isLoading?: boolean
  accentColor?: string
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  isLoading = false,
  accentColor = '#58A6FF',
}: KPICardProps) {
  const trendPositive = trend !== undefined && trend >= 0

  return (
    <motion.div
      className="glass rounded-xl p-4 flex flex-col gap-3 min-h-[120px]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {isLoading && (
        <div className="absolute inset-0 rounded-xl shimmer pointer-events-none" />
      )}

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">
          {title}
        </span>
        <span style={{ color: accentColor }} className="opacity-60">
          {icon}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <CurrencyDisplay
          value={value}
          className="text-2xl font-semibold text-white"
          animate={!isLoading}
        />

        {(subtitle || trend !== undefined) && (
          <div className="flex items-center gap-2">
            {subtitle && (
              <span className="text-xs text-muted">{subtitle}</span>
            )}
            {trend !== undefined && (
              <span
                className={`text-xs font-medium ${
                  trendPositive ? 'text-success' : 'text-danger'
                }`}
              >
                {trendPositive ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
