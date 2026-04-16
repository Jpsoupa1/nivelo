import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight, Repeat } from 'lucide-react'
import type { RecurringTransaction, Category, Language } from '../../types/finance'
import { formatCurrency } from '../../utils/format'
import { v4 as uuid } from '../../utils/uuid'

interface RecurringViewProps {
  recurrings: RecurringTransaction[]
  categories: Category[]
  lang: Language
  onAdd: (r: RecurringTransaction) => void
  onUpdate: (r: RecurringTransaction) => void
  onDelete: (id: string) => void
}

const EMPTY: Omit<RecurringTransaction, 'id' | 'active'> = {
  amount: 0,
  category: '',
  description: '',
  dayOfMonth: 1,
}

export function RecurringView({ recurrings, categories, lang, onAdd, onUpdate, onDelete }: RecurringViewProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [isExpense, setIsExpense] = useState(true)

  const isPT = lang === 'pt'

  function handleAdd() {
    if (!form.description || !form.category || form.amount === 0) return
    const r: RecurringTransaction = {
      id: `rec-${uuid()}`,
      amount: isExpense ? -Math.abs(form.amount) : Math.abs(form.amount),
      category: form.category,
      description: form.description,
      dayOfMonth: form.dayOfMonth,
      active: true,
    }
    onAdd(r)
    setForm(EMPTY)
    setShowForm(false)
  }

  function toggleActive(r: RecurringTransaction) {
    onUpdate({ ...r, active: !r.active })
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Repeat size={16} className="text-accent" />
            {isPT ? 'Recorrentes' : 'Recurring'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {isPT
              ? 'Transações automáticas todo mês'
              : 'Automatic monthly transactions'}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={13} />
          {isPT ? 'Adicionar' : 'Add'}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-surface border border-white/[0.07] rounded-xl p-4 flex flex-col gap-3">
              <p className="text-xs font-medium text-muted uppercase tracking-wider">
                {isPT ? 'Nova recorrente' : 'New recurring'}
              </p>

              {/* Type toggle */}
              <div className="flex rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.02] w-fit">
                {[true, false].map((exp) => (
                  <button
                    key={String(exp)}
                    type="button"
                    onClick={() => setIsExpense(exp)}
                    className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                      isExpense === exp
                        ? exp ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                        : 'text-muted hover:text-white'
                    }`}
                  >
                    {exp
                      ? (isPT ? 'Despesa' : 'Expense')
                      : (isPT ? 'Receita' : 'Income')}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted mb-1 block">
                    {isPT ? 'Descrição' : 'Description'}
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder={isPT ? 'Ex: Aluguel' : 'e.g. Rent'}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted mb-1 block">
                    {isPT ? 'Valor' : 'Amount'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount || ''}
                    onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-accent/40 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted mb-1 block">
                    {isPT ? 'Categoria' : 'Category'}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors"
                  >
                    <option value="" className="bg-surface">—</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.key} className="bg-surface">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted mb-1 block">
                    {isPT ? 'Dia do mês' : 'Day of month'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={form.dayOfMonth}
                    onChange={(e) => setForm((f) => ({ ...f, dayOfMonth: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAdd}
                  disabled={!form.description || !form.category || form.amount === 0}
                  className="flex-1 bg-accent/15 hover:bg-accent/25 border border-accent/20 text-accent text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPT ? 'Salvar' : 'Save'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 text-muted hover:text-white text-sm transition-colors"
                >
                  {isPT ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {recurrings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RefreshCw size={28} className="text-muted/30 mb-3" />
          <p className="text-sm text-muted">
            {isPT ? 'Nenhuma recorrente configurada' : 'No recurring transactions set up'}
          </p>
          <p className="text-xs text-muted/50 mt-1">
            {isPT
              ? 'Adicione salário, aluguel, assinaturas…'
              : 'Add salary, rent, subscriptions…'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {recurrings.map((r, i) => {
              const cat = categories.find((c) => c.key === r.category)
              const isNeg = r.amount < 0
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.03 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    r.active
                      ? 'bg-surface border-white/[0.06]'
                      : 'bg-white/[0.02] border-white/[0.03] opacity-50'
                  }`}
                >
                  {/* Color dot */}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: cat?.color ?? '#8B949E' }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{r.description}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {cat?.name ?? r.category} · {isPT ? 'todo dia' : 'every day'} {r.dayOfMonth}
                    </p>
                  </div>

                  {/* Amount */}
                  <span className={`font-mono text-sm font-semibold shrink-0 ${
                    isNeg ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {isNeg ? '−' : '+'}{formatCurrency(Math.abs(r.amount))}
                  </span>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(r)}
                    className="shrink-0 text-muted hover:text-white transition-colors"
                    title={r.active ? 'Disable' : 'Enable'}
                  >
                    {r.active
                      ? <ToggleRight size={18} className="text-accent" />
                      : <ToggleLeft size={18} />
                    }
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDelete(r.id)}
                    className="shrink-0 text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
