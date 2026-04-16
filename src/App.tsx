import { useReducer, startTransition, useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { financeReducer, initialState, DEFAULT_CATEGORIES } from './store/financeReducer'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardView } from './components/views/DashboardView'
import { ChatView } from './components/views/ChatView'
import { CategoriesView } from './components/views/CategoriesView'
import { RecurringView } from './components/views/RecurringView'
import { ImportView } from './components/views/ImportView'
import { AuthView } from './components/views/AuthView'
import { LandingPage } from './components/views/LandingPage'
import { buildTransaction } from './services/nlpParser'
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
} from './services/database'
import { getPendingRecurring } from './services/recurringEngine'
import type { Transaction, Category, RecurringTransaction, AppView } from './types/finance'

type Screen = 'landing' | 'login' | 'signup'

function FinanceApp() {
  const { user, isLoading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>('landing')
  const [state, dispatch] = useReducer(financeReducer, initialState)
  const [activeView, setActiveView] = useState<AppView>('dashboard')
  const [dataLoading, setDataLoading] = useState(false)
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([])

  // Load user data on login
  useEffect(() => {
    if (!user) return

    setDataLoading(true)
    Promise.all([fetchTransactions(), fetchCategories(), fetchRecurring()])
      .then(async ([transactions, categories, recs]) => {
        const finalCategories = categories.length === 0
          ? (await seedDefaultCategories(DEFAULT_CATEGORIES), DEFAULT_CATEGORIES)
          : categories

        dispatch({ type: 'LOAD_DATA', payload: { transactions, categories: finalCategories } })
        setRecurrings(recs)

        // Fire any pending recurring transactions for the current month
        const now = new Date()
        const pending = getPendingRecurring(recs, transactions, now.getMonth() + 1, now.getFullYear())
        for (const tx of pending) {
          dispatch({ type: 'ADD_TRANSACTION', payload: tx })
          await insertTransaction(tx)
        }
      })
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [user])

  async function handleTransaction(tx: ReturnType<typeof buildTransaction>) {
    if (!tx) return
    startTransition(() => {
      dispatch({ type: 'ADD_TRANSACTION', payload: tx })
    })
    await insertTransaction(tx)
  }

  async function handleUpdateTransaction(tx: Transaction) {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: tx })
    await updateTransaction(tx)
  }

  function handleProcessing(v: boolean) {
    dispatch({ type: 'SET_PROCESSING', payload: v })
  }

  async function handleAutoCreateCategory(cat: Category) {
    dispatch({ type: 'ADD_CATEGORY', payload: cat })
    await insertCategory(cat)
  }

  async function handleAddCategory(cat: Category) {
    dispatch({ type: 'ADD_CATEGORY', payload: cat })
    await insertCategory(cat)
  }

  async function handleUpdateCategory(cat: Category) {
    dispatch({ type: 'UPDATE_CATEGORY', payload: cat })
    await updateCategory(cat)
  }

  async function handleDeleteCategory(id: string) {
    dispatch({ type: 'DELETE_CATEGORY', payload: id })
    await deleteCategory(id)
  }

  function handleSetLanguage(lang: import('./types/finance').Language) {
    dispatch({ type: 'SET_LANGUAGE', payload: lang })
  }

  async function handleAddRecurring(r: RecurringTransaction) {
    setRecurrings((prev) => [...prev, r])
    await insertRecurring(r)
  }

  async function handleUpdateRecurring(r: RecurringTransaction) {
    setRecurrings((prev) => prev.map((x) => x.id === r.id ? r : x))
    await updateRecurring(r)
  }

  async function handleDeleteRecurring(id: string) {
    setRecurrings((prev) => prev.filter((x) => x.id !== id))
    await deleteRecurring(id)
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
        {activeView === 'import' && (
          <ImportView
            categories={state.categories}
            lang={state.language}
            onImport={async (txs) => {
              for (const tx of txs) {
                dispatch({ type: 'ADD_TRANSACTION', payload: tx })
                await insertTransaction(tx)
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
