import type { FinancialState, FinanceAction, CashFlowPoint } from '../types/finance'
import { INITIAL_CATEGORIES } from '../data/mockData'

const now = new Date()

export const initialState: FinancialState = {
  balance: 0,
  transactions: [],
  categories: [],
  cashFlow: [],
  isProcessing: false,
  lastUpdated: now.toISOString(),
  language: 'en',
  selectedPeriod: { month: now.getMonth() + 1, year: now.getFullYear() },
}

// Recompute signed balance from all transactions
function computeBalance(transactions: FinancialState['transactions']): number {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0)
}

// Derive cash flow points (last 6 months) from transactions
export function computeCashFlow(transactions: FinancialState['transactions']): CashFlowPoint[] {
  const now = new Date()
  const points: CashFlowPoint[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = d.toLocaleString('en-US', { month: 'short' })
    const year = d.getFullYear()
    const m = d.getMonth() + 1

    const monthTxs = transactions.filter((tx) => {
      const t = new Date(tx.date)
      return t.getMonth() + 1 === m && t.getFullYear() === year
    })

    const income = monthTxs.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0)
    const expenses = monthTxs.filter((tx) => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0)
    points.push({ month, income, expenses, net: income - expenses })
  }

  return points
}

export function financeReducer(
  state: FinancialState,
  action: FinanceAction,
): FinancialState {
  switch (action.type) {
    case 'LOAD_DATA': {
      const { transactions, categories } = action.payload
      return {
        ...state,
        transactions,
        categories,
        balance: computeBalance(transactions),
        cashFlow: computeCashFlow(transactions),
        lastUpdated: new Date().toISOString(),
      }
    }

    case 'ADD_TRANSACTION': {
      const tx = action.payload
      const transactions = [tx, ...state.transactions]
      return {
        ...state,
        transactions,
        balance: computeBalance(transactions),
        cashFlow: computeCashFlow(transactions),
        lastUpdated: new Date().toISOString(),
      }
    }

    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload }

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }

    case 'UPDATE_TRANSACTION': {
      const transactions = state.transactions.map((tx) =>
        tx.id === action.payload.id ? action.payload : tx,
      )
      return {
        ...state,
        transactions,
        balance: computeBalance(transactions),
        cashFlow: computeCashFlow(transactions),
      }
    }

    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload }

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      }

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      }

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload }

    case 'SET_PERIOD':
      return { ...state, selectedPeriod: action.payload }

    default:
      return state
  }
}

// Derived selector: compute spent amounts per category from transactions
export function computeAllocations(state: FinancialState) {
  return state.categories.map((cat) => {
    const spent = state.transactions
      .filter((tx) => tx.amount < 0 && tx.category === cat.key)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    return { category: cat, spent }
  })
}

// Seed default categories for a brand-new user
export { INITIAL_CATEGORIES as DEFAULT_CATEGORIES }
