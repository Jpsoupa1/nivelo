import type { FinancialState, Language } from '../types/finance'
import { formatCurrency } from '../utils/format'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export interface GeminiAction {
  type: 'ADD_TRANSACTION'
  amount: number
  category: string
  description: string
}

export interface GeminiResult {
  text: string
  action: GeminiAction | null
}

function buildSystemPrompt(state: FinancialState, language: Language): string {
  const { month, year } = state.selectedPeriod
  const periodTxs = state.transactions.filter((tx) => {
    const d = new Date(tx.date)
    return d.getMonth() + 1 === month && d.getFullYear() === year
  })

  const income   = periodTxs.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0)
  const expenses = periodTxs.filter((tx) => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0)
  const recent   = state.transactions.slice(0, 20)

  const budgetLines = state.categories
    .filter((c) => c.budgeted > 0)
    .map((c) => {
      const spent = periodTxs
        .filter((tx) => tx.amount < 0 && tx.category === c.key)
        .reduce((s, tx) => s + Math.abs(tx.amount), 0)
      const pct = Math.round((spent / c.budgeted) * 100)
      return `  ${c.name} (${c.key}): ${formatCurrency(spent)} spent of ${formatCurrency(c.budgeted)} budget (${pct}%)`
    })
    .join('\n')

  const txLines = recent
    .map((tx) => `  ${new Date(tx.date).toLocaleDateString()} | ${tx.amount > 0 ? '+' : ''}${formatCurrency(tx.amount)} | ${tx.category} | ${tx.description}`)
    .join('\n')

  const catKeys = state.categories.map((c) => `${c.key} (${c.name})`).join(', ')

  const lang = language === 'pt' ? 'Brazilian Portuguese' : 'English'

  return `You are Nivelo AI, an intelligent personal finance assistant. Always respond in ${lang}. Be concise, direct, and helpful.

=== USER FINANCIAL CONTEXT ===
Total balance: ${formatCurrency(state.balance)}
Period: ${month}/${year}
Period income: ${formatCurrency(income)}
Period expenses: ${formatCurrency(expenses)}
Net this period: ${formatCurrency(income - expenses)}

Budget status:
${budgetLines || '  No budgets configured'}

Recent transactions:
${txLines || '  No transactions yet'}

Available categories: ${catKeys}
=== END CONTEXT ===

RULES:
1. Answer questions about finances using the context above.
2. Give insights, comparisons, and advice when asked.
3. If the user wants to RECORD a transaction (expense or income), append EXACTLY this block at the very end of your response (no extra text after it):
\`\`\`action
{"type":"ADD_TRANSACTION","amount":<signed_float>,"category":"<CATEGORY_KEY>","description":"<short description>"}
\`\`\`
   - amount is NEGATIVE for expenses, POSITIVE for income
   - category must be one of the keys listed above
   - Only include this block when actually recording a transaction
4. Do NOT include the action block for queries, analysis, or advice — only when recording.
5. Keep responses under 120 words unless a detailed analysis is requested.`
}

function parseAction(text: string): { cleanText: string; action: GeminiAction | null } {
  const match = text.match(/```action\s*([\s\S]*?)```/m)
  if (!match) return { cleanText: text.trim(), action: null }

  const cleanText = text.replace(/```action[\s\S]*?```/m, '').trim()
  try {
    const action = JSON.parse(match[1].trim()) as GeminiAction
    if (action.type === 'ADD_TRANSACTION' && typeof action.amount === 'number' && action.category) {
      return { cleanText, action }
    }
  } catch {
    // malformed JSON — ignore action
  }
  return { cleanText, action: null }
}

export async function askGemini(
  userMessage: string,
  state: FinancialState,
  history: Array<{ role: 'user' | 'model'; text: string }>,
): Promise<GeminiResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set')

  const systemPrompt = buildSystemPrompt(state, state.language)

  // Gemini uses "contents" array — inject system prompt as first user turn
  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I am Nivelo AI, ready to help with your finances.' }] },
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const { cleanText, action } = parseAction(rawText)

  return { text: cleanText, action }
}

export function isGeminiEnabled(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY
}
