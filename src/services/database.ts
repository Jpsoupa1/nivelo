import { supabase } from '../lib/supabase'
import type { Transaction, Category } from '../types/finance'

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
