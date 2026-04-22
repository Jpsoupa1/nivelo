import { supabase } from '../lib/supabase'
import type { Transaction, Category, RecurringTransaction, Goal } from '../types/finance'

// ── Transactions ─────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, category, description, date, source, status')
    .order('date', { ascending: false })

  if (error) throw error
  return data as Transaction[]
}

export async function insertTransaction(tx: Transaction): Promise<void> {
  const { error } = await supabase.from('transactions').insert({
    id: tx.id,
    amount: tx.amount,
    category: tx.category,
    description: tx.description,
    date: tx.date,
    source: tx.source,
    status: tx.status,
  })
  if (error) throw error
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update({
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      date: tx.date,
      source: tx.source,
      status: tx.status,
    })
    .eq('id', tx.id)
  if (error) throw error
}

// ── Categories ───────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, key, color, budgeted, icon, auto_created')
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    key: row.key,
    color: row.color,
    budgeted: row.budgeted,
    icon: row.icon,
    autoCreated: row.auto_created,
  }))
}

export async function insertCategory(cat: Category): Promise<void> {
  const { error } = await supabase.from('categories').insert({
    id: cat.id,
    name: cat.name,
    key: cat.key,
    color: cat.color,
    budgeted: cat.budgeted,
    icon: cat.icon,
    auto_created: cat.autoCreated ?? false,
  })
  if (error) throw error
}

export async function updateCategory(cat: Category): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({
      name: cat.name,
      key: cat.key,
      color: cat.color,
      budgeted: cat.budgeted,
      icon: cat.icon,
    })
    .eq('id', cat.id)
  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// ── Recurring Transactions ───────────────────────────────────

export async function fetchRecurring(): Promise<RecurringTransaction[]> {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('id, amount, category, description, day_of_month, active')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id,
    amount: r.amount,
    category: r.category,
    description: r.description,
    dayOfMonth: r.day_of_month,
    active: r.active,
  }))
}

export async function insertRecurring(r: RecurringTransaction): Promise<void> {
  const { error } = await supabase.from('recurring_transactions').insert({
    id: r.id,
    amount: r.amount,
    category: r.category,
    description: r.description,
    day_of_month: r.dayOfMonth,
    active: r.active,
  })
  if (error) throw error
}

export async function updateRecurring(r: RecurringTransaction): Promise<void> {
  const { error } = await supabase
    .from('recurring_transactions')
    .update({ amount: r.amount, category: r.category, description: r.description, day_of_month: r.dayOfMonth, active: r.active })
    .eq('id', r.id)
  if (error) throw error
}

export async function deleteRecurring(id: string): Promise<void> {
  const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
  if (error) throw error
}

// ── Goals ─────────────────────────────────────────────────────

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, name, target_amount, saved_amount, deadline, color, icon')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    targetAmount: r.target_amount,
    savedAmount: r.saved_amount,
    deadline: r.deadline ?? undefined,
    color: r.color,
    icon: r.icon,
  }))
}

export async function insertGoal(g: Goal): Promise<void> {
  const { error } = await supabase.from('goals').insert({
    id: g.id, name: g.name, target_amount: g.targetAmount,
    saved_amount: g.savedAmount, deadline: g.deadline ?? null,
    color: g.color, icon: g.icon,
  })
  if (error) throw error
}

export async function updateGoal(g: Goal): Promise<void> {
  const { error } = await supabase.from('goals')
    .update({ name: g.name, target_amount: g.targetAmount, saved_amount: g.savedAmount, deadline: g.deadline ?? null, color: g.color })
    .eq('id', g.id)
  if (error) throw error
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) throw error
}

// ── Seed default categories for new users ───────────────────

export async function seedDefaultCategories(defaults: Category[]): Promise<void> {
  const rows = defaults.map((cat) => ({
    id: cat.id,
    name: cat.name,
    key: cat.key,
    color: cat.color,
    budgeted: cat.budgeted,
    icon: cat.icon,
    auto_created: false,
  }))
  const { error } = await supabase.from('categories').insert(rows)
  if (error) throw error
}
