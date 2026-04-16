import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  Tag,
  Activity,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import type { AppView, Language } from '../../types/finance'
import { formatCurrency } from '../../utils/format'
import { t } from '../../services/i18n'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
  activeView: AppView
  onNavigate: (view: AppView) => void
  balance: number
  isProcessing: boolean
  categoryCount: number
  language: Language
  onSetLanguage: (lang: Language) => void
  userEmail: string
}

export function Sidebar({
  activeView,
  onNavigate,
  balance,
  isProcessing,
  categoryCount,
  language,
  onSetLanguage,
  userEmail,
}: SidebarProps) {
  const s = t(language).sidebar
  const { signOut } = useAuth()

  const NAV_ITEMS: { id: AppView; label: string; description: string; icon: React.ReactNode }[] = [
    { id: 'dashboard',  label: s.nav.dashboard.label,  description: s.nav.dashboard.description,  icon: <LayoutDashboard size={16} /> },
    { id: 'chat',       label: s.nav.chat.label,       description: s.nav.chat.description,       icon: <MessageSquare size={16} /> },
    { id: 'categories', label: s.nav.categories.label, description: s.nav.categories.description, icon: <Tag size={16} /> },
  ]

  // Derive initials from email
  const initials = userEmail.slice(0, 2).toUpperCase()

  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen border-r border-white/[0.06] bg-surface">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
            <Activity size={14} className="text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight leading-none">Nivelo</p>
            <p className="text-[10px] text-muted mt-0.5">Finanças Inteligentes</p>
          </div>
        </div>
      </div>

      {/* Balance summary */}
      <div className="mx-3 my-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
          {s.liquidBalance}
        </p>
        <p className="font-mono text-base font-semibold text-white">
          {formatCurrency(balance)}
        </p>
        {isProcessing && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] text-accent">{s.processing}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 flex flex-col gap-0.5">
        <p className="text-[10px] text-muted/50 uppercase tracking-widest px-2 py-1.5">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                isActive
                  ? 'bg-accent/10 text-white'
                  : 'text-muted hover:text-white hover:bg-white/[0.04]'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-accent/10 border border-accent/15"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className={`relative z-10 shrink-0 ${isActive ? 'text-accent' : ''}`}>
                {item.icon}
              </span>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className="text-[10px] text-muted mt-0.5 truncate">{item.description}</p>
              </div>
              {isActive && (
                <ChevronRight size={12} className="relative z-10 text-accent/60 shrink-0" />
              )}
              {item.id === 'categories' && (
                <span className="relative z-10 ml-auto text-[10px] font-mono text-muted bg-white/[0.06] px-1.5 py-0.5 rounded">
                  {categoryCount}
                </span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Language toggle */}
      <div className="px-3 pb-3">
        <div className="flex rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.02]">
          {(['en', 'pt'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onSetLanguage(lang)}
              className={`flex-1 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${
                language === lang
                  ? 'bg-accent/15 text-accent border-accent/20'
                  : 'text-muted hover:text-white'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* User + logout */}
      <div className="px-3 pb-3 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-semibold text-accent">{initials}</span>
          </div>
          <p className="text-[11px] text-muted truncate flex-1">{userEmail}</p>
          <button
            type="button"
            onClick={signOut}
            className="text-muted hover:text-red-400 transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
