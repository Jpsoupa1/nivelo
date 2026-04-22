import { useReducer, startTransition, useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { financeReducer, initialState, DEFAULT_CATEGORIES } from './store/financeReducer'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardView } from './components/views/DashboardView'
import { ChatView } from './components/views/ChatView'
import { CategoriesView } from './components/views/CategoriesView'
import { RecurringView } from './components/views/RecurringView'
import { ImportView } from './components/views/ImportView'
import { GoalsView } from './components/views/GoalsView'
import { AuthView } from './components/views/AuthView'
import { LandingPage } from './components/views/LandingPage'
import { buildTransaction } from './services/nlpParser'
import { v4 as uuid } from './utils/uuid'
import {
  fetchTransactions,
  fetchCategories,
  insertTransaction,
  updateTransaction,
  insertCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
  fetchRecurring,
  insertRecurring,
  updateRecurring,
  deleteRecurring,
  fetchGoals,
  insertGoal,
  updateGoal,
  deleteGoal,
} from './services/database'
import { getPendingRecurring } from './services/recurringEngine'
import type { Transaction, Category, RecurringTransaction, Goal, AppView, ChatMessage } from './types/finance'

type Screen = 'landing' | 'login' | 'signup'

/* ── Lightweight error toast ─────────────────────────────── */
function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm shadow-xl backdrop-blur-md"
    >
      <p className="font-medium text-xs uppercase tracking-wider text-red-400 mb-0.5">Error</p>
      <p>{message}</p>
    </motion.div>
  )
}

