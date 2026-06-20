import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, Sparkles, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { toast } from '../../components/ui/Toast'
import { validateCpf, formatCpf } from '../../domain/logic/cpf'
import { copy } from '../../copy/pt-BR'
import {
  useUpdateUser,
  useSessionUser,
  useSuggestedUsers,
  useToggleFollow,
} from '../../lib/query/hooks'
import { SlangLevel } from '../../domain/models'
import { isSupabaseConfigured } from '../../data/supabase/client'
import { LocationPicker } from '../../components/shared/LocationPicker'

const STEPS = {
  WELCOME: 0,
  STYLE: 1,
  CITY: 2,
  CPF: 3,
  FOLLOW: 4,
  DONE: 5,
}

const STYLES = [
  { id: 'BONDE', title: '🍔 Sou do bonde', desc: 'Social, curte colar nos rolês com a tropa.' },
  { id: 'INFLUENCER', title: '📸 Influencer', desc: 'Quer postar reviews detalhados e amassar no feed.' },
  { id: 'FOODIE', title: '🍽️ Foodie', desc: 'Focado em qualidade, sabor e experiências premium.' },
  { id: 'BARATIN', title: '💸 Baratin', desc: 'Focado no custo-benefício, rango bom e barato.' },
]

export function OnboardingScreen() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEPS.WELCOME)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedUf, setSelectedUf] = useState<string>('')
  const [cpf, setCpf] = useState('')
  const [following, setFollowing] = useState<string[]>([])

  const { data: sessionUser, isLoading: sessionLoading } = useSessionUser()
  const updateUserMutation = useUpdateUser()
  const { data: suggestedUsers, isLoading: suggestionsLoading } =
    useSuggestedUsers(sessionUser?.id ?? '')
  const toggleFollowMutation = useToggleFollow()

  // Onboarding only makes sense for a signed-in user (their profile is what we
  // write to). If a backend is configured but there's no session, go sign in.
  useEffect(() => {
    if (isSupabaseConfigured && !sessionLoading && !sessionUser) {
      navigate('/auth', { replace: true })
    }
  }, [sessionLoading, sessionUser, navigate])

  const handleNext = () => {
    if (step < STEPS.DONE) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > STEPS.WELCOME) {
      setStep(step - 1)
    }
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpf(e.target.value))
  }

  const handleValidateAndNextCpf = () => {
    if (validateCpf(cpf)) {
      handleNext()
    } else {
      toast('CPF inválido, chef! Bota um de verdade pra provar que não é robô 🤖', 'error')
    }
  }

  const toggleFollow = (id: string) => {
    if (!sessionUser) return
    const willFollow = !following.includes(id)
    setFollowing((prev) =>
      willFollow ? [...prev, id] : prev.filter((item) => item !== id)
    )
    // Persist immediately so the follow survives onboarding.
    toggleFollowMutation.mutate({
      followerId: sessionUser.id,
      followingId: id,
      follow: willFollow,
    })
  }

  const handleFinish = async () => {
    // Set onboarding as completed in local storage
    localStorage.setItem('hasCompletedOnboarding', 'true')

    if (sessionUser) {
      const updatedUser = {
        ...sessionUser,
        cpf: cpf.replace(/\D/g, ''),
        cpfValid: true,
        preferences: {
          ...sessionUser.preferences,
          defaultCity: selectedCity || null,
          defaultState: selectedUf || null,
          slangLevel: SlangLevel.HIGH, // Default high slang for Gen Z feel
        }
      }
      try {
        await updateUserMutation.mutateAsync(updatedUser)
      } catch (err) {
        console.error('Failed to update onboarding user', err)
      }
    }

    toast('Tudo pronto! Bora amassar 🚀', 'success')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F0F0F] p-4 text-white">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === STEPS.WELCOME && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] shadow-[0_0_30px_rgba(255,107,53,0.4)]">
                  <Sparkles size={38} className="text-white animate-pulse" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {copy.onboarding.welcome}
              </h1>
              <p className="mt-4 text-base text-[#A0A0A0]">
                {copy.onboarding.subtitle}
              </p>
              <Button onClick={handleNext} className="mt-8 w-full py-6 text-base font-bold rounded-full">
                Bora começar! 👋
              </Button>
            </motion.div>
          )}

          {step === STEPS.STYLE && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-primary">
                  {copy.onboarding.chooseStyle}
                </h2>
                <p className="text-sm text-[#A0A0A0]">Como é seu rolê gastronômico?</p>
              </div>

              <div className="grid gap-3">
                {STYLES.map((style) => (
                  <Card
                    key={style.id}
                    className={`cursor-pointer border-2 transition-all ${
                      selectedStyle === style.id
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(255,107,53,0.15)]'
                        : 'border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#444]'
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-bold text-white">{style.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <CardDescription className="text-xs text-[#A0A0A0]">
                        {style.desc}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full border-[#2D2D2D] hover:bg-[#1A1A1A]">
                  Voltar
                </Button>
                <Button onClick={handleNext} disabled={!selectedStyle} className="flex-1 rounded-full">
                  Próximo
                </Button>
              </div>
            </motion.div>
          )}

          {step === STEPS.CITY && (
            <motion.div
              key="city"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-primary">
                  {copy.onboarding.chooseCity}
                </h2>
                <p className="text-sm text-[#A0A0A0]">Bota seu radar no lugar certo.</p>
              </div>

              <LocationPicker
                uf={selectedUf || null}
                city={selectedCity || null}
                onChange={({ uf, city }) => {
                  setSelectedUf(uf)
                  setSelectedCity(city)
                }}
              />

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full border-[#2D2D2D] hover:bg-[#1A1A1A]">
                  Voltar
                </Button>
                <Button onClick={handleNext} disabled={!selectedUf || !selectedCity} className="flex-1 rounded-full">
                  Próximo
                </Button>
              </div>
            </motion.div>
          )}

          {step === STEPS.CPF && (
            <motion.div
              key="cpf"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                  <ShieldAlert size={26} />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  Sem bot por aqui! 🤖
                </h2>
                <p className="mt-2 text-sm text-[#A0A0A0]">
                  Bota teu CPF pra provar que não é robô. Fica sussa, a gente só confere o dígito pra ver se é real! 😉
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A0A0A0]">
                  CPF do Cria
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#1A1A1A] px-4 py-4 text-center text-lg font-bold tracking-widest text-white outline-none transition-all focus:border-primary focus:bg-primary/5"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full border-[#2D2D2D] hover:bg-[#1A1A1A]">
                  Voltar
                </Button>
                <Button
                  onClick={handleValidateAndNextCpf}
                  disabled={cpf.replace(/\D/g, '').length !== 11}
                  className="flex-1 rounded-full"
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          )}

          {step === STEPS.FOLLOW && (
            <motion.div
              key="follow"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-primary">
                  {copy.onboarding.followPeople}
                </h2>
                <p className="text-sm text-[#A0A0A0]">Veja reviews de quem manja muito de rango.</p>
              </div>

              <div className="space-y-3">
                {suggestionsLoading ? (
                  <p className="py-6 text-center text-xs text-[#808080]">Buscando a galera…</p>
                ) : !suggestedUsers || suggestedUsers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2D2D2D] bg-[#1A1A1A] p-6 text-center">
                    <p className="text-sm font-bold text-white">Você é dos primeiros! 🎉</p>
                    <p className="mt-1 text-xs text-[#808080]">
                      Convida teus amigos pra testar e segue eles aqui depois.
                    </p>
                  </div>
                ) : (
                  suggestedUsers.map((person) => {
                    const isFollowing = following.includes(person.id)
                    return (
                      <div
                        key={person.id}
                        className="flex items-center justify-between rounded-xl bg-[#1A1A1A] p-4 border border-[#2D2D2D]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-secondary to-[#A391FF] text-white font-extrabold text-sm">
                            {person.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{person.displayName}</p>
                            <p className="text-xs text-[#A0A0A0]">@{person.username}</p>
                            {person.bio && (
                              <p className="mt-1 text-[11px] text-[#808080] line-clamp-1">{person.bio}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isFollowing ? 'outline' : 'primary'}
                          onClick={() => toggleFollow(person.id)}
                          className={`rounded-full text-xs h-8 ${
                            isFollowing ? 'border-[#2D2D2D] hover:bg-transparent text-[#A0A0A0]' : 'px-4'
                          }`}
                        >
                          {isFollowing ? (
                            <span className="flex items-center gap-1">
                              <Check size={12} /> Seguindo
                            </span>
                          ) : (
                            'Seguir'
                          )}
                        </Button>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full border-[#2D2D2D] hover:bg-[#1A1A1A]">
                  Voltar
                </Button>
                <Button onClick={handleNext} className="flex-1 rounded-full">
                  Falta pouco!
                </Button>
              </div>
            </motion.div>
          )}

          {step === STEPS.DONE && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="mb-6 flex justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] shadow-[0_0_40px_rgba(255,107,53,0.5)]">
                  <span className="text-4xl animate-bounce">🍕</span>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Boca livre tá liberada! 🚀
              </h2>
              <p className="text-[#A0A0A0] text-sm">
                Agora você faz parte do Rango Social. Descubra os rankings do bairro, vote em duelos e encontre o rango perfeito com a tropa!
              </p>
              
              <Button onClick={handleFinish} className="w-full py-6 text-base font-bold rounded-full">
                {copy.onboarding.done}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
