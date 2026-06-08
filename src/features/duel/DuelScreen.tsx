import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy, Swords, Check, ChevronLeft, Share2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { toast } from '../../components/ui/Toast'
import { DuelRecapCard } from '../../components/shared/DuelRecapCard'
import {
  useReviews,
  usePostDuel,
  useSessionUser,
} from '../../lib/query/hooks'
import {
  detectDuelOpportunities,
  computeDuelWinner,
  CUISINE_LABELS,
  type DuelOpportunity,
} from '../../domain/logic/duel'
import { copy } from '../../copy/pt-BR'

export function DuelScreen() {
  const navigate = useNavigate()
  const { data: sessionUser } = useSessionUser()
  const { data: myReviews } = useReviews({ userId: sessionUser?.id })
  const postDuelMutation = usePostDuel()

  // Only the current user's reviews feed the trigger (guards the undefined-userId render).
  const opportunities = useMemo(
    () =>
      detectDuelOpportunities(
        (myReviews ?? []).filter((r) => r.userId === sessionUser?.id)
      ),
    [myReviews, sessionUser?.id]
  )

  const [selected, setSelected] = useState<DuelOpportunity | null>(null)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [isRecapOpen, setIsRecapOpen] = useState(false)

  const resetFlow = () => {
    setQuestionIdx(0)
    setAnswers({})
    setWinnerId(null)
  }

  const startMatchup = (op: DuelOpportunity) => {
    setSelected(op)
    resetFlow()
  }

  const finish = async (finalAnswers: Record<string, string>) => {
    if (!selected || !sessionUser) return
    const wId = computeDuelWinner(
      finalAnswers,
      selected.aRestaurantId,
      selected.bRestaurantId
    )
    setWinnerId(wId)
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.7 } })

    try {
      await postDuelMutation.mutateAsync({
        userId: sessionUser.id,
        cuisine: selected.cuisine,
        aId: selected.aRestaurantId,
        bId: selected.bRestaurantId,
        questions: selected.questions.map((q) => ({
          aspect: q.aspect,
          prompt: q.prompt,
          chosenId: finalAnswers[q.aspect],
        })),
        winnerId: wId,
      })
    } catch {
      toast('Deu ruim ao registrar o duelo', 'error')
    }
  }

  const answer = (aspect: string, chosenId: string) => {
    if (!selected) return
    const next = { ...answers, [aspect]: chosenId }
    setAnswers(next)
    if (questionIdx < selected.questions.length - 1) {
      setQuestionIdx(questionIdx + 1)
    } else {
      finish(next)
    }
  }

  const header = (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <Swords className="text-primary" />
          <span>{copy.duel.title}</span>
        </h1>
        <p className="mt-1 text-xs text-[#A0A0A0]">{copy.duel.subtitle}</p>
      </div>
      <Link to="/duel/leaderboard">
        <button className="rounded-full bg-[#1A1A1A] border border-[#2D2D2D] px-3 py-2 text-[10px] font-black uppercase text-primary">
          🏆 Ranking
        </button>
      </Link>
    </div>
  )

  // --- Empty state (no eligible matchups) ---
  if (opportunities.length === 0 && !selected) {
    return (
      <div className="mx-auto max-w-md space-y-6 pb-10">
        {header}
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-8 text-center">
          <Swords size={32} className="mx-auto text-[#3A3A3A]" />
          <p className="mt-3 text-xs leading-relaxed text-[#A0A0A0]">
            {copy.duel.noMatchups}
          </p>
          <Link to="/review">
            <Button className="mt-5 rounded-full text-xs">Mandar uma real 🚀</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // --- Matchup picker ---
  if (!selected) {
    return (
      <div className="mx-auto max-w-md space-y-6 pb-10">
        {header}
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#808080]">
          {copy.duel.pickMatchup}
        </h3>
        <div className="space-y-3">
          {opportunities.map((op) => (
            <Card
              key={`${op.cuisine}-${op.aRestaurantId}-${op.bRestaurantId}`}
              className="border-[#2D2D2D] bg-[#1A1A1A] p-4"
            >
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[9px] font-black uppercase text-primary">
                {CUISINE_LABELS[op.cuisine]}
              </span>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="flex-1 truncate text-sm font-bold text-white">
                  {op.aName}
                </span>
                <span className="text-xs font-black text-[#808080]">VS</span>
                <span className="flex-1 truncate text-right text-sm font-bold text-white">
                  {op.bName}
                </span>
              </div>
              <Button
                onClick={() => startMatchup(op)}
                className="mt-4 w-full rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] text-xs font-bold"
              >
                {copy.duel.start}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const winnerName =
    winnerId === selected.aRestaurantId ? selected.aName : selected.bName
  const loserName =
    winnerId === selected.aRestaurantId ? selected.bName : selected.aName

  // --- Result reveal ---
  if (winnerId) {
    return (
      <div className="mx-auto max-w-md space-y-6 pb-10">
        {header}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <Card className="border-primary/30 bg-primary/5 p-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 14 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 text-amber-400"
            >
              <Trophy size={30} />
            </motion.div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#808080]">
              {CUISINE_LABELS[selected.cuisine]}
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">{winnerName}</h2>
            <p className="text-xs text-[#A0A0A0]">{copy.duel.winner}</p>
            <p className="mt-1 text-[11px] text-[#808080]">
              bateu <span className="font-bold text-[#A0A0A0]">{loserName}</span>
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={() => setIsRecapOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] text-xs font-bold"
              >
                <Share2 size={14} /> {copy.duel.shareRecap}
              </Button>
              <Button
                onClick={() => navigate('/duel/leaderboard')}
                variant="outline"
                className="w-full rounded-full border-[#2D2D2D] text-xs"
              >
                {copy.duel.seeLeaderboard}
              </Button>
              <button
                onClick={() => setSelected(null)}
                className="text-[11px] font-bold text-[#808080] hover:text-white"
              >
                Duelar de novo
              </button>
            </div>
          </Card>
        </motion.div>

        <DuelRecapCard
          isOpen={isRecapOpen}
          onClose={() => setIsRecapOpen(false)}
          cuisineLabel={CUISINE_LABELS[selected.cuisine]}
          winnerName={winnerName}
          loserName={loserName}
        />
      </div>
    )
  }

  // --- Question flow ---
  const currentQuestion = selected.questions[questionIdx]
  return (
    <div className="mx-auto max-w-md space-y-6 pb-10">
      {header}
      <Card className="space-y-6 border-[#2D2D2D] bg-[#1A1A1A] p-6">
        <div className="flex items-center justify-between text-xs font-bold text-[#808080]">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1 hover:text-white"
          >
            <ChevronLeft size={14} /> Trocar
          </button>
          <span>
            Questão {questionIdx + 1} de {selected.questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {selected.questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full ${
                idx <= questionIdx ? 'bg-primary' : 'bg-[#2D2D2D]'
              }`}
            />
          ))}
        </div>

        <h3 className="text-center text-lg font-black text-white">
          {currentQuestion.prompt}
        </h3>

        <div className="grid gap-3 pt-2">
          {[
            { id: selected.aRestaurantId, name: selected.aName },
            { id: selected.bRestaurantId, name: selected.bName },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => answer(currentQuestion.aspect, r.id)}
              className="flex w-full items-center justify-between rounded-xl border-2 border-[#2D2D2D] bg-[#242424] p-4 text-left transition-all hover:border-primary"
            >
              <span className="text-sm font-bold text-white">{r.name}</span>
              <span className="text-lg">🥊</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Running tally */}
      {Object.keys(answers).length > 0 && (
        <div className="space-y-1.5 px-1">
          {selected.questions.slice(0, questionIdx).map((q) => {
            const chosenName =
              answers[q.aspect] === selected.aRestaurantId
                ? selected.aName
                : selected.bName
            return (
              <div
                key={q.aspect}
                className="flex items-center justify-between text-[11px] text-[#808080]"
              >
                <span>{q.prompt}</span>
                <span className="flex items-center gap-1 font-bold text-white">
                  <Check size={11} className="text-primary" /> {chosenName}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
