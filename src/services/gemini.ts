import type { FinancialState, Language } from '../types/finance'
import { formatCurrency } from '../utils/format'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'

export type GeminiAction =
  | { type: 'ADD_TRANSACTION'; amount: number; category: string; description: string }
  | { type: 'ADD_CATEGORY'; key: string; name: string; budget?: number }

export interface GeminiResult {
  text: string
  actions: GeminiAction[]
}

type SessionMessage = { role: 'user' | 'model'; text: string }

function getSessionHistory(sessionId: string): SessionMessage[] {
  try {
    const saved = sessionStorage.getItem(`nivelo_chat_${sessionId}`)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveSessionHistory(sessionId: string, history: SessionMessage[]) {
  try {
    sessionStorage.setItem(`nivelo_chat_${sessionId}`, JSON.stringify(history))
  } catch {
    // sessionStorage full — ignore
  }
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
3. If the user wants to RECORD a transaction OR CREATE a category, append EXACTLY this block at the very end of your response:
\`\`\`action
[
  {"type":"ADD_CATEGORY","key":"<KEY>","name":"<Display Name>","budget":<number_or_0>},
  {"type":"ADD_TRANSACTION","amount":<signed_float>,"category":"<category_key>","description":"<short description>"}
]
\`\`\`
   - For transactions only (no new category), use a single-element array with just ADD_TRANSACTION.
   - amount is NEGATIVE for expenses, POSITIVE for income.
   - If adding to a NEW category, include ADD_CATEGORY first, then ADD_TRANSACTION using its key.
4. If creating a category without a budget, set budget to 0 and ask the user for a monthly budget in your text.
5. Keep responses under 120 words unless analysis is requested.`
}

function parseActions(text: string): { cleanText: string; actions: GeminiAction[] } {
  // Corta o texto rigorosamente antes do bloco de ação começar. 
  // Isso garante que NUNCA vai vazar '```action' na UI.
  const cleanText = text.split('```action')[0].trim()

  const match = text.match(/```action\s*([\s\S]*?)```/m)
  if (!match) return { cleanText, actions: [] }

  try {
    const parsed = JSON.parse(match[1].trim())
    const actionsArray = Array.isArray(parsed) ? parsed : [parsed]
    
    const validActions = actionsArray.filter((a: any) => {
      if (a.type === 'ADD_TRANSACTION' && typeof a.amount === 'number' && a.category) return true
      if (a.type === 'ADD_CATEGORY' && a.key && a.name) return true
      return false
    }) as GeminiAction[]

    return { cleanText, actions: validActions }
  } catch {
    return { cleanText, actions: [] }
  }
}

export async function askGemini(
  userMessage: string,
  state: FinancialState,
  sessionId: string = 'default-session'
): Promise<GeminiResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Chave VITE_GEMINI_API_KEY não encontrada no arquivo .env.local')
  }

  const systemPrompt = buildSystemPrompt(state, state.language)
  const history = getSessionHistory(sessionId)

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I am Nivelo AI.' }] },
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  let res: Response | null = null;
  let retries = 2; // Tenta até 3 vezes (1 inicial + 2 retries)

  while (retries >= 0) {
    res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: 2048, // Aumentado para não cortar o JSON
          topP: 0.95,
        },
      }),
    })

    if (res.ok) break; // Sucesso, sai do loop

    if (res.status === 503 && retries > 0) {
      // Se for High Demand, espera 2 segundos antes de tentar de novo
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries--;
    } else {
      break; // Outro erro, sai do loop e deixa estourar o erro abaixo
    }
  }

  if (!res || !res.ok) {
    const err = await res?.json().catch(() => ({}));
    throw new Error(`Gemini Error: ${err?.error?.message || res?.statusText || 'Falha na conexão'}`)
  }

  const data = await res.json()
  const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  
  const { cleanText, actions } = parseActions(rawText)

  history.push({ role: 'user', text: userMessage })
  history.push({ role: 'model', text: cleanText })
  saveSessionHistory(sessionId, history)

  return { text: cleanText, actions }
}
