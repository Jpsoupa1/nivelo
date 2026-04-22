import type { Language } from '../types/finance'

export function formatCurrency(
  value: number,
  language: Language = 'en',
): string {
  const currency = language === 'pt' ? 'BRL' : 'USD'
  const locale = language === 'pt' ? 'pt-BR' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(iso: string, language: Language = 'en'): string {
  const locale = language === 'pt' ? 'pt-BR' : 'en-US'
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatShortDate(iso: string, language: Language = 'en'): string {
  const locale = language === 'pt' ? 'pt-BR' : 'en-US'
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    FOOD: '#34D399',
    TRANSPORT: '#FBBF24',
    HOUSING: '#A78BFA',
    HEALTH: '#FB7185',
    ENTERTAINMENT: '#38BDF8',
    SALARY: '#34D399',
    INVESTMENT: '#E8A835',
    UTILITIES: '#818CF8',
    OTHER: '#8B82A8',
  }
  return map[category] ?? '#8B82A8'
}
