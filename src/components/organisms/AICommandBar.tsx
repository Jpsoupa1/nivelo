import { useState, useRef, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Cpu, CheckCircle, Sparkles } from 'lucide-react'
import type { ChatMessage, FinancialState, Category } from '../../types/finance'
import { ChatBubble } from '../molecules/ChatBubble'
import { parseNLPCommand, buildTransaction } from '../../services/nlpParser'
import { formatCurrency } from '../../utils/format'
import { t } from '../../services/i18n'
import { v4 as uuid } from '../../utils/uuid'

type BarState = 'idle' | 'focused' | 'processing' | 'done'

interface AICommandBarProps {
  state: FinancialState
  onTransaction: (tx: ReturnType<typeof buildTransaction>) => void
  onProcessing: (v: boolean) => void
  onAutoCreateCategory: (cat: Category) => void
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

export function AICommandBar({
  state,
  onTransaction,
  onProcessing,
  onAutoCreateCategory,
  fullPage = false,
}: AICommandBarProps) {
  const [input, setInput] = useState('')
  const [barState, setBarState] = useState<BarState>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>(() => [makeWelcome(state)])
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Rebuild welcome message when language changes (only if it's still the only message)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [makeWelcome(state)]
      }
      return prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.language])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function appendMessage(msg: ChatMessage) {
    startTransition(() => setMessages((prev) => [...prev, msg]))
  }

  function handleSubmit(text = input) {
    const trimmed = text.trim()
    if (!trimmed || barState === 'processing') return

    const userMsg: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }
    appendMessage(userMsg)
    setInput('')
    setBarState('processing')
    onProcessing(true)

    const delay = 1200 + Math.random() * 600
    setTimeout(() => {
      const lang = state.language
      const r = t(lang).nlp
      const cmd = parseNLPCommand(trimmed, state.categories, lang)
      let reply = cmd.response

      if (cmd.newCategory) {
        onAutoCreateCategory(cmd.newCategory)
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
          const catName =
            cmd.newCategory?.name ??
            state.categories.find((c) => c.key === tx.category)?.name ??
            tx.category
          reply = tx.amount < 0
            ? r.debit(formatCurrency(Math.abs(tx.amount)), catName)
            : r.credit(formatCurrency(Math.abs(tx.amount)), catName)
          if (cmd.newCategory) reply += r.autoCatCreated(cmd.newCategory.name)
        } else {
          reply = r.noAmount
        }
      } else if (cmd.intent === 'SET_BUDGET') {
        reply = cmd.amount
          ? r.budgetSet(cmd.categoryName ?? '', formatCurrency(cmd.amount))
          : r.budgetNoAmount
      }

      appendMessage({ id: uuid(), role: 'assistant', content: reply, timestamp: new Date().toISOString() })
      setBarState('done')
      onProcessing(false)
      setTimeout(() => setBarState('idle'), 1500)
    }, delay)
  }

  const s = t(state.language).chat

  return (
    <div className={`glass rounded-xl flex flex-col overflow-hidden ${fullPage ? 'h-full' : ''}`}>
      {/* Header (full-page only) */}
      {fullPage && (
        <div className="shrink-0 px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
          <Sparkles size={14} className="text-accent" />
          <div>
            <p className="text-sm font-medium">{s.title}</p>
            <p className="text-[10px] text-muted">{s.subtitle}</p>
          </div>
          <div className="ml-auto">
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

      {/* Chat history */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {barState === 'processing' && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="glass px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-2">
              <Cpu size={12} className="text-accent animate-pulse" />
              <span className="text-xs text-muted">{s.pipeline}</span>
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1 h-1 rounded-full bg-accent"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Suggestion chips (full-page only, shown before any user message) */}
      {fullPage && messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {s.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSubmit(suggestion)}
              className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] text-muted hover:text-white hover:border-accent/30 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t border-white/[0.06] px-4 py-3">
        <div
          className={`relative flex items-center gap-3 rounded-lg border transition-all duration-200 px-3 h-11 ${
            barState === 'focused'
              ? 'border-accent/40 bg-surface-2'
              : barState === 'processing'
              ? 'border-accent/20 bg-surface-2'
              : barState === 'done'
              ? 'border-success/40 bg-surface-2'
              : 'border-white/[0.06] bg-surface-2/50'
          }`}
        >
          {barState === 'processing' && (
            <div className="absolute inset-0 rounded-lg shimmer pointer-events-none" />
          )}

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
                <span className="text-[10px] font-mono text-muted shrink-0 select-none">AI</span>
              </motion.span>
            )}
          </AnimatePresence>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => barState === 'idle' && setBarState('focused')}
            onBlur={() => barState === 'focused' && setBarState('idle')}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={barState === 'processing'}
            placeholder={s.placeholder}
            className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-muted/50 outline-none disabled:opacity-50"
          />

          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || barState === 'processing'}
            className="shrink-0 p-1 rounded text-muted hover:text-accent disabled:opacity-30 transition-colors"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
