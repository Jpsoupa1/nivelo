import type { Transaction } from '../types/finance'
import { v4 as uuid } from '../utils/uuid'

export interface CsvRow {
  date: string
  description: string
  amount: number
  raw: string
}

/**
 * Parse a CSV string into rows.
 * Handles common Brazilian bank export formats:
 *   - date, description, amount (positive/negative)
 *   - Semicolon or comma delimited
 *   - Amounts like "1.234,56" or "1234.56"
 */
export function parseCsv(content: string): CsvRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length < 2) return []

  // Detect delimiter
  const delim = lines[0].includes(';') ? ';' : ','

  // Skip header row
  const rows: CsvRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim).map((c) => c.replace(/^"|"$/g, '').trim())
    if (cols.length < 3) continue

    // Try to find date, description, amount by scanning columns
    const dateCol = cols[0]
    const descCol = cols[1]
    const amtCol  = cols[2]

    // Parse amount: handle "1.234,56" → 1234.56 and "-1.234,56"
    const amtStr = amtCol.replace(/\./g, '').replace(',', '.')
    const amount = parseFloat(amtStr)

    if (isNaN(amount)) continue

    // Basic date normalization: DD/MM/YYYY → YYYY-MM-DD
    const dateNorm = dateCol.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')
    const dateObj = new Date(dateNorm)
    if (isNaN(dateObj.getTime())) continue

    rows.push({
      date: dateObj.toISOString(),
      description: descCol,
      amount,
      raw: lines[i],
    })
  }

  return rows
}

export function csvRowToTransaction(row: CsvRow, categoryKey: string): Transaction {
  return {
    id: `txn-csv-${uuid()}`,
    amount: row.amount,
    category: categoryKey,
    description: row.description,
    date: row.date,
    source: 'manual',
    status: 'confirmed',
  }
}
