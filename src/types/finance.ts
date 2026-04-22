// Category key is now a plain string so users can define their own
export type TransactionCategory = string

export type Language = 'en' | 'pt'

export interface Category {
  id: string
  name: string       // Display name: "Food & Dining"
  key: string        // Normalized key: "FOOD" — used for matching
  color: string      // Hex accent color
  budgeted: number   // Monthly budget envelope
  icon: string       // Lucide icon name (string reference)
  autoCreated?: boolean // true when created on-the-fly by AI
}

export interface Transaction {
  id: string
  amount: number          // Signed: negative = debit
  category: TransactionCategory
  description: string
  date: string            // ISO 8601
  source: 'manual' | 'ai' | 'webhook' | 'recurring'
  status: 'pending' | 'confirmed' | 'failed'
}

// Derived from Category + Transactions — not stored directly
export interface Allocation {
  category: Category
  spent: number
}

export interface CashFlowPoint {
  month: string
  income: number
  expenses: number
  net: number
}

export interface FinancialState {
  balance: number
  transactions: Transaction[]
  categories: Category[]
  cashFlow: CashFlowPoint[]
  isProcessing: boolean
  lastUpdated: string
  language: Language
  selectedPeriod: SelectedPeriod
}

export type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'REMOVE_TRANSACTION'; payload: string }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'SET_LAST_UPDATED'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_PERIOD'; payload: SelectedPeriod }
  | { type: 'LOAD_DATA'; payload: { transactions: Transaction[]; categories: Category[] } }


export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type NLPIntent =
  | 'ADD_EXPENSE'
  | 'ADD_INCOME'
  | 'QUERY_BALANCE'
  | 'QUERY_SPENDING'
  | 'SET_BUDGET'
  | 'UNKNOWN'

export interface ParsedCommand {
  intent: NLPIntent
  amount?: number
  categoryKey?: string   // normalized key e.g. "HOUSING"
  categoryName?: string  // raw name from user e.g. "Housa"
  description?: string
  response: string
  newCategory?: Category // set when auto-creation is needed
}

export type AppView = 'dashboard' | 'chat' | 'categories' | 'recurring' | 'import' | 'goals'

export interface Goal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  deadline?: string  // ISO date string
  color: string
  icon: string
}

export interface RecurringTransaction {
  id: string
  amount: number        // signed: negative = expense
  category: string
  description: string
  dayOfMonth: number    // 1–28
  active: boolean
}

export interface SelectedPeriod {
  month: number // 1–12
  year: number
}
