import { useState, useRef, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Cpu, CheckCircle, Sparkles, Zap } from 'lucide-react'
import type { ChatMessage, FinancialState, Category } from '../../types/finance'
import { ChatBubble } from '../molecules/ChatBubble'
import { parseNLPCommand, buildTransaction } from '../../services/nlpParser'
import { askGemini, isGeminiEnabled } from '../../services/gemini'
import { formatCurrency } from '../../utils/format'
import { t } from '../../services/i18n'
import { v4 as uuid } from '../../utils/uuid'
import { CATEGORY_COLORS } from '../../data/mockData'

type BarState = 'idle' | 'focused' | 'processing' | 'done'

interface AICommandBarProps {
  state: FinancialState
  onTransaction: (tx: ReturnType<typeof buildTransaction>) => void
  onProcessing: (v: boolean) => void
  onAutoCreateCategory: (cat: Category) => Promise<void>
  onUpdateCategory: (cat: Category) => void
  messages: ChatMessage[]
  onSetMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  fullPage?: boolean
}

function makeWelcome(state: FinancialState): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: t(state.language).chat.welcome,
    timestamp: new Date().toISOString(),
  }
}

function pickColor(categories: Category[]): string {
  const used = new Set(categories.map((c) => c.color))
  return CATEGORY_COLORS.find((c) => !used.has(c)) ?? CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]
}

