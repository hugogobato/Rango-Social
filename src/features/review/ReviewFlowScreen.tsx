import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, DollarSign, Image } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { toast } from '../../components/ui/Toast'
import { useRestaurants, usePostReview, useSessionUser } from '../../lib/query/hooks'
import { MetricId } from '../../domain/models'
import { copy } from '../../copy/pt-BR'
import confetti from 'canvas-confetti'

export function ReviewFlowScreen() {
  const navigate = useNavigate()
  const { data: restaurants } = useRestaurants()
  const { data: sessionUser } = useSessionUser()
  const postReviewMutation = usePostReview()

  const [step, setStep] = useState(1)
  const [restaurantId, setRestaurantId] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [partySize, setPartySize] = useState(1)
  const [totalSpent, setTotalSpent] = useState<number | undefined>(undefined)
  const [comment, setComment] = useState('')
  const [overallScore, setOverallScore] = useState(3)

  // Metrics state
  const [taste, setTaste] = useState(3)
  const [costBenefit, setCostBenefit] = useState(3)
  const [service, setService] = useState(3)
  const [vibe, setVibe] = useState(3)

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const handleSubmit = async () => {
    if (!restaurantId) {
      toast('Escolhe o pico primeiro, chef!', 'error')
      return
    }

    const reviewData = {
      userId: sessionUser?.id || 'u_me',
      restaurantId,
      overallScore,
      visitDate,
      comment: comment || null,
      photos: ['https://picsum.photos/seed/review/600/400'],
      companions: [],
      targetDestinations: [{ type: 'profile' as const, id: sessionUser?.id || 'u_me' }],
      receiptPhoto: null,
      totalSpent,
      partySize,
      metrics: {
        [MetricId.TASTE]: taste,
        [MetricId.COST_BENEFIT]: costBenefit,
        [MetricId.SERVICE]: service,
        [MetricId.VIBE]: vibe,
      } as Record<MetricId, number>,
    }

    try {
      await postReviewMutation.mutateAsync(reviewData)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#FF6B35', '#7B61FF', '#00D9C0']
      })
      toast('Crítica lançada com sucesso! 🚀', 'success')
      navigate('/')
    } catch (err) {
      toast('Deu ruim ao postar review!', 'error')
    }
  }

  const perPersonCost = totalSpent && partySize > 0 ? (totalSpent / partySize).toFixed(0) : null

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>{copy.cta.reviewPrimary}</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">Lança a braba sem rodeios</p>
      </div>

      {step === 1 && (
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-bold text-white">Passo 1: Onde e Quando?</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#A0A0A0]">Escolher Pico</label>
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="">Selecione o restaurante...</option>
                {restaurants?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.address.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#A0A0A0] flex items-center gap-1">
                <Calendar size={13} /> Data do Rango
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            <Button onClick={handleNext} disabled={!restaurantId} className="w-full rounded-full">
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-bold text-white">Passo 2: Quanto gastou?</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A0A0A0] flex items-center gap-1">
                  <DollarSign size={13} /> Valor Total
                </label>
                <input
                  type="number"
                  placeholder="Total R$"
                  value={totalSpent || ''}
                  onChange={(e) => setTotalSpent(Number(e.target.value) || undefined)}
                  className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A0A0A0] flex items-center gap-1">
                  <Users size={13} /> Galera
                </label>
                <input
                  type="number"
                  min="1"
                  value={partySize}
                  onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {perPersonCost && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-center">
                <p className="text-xs text-[#A0A0A0]">Gasto por cabeça</p>
                <p className="text-lg font-black text-primary">R$ {perPersonCost}/pessoa</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full border-[#2D2D2D]">
                Voltar
              </Button>
              <Button onClick={handleNext} className="flex-1 rounded-full">
                Próximo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-bold text-white">Passo 3: Notas e Métricas</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-5 pt-2">
            {/* General rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A0A0A0]">Média Geral: {overallScore} / 5</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallScore(star)}
                    className="text-xl"
                  >
                    {star <= overallScore ? '🌶️' : '⚪'}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual sliders */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Sabor</span>
                  <span>{taste}/5</span>
                </div>
                <input
                  type="range" min="1" max="5" value={taste}
                  onChange={(e) => setTaste(Number(e.target.value))}
                  className="w-full accent-primary bg-[#242424]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Custo-benefício</span>
                  <span>{costBenefit}/5</span>
                </div>
                <input
                  type="range" min="1" max="5" value={costBenefit}
                  onChange={(e) => setCostBenefit(Number(e.target.value))}
                  className="w-full accent-primary bg-[#242424]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Atendimento</span>
                  <span>{service}/5</span>
                </div>
                <input
                  type="range" min="1" max="5" value={service}
                  onChange={(e) => setService(Number(e.target.value))}
                  className="w-full accent-primary bg-[#242424]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Vibe</span>
                  <span>{vibe}/5</span>
                </div>
                <input
                  type="range" min="1" max="5" value={vibe}
                  onChange={(e) => setVibe(Number(e.target.value))}
                  className="w-full accent-primary bg-[#242424]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full border-[#2D2D2D]">
                Voltar
              </Button>
              <Button onClick={handleNext} className="flex-1 rounded-full">
                Próximo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-bold text-white">Passo 4: Manda o Papo</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#A0A0A0]">Diz aí como foi (slangs liberados)</label>
              <textarea
                placeholder="O hambúrguer é sacanagem de bom, mas a fila flopou legal..."
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl p-3 text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="p-4 border border-dashed border-[#2D2D2D] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#242424]/50">
              <Image size={18} className="text-[#808080]" />
              <span className="text-[10px] text-[#A0A0A0] font-semibold">Subir foto do prato/comanda</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full border-[#2D2D2D]">
                Voltar
              </Button>
              <Button onClick={handleSubmit} className="flex-1 rounded-full bg-gradient-to-tr from-primary to-[#FF8C61]">
                {copy.cta.publish}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
