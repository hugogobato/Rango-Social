import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShieldCheck, HeartCrack, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { toast } from '../../components/ui/Toast'
import {
  usePostIllnessReport,
  useIllnessReportLimit,
  useSessionUser,
} from '../../lib/query/hooks'
import { IllnessSymptom } from '../../domain/models'
import { copy } from '../../copy/pt-BR'

export function IllnessReportScreen() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const navigate = useNavigate()

  const { data: sessionUser } = useSessionUser()
  const postIllnessReportMutation = usePostIllnessReport()
  const { data: canReport, isLoading: isCheckingLimit } = useIllnessReportLimit(
    restaurantId || '',
    sessionUser?.id || ''
  )

  const [symptom, setSymptom] = useState<IllnessSymptom>(IllnessSymptom.MAL_ESTAR)
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  const alreadyReported = canReport === false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurantId) return

    try {
      await postIllnessReportMutation.mutateAsync({
        restaurantId,
        symptom,
        note: note || undefined,
        mealDate,
      })

      toast('Relato enviado anonimamente. Cuidado com o estômago! 🤢', 'success')
      navigate(`/restaurant/${restaurantId}`)
    } catch (err) {
      if (err instanceof Error && err.message === 'ALREADY_REPORTED') {
        toast(copy.illness.alreadyReported, 'info')
      } else {
        toast('Falha ao enviar relato', 'error')
      }
    }
  }

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <HeartCrack className="text-[#FF453A]" />
          <span>{copy.illness.title}</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">
          Relate anonimamente para alertar outros clientes se o Pico estiver zoado.
        </p>
      </div>

      {alreadyReported ? (
        <Card className="border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 size={32} className="text-primary" />
            <p className="text-sm font-bold text-white">{copy.illness.alreadyReported}</p>
            <Button
              onClick={() => navigate(`/restaurant/${restaurantId}`)}
              variant="outline"
              className="rounded-full border-[#2D2D2D] text-xs"
            >
              Voltar pro pico
            </Button>
          </div>
        </Card>
      ) : (
      <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Safety Notice */}
          <div className="flex gap-2.5 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-[#E0E0E0]">
            <ShieldCheck size={16} className="text-primary flex-shrink-0" />
            <p>
              Sua identidade está protegida. Apenas a contagem agregada de relatos recentes será mostrada publicamente para evitar linchamentos de picos.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#A0A0A0]">{copy.illness.symptomLabel}</label>
            <select
              value={symptom}
              onChange={(e) => setSymptom(e.target.value as IllnessSymptom)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
            >
              {Object.values(IllnessSymptom).map((sym) => (
                <option key={sym} value={sym}>
                  {sym === IllnessSymptom.INTOXICACAO
                    ? '🤮 Intoxicação Alimentar'
                    : sym === IllnessSymptom.DIARREIA
                      ? '🚽 Diarreia'
                      : sym === IllnessSymptom.VOMITO
                        ? '🤢 Vômito'
                        : sym === IllnessSymptom.MAL_ESTAR
                          ? '🤒 Mal-estar Geral'
                          : '❓ Outro'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#A0A0A0]">{copy.illness.mealDateLabel}</label>
            <input
              type="date"
              value={mealDate}
              onChange={(e) => setMealDate(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#A0A0A0]">Observações Extras</label>
            <textarea
              placeholder={copy.illness.notePlaceholder}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl p-3 text-xs text-white outline-none focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={postIllnessReportMutation.isPending || isCheckingLimit}
            className="w-full rounded-full bg-[#FF453A] hover:bg-red-600 text-white font-bold py-6 text-sm"
          >
            {postIllnessReportMutation.isPending ? 'Enviando…' : copy.illness.submit}
          </Button>
        </form>
      </Card>
      )}
    </div>
  )
}
