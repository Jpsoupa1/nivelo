import type { RecurringTransaction, Transaction } from '../types/finance'
import { v4 as uuid } from '../utils/uuid'

/**
 * Given the active recurring rules and the existing transactions for a month,
 * returns any Transaction objects that should be created (not yet present).
 */
export function getPendingRecurring(
  recurrings: RecurringTransaction[],
  existingTxs: Transaction[],
  month: number,
  year: number,
): Transaction[] {
  const today = new Date()
  const pending: Transaction[] = []

  for (const r of recurrings) {
    if (!r.active) continue

    // Determine the fire date for this month
    const fireDate = new Date(year, month - 1, r.dayOfMonth)

    // Don't fire future dates
    if (fireDate > today) continue

    // Check if already fired this month (same recurring description + month/year)
    const alreadyFired = existingTxs.some((tx) => {
      const d = new Date(tx.date)
      return (
        tx.description === r.description &&
        tx.category === r.category &&
        d.getMonth() + 1 === month &&
        d.getFullYear() === year &&
        tx.source === 'recurring'
      )
    })

    if (!alreadyFired) {
      pending.push({
        id: `txn-rec-${uuid()}`,
        amount: r.amount,
        category: r.category,
        description: r.description,
        date: fireDate.toISOString(),
        source: 'recurring' as Transaction['source'],
        status: 'confirmed',
      })
    }
  }

  return pending
}
