import type { ParsedCommand, Category, Language } from '../types/finance'
import { v4 as uuid } from '../utils/uuid'
import { CATEGORY_COLORS } from '../data/mockData'
import { t } from './i18n'

// Keyword → likely category key mapping (defaults)
const KEYWORD_MAP: Record<string, string> = {
  food: 'FOOD', lunch: 'FOOD', dinner: 'FOOD', breakfast: 'FOOD',
  groceries: 'FOOD', restaurant: 'FOOD', cafe: 'FOOD', coffee: 'FOOD',
  snack: 'FOOD', meal: 'FOOD', pizza: 'FOOD', burger: 'FOOD',
  uber: 'TRANSPORT', taxi: 'TRANSPORT', bus: 'TRANSPORT', metro: 'TRANSPORT',
  transport: 'TRANSPORT', fuel: 'TRANSPORT', gas: 'TRANSPORT', subway: 'TRANSPORT',
  rent: 'HOUSING', mortgage: 'HOUSING', housing: 'HOUSING', apartment: 'HOUSING', house: 'HOUSING',
  doctor: 'HEALTH', pharmacy: 'HEALTH', health: 'HEALTH', gym: 'HEALTH', medicine: 'HEALTH', hospital: 'HEALTH',
  netflix: 'ENTERTAINMENT', spotify: 'ENTERTAINMENT', game: 'ENTERTAINMENT',
  entertainment: 'ENTERTAINMENT', cinema: 'ENTERTAINMENT', movie: 'ENTERTAINMENT', concert: 'ENTERTAINMENT',
  salary: 'SALARY', income: 'SALARY', paycheck: 'SALARY', payroll: 'SALARY',
  investment: 'INVESTMENT', dividend: 'INVESTMENT', stock: 'INVESTMENT', crypto: 'INVESTMENT',
  electricity: 'UTILITIES', internet: 'UTILITIES', water: 'UTILITIES', utility: 'UTILITIES', bill: 'UTILITIES', phone: 'UTILITIES',
}

function normalize(str: string): string {
  return str.trim().toUpperCase().replace(/\s+/g, '_')
}

/**
 * Resolve a category from user text against the live category list.
 * Returns { matched: Category } if found, or { matched: null, suggestedKey, suggestedName }
 * for auto-creation.
 */
function resolveCategory(
  text: string,
  categories: Category[],
): { matched: Category | null; suggestedKey: string; suggestedName: string } {
  const lower = text.toLowerCase()

  // 1. Check keyword map → look for that key in live categories
  for (const [kw, key] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(kw)) {
      const found = categories.find((c) => c.key === key)
      if (found) return { matched: found, suggestedKey: key, suggestedName: found.name }
      // Key from map but category deleted — treat as new
      return { matched: null, suggestedKey: key, suggestedName: kw.charAt(0).toUpperCase() + kw.slice(1) }
    }
  }

  // 2. Try direct fuzzy match on category names and keys in the live list
  for (const cat of categories) {
    if (
      lower.includes(cat.name.toLowerCase()) ||
      lower.includes(cat.key.toLowerCase())
    ) {
      return { matched: cat, suggestedKey: cat.key, suggestedName: cat.name }
    }
  }

  // 3. Capture anything after "on" / "in" / "at" / "for" as a new category name
  const afterPrep = lower.match(/(?:on|in|at|for)\s+([a-z][a-z\s]{1,24}?)(?:\s*$|,|\.|!)/i)
  if (afterPrep) {
    const raw = afterPrep[1].trim()
    const key = normalize(raw)
    return { matched: null, suggestedKey: key, suggestedName: raw.charAt(0).toUpperCase() + raw.slice(1) }
  }

  return { matched: null, suggestedKey: 'OTHER', suggestedName: 'Other' }
}

function extractAmount(text: string): number | undefined {
  const match = text.match(/(?:R?\$\s*|BRL\s*)?(\d{1,6}(?:[.,]\d{1,2})?)/i)
  if (!match) return undefined
  return parseFloat(match[1].replace(',', '.'))
}

function pickAutoColor(categories: Category[]): string {
  const used = new Set(categories.map((c) => c.color))
  return CATEGORY_COLORS.find((c) => !used.has(c)) ?? CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]
}