export function AICommandBar({
  state,
  onTransaction,
  onProcessing,
  onAutoCreateCategory,
  onUpdateCategory,
  messages,
  onSetMessages,
  fullPage = false,
}: AICommandBarProps) {
  const [input, setInput] = useState('')
  const [barState, setBarState] = useState<BarState>('idle')
  const [, startTransition] = useTransition()
  const [pendingBudgetCat, setPendingBudgetCat] = useState<Category | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const geminiEnabled = isGeminiEnabled()

  // Seed welcome message once on mount
  useEffect(() => {
    if (messages.length === 0) {
      onSetMessages([makeWelcome(state)])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update welcome message when language changes (only if it's the only message)
  useEffect(() => {
    onSetMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') return [makeWelcome(state)]
      return prev
    })
  }, [state.language]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  function appendMessage(msg: ChatMessage) {
    startTransition(() => onSetMessages((prev) => [...prev, msg]))
  }

  function botMsg(content: string): ChatMessage {
    return { id: uuid(), role: 'assistant', content, timestamp: new Date().toISOString() }
  }

  // ── Budget capture ────────────────────────────────────────────────────────
  async function handleBudgetReply(trimmed: string) {
    const cat = pendingBudgetCat!
    appendMessage({ id: uuid(), role: 'user', content: trimmed, timestamp: new Date().toISOString() })
    setInput('')

    const amount = parseFloat(trimmed.replace(',', '.'))
    const isPT = state.language === 'pt'

    if (isNaN(amount) || amount < 0) {
      appendMessage(botMsg(
        isPT
          ? `Não entendi. Digite um número como **300** ou **0** para deixar sem orçamento.`
          : `Didn't catch that. Type a number like **300**, or **0** to skip.`
      ))
      return
    }

    const updated = { ...cat, budgeted: amount }
    onUpdateCategory(updated)
    setPendingBudgetCat(null)

    appendMessage(botMsg(
      amount === 0
        ? isPT
          ? `Ok, **${cat.name}** ficará sem orçamento mensal. Você pode definir um depois em Categorias.`
          : `Got it — **${cat.name}** has no monthly budget for now. You can set one later in Categories.`
        : isPT
          ? `Pronto! Orçamento mensal de **${formatCurrency(amount)}** definido para **${cat.name}**. A categoria já aparece em Categorias.`
          : `Done! Monthly budget of **${formatCurrency(amount)}** set for **${cat.name}**. It's already visible in Categories.`
    ))
  }

  // ── Main submit ───────────────────────────────────────────────────────────
  async function handleSubmit(text = input) {
    const trimmed = text.trim()
    if (!trimmed || barState === 'processing') return

    if (pendingBudgetCat) {
      handleBudgetReply(trimmed)
      return
    }

    const userMsg: ChatMessage = { id: uuid(), role: 'user', content: trimmed, timestamp: new Date().toISOString() }
    appendMessage(userMsg)
    setInput('')
    setBarState('processing')
    onProcessing(true)

    try {
      if (geminiEnabled) {
        // askGemini now manages session history internally via sessionStorage
        const result = await askGemini(trimmed, state)

        let lastNewCat: Category | null = null

        for (const action of result.actions) {
          if (action.type === 'ADD_CATEGORY') {
            const newCat: Category = {
              id: `cat-${uuid()}`,
              name: action.name,
              key: action.key.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
              color: pickColor([...state.categories, ...(lastNewCat ? [lastNewCat] : [])]),
              budgeted: action.budget ?? 0,
              icon: 'Tag',
              autoCreated: true,
            }
            await onAutoCreateCategory(newCat)
            lastNewCat = newCat

          } else if (action.type === 'ADD_TRANSACTION') {
            const tx = {
              id: `txn-${uuid()}`,
              amount: action.amount,
              category: action.category,
              description: action.description,
              date: new Date().toISOString(),
              source: 'ai' as const,
              status: 'confirmed' as const,
            }
            onTransaction(tx)

            // Auto-create category if missing and no ADD_CATEGORY action handled it
            const catExists = state.categories.some((c) => c.key === action.category)
              || lastNewCat?.key === action.category
            if (!catExists) {
              const autocat: Category = {
                id: `cat-${uuid()}`,
                name: action.category,
                key: action.category.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
                color: pickColor(state.categories),
                budgeted: 0,
                icon: 'Tag',
                autoCreated: true,
              }
              await onAutoCreateCategory(autocat)
              lastNewCat = autocat
            }
          }
        }

        appendMessage(botMsg(result.text))

        // If a new category was created with no budget, activate budget-capture mode
        if (lastNewCat && lastNewCat.budgeted === 0) {
          setPendingBudgetCat(lastNewCat)
        }

      } else {
        // Fallback: local NLP parser
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 500))
        const lang = state.language
        const r = t(lang).nlp
        const cmd = parseNLPCommand(trimmed, state.categories, lang)
        let reply = cmd.response
        let newCat: Category | null = null

        if (cmd.newCategory) {
          await onAutoCreateCategory(cmd.newCategory)
          newCat = cmd.newCategory
          reply += r.autoCatHint(cmd.newCategory.name)
        }

        if (cmd.intent === 'QUERY_BALANCE') {
          reply = r.balance(formatCurrency(state.balance))
        } else if (cmd.intent === 'QUERY_SPENDING') {
          const cat = state.categories.find((c) => c.key === cmd.categoryKey)
          if (cat) {
            const spent = state.transactions
              .filter((tx) => tx.amount < 0 && tx.category === cat.key)
              .reduce((s, tx) => s + Math.abs(tx.amount), 0)
            reply = cat.budgeted > 0
              ? r.spendWithBudget(formatCurrency(spent), formatCurrency(cat.budgeted), cat.name)
              : r.spendNoBudget(formatCurrency(spent), cat.name)
          } else {
            reply = r.noCatFound(cmd.categoryName ?? '')
          }
        } else if (cmd.intent === 'ADD_EXPENSE' || cmd.intent === 'ADD_INCOME') {
          const tx = buildTransaction(cmd)
          if (tx) {
            onTransaction(tx)
            const catName = cmd.newCategory?.name ?? state.categories.find((c) => c.key === tx.category)?.name ?? tx.category
            reply = tx.amount < 0
              ? r.debit(formatCurrency(Math.abs(tx.amount)), catName)
              : r.credit(formatCurrency(Math.abs(tx.amount)), catName)
            if (cmd.newCategory) reply += r.autoCatCreated(cmd.newCategory.name)
          } else {
            reply = r.noAmount
          }
        } else if (cmd.intent === 'SET_BUDGET') {
          reply = cmd.amount ? r.budgetSet(cmd.categoryName ?? '', formatCurrency(cmd.amount)) : r.budgetNoAmount
        }

        appendMessage(botMsg(reply))

        if (newCat && newCat.budgeted === 0) {
          const isPT = lang === 'pt'
          appendMessage(botMsg(
            isPT
              ? `Qual deve ser o orçamento mensal para **${newCat.name}**? (Digite **0** para deixar sem orçamento)`
              : `What should the monthly budget be for **${newCat.name}**? (Type **0** to skip)`
          ))
          setPendingBudgetCat(newCat)
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      appendMessage(botMsg(`Error connecting to Nivelo AI: ${errMsg}`))
    } finally {
      setBarState('done')
      onProcessing(false)
      setTimeout(() => setBarState('idle'), 1500)
    }
  }

  const s = t(state.language).chat

  return (
    <div className={`glass rounded-xl flex flex-col overflow-hidden ${fullPage ? 'h-full' : ''}`}>
      {fullPage && (
        <div className="shrink-0 px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
          <Sparkles size={14} className="text-accent" />
          <div>
            <p className="text-sm font-medium">{s.title}</p>
            <p className="text-[10px] text-muted">{s.subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {geminiEnabled && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/15">
                <Zap size={9} className="text-accent" />
                <span className="text-[9px] text-accent font-medium">Gemini</span>
              </div>
            )}
            <AnimatePresence>
              {barState === 'processing' && (
                <motion.div
                  className="flex items-center gap-1.5 text-xs text-accent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Cpu size={12} className="animate-pulse" />
                  {s.processing}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
        </AnimatePresence>

        {barState === 'processing' && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-2">
              <Cpu size={12} className="text-accent animate-pulse" />
              <span className="text-xs text-muted">
                {geminiEnabled ? 'Gemini AI is thinking…' : s.pipeline}
              </span>
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="w-1 h-1 rounded-full bg-accent"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {fullPage && messages.length <= 1 && !pendingBudgetCat && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {s.suggestions.map((suggestion) => (
            <button key={suggestion} onClick={() => handleSubmit(suggestion)}
              className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] text-muted hover:text-white hover:border-accent/30 transition-colors">
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {pendingBudgetCat && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/[0.06] border border-accent/15 text-xs text-accent">
            <Sparkles size={11} />
            {state.language === 'pt'
              ? `Aguardando orçamento mensal para "${pendingBudgetCat.name}"`
              : `Awaiting monthly budget for "${pendingBudgetCat.name}"`}
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-white/[0.06] px-4 py-3">
        <div className={`relative flex items-center gap-3 rounded-lg border transition-all duration-200 px-3 h-11 ${
          barState === 'focused' ? 'border-accent/40 bg-surface-2'
          : barState === 'processing' ? 'border-accent/20 bg-surface-2'
          : barState === 'done' ? 'border-success/40 bg-surface-2'
          : pendingBudgetCat ? 'border-accent/30 bg-surface-2'
          : 'border-white/[0.06] bg-surface-2/50'
        }`}>
          {barState === 'processing' && <div className="absolute inset-0 rounded-lg shimmer pointer-events-none" />}

          <AnimatePresence mode="wait">
            {barState === 'processing' && (
              <motion.span key="cpu" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Cpu size={14} className="text-accent shrink-0 animate-pulse" />
              </motion.span>
            )}
            {barState === 'done' && (
              <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <CheckCircle size={14} className="text-success shrink-0" />
              </motion.span>
            )}
            {(barState === 'idle' || barState === 'focused') && (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {geminiEnabled
                  ? <Zap size={13} className="text-accent/60 shrink-0" />
                  : <span className="text-[10px] font-mono text-muted shrink-0 select-none">AI</span>
                }
              </motion.span>
            )}
          </AnimatePresence>

          <input ref={inputRef} value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => barState === 'idle' && setBarState('focused')}
            onBlur={() => barState === 'focused' && setBarState('idle')}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={barState === 'processing'}
            placeholder={pendingBudgetCat
              ? (state.language === 'pt' ? 'Digite o orçamento mensal (ex: 300)...' : 'Type monthly budget (e.g. 300)...')
              : s.placeholder}
            className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-muted/50 outline-none disabled:opacity-50"
          />

          <button onClick={() => handleSubmit()} disabled={!input.trim() || barState === 'processing'}
            className="shrink-0 p-1 rounded text-muted hover:text-accent disabled:opacity-30 transition-colors">
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
