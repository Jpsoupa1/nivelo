import type { RecurringTransaction, Transaction } from '../types/finance'

function recurringTxId(recurringId: string, year: number, month: number): string {
  return `txn-rec-${recurringId}-${year}-${String(month).padStart(2, '0')}`
}

/**
 * Returns transactions that should be created for the given month/year.
 *
 * Deduplication uses a deterministic ID (recurringId + year + month) so:
 * - Two rules with the same description never collide
 * - Renaming a rule's description doesn't cause double-fires
 * - Timezone-safe: fireDate is always built in UTC
 */
export function getPendingRecurring(
  recurrings: RecurringTransaction[],
  existingTxs: Transaction[],
  month: number,
  year: number,
): Transaction[] {
  const today = new Date()
  const existingIds = new Set(existingTxs.map((tx) => tx.id))
  const pending: Transaction[] = []

  for (const r of recurrings) {
    if (!r.active) continue

    const txId = recurringTxId(r.id, year, month)
    if (existingIds.has(txId)) continue

    const fireDate = new Date(Date.UTC(year, month - 1, r.dayOfMonth))
    if (fireDate > today) continue

    pending.push({
      id: txId,
      amount: r.amount,
      category: r.category,
      description: r.description,
      date: fireDate.toISOString(),
      source: 'recurring',
      status: 'confirmed',
    })
  }

  return pending
}
