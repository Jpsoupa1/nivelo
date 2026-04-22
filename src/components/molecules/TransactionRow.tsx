import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Transaction, Category } from '../../types/finance'
import { StatusDot } from '../atoms/StatusDot'
import { Badge } from '../atoms/Badge'
import { formatCurrency, formatShortDate } from '../../utils/format'

interface TransactionRowProps {
  transaction: Transaction
  categories: Category[]
  onUpdate?: (tx: Transaction) => void
  index: number
}

export function TransactionRow({ transaction, categories, onUpdate, index }: TransactionRowProps) {
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState(transaction.description)

  const isDebit = transaction.amount < 0
  const cat = categories.find((c) => c.key === transaction.category)
  const color = cat?.color ?? '#8B82A8'
  const label = cat?.name ?? transaction.category

  function handleBlur() {
    setEditing(false)
    if (description !== transaction.description && onUpdate) {
      onUpdate({ ...transaction, description })
    }
  }

  return (
    <motion.tr
      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.025 }}
    >
      <td className="py-3 pl-4 pr-2 w-8">
        <StatusDot status={transaction.status} />
      </td>

      <td className="py-3 px-2 text-xs text-muted font-mono whitespace-nowrap">
        {formatShortDate(transaction.date)}
      </td>

      <td className="py-3 px-2">
        {editing ? (
          <input
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            className="bg-surface-2 border border-accent/30 rounded px-2 py-0.5 text-sm text-white w-full outline-none"
          />
        ) : (
          <span
            className="text-sm text-white/80 cursor-text"
            onClick={() => setEditing(true)}
            title="Click to edit"
          >
            {transaction.description}
          </span>
        )}
      </td>

      <td className="py-3 px-2">
        <Badge label={label} color={color} />
      </td>

      <td className="py-3 px-2">
        <span className="text-xs text-muted capitalize">{transaction.source}</span>
      </td>

      <td className="py-3 pl-2 pr-4 text-right">
        <span
          className={`font-mono text-sm font-medium ${
            isDebit ? 'text-danger' : 'text-success'
          }`}
        >
          {isDebit ? '−' : '+'}
          {formatCurrency(Math.abs(transaction.amount))}
        </span>
      </td>
    </motion.tr>
  )
}
