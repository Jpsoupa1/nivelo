import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  ArrowRight,
  Sparkles,
  PieChart,
  TrendingUp,
  Upload,
  Target,
  Repeat,
  Shield,
  MessageSquare,
  BarChart3,
  Zap,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'
import { NiveloLogoIcon } from '../atoms/NiveloLogo'

interface LandingPageProps {
  onSignUp: () => void
  onLogin: () => void
}

/* ── Animated section wrapper ─────────────────────────────── */
function FadeInSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

/* ── Feature card ─────────────────────────────────────────── */
function FeatureCard({ icon, title, description, color, delay }: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className="group relative bg-[#14112A]/80 rounded-2xl p-7 border border-white/[0.06] hover:border-[#E8A835]/20 hover:shadow-[0_8px_30px_rgba(232,168,53,0.06)] transition-all duration-300 cursor-default backdrop-blur-sm"
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}14`, border: `1px solid ${color}22` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>

      <h3 className="text-[15px] font-semibold text-white/90 mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-[13px] text-[#8B82A8] leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

/* ── Step card ────────────────────────────────────────────── */
function StepCard({ step, title, description, delay }: {
  step: string
  title: string
  description: string
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center px-6"
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8A835] to-[#D4952B] flex items-center justify-center text-[#0C0A1A] font-bold text-lg mb-5 shadow-lg shadow-[#E8A835]/20">
        {step}
      </div>
      <h3 className="text-base font-semibold text-white/90 mb-2">{title}</h3>
      <p className="text-sm text-[#8B82A8] leading-relaxed max-w-[280px]">{description}</p>
    </motion.div>
  )
}

/* ── Main Landing Page ────────────────────────────────────── */
export function LandingPage({ onSignUp, onLogin }: LandingPageProps) {
  const FEATURES = [
    {
      icon: <Sparkles size={22} />,
      title: 'Assistente IA',
      description: 'Converse com a Nivelo AI para registrar gastos, consultar saldos e receber insights financeiros em linguagem natural.',
      color: '#A78BFA',
    },
    {
      icon: <PieChart size={22} />,
      title: 'Controle de Orçamento',
      description: 'Defina limites mensais por categoria e receba alertas automáticos quando estiver perto de ultrapassar.',
      color: '#E8A835',
    },
    {
      icon: <TrendingUp size={22} />,
      title: 'Relatórios Inteligentes',
      description: 'Dashboard completo com projeções, cash flow e análise de tendências para decisões mais informadas.',
      color: '#34D399',
    },
    {
      icon: <Upload size={22} />,
      title: 'Importação Bancária',
      description: 'Importe extratos CSV do seu banco e categorize transações automaticamente com IA.',
      color: '#FBBF24',
    },
    {
      icon: <Target size={22} />,
      title: 'Metas Financeiras',
      description: 'Crie objetivos com prazo e acompanhe seu progresso visual. Saiba exatamente quanto poupar por mês.',
      color: '#38BDF8',
    },
    {
      icon: <Repeat size={22} />,
      title: 'Gestão de Recorrentes',
      description: 'Cadastre receitas e despesas fixas que são lançadas automaticamente todo mês no dia configurado.',
      color: '#34D399',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0C0A1A] text-white flex flex-col overflow-x-hidden">

      {/* ── Decorative background ──────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Gradient orbs */}
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-[#E8A835]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-[#A78BFA]/[0.04] blur-[120px]" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/[0.06] bg-[#0C0A1A]/80 backdrop-blur-xl sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <NiveloLogoIcon size={26} />
          <span className="text-base font-bold tracking-tight text-white">NIVELO</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Funcionalidades', href: '#features' },
            { label: 'Como funciona', href: '#how-it-works' },
            { label: 'Segurança', href: '#security' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-[#8B82A8] hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-[#8B82A8] hover:text-white transition-colors px-3 py-1.5"
          >
            Login
          </button>
          <button
            onClick={onSignUp}
            className="text-sm font-medium bg-[#E8A835] hover:bg-[#D4952B] text-[#0C0A1A] px-5 py-2 rounded-full transition-all duration-200 shadow-md shadow-[#E8A835]/20 hover:shadow-lg hover:shadow-[#E8A835]/30 hover:scale-[1.02] active:scale-[0.98] font-semibold"
          >
            Começar Grátis
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 flex-shrink-0 px-6 md:px-10 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left — copy */}
          <div className="flex-1 min-w-0 lg:max-w-[520px]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E8A835]/20 bg-[#E8A835]/[0.06] mb-7">
                <Zap size={12} className="text-[#E8A835]" />
                <span className="text-[11px] font-semibold text-[#E8A835]/80 uppercase tracking-[0.1em]">
                  Powered by AI
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-[52px] font-bold leading-[1.1] tracking-tight mb-6 text-white">
                Suas finanças no{' '}
                <span className="text-[#E8A835] relative">
                  próximo nível
                  <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <motion.path
                      d="M2 5.5C30 2.5 60 2 100 3.5C140 5 170 4 198 2.5"
                      stroke="#E8A835"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-[#8B82A8] text-base md:text-lg leading-relaxed max-w-[460px] mb-8">
                A plataforma inteligente que entende seus gastos, controla seu orçamento e te guia com IA para conquistar suas metas financeiras.
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-4">
                <button
                  onClick={onSignUp}
                  className="group flex items-center gap-2 bg-[#E8A835] hover:bg-[#D4952B] text-[#0C0A1A] font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-[#E8A835]/25 hover:shadow-xl hover:shadow-[#E8A835]/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Começar Agora
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={onLogin}
                  className="flex items-center gap-2 text-[#8B82A8] hover:text-white text-sm font-medium px-4 py-3.5 rounded-full transition-colors"
                >
                  Acessar minha conta
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/[0.06]">
                {[
                  { icon: <Shield size={15} />, label: 'Dados criptografados' },
                  { icon: <Sparkles size={15} />, label: 'IA Gemini integrada' },
                  { icon: <BarChart3 size={15} />, label: 'Análise em tempo real' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[#A78BFA]">{item.icon}</span>
                    <span className="text-xs text-[#8B82A8]/70 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — app mockup */}
          <motion.div
            className="hidden lg:block shrink-0 w-[420px]"
            initial={{ opacity: 0, x: 40, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute -inset-8 bg-gradient-to-br from-[#E8A835]/10 via-transparent to-[#A78BFA]/10 rounded-3xl blur-2xl" />

              {/* Main card */}
              <div className="relative bg-[#14112A] rounded-2xl p-6 shadow-2xl shadow-black/30 border border-white/[0.08]">

                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-[#8B82A8] uppercase tracking-[0.15em] mb-1">Saldo Total</p>
                    <p className="font-mono text-2xl font-bold text-white">R$ 24.850,00</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#34D399]/10 border border-[#34D399]/20">
                    <TrendingUp size={12} className="text-[#34D399]" />
                    <span className="text-xs font-semibold text-[#34D399]">+8.2%</span>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="flex items-end gap-[3px] h-16 mb-5">
                  {[35, 50, 42, 65, 55, 72, 60, 80, 68, 90, 75, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        background: i >= 10 ? '#E8A835' : i >= 8 ? 'rgba(232,168,53,0.5)' : 'rgba(255,255,255,0.06)',
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.04, ease: 'easeOut' }}
                    />
                  ))}
                </div>

                {/* AI chat preview */}
                <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-[#A78BFA]/15 flex items-center justify-center">
                      <MessageSquare size={10} className="text-[#A78BFA]" />
                    </div>
                    <span className="text-[10px] text-[#8B82A8] uppercase tracking-wider font-medium">Nivelo AI</span>
                  </div>
                  <p className="text-xs text-[#8B82A8] leading-relaxed">
                    Você gastou <span className="text-white font-medium">R$ 1.230</span> em alimentação este mês, <span className="text-[#E8A835] font-medium">82%</span> do orçamento. Recomendo atenção nos próximos dias.
                  </p>
                </div>

                {/* Category pills */}
                <div className="flex gap-2 mt-4">
                  {[
                    { label: 'Alimentação', color: '#34D399', pct: '82%' },
                    { label: 'Transporte', color: '#FBBF24', pct: '45%' },
                    { label: 'Lazer', color: '#38BDF8', pct: '30%' },
                  ].map((cat) => (
                    <div key={cat.label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-[10px] text-[#8B82A8]">{cat.label}</span>
                      <span className="text-[10px] font-mono text-[#8B82A8]/60">{cat.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Security bar ───────────────────────────────────── */}
      <section id="security" className="relative z-10 py-8 border-y border-white/[0.06] bg-[#14112A]/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-center gap-6">
          <span className="text-[10px] text-[#E8A835]/60 uppercase tracking-[0.2em] font-semibold">Segurança Garantida</span>
          <div className="flex items-center gap-8">
            {[
              { label: 'Supabase RLS', icon: <Shield size={16} /> },
              { label: 'Criptografia E2E', icon: <Shield size={16} /> },
              { label: 'Auth JWT', icon: <Shield size={16} /> },
              { label: 'Edge Functions', icon: <Zap size={16} /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-[#8B82A8]/50">{item.icon}</span>
                <span className="text-xs text-[#8B82A8]/60 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────── */}
      <section id="features" className="relative z-10 py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <FadeInSection className="text-center mb-16">
            <span className="text-[10px] text-[#A78BFA] uppercase tracking-[0.2em] font-semibold">Funcionalidades</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4 tracking-tight">
              Projetado para suas finanças
            </h2>
            <p className="text-[#8B82A8] max-w-lg mx-auto">
              Ferramentas poderosas com inteligência artificial para você ter controle total do seu dinheiro.
            </p>
          </FadeInSection>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
                delay={i * 0.08}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-20 md:py-28 px-6 md:px-10 bg-[#14112A]/40 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <FadeInSection className="text-center mb-16">
            <span className="text-[10px] text-[#E8A835] uppercase tracking-[0.2em] font-semibold">Passo a passo</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4 tracking-tight">
              Como a Nivelo funciona
            </h2>
            <p className="text-[#8B82A8] max-w-lg mx-auto">
              Comece em menos de 2 minutos — sem burocracia, sem complicação.
            </p>
          </FadeInSection>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            <StepCard
              step="01"
              title="Crie sua conta"
              description="Cadastre-se gratuitamente com email e senha. Suas categorias padrão já estarão configuradas."
              delay={0}
            />
            <StepCard
              step="02"
              title="Converse com a IA"
              description='Diga "Gastei 50 reais no almoço" e a Nivelo AI registra a transação automaticamente com categoria.'
              delay={0.1}
            />
            <StepCard
              step="03"
              title="Acompanhe e conquiste"
              description="Visualize relatórios, receba alertas de orçamento e acompanhe suas metas financeiras em tempo real."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-28 px-6 md:px-10">
        <FadeInSection className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-[42px] font-bold text-white leading-tight tracking-tight mb-6">
            Comece a nivelar suas finanças<br />
            <span className="text-[#E8A835]">hoje mesmo</span>
          </h2>
          <p className="text-[#8B82A8] text-base md:text-lg max-w-md mx-auto mb-10">
            Gratuito para sempre. Sem cartão de crédito. Suas finanças merecem inteligência.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onSignUp}
              className="group flex items-center gap-2.5 bg-[#E8A835] hover:bg-[#D4952B] text-[#0C0A1A] font-semibold text-base px-8 py-4 rounded-full transition-all duration-200 shadow-lg shadow-[#E8A835]/25 hover:shadow-xl hover:shadow-[#E8A835]/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Criar Conta Grátis
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </FadeInSection>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#14112A]/30 py-8 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NiveloLogoIcon size={20} />
            <span className="text-sm font-semibold text-white">NIVELO</span>
          </div>

          <div className="flex items-center gap-6">
            {['Privacidade', 'Termos de Uso', 'Contato'].map((link) => (
              <span key={link} className="text-xs text-[#8B82A8]/60 hover:text-[#8B82A8] transition-colors cursor-pointer uppercase tracking-wider">
                {link}
              </span>
            ))}
          </div>

          <span className="text-xs text-[#8B82A8]/40">
            © {new Date().getFullYear()} Nivelo. Todos os direitos reservados.
          </span>
        </div>
      </footer>
    </div>
  )
}