export function parseNLPCommand(
  input: string,
  categories: Category[],
  language: Language = 'en',
): ParsedCommand {
  const lower = input.toLowerCase().trim()
  const r = t(language).nlp

  // QUERY_BALANCE
  if (
    lower.includes('how much do i have') ||
    lower.includes('my balance') ||
    lower.includes('current balance') ||
    lower.includes('quanto tenho') ||
    lower.includes('meu saldo') ||
    (lower.includes('how much') && !lower.includes('spent') && !lower.includes('on')) ||
    (lower.includes('quanto') && !lower.includes('gastei') && !lower.includes('em'))
  ) {
    return { intent: 'QUERY_BALANCE', response: r.fetchingBalance }
  }

  // QUERY_SPENDING
  if (
    (lower.includes('how much') && (lower.includes('spend') || lower.includes('spent') || lower.includes('on'))) ||
    lower.includes('total spending') ||
    lower.includes('spending on') ||
    (lower.includes('quanto') && (lower.includes('gastei') || lower.includes('em')))
  ) {
    const { matched, suggestedKey, suggestedName } = resolveCategory(input, categories)
    return {
      intent: 'QUERY_SPENDING',
      categoryKey: matched?.key ?? suggestedKey,
      categoryName: matched?.name ?? suggestedName,
      response: r.aggregatingSpend(matched?.name ?? suggestedName),
    }
  }

  // SET_BUDGET
  if (
    lower.includes('budget') ||
    lower.includes('orçamento') ||
    lower.includes('orcamento') ||
    (lower.includes('set') && lower.includes('limit')) ||
    (lower.includes('definir') && lower.includes('limite'))
  ) {
    const amount = extractAmount(input)
    const { matched, suggestedKey, suggestedName } = resolveCategory(input, categories)
    const fmtAmount = amount ? `$${amount.toFixed(2)}` : ''
    return {
      intent: 'SET_BUDGET',
      amount,
      categoryKey: matched?.key ?? suggestedKey,
      categoryName: matched?.name ?? suggestedName,
      response: amount
        ? r.updatingBudget(matched?.name ?? suggestedName, fmtAmount)
        : r.updatingBudgetBlank,
    }
  }

  // ADD_INCOME
  if (
    /\b(received|got paid|earned|recebi|salary|income)\b/.test(lower)
  ) {
    const amount = extractAmount(input)
    const { matched, suggestedKey, suggestedName } = resolveCategory(input, categories)
    const catKey = matched?.key ?? (suggestedKey === 'OTHER' ? 'SALARY' : suggestedKey)
    const catName = matched?.name ?? suggestedName

    let newCategory: Category | undefined
    if (!matched && catKey !== 'SALARY') {
      newCategory = {
        id: `cat-${uuid()}`,
        name: catName,
        key: catKey,
        color: pickAutoColor(categories),
        budgeted: 0,
        icon: 'Banknote',
        autoCreated: true,
      }
    }

    const fmtAmount = amount ? `$${amount.toFixed(2)}` : ''
    return {
      intent: 'ADD_INCOME',
      amount,
      categoryKey: catKey,
      categoryName: catName,
      description: input.replace(/^(eu\s+)?(recebi|i\s+)?(received|got paid|earned)\s*/i, '').trim() || 'Income received',
      response: amount ? r.processingIncome(fmtAmount) : r.processingIncomeBlank,
      newCategory,
    }
  }

  // ADD_EXPENSE — most common path
  if (
    /\b(spent|paid|bought|purchased|spend|gastei|paguei|comprei)\b/.test(lower) ||
    /^(i\s+)?(spent|paid|bought)/.test(lower)
  ) {
    const amount = extractAmount(input)
    const { matched, suggestedKey, suggestedName } = resolveCategory(input, categories)

    let newCategory: Category | undefined
    if (!matched) {
      newCategory = {
        id: `cat-${uuid()}`,
        name: suggestedName,
        key: suggestedKey,
        color: pickAutoColor(categories),
        budgeted: 0,
        icon: 'Tag',
        autoCreated: true,
      }
    }

    const description = input
      .replace(/^(eu\s+)?(gastei|paguei|comprei|(i\s+)?(spent|paid|bought|purchased))\s*/i, '')
      .replace(/^R?\$?\d[\d.,]*\s*(no?|na|em|in|on\s*)?/i, '')
      .trim() || suggestedName

    const fmtAmount = amount ? `$${amount.toFixed(2)}` : ''
    return {
      intent: 'ADD_EXPENSE',
      amount,
      categoryKey: matched?.key ?? suggestedKey,
      categoryName: matched?.name ?? suggestedName,
      description,
      response: amount
        ? r.loggingExpense(fmtAmount, matched?.name ?? suggestedName)
        : r.loggingExpenseBlank,
      newCategory,
    }
  }

  return { intent: 'UNKNOWN', response: r.unknown }
}

export function buildTransaction(cmd: ParsedCommand) {
  if (!cmd.amount || !cmd.categoryKey) return null
  const isExpense = cmd.intent === 'ADD_EXPENSE'
  return {
    id: `txn-${uuid()}`,
    amount: isExpense ? -Math.abs(cmd.amount) : Math.abs(cmd.amount),
    category: cmd.categoryKey,
    description: cmd.description ?? (isExpense ? 'Expense' : 'Income'),
    date: new Date().toISOString(),
    source: 'ai' as const,
    status: 'confirmed' as const,
  }
}
