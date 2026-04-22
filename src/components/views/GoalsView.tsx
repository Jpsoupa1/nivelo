import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Target, CheckCircle, Calendar } from 'lucide-react'
import type { Goal, Language } from '../../types/finance'
import { formatCurrency } from '../../utils/format'
import { v4 as uuid } from '../../utils/uuid'

interface GoalsViewProps {
  goals: Goal[]
  lang: Language
  onAdd: (g: Goal) => void
  onUpdate: (g: Goal) => void
  onDelete: (id: string) => void
}

const GOAL_COLORS = ['#E8A835', '#34D399', '#A78BFA', '#38BDF8', '#FB7185', '#818CF8']

const EMPTY_FORM = { name: '', targetAmount: 0, savedAmount: 0, deadline: '', color: '#E8A835' }

export function GoalsView({ goals, lang, onAdd, onUpdate, onDelete }: GoalsViewProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [depositId, setDepositId] = useState<string | null>(null)
  const [depositAmt, setDepositAmt] = useState('')
  const isPT = lang === 'pt'

  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)

  function handleAdd() {
    if (!form.name || form.targetAmount <= 0) return
    onAdd({
      id: `goal-${uuid()}`,
      name: form.name,
      targetAmount: form.targetAmount,
      savedAmount: form.savedAmount,
      deadline: form.deadline || undefined,
      color: form.color,
      icon: 'Target',
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function handleDeposit(goal: Goal) {
    const amt = parseFloat(depositAmt)
    if (isNaN(amt) || amt <= 0) return
    onUpdate({ ...goal, savedAmount: Math.min(goal.savedAmount + amt, goal.targetAmount) })
    setDepositId(null)
    setDepositAmt('')
  }

  function monthsLeft(deadline?: string): number | null {
    if (!deadline) return null
    const d = new Date(deadline)
    const now = new Date()
    return Math.max(0, (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth())
  }

  function monthlyNeeded(goal: Goal): number | null {
    const ml = monthsLeft(goal.deadline)
    if (ml === null || ml === 0) return null
    const remaining = goal.targetAmount - goal.savedAmount
    return remaining > 0 ? remaining / ml : 0
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Target size={16} className="text-accent" />
            {isPT ? 'Metas Financeiras' : 'Financial Goals'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {isPT
              ? `${formatCurrency(totalSaved, lang)} poupado de ${formatCurrency(totalTarget, lang)}`
              : `${formatCurrency(totalSaved, lang)} saved of ${formatCurrency(totalTarget, lang)}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={13} />
          {isPT ? 'Nova meta' : 'New goal'}
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
                {isPT ? 'Nova meta' : 'New goal'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] text-muted mb-1 block">{isPT ? 'Nome' : 'Name'}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={isPT ? 'Ex: Viagem para Europa' : 'e.g. Trip to Europe'}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted mb-1 block">{isPT ? 'Valor alvo' : 'Target amount'}</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.targetAmount || ''}
                    onChange={(e) => setForm((f) => ({ ...f, targetAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-accent/40 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted mb-1 block">{isPT ? 'Já poupado' : 'Already saved'}</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.savedAmount || ''}
                    onChange={(e) => setForm((f) => ({ ...f, savedAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-accent/40 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted mb-1 block">{isPT ? 'Prazo (opcional)' : 'Deadline (optional)'}</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted mb-1 block">{isPT ? 'Cor' : 'Color'}</label>
                  <div className="flex gap-2 mt-1">
                    {GOAL_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        className={`w-5 h-5 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/30' : ''}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAdd}
                  disabled={!form.name || form.targetAmount <= 0}
                  className="flex-1 bg-accent/15 hover:bg-accent/25 border border-accent/20 text-accent text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPT ? 'Criar meta' : 'Create goal'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 text-muted hover:text-white text-sm transition-colors">
                  {isPT ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Target size={28} className="text-muted/30 mb-3" />
          <p className="text-sm text-muted">{isPT ? 'Nenhuma meta criada' : 'No goals yet'}</p>
          <p className="text-xs text-muted/50 mt-1">{isPT ? 'Crie sua primeira meta financeira' : 'Create your first financial goal'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {goals.map((goal, i) => {
              const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
              const done = pct >= 100
              const ml = monthsLeft(goal.deadline)
              const needed = monthlyNeeded(goal)

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="bg-surface border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-3"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${goal.color}20` }}>
                        {done
                          ? <CheckCircle size={15} style={{ color: goal.color }} />
                          : <Target size={15} style={{ color: goal.color }} />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{goal.name}</p>
                        {goal.deadline && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar size={10} className="text-muted" />
                            <span className="text-[10px] text-muted">
                              {ml !== null ? (ml === 0 ? (isPT ? 'Venceu' : 'Due') : `${ml} ${isPT ? 'meses' : 'months'}`) : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => onDelete(goal.id)} className="text-muted hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-mono text-white">{formatCurrency(goal.savedAmount, lang)}</span>
                      <span className="text-xs text-muted">{Math.round(pct)}%</span>
                      <span className="text-xs font-mono text-muted">{formatCurrency(goal.targetAmount, lang)}</span>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: done ? '#3FB950' : goal.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Monthly needed */}
                  {needed !== null && needed > 0 && (
                    <p className="text-[11px] text-muted">
                      {isPT
                        ? `Poupe ${formatCurrency(needed, lang)}/mês para atingir no prazo`
                        : `Save ${formatCurrency(needed, lang)}/mo to reach by deadline`}
                    </p>
                  )}

                  {done && (
                    <p className="text-[11px] text-emerald-400 font-medium">
                      {isPT ? 'Meta atingida!' : 'Goal reached!'}
                    </p>
                  )}

                  {/* Deposit */}
                  {!done && (
                    depositId === goal.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number" min="0" step="0.01" autoFocus
                          value={depositAmt}
                          onChange={(e) => setDepositAmt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleDeposit(goal)}
                          placeholder="0.00"
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-accent/40 font-mono"
                        />
                        <button onClick={() => handleDeposit(goal)} className="text-xs text-accent font-medium px-3 py-1.5 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors">
                          {isPT ? 'OK' : 'Add'}
                        </button>
                        <button onClick={() => { setDepositId(null); setDepositAmt('') }} className="text-xs text-muted px-2">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDepositId(goal.id)}
                        className="w-full text-xs text-muted hover:text-white border border-white/[0.06] hover:border-white/20 rounded-lg py-1.5 transition-colors"
                      >
                        + {isPT ? 'Adicionar poupança' : 'Add savings'}
                      </button>
                    )
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
