import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { toast } from '../../components/ui/Toast'
import { useRestaurants, usePostDuel, useSessionUser } from '../../lib/query/hooks'
import { RestaurantCategory, MetricId } from '../../domain/models'
import { copy } from '../../copy/pt-BR'

const QUESTIONS = [
  { aspect: MetricId.TASTE, prompt: 'Quem tem o melhor sabor?' },
  { aspect: MetricId.COST_BENEFIT, prompt: 'Quem tem o melhor custo-benefício?' },
  { aspect: MetricId.SERVICE, prompt: 'Quem atende melhor?' },
]

export function DuelScreen() {
  const navigate = useNavigate()
  const { data: restaurants } = useRestaurants()
  const { data: sessionUser } = useSessionUser()
  const postDuelMutation = usePostDuel()

  const [cuisine, setCuisine] = useState<RestaurantCategory>(RestaurantCategory.PODRAO)
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isFinished, setIsFinished] = useState(false)

  // Filter restaurants by chosen cuisine
  const eligible = restaurants?.filter((r) => r.categories.includes(cuisine)) || []
  const restaurantA = eligible[0]
  const restaurantB = eligible[1]

  const handleSelectWinner = (aspect: MetricId, chosenId: string) => {
    setAnswers((prev) => ({ ...prev, [aspect]: chosenId }))

    if (activeQuestionIdx < QUESTIONS.length - 1) {
      setActiveQuestionIdx(activeQuestionIdx + 1)
    } else {
      setIsFinished(true)
    }
  }

  const handleFinishDuel = async () => {
    if (!restaurantA || !restaurantB || !sessionUser) return

    // Calculate winners per aspect
    const votesForA = Object.values(answers).filter((id) => id === restaurantA.id).length
    const overallWinnerId = votesForA >= 2 ? restaurantA.id : restaurantB.id



    const questionsPayload = QUESTIONS.map((q) => ({
      aspect: q.aspect,
      prompt: q.prompt,
      chosenId: answers[q.aspect],
    }))

    try {
      await postDuelMutation.mutateAsync({
        userId: sessionUser.id,
        cuisine,
        aId: restaurantA.id,
        bId: restaurantB.id,
        questions: questionsPayload,
        winnerId: overallWinnerId,
      })

      toast('Duelo finalizado! ELOs recalculados. 🥊', 'success')
      navigate('/duel/leaderboard')
    } catch (err) {
      toast('Deu ruim ao registrar o duelo', 'error')
    }
  }

  if (eligible.length < 2) {
    return (
      <div className="space-y-6 max-w-md mx-auto text-center py-16">
        <h1 className="text-xl font-extrabold text-white">Duelos 🥊</h1>
        <p className="text-xs text-[#A0A0A0]">
          Não temos restaurantes suficientes da culinária <span className="font-bold text-primary">{cuisine}</span> cadastrados para duelar hoje.
        </p>
        <div className="pt-4 flex flex-col gap-2">
          {Object.values(RestaurantCategory).slice(0, 5).map((cat) => (
            <Button key={cat} variant="outline" size="sm" onClick={() => setCuisine(cat)} className="rounded-full">
              Mudar para {cat}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const currentQuestion = QUESTIONS[activeQuestionIdx]

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>{copy.duel.title}</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">{copy.duel.subtitle}</p>
      </div>

      {!isFinished ? (
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-6 space-y-6">
          {/* Question Indicator */}
          <div className="flex justify-between items-center text-xs font-bold text-[#808080]">
            <span>Questão {activeQuestionIdx + 1} de {QUESTIONS.length}</span>
            <span>Métrica: {currentQuestion.aspect}</span>
          </div>

          <h3 className="text-lg font-black text-center text-white">
            {currentQuestion.prompt}
          </h3>

          <div className="grid gap-3 pt-2">
            {/* Restaurant A Option */}
            <button
              onClick={() => handleSelectWinner(currentQuestion.aspect, restaurantA.id)}
              className="w-full text-left p-4 rounded-xl border-2 border-[#2D2D2D] bg-[#242424] hover:border-primary transition-all flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-bold text-white">{restaurantA.name}</p>
                <p className="text-[10px] text-[#A0A0A0]">{restaurantA.address.neighborhood}</p>
              </div>
              <span className="text-lg">🥊</span>
            </button>

            {/* Restaurant B Option */}
            <button
              onClick={() => handleSelectWinner(currentQuestion.aspect, restaurantB.id)}
              className="w-full text-left p-4 rounded-xl border-2 border-[#2D2D2D] bg-[#242424] hover:border-primary transition-all flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-bold text-white">{restaurantB.name}</p>
                <p className="text-[10px] text-[#A0A0A0]">{restaurantB.address.neighborhood}</p>
              </div>
              <span className="text-lg">🥊</span>
            </button>
          </div>
        </Card>
      ) : (
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-6 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
            <Trophy size={26} />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Duelo Encerrado!</h2>
            <p className="text-xs text-[#A0A0A0] mt-1">
              Computamos suas respostas. Pronto para ver as novas pontuações de ELO?
            </p>
          </div>

          <div className="p-4 bg-[#242424] rounded-xl space-y-2 text-left text-xs">
            <h4 className="font-bold text-[#808080] uppercase tracking-wider text-[9px]">Gabarito do Cria</h4>
            {QUESTIONS.map((q) => {
              const winnerName = answers[q.aspect] === restaurantA.id ? restaurantA.name : restaurantB.name
              return (
                <div key={q.aspect} className="flex justify-between items-center border-b border-[#2D2D2D] pb-1.5">
                  <span className="text-[#A0A0A0]">{q.prompt}</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Check size={11} className="text-primary" /> {winnerName}
                  </span>
                </div>
              )
            })}
          </div>

          <Button onClick={handleFinishDuel} className="w-full rounded-full bg-gradient-to-tr from-primary to-[#FF8C61]">
            Calcular Novo ELO 📈
          </Button>
        </Card>
      )}
    </div>
  )
}
