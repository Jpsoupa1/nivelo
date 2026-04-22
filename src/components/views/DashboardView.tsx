import { ChevronLeft, ChevronRight, Wallet, TrendingDown, TrendingUp } from 'lucide-react'
import type { FinancialState, Transaction, RecurringTransaction } from '../../types/finance'
import { KPICard } from '../molecules/KPICard'
import { CashFlowChart } from '../organisms/CashFlowChart'
import { SmartLedger } from '../organisms/SmartLedger'
import { AllocationPanel } from '../organisms/AllocationPanel'
import { BudgetAlerts } from '../organisms/BudgetAlerts'
import { ProjectionChart } from '../organisms/ProjectionChart'
import { computeCashFlow } from '../../store/financeReducer'
import { t } from '../../services/i18n'
import { formatCurrency } from '../../utils/format'

interface DashboardViewProps {
  state: FinancialState
  recurrings: RecurringTransaction[]
  onUpdateTransaction: (tx: Transaction) => void
  onSetPeriod: (month: number, year: number) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function DashboardView({ state, recurrings, onUpdateTransaction, onSetPeriod }: DashboardViewProps) {
  const s = t(state.language).dashboard
  const { month, year } = state.selectedPeriod

  // Transactions filtered to selected period
  const periodTxs = state.transactions.filter((tx) => {
    const d = new Date(tx.date)
    return d.getMonth() + 1 === month && d.getFullYear() === year
  })

  // Allocations computed from period transactions
  const allocations = state.categories.map((cat) => {
    const spent = periodTxs
      .filter((tx) => tx.amount < 0 && tx.category === cat.key)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    return { category: cat, spent }
  })

  const lastTx = periodTxs[0]
  const monthlyIncome = periodTxs
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0)

  const cashFlow = computeCashFlow(state.transactions)

  const hasAlerts = allocations.some(
    (a) => a.category.budgeted > 0 && a.spent / a.category.budgeted >= 0.8
  )

  function shiftPeriod(delta: number) {
    const d = new Date(year, month - 1 + delta, 1)
    onSetPeriod(d.getMonth() + 1, d.getFullYear())
  }

  const isCurrentMonth =
    month === new Date().getMonth() + 1 && year === new Date().getFullYear()

  return (
    <div
      className="flex-1 p-4 grid gap-3 min-h-0"
      style={{
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: hasAlerts
          ? '32px auto 120px minmax(0, 1fr) minmax(0, 1fr)'
          : '32px 120px minmax(0, 1fr) minmax(0, 1fr)',
        gridTemplateAreas: hasAlerts
          ? `
            "period  period  period  period"
            "alerts  alerts  alerts  alerts"
            "balance lastTx  lastTx  allocation"
            "chart   proj    ledger  ledger"
            "alloc   alloc   ledger  ledger"
          `
          : `
            "period  period  period  period"
            "balance lastTx  lastTx  allocation"
            "chart   proj    ledger  ledger"
            "alloc   alloc   ledger  ledger"
          `,
      }}
    >
      {/* Period selector */}
      <div style={{ gridArea: 'period' }} className="flex items-center gap-2">
        <button
          onClick={() => shiftPeriod(-1)}
          className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-medium text-white">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          onClick={() => shiftPeriod(1)}
          disabled={isCurrentMonth}
          className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
        {!isCurrentMonth && (
          <button
            onClick={() => {
              const now = new Date()
              onSetPeriod(now.getMonth() + 1, now.getFullYear())
            }}
            className="ml-1 text-[11px] text-accent/70 hover:text-accent transition-colors"
          >
            {state.language === 'pt' ? 'Hoje' : 'Today'}
          </button>
        )}
      </div>

      {/* Budget Alerts */}
      {hasAlerts && (
        <div style={{ gridArea: 'alerts' }}>
          <BudgetAlerts allocations={allocations} lang={state.language} />
        </div>
      )}

      {/* Balance KPI */}
      <div style={{ gridArea: 'balance' }}>
        <KPICard
          title={s.liquidBalance}
          value={state.balance}
          subtitle={s.allAccounts}
          icon={<Wallet size={16} />}
          isLoading={state.isProcessing}
          accentColor="#A78BFA"
          language={state.language}
        />
      </div>

      {/* Last Tx + Monthly Income */}
      <div style={{ gridArea: 'lastTx' }} className="grid grid-cols-2 gap-3">
        <KPICard
          title={s.lastTx}
          value={lastTx ? Math.abs(lastTx.amount) : 0}
          subtitle={lastTx?.description ?? '—'}
          icon={<TrendingDown size={16} />}
          accentColor={lastTx && lastTx.amount < 0 ? '#FB7185' : '#34D399'}
          isLoading={state.isProcessing}
          language={state.language}
        />
        <KPICard
          title={s.monthlyIncome}
          value={monthlyIncome}
          subtitle={s.thisMonth}
          icon={<TrendingUp size={16} />}
          accentColor="#34D399"
          isLoading={state.isProcessing}
          language={state.language}
        />
      </div>

      {/* Top allocation KPI */}
      <div style={{ gridArea: 'allocation' }}>
        {(() => {
          const top = allocations
            .filter((a) => a.category.budgeted > 0)
            .sort((a, b) => b.spent / b.category.budgeted - a.spent / a.category.budgeted)[0]
          if (!top) return (
            <KPICard
              title={s.topSpend('')}
              value={0}
              subtitle={s.nobudget}
              icon={<TrendingDown size={16} />}
              accentColor="#D29922"
            />
          )
          return (
            <KPICard
              title={s.topSpend(top.category.name)}
              value={top.spent}
              subtitle={s.ofBudget(formatCurrency(top.category.budgeted, state.language))}
              icon={<TrendingDown size={16} />}
              trend={-(top.spent / top.category.budgeted) * 100}
              accentColor={top.category.color}
              isLoading={state.isProcessing}
              language={state.language}
            />
          )
        })()}
      </div>

      {/* Cash Flow Chart */}
      <div style={{ gridArea: 'chart' }}>
        <CashFlowChart data={cashFlow} />
      </div>

      {/* Balance Projection */}
      <div style={{ gridArea: 'proj' }}>
        <ProjectionChart
          balance={state.balance}
          transactions={state.transactions}
          recurrings={recurrings}
        />
      </div>

      {/* Smart Ledger — shows period transactions */}
      <div style={{ gridArea: 'ledger' }}>
        <SmartLedger
          transactions={periodTxs}
          categories={state.categories}
          onUpdate={onUpdateTransaction}
          lang={state.language}
        />
      </div>

      {/* Allocation Envelopes */}
      <div style={{ gridArea: 'alloc' }}>
        <AllocationPanel allocations={allocations} lang={state.language} />
      </div>
    </div>
  )
}
