import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import type { Transaction, Category, Language } from '../../types/finance'
import { TransactionRow } from '../molecules/TransactionRow'
import { t } from '../../services/i18n'

interface SmartLedgerProps {
  transactions: Transaction[]
  categories: Category[]
  onUpdate: (tx: Transaction) => void
  lang: Language
}

export function SmartLedger({ transactions, categories, onUpdate, lang }: SmartLedgerProps) {
  const s = t(lang).ledger
  const [search, setSearch] = useState('')
  const [filterKey, setFilterKey] = useState<string>('ALL')
  const [showFilter, setShowFilter] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // Fix #11: Close dropdown on outside click
  useEffect(() => {
    if (!showFilter) return
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showFilter])

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      !search ||
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filterKey === 'ALL' || tx.category === filterKey
    return matchSearch && matchFilter
  })

  const activeCatName = filterKey === 'ALL'
    ? s.allCats.split(' ')[0]   // "All" / "Todas"
    : categories.find((c) => c.key === filterKey)?.name ?? filterKey

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-3 shrink-0">
        <h3 className="text-xs font-medium text-muted uppercase tracking-wider">
          {s.title}
        </h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={s.search}
              className="bg-surface-2 border border-white/[0.06] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white/80 placeholder:text-muted outline-none focus:border-accent/40 w-44 transition-colors"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                filterKey !== 'ALL'
                  ? 'border-accent/40 text-accent bg-accent/10'
                  : 'border-white/[0.06] text-muted hover:text-white'
              }`}
            >
              <Filter size={11} />
              {activeCatName}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-8 z-20 glass rounded-lg p-1.5 min-w-[160px] flex flex-col gap-0.5 max-h-60 overflow-y-auto">
                <button
                  onClick={() => { setFilterKey('ALL'); setShowFilter(false) }}
                  className={`text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                    filterKey === 'ALL' ? 'text-accent bg-accent/10' : 'text-muted hover:text-white'
                  }`}
                >
                  {s.allCats}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setFilterKey(cat.key); setShowFilter(false) }}
                    className={`text-left px-2.5 py-1.5 rounded text-xs flex items-center gap-2 transition-colors ${
                      filterKey === cat.key ? 'text-accent bg-accent/10' : 'text-muted hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {s.cols.map((h) => (
                <th
                  key={h}
                  className="pb-2 text-left text-[10px] font-medium text-muted uppercase tracking-wider first:pl-4 last:pr-4 last:text-right"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map((tx, i) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  categories={categories}
                  onUpdate={onUpdate}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-24 text-muted text-sm">
            {s.noMatch}
          </div>
        )}
      </div>
    </div>
  )
}
