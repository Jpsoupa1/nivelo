import { useReducer, startTransition, useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { financeReducer, initialState, DEFAULT_CATEGORIES } from './store/financeReducer'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardView } from './components/views/DashboardView'
import { ChatView } from './components/views/ChatView'
import { CategoriesView } from './components/views/CategoriesView'
import { AuthView } from './components/views/AuthView'
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
} from './services/database'
import type { Transaction, Category, AppView } from './types/finance'

function FinanceApp() {
  const { user, isLoading: authLoading } = useAuth()
  const [state, dispatch] = useReducer(financeReducer, initialState)
  const [activeView, setActiveView] = useState<AppView>('dashboard')
  const [dataLoading, setDataLoading] = useState(false)

  // Load user data on login
  useEffect(() => {
    if (!user) return

    setDataLoading(true)
    Promise.all([fetchTransactions(), fetchCategories()])
      .then(async ([transactions, categories]) => {
        // Seed default categories for brand-new users
        if (categories.length === 0) {
          await seedDefaultCategories(DEFAULT_CATEGORIES)
          dispatch({ type: 'LOAD_DATA', payload: { transactions, categories: DEFAULT_CATEGORIES } })
        } else {
          dispatch({ type: 'LOAD_DATA', payload: { transactions, categories } })
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

  if (!user) return <AuthView />

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
