import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, TrendingDown } from 'lucide-react'
import type { Allocation, Language } from '../../types/finance'
import { formatCurrency } from '../../utils/format'

interface BudgetAlertsProps {
  allocations: Allocation[]
  lang: Language
}

const WARN_THRESHOLD = 0.8  // 80%
const DANGER_THRESHOLD = 1.0 // 100%

export function BudgetAlerts({ allocations, lang }: BudgetAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const alerts = allocations
    .filter((a) => {
      if (a.category.budgeted === 0) return false
      const pct = a.spent / a.category.budgeted
      return pct >= WARN_THRESHOLD && !dismissed.has(a.category.id)
    })
    .map((a) => {
      const pct = a.spent / a.category.budgeted
      const isOver = pct >= DANGER_THRESHOLD
      return { ...a, pct, isOver }
    })
    .sort((a, b) => b.pct - a.pct)

  if (alerts.length === 0) return null

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
  }

  return (
    <motion.div
      className="flex flex-col gap-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence initial={false}>
        {alerts.map((alert) => {
          const remaining = alert.category.budgeted - alert.spent
          const pctDisplay = Math.round(alert.pct * 100)

          return (
            <motion.div
              key={alert.category.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs ${
                alert.isOver
                  ? 'bg-red-500/[0.08] border-red-500/20 text-red-300'
                  : 'bg-yellow-500/[0.08] border-yellow-500/20 text-yellow-300'
              }`}
            >
              {/* Icon */}
              <span className="shrink-0">
                {alert.isOver
                  ? <TrendingDown size={13} />
                  : <AlertTriangle size={13} />
                }
              </span>

              {/* Color dot */}
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: alert.category.color }}
              />

              {/* Message */}
              <span className="flex-1 min-w-0">
                {alert.isOver ? (
                  <>
                    <span className="font-medium">{alert.category.name}</span>
                    {lang === 'pt'
                      ? ` ultrapassou o orçamento em ${formatCurrency(Math.abs(remaining))}`
                      : ` exceeded budget by ${formatCurrency(Math.abs(remaining))}`
                    }
                  </>
                ) : (
                  <>
                    <span className="font-medium">{alert.category.name}</span>
                    {lang === 'pt'
                      ? ` atingiu ${pctDisplay}% do orçamento — restam ${formatCurrency(remaining)}`
                      : ` at ${pctDisplay}% of budget — ${formatCurrency(remaining)} remaining`
                    }
                  </>
                )}
              </span>

              {/* Progress pill */}
              <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                alert.isOver
                  ? 'bg-red-500/15 text-red-300'
                  : 'bg-yellow-500/15 text-yellow-300'
              }`}>
                {pctDisplay}%
              </span>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(alert.category.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
