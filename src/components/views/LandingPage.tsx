import { motion } from 'framer-motion'
import { BarChart2, ArrowUpRight, TrendingUp, Shield, Zap, Bell } from 'lucide-react'

interface LandingPageProps {
  onSignUp: () => void
  onLogin: () => void
}

const BARS = [40, 65, 50, 80, 60, 90, 75, 100]

export function LandingPage({ onSignUp, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-primary text-white flex flex-col overflow-hidden">

      {/* ── Navbar ───────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-10 py-4 border-b border-white/[0.05]">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
            <BarChart2 size={16} className="text-accent" />
          </div>
          <span className="text-base font-bold tracking-tight">NIVELO</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {['Produtos', 'Investimentos', 'Segurança', 'Empresas'].map((item) => (
            <button
              key={item}
              className="text-sm text-muted hover:text-white transition-colors"
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-muted hover:text-white transition-colors px-3 py-1.5"
          >
            Login
          </button>
          <button
            onClick={onSignUp}
            className="text-sm font-medium bg-accent hover:bg-accent/90 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Abrir Conta
          </button>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center px-10 py-16 gap-12 max-w-7xl mx-auto w-full">

        {/* Left — copy */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/25 bg-accent/[0.08] mb-6">
              <span className="text-accent text-xs">✦</span>
              <span className="text-xs font-medium text-accent/80 uppercase tracking-widest">
                O futuro das finanças chegou
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight mb-5">
              Nivele sua vida<br />
              <span className="text-accent">financeira.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-muted text-base leading-relaxed max-w-md mb-8">
              A Nivelo é a plataforma inteligente que entende seus gastos,
              otimiza seus investimentos e eleva seu patrimônio para o
              próximo nível. Tudo em um só lugar.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <button
                onClick={onSignUp}
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                Começar agora
                <ArrowUpRight size={15} />
              </button>
              <button
                onClick={onLogin}
                className="flex items-center gap-2 border border-white/[0.12] hover:border-white/25 text-muted hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                Conhecer planos
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10">
              {[
                { icon: <Shield size={14} />, label: 'Segurança bancária' },
                { icon: <Zap size={14} />, label: 'IA em tempo real' },
                { icon: <TrendingUp size={14} />, label: 'Análises avançadas' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-muted">
                  <span className="text-accent/60">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — app mockup */}
        <motion.div
          className="hidden lg:flex shrink-0 w-[360px]"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          <div className="w-full bg-surface border border-white/[0.08] rounded-2xl p-5 shadow-2xl shadow-black/50">

            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-muted uppercase tracking-widest mb-0.5">Saldo Total</p>
                <p className="font-mono text-2xl font-bold text-white">R$ 48.290,00</p>
              </div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                  <Bell size={12} className="text-muted" />
                </div>
                <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-accent">N</span>
                </div>
              </div>
            </div>

            {/* Bank card */}
            <div className="relative bg-gradient-to-br from-[#1a56db] to-[#0e3baa] rounded-xl p-4 mb-4 overflow-hidden">
              {/* Glare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.06] rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/[0.04] rounded-full translate-y-1/2 -translate-x-1/4" />

              {/* Card top row */}
              <div className="relative flex items-center justify-between mb-6">
                <div className="w-7 h-5 rounded bg-white/20 border border-white/30" />
                <div className="text-right">
                  <p className="text-[9px] text-white/50 uppercase tracking-widest">Platinum</p>
                  <p className="text-xs font-bold text-white tracking-wider">NIVELO</p>
                </div>
              </div>

              {/* Card number */}
              <p className="relative font-mono text-sm text-white/80 tracking-[0.15em] mb-4">
                •••• •••• •••• 8829
              </p>

              {/* Card bottom row */}
              <div className="relative flex items-end justify-between">
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Titular</p>
                  <p className="text-xs font-semibold text-white">JOÃO DA SILVA</p>
                </div>
                {/* Toggle */}
                <div className="w-9 h-5 bg-white/20 rounded-full p-0.5 flex items-center justify-end">
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Monthly return */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted">Rendimento Mensal</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">+12,4%</span>
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-1.5 h-12">
              {BARS.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all ${
                    i === BARS.length - 1
                      ? 'bg-accent'
                      : 'bg-white/[0.08]'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
