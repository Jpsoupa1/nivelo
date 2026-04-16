import type { Transaction, Category, CashFlowPoint } from '../types/finance'

export const INITIAL_BALANCE = 24_850.00

export const CATEGORY_COLORS = [
  '#58A6FF', '#3FB950', '#D29922', '#F78166',
  '#BC8CFF', '#79C0FF', '#FF7B72', '#FFA657',
  '#56D364', '#E3B341',
]

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-food',    name: 'Food & Dining',  key: 'FOOD',          color: '#3FB950', budgeted: 600,  icon: 'UtensilsCrossed' },
  { id: 'cat-tran',    name: 'Transport',       key: 'TRANSPORT',     color: '#D29922', budgeted: 300,  icon: 'Car' },
  { id: 'cat-hous',    name: 'Housing',         key: 'HOUSING',       color: '#58A6FF', budgeted: 2500, icon: 'Home' },
  { id: 'cat-heal',    name: 'Health',          key: 'HEALTH',        color: '#F78166', budgeted: 200,  icon: 'Heart' },
  { id: 'cat-ent',     name: 'Entertainment',   key: 'ENTERTAINMENT', color: '#BC8CFF', budgeted: 150,  icon: 'Tv' },
  { id: 'cat-sal',     name: 'Salary',          key: 'SALARY',        color: '#3FB950', budgeted: 0,    icon: 'Banknote' },
  { id: 'cat-inv',     name: 'Investment',      key: 'INVESTMENT',    color: '#58A6FF', budgeted: 0,    icon: 'TrendingUp' },
  { id: 'cat-util',    name: 'Utilities',       key: 'UTILITIES',     color: '#79C0FF', budgeted: 250,  icon: 'Zap' },
  { id: 'cat-other',   name: 'Other',           key: 'OTHER',         color: '#8B949E', budgeted: 100,  icon: 'MoreHorizontal' },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    amount: 8500.00,
    category: 'SALARY',
    description: 'Monthly salary — AXIS Corp',
    date: '2026-04-01T09:00:00Z',
    source: 'webhook',
    status: 'confirmed',
  },
  {
    id: 'txn-002',
    amount: -2100.00,
    category: 'HOUSING',
    description: 'Apartment rent — April',
    date: '2026-04-02T10:30:00Z',
    source: 'manual',
    status: 'confirmed',
  },
  {
    id: 'txn-003',
    amount: -84.50,
    category: 'FOOD',
    description: 'Weekly groceries — Mercado',
    date: '2026-04-05T15:20:00Z',
    source: 'manual',
    status: 'confirmed',
  },
  {
    id: 'txn-004',
    amount: -42.00,
    category: 'TRANSPORT',
    description: 'Uber — office commute',
    date: '2026-04-07T08:10:00Z',
    source: 'ai',
    status: 'confirmed',
  },
  {
    id: 'txn-005',
    amount: 1200.00,
    category: 'INVESTMENT',
    description: 'Dividend payout — ETF IVVB11',
    date: '2026-04-08T11:00:00Z',
    source: 'webhook',
    status: 'confirmed',
  },
  {
    id: 'txn-006',
    amount: -35.90,
    category: 'ENTERTAINMENT',
    description: 'Streaming subscriptions',
    date: '2026-04-09T00:00:00Z',
    source: 'webhook',
    status: 'confirmed',
  },
  {
    id: 'txn-007',
    amount: -120.00,
    category: 'HEALTH',
    description: 'Pharmacy — monthly medications',
    date: '2026-04-10T14:00:00Z',
    source: 'manual',
    status: 'confirmed',
  },
  {
    id: 'txn-008',
    amount: -185.00,
    category: 'UTILITIES',
    description: 'Electricity + internet bill',
    date: '2026-04-11T09:45:00Z',
    source: 'manual',
    status: 'confirmed',
  },
  {
    id: 'txn-009',
    amount: -52.00,
    category: 'FOOD',
    description: 'Lunch with team — Outback',
    date: '2026-04-12T13:30:00Z',
    source: 'ai',
    status: 'confirmed',
  },
  {
    id: 'txn-010',
    amount: -28.00,
    category: 'TRANSPORT',
    description: 'Fuel top-up',
    date: '2026-04-13T07:30:00Z',
    source: 'manual',
    status: 'confirmed',
  },
]

export const MOCK_CASH_FLOW: CashFlowPoint[] = [
  { month: 'Nov', income: 9200,  expenses: 3800, net: 5400 },
  { month: 'Dec', income: 11500, expenses: 5200, net: 6300 },
  { month: 'Jan', income: 8500,  expenses: 3600, net: 4900 },
  { month: 'Feb', income: 8500,  expenses: 4100, net: 4400 },
  { month: 'Mar', income: 9700,  expenses: 3900, net: 5800 },
  { month: 'Apr', income: 9700,  expenses: 3172, net: 6528 },
]
