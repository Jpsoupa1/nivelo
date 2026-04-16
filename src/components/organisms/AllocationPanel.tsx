import { motion } from 'framer-motion'
import type { Allocation, Language } from '../../types/finance'
import { formatCurrency } from '../../utils/format'
import { t } from '../../services/i18n'

interface AllocationPanelProps {
  allocations: Allocation[]
  lang: Language
}

function AllocationBar({ allocation, index, lang }: { allocation: Allocation; index: number; lang: Language }) {
  const { category, spent } = allocation
  const s = t(lang).allocation
  const pct = category.budgeted > 0
    ? Math.min((spent / category.budgeted) * 100, 100)
    : 0
  const isOver = category.budgeted > 0 && spent > category.budgeted
  const remaining = category.budgeted - spent
  const hasNobudget = category.budgeted === 0

  return (
    <motion.div
      className="flex flex-col gap-1.5"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: category.color }}
          />
          <span className="text-xs text-white/70">{category.name}</span>
        </div>
        <span className="text-[11px] font-mono text-muted">
          {formatCurrency(spent)}
          {!hasNobudget && (
            <>
              {' '}<span className="text-white/20">/</span>{' '}
              {formatCurrency(category.budgeted)}
            </>
          )}
        </span>
      </div>

      {!hasNobudget && (
        <>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: isOver ? '#DA3633' : category.color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.04 }}
            />
          </div>
          <span className={`text-[10px] ${isOver ? 'text-danger' : 'text-muted'}`}>
            {isOver
              ? s.overBudget(formatCurrency(Math.abs(remaining)))
              : s.remaining(formatCurrency(remaining))}
          </span>
        </>
      )}
    </motion.div>
  )
}

export function AllocationPanel({ allocations, lang }: AllocationPanelProps) {
  const s = t(lang).allocation
  const withBudget = allocations.filter((a) => a.category.budgeted > 0)
  const withSpend  = allocations.filter((a) => a.category.budgeted === 0 && a.spent > 0)

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-4 h-full overflow-hidden">
      <h3 className="text-xs font-medium text-muted uppercase tracking-wider shrink-0">
        {s.title}
      </h3>

      <div className="flex flex-col gap-4 overflow-y-auto flex-1">
        {withBudget.map((alloc, i) => (
          <AllocationBar key={alloc.category.id} allocation={alloc} index={i} lang={lang} />
        ))}

        {withSpend.length > 0 && (
          <>
            <div className="border-t border-white/[0.04] pt-2">
              <p className="text-[10px] text-muted/50 uppercase tracking-wider mb-3">
                {s.unbudgeted}
              </p>
              {withSpend.map((alloc, i) => (
                <AllocationBar key={alloc.category.id} allocation={alloc} index={i} lang={lang} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