function FinanceApp() {
  const { user, isLoading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>('landing')
  const [state, dispatch] = useReducer(financeReducer, initialState)
  const [activeView, setActiveView] = useState<AppView>('dashboard')
  const [dataLoading, setDataLoading] = useState(false)
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Fix #2: Guard to prevent duplicate recurring fire in StrictMode
  const recurringFiredRef = useRef(false)
  const dataLoadedRef = useRef(false)

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg)
    console.error('[Nivelo]', msg)
  }, [])

  // Load user data on login
  useEffect(() => {
    if (!user) {
      // Reset guard when user logs out
      recurringFiredRef.current = false
      dataLoadedRef.current = false
      return
    }

    // Prevent double-fetch in StrictMode
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true

    setDataLoading(true)
    Promise.all([fetchTransactions(), fetchCategories(), fetchRecurring(), fetchGoals()])
      .then(async ([transactions, categories, recs, fetchedGoals]) => {
        let finalCategories = categories
        if (categories.length === 0) {
          const withNewIds = DEFAULT_CATEGORIES.map((cat) => ({ ...cat, id: `cat-${uuid()}` }))
          await seedDefaultCategories(withNewIds)
          finalCategories = withNewIds
        }

        dispatch({ type: 'LOAD_DATA', payload: { transactions, categories: finalCategories } })
        setRecurrings(recs)
        setGoals(fetchedGoals)

        // Fix #2: Fire pending recurring only once
        if (!recurringFiredRef.current) {
          recurringFiredRef.current = true
          const now = new Date()
          const pending = getPendingRecurring(recs, transactions, now.getMonth() + 1, now.getFullYear())
          for (const tx of pending) {
            try {
              await insertTransaction(tx)
              dispatch({ type: 'ADD_TRANSACTION', payload: tx })
            } catch (err) {
              showError(`Failed to create recurring "${tx.description}": ${err instanceof Error ? err.message : 'Unknown error'}`)
            }
          }
        }
      })
      .catch((err) => showError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`))
      .finally(() => setDataLoading(false))
  }, [user, showError])

  // Fix #1: All optimistic operations now have try/catch with rollback

  async function handleTransaction(tx: ReturnType<typeof buildTransaction>) {
    if (!tx) return
    startTransition(() => {
      dispatch({ type: 'ADD_TRANSACTION', payload: tx })
    })
    try {
      await insertTransaction(tx)
    } catch (err) {
      // Rollback: remove the optimistically added transaction
      dispatch({ type: 'REMOVE_TRANSACTION', payload: tx.id })
      showError(`Failed to save transaction: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async function handleUpdateTransaction(tx: Transaction) {
    const previous = state.transactions.find((t) => t.id === tx.id)
    dispatch({ type: 'UPDATE_TRANSACTION', payload: tx })
    try {
      await updateTransaction(tx)
    } catch (err) {
      if (previous) dispatch({ type: 'UPDATE_TRANSACTION', payload: previous })
      showError(`Failed to update transaction: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  function handleProcessing(v: boolean) {
    dispatch({ type: 'SET_PROCESSING', payload: v })
  }

  async function handleAutoCreateCategory(cat: Category) {
    dispatch({ type: 'ADD_CATEGORY', payload: cat })
    try {
      await insertCategory(cat)
    } catch (err) {
      dispatch({ type: 'DELETE_CATEGORY', payload: cat.id })
      showError(`Failed to create category: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async function handleAddCategory(cat: Category) {
    dispatch({ type: 'ADD_CATEGORY', payload: cat })
    try {
      await insertCategory(cat)
    } catch (err) {
      dispatch({ type: 'DELETE_CATEGORY', payload: cat.id })
      showError(`Failed to create category: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async function handleUpdateCategory(cat: Category) {
    const previous = state.categories.find((c) => c.id === cat.id)
    dispatch({ type: 'UPDATE_CATEGORY', payload: cat })
    try {
      await updateCategory(cat)
    } catch (err) {
      if (previous) dispatch({ type: 'UPDATE_CATEGORY', payload: previous })
      showError(`Failed to update category: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async function handleDeleteCategory(id: string) {
    const previous = state.categories.find((c) => c.id === id)
    dispatch({ type: 'DELETE_CATEGORY', payload: id })
    try {
      await deleteCategory(id)
    } catch (err) {
      if (previous) dispatch({ type: 'ADD_CATEGORY', payload: previous })
      showError(`Failed to delete category: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  function handleSetLanguage(lang: import('./types/finance').Language) {
    dispatch({ type: 'SET_LANGUAGE', payload: lang })
  }

  async function handleAddRecurring(r: RecurringTransaction) {
    setRecurrings((prev) => [...prev, r])
    try {
      await insertRecurring(r)
    } catch (err) {
      setRecurrings((prev) => prev.filter((x) => x.id !== r.id))
      showError(`Failed to create recurring: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async function handleUpdateRecurring(r: RecurringTransaction) {
    const previous = recurrings.find((x) => x.id === r.id)
    setRecurrings((prev) => prev.map((x) => x.id === r.id ? r : x))
    try {
      await updateRecurring(r)
    } catch (err) {
      if (previous) setRecurrings((prev) => prev.map((x) => x.id === r.id ? previous : x))
      showError(`Failed to update recurring: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async function handleDeleteRecurring(id: string) {
    const previous = recurrings.find((x) => x.id === id)
    setRecurrings((prev) => prev.filter((x) => x.id !== id))
    try {
      await deleteRecurring(id)
    } catch (err) {
      if (previous) setRecurrings((prev) => [...prev, previous])
      showError(`Failed to delete recurring: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async function handleAddGoal(g: Goal) {
    setGoals((prev) => [...prev, g])
    try {
      await insertGoal(g)
    } catch (err) {
      setGoals((prev) => prev.filter((x) => x.id !== g.id))
      showError(`Failed to create goal: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async function handleUpdateGoal(g: Goal) {
    const previous = goals.find((x) => x.id === g.id)
    setGoals((prev) => prev.map((x) => x.id === g.id ? g : x))
    try {
      await updateGoal(g)
    } catch (err) {
      if (previous) setGoals((prev) => prev.map((x) => x.id === g.id ? previous : x))
      showError(`Failed to update goal: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async function handleDeleteGoal(id: string) {
    const previous = goals.find((x) => x.id === id)
    setGoals((prev) => prev.filter((x) => x.id !== id))
    try {
      await deleteGoal(id)
    } catch (err) {
      if (previous) setGoals((prev) => [...prev, previous])
      showError(`Failed to delete goal: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  function handleSetPeriod(month: number, year: number) {
    dispatch({ type: 'SET_PERIOD', payload: { month, year } })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    if (screen === 'landing') {
      return (
        <LandingPage
          onSignUp={() => setScreen('signup')}
          onLogin={() => setScreen('login')}
        />
      )
    }
    return (
      <AuthView
        initialMode={screen === 'signup' ? 'signup' : 'login'}
        onBack={() => setScreen('landing')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-primary text-white flex overflow-hidden" style={{ height: '100vh' }}>
      {/* Error toast */}
      <AnimatePresence>
        {errorMsg && <ErrorToast message={errorMsg} onDismiss={() => setErrorMsg(null)} />}
      </AnimatePresence>

      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        balance={state.balance}
        isProcessing={state.isProcessing || dataLoading}
        categoryCount={state.categories.length}
        language={state.language}
        onSetLanguage={handleSetLanguage}
        userEmail={user.email ?? ''}
      />

      <div className="flex-1 flex overflow-hidden">
        {activeView === 'dashboard' && (
          <DashboardView
            state={state}
            recurrings={recurrings}
            onUpdateTransaction={handleUpdateTransaction}
            onSetPeriod={handleSetPeriod}
          />
        )}
        {activeView === 'chat' && (
          <ChatView
            state={state}
            onTransaction={handleTransaction}
            onProcessing={handleProcessing}
            onAutoCreateCategory={handleAutoCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            chatMessages={chatMessages}
            onSetChatMessages={setChatMessages}
          />
        )}
        {activeView === 'categories' && (
          <CategoriesView
            categories={state.categories}
            lang={state.language}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
        )}
        {activeView === 'goals' && (
          <GoalsView
            goals={goals}
            lang={state.language}
            onAdd={handleAddGoal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
          />
        )}
        {activeView === 'import' && (
          <ImportView
            categories={state.categories}
            lang={state.language}
            onImport={async (txs) => {
              const failed: string[] = []
              for (const tx of txs) {
                try {
                  await insertTransaction(tx)
                  dispatch({ type: 'ADD_TRANSACTION', payload: tx })
                } catch {
                  failed.push(tx.description)
                }
              }
              if (failed.length > 0) {
                showError(`Failed to import ${failed.length} transaction(s): ${failed.slice(0, 3).join(', ')}${failed.length > 3 ? '…' : ''}`)
              }
            }}
          />
        )}
        {activeView === 'recurring' && (
          <RecurringView
            recurrings={recurrings}
            categories={state.categories}
            lang={state.language}
            onAdd={handleAddRecurring}
            onUpdate={handleUpdateRecurring}
            onDelete={handleDeleteRecurring}
          />
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceApp />
    </AuthProvider>
  )
}
