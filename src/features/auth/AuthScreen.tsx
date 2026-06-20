import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { validateCpf, formatCpf } from '../../domain/logic/cpf'
import { signInWithEmail, signUpWithEmail } from '../../lib/auth'
import { isSupabaseConfigured } from '../../data/supabase/client'

type Mode = 'signin' | 'signup'

const inputClass =
  'w-full rounded-xl border-2 border-[#2D2D2D] bg-[#1A1A1A] px-4 py-3 text-sm font-semibold text-white outline-none transition-all placeholder:text-[#666] focus:border-primary focus:bg-primary/5'

export function AuthScreen() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)

  const refreshSession = () =>
    queryClient.invalidateQueries({ queryKey: ['sessionUser'] })

  // New accounts still need to pick a city/CPF; returning users go home.
  const nextRoute = () =>
    localStorage.getItem('hasCompletedOnboarding') === 'true'
      ? '/'
      : '/onboarding'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      toast('Backend não configurado — rodando no modo mock.', 'error')
      return
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (!username.trim() || !displayName.trim()) {
          toast('Bota um @ e um nome pra galera te achar.', 'error')
          return
        }
        const cpfDigits = cpf.replace(/\D/g, '')
        const cpfValid = cpfDigits.length > 0 ? validateCpf(cpf) : false
        if (cpfDigits.length > 0 && !cpfValid) {
          toast('CPF inválido, chef! Confere os dígitos. 🤖', 'error')
          return
        }
        await signUpWithEmail({
          email: email.trim(),
          // Store the handle bare (no leading @) — the UI adds the @ when showing it,
          // so storing "@hugo" would render as "@@hugo".
          username: username.trim().replace(/^@+/, ''),
          password,
          displayName: displayName.trim(),
          cpf: cpfDigits || undefined,
          cpfValid: cpfDigits ? cpfValid : undefined,
        })
        await refreshSession()
        toast('Conta criada! Bora amassar 🚀', 'success')
        navigate('/onboarding')
      } else {
        await signInWithEmail(email.trim(), password)
        await refreshSession()
        toast('Tamo junto! 👊', 'success')
        navigate(nextRoute())
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deu ruim, tenta de novo.'
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F0F0F] p-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] shadow-[0_0_30px_rgba(255,107,53,0.4)]">
            <Sparkles size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {mode === 'signin' ? 'Bem-vindo de volta 👋' : 'Cria sua conta 🍔'}
          </h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            {mode === 'signin'
              ? 'Entra pra continuar amassando no feed.'
              : 'Junta-se ao Rango Social e bora pros rolês.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <input
                className={inputClass}
                placeholder="Nome (ex: Hugo)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
              <input
                className={inputClass}
                placeholder="@usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </>
          )}
          <input
            className={inputClass}
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            className={inputClass}
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
          />
          {mode === 'signup' && (
            <input
              className={inputClass}
              placeholder="CPF (opcional, prova que não é robô)"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              inputMode="numeric"
            />
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-6 text-base font-bold"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : mode === 'signin' ? (
              'Entrar'
            ) : (
              'Criar conta'
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-5 w-full text-center text-sm text-[#A0A0A0] transition-colors hover:text-white"
        >
          {mode === 'signin' ? (
            <>
              Ainda não tem conta?{' '}
              <span className="font-bold text-primary">Cadastra-se</span>
            </>
          ) : (
            <>
              Já é do bonde?{' '}
              <span className="font-bold text-primary">Entrar</span>
            </>
          )}
        </button>

        {!isSupabaseConfigured && (
          <p className="mt-6 text-center text-xs text-[#666]">
            Backend não configurado — o app está rodando no modo mock.
          </p>
        )}
      </motion.div>
    </div>
  )
}
