import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function AuthView() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setIsLoading(true)

    let err: string | null = null

    if (mode === 'signup') {
      err = await signUp(email, password, fullName)
      if (!err) {
        setSuccessMsg('Account created! Check your email to confirm before signing in.')
        setMode('login')
      }
    } else {
      err = await signIn(email, password)
    }

    if (err) setError(err)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center">
            <Activity size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight leading-none text-white">AXIS</p>
            <p className="text-[11px] text-muted mt-0.5">Autonomous Finance</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.02] mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); setSuccessMsg(null) }}
                className={`flex-1 py-2 text-xs font-medium tracking-wide transition-colors ${
                  mode === m
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div
                  key="fullname"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-[11px] text-muted mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    required={mode === 'signup'}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[11px] text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Success */}
            {successMsg && (
              <p className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full bg-accent/15 hover:bg-accent/25 border border-accent/20 text-accent font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted/40 mt-4">
          AXIS Lab · Personal Finance · v1.0.0
        </p>
      </motion.div>
    </div>
  )
}
