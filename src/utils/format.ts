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
    FOOD: '#3FB950',
    TRANSPORT: '#D29922',
    HOUSING: '#58A6FF',
    HEALTH: '#F78166',
    ENTERTAINMENT: '#BC8CFF',
    SALARY: '#3FB950',
    INVESTMENT: '#58A6FF',
    UTILITIES: '#79C0FF',
    OTHER: '#8B949E',
  }
  return map[category] ?? '#8B949E'
}
