import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin,
  AlertTriangle,
  MessageSquare,
  Share2,
  Clock,
  Plus,
  Award,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import {
  useRestaurant,
  useReviews,
  useVibeChecks,
  usePostVibeCheck,
  useSessionUser,
} from '../../lib/query/hooks'
import { VibeStatus } from '../../domain/models'
import { ShareCardDialog } from '../../components/shared/ShareCardDialog'
import { LazyImage } from '../../components/shared/LazyImage'
import { toast } from '../../components/ui/Toast'

const VIBE_LABELS: Record<VibeStatus, string> = {
  [VibeStatus.EMPTY]: 'Vazio 🌵',
  [VibeStatus.BUSY]: 'Bombando 🔥',
  [VibeStatus.QUEUE]: 'Fila ⏳',
  [VibeStatus.GOOD_MUSIC]: 'Música boa 🎵',
  [VibeStatus.GOOD_SERVICE]: 'Atendimento top 👏',
  [VibeStatus.BAD_SERVICE]: 'Atendimento ruim 😤',
  [VibeStatus.NOISY]: 'Barulhento 📢',
  [VibeStatus.ROMANTIC]: 'Romântico 💡',
  [VibeStatus.GROUP_FRIENDLY]: 'Bom p/ galera 🍻',
  [VibeStatus.OVERPRICED]: 'Facada/Caro 💸',
}

export function RestaurantDetailScreen() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const { data: currentUser } = useSessionUser()
  const { data: restaurant, isLoading: isRestaurantLoading } = useRestaurant(restaurantId || '')
  const { data: reviews, isLoading: isReviewsLoading } = useReviews({ restaurantId })
  const { data: vibeChecks } = useVibeChecks(restaurantId || '')

  const postVibeCheckMutation = usePostVibeCheck()

  // Modal / Sheet States
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isVibeSheetOpen, setIsVibeSheetOpen] = useState(false)

  // Vibe Form States
  const [vibeStatus, setVibeStatus] = useState<VibeStatus>(VibeStatus.BUSY)
  const [vibeNote, setVibeNote] = useState('')

  if (isRestaurantLoading) {
    return <div className="text-center py-10 text-xs text-[#808080]">Carregando pico…</div>
  }

  if (!restaurant) {
    return (
      <div className="text-center py-10 text-xs text-red-400 font-bold">
        Pico não encontrado
      </div>
    )
  }

  const handlePostVibeCheck = () => {
    if (!currentUser) {
      toast('Faça login primeiro!', 'error')
      return
    }

    postVibeCheckMutation.mutate(
      {
        restaurantId: restaurant.id,
        userId: currentUser.id,
        status: vibeStatus,
        note: vibeNote.trim() || null,
        photo: null,
      },
      {
        onSuccess: () => {
          setIsVibeSheetOpen(false)
          setVibeNote('')
          toast('Vibe check enviado! ✌️', 'success')
        },
        onError: () => {
          toast('Falha ao enviar vibe check', 'error')
        },
      }
    )
  }

  // Filter out expired vibe checks (older than 2h, although mock repository returns all)
  const activeVibes = vibeChecks || []

  return (
    <div className="space-y-6 max-w-md mx-auto pb-16">
      {/* Restaurant Header visual */}
      <div className="h-48 bg-[#242424] rounded-2xl overflow-hidden relative border border-[#2D2D2D]">
        <LazyImage
          src={restaurant.photos?.[0]}
          alt={restaurant.name}
          fallback="Sem foto do local"
        />

        {/* Floating actions in header */}
        <div className="absolute top-3 left-3 flex gap-2">
          <button
            onClick={() => setIsShareDialogOpen(true)}
            className="bg-[#0F0F0F]/80 hover:bg-white/10 p-2.5 rounded-full border border-white/15 hover:scale-105 transition-all text-white flex items-center justify-center"
            title="Compartilhar Pico"
            aria-label="Compartilhar Pico"
          >
            <Share2 size={13} />
          </button>
        </div>

        <div className="absolute top-3 right-3">
          <Badge className="bg-[#0F0F0F]/80 text-white font-extrabold border-none px-2.5 py-1 text-[10px]">
            {restaurant.priceRange}
          </Badge>
        </div>
      </div>

      {/* Main Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white">{restaurant.name}</h1>
            <p className="text-[11px] text-[#A0A0A0] flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-[#808080]" />
              <span className="truncate">
                {restaurant.address.street}, {restaurant.address.number} •{' '}
                {restaurant.address.neighborhood}
              </span>
            </p>
          </div>
          {restaurant.averageOverallScore && (
            <div className="flex items-center gap-1 rounded-xl bg-primary/15 border border-primary/20 px-2.5 py-1 text-xs font-black text-primary shrink-0">
              🌶️ {restaurant.averageOverallScore.toFixed(1)}
            </div>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {restaurant.categories.map((cat, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="bg-[#1A1A1A] border-[#2D2D2D] text-[10px] py-0.5 px-2 font-bold"
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Illness Warning Banner */}
      {restaurant.illnessWarning && (
        <Card className="border-[#FF453A]/30 bg-[#FF453A]/10 p-3.5 rounded-xl">
          <div className="flex gap-2.5 text-[#FF453A]">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <div>
              <p className="text-xs font-black">Alerta de Saúde</p>
              <p className="text-[11px] text-[#FFA19E] mt-0.5 leading-relaxed">
                Aviso: Esse pico recebeu {restaurant.illnessReports90d} relatos de mal-estar da galera
                nos últimos 90 dias. Fique esperto! 🤢
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Real-time Vibe Check Panel */}
      <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-3 rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} className="text-[#808080]" />
            <span>Como tá o rolê agora?</span>
          </h3>
          <button
            onClick={() => setIsVibeSheetOpen(true)}
            className="text-[10px] text-primary hover:underline font-black flex items-center gap-0.5"
          >
            <Plus size={10} /> Dar o papo
          </button>
        </div>

        {activeVibes.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {activeVibes.map((vibe) => (
              <div
                key={vibe.id}
                className="flex items-start justify-between gap-3 bg-[#242424] p-2.5 rounded-lg border border-[#2D2D2D] text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-white">
                      {VIBE_LABELS[vibe.status] || vibe.status}
                    </span>
                    <span className="text-[9px] text-[#808080]">
                      por @{vibe.userId.replace('u_', '')}
                    </span>
                  </div>
                  {vibe.note && (
                    <p className="text-[10px] text-[#A0A0A0] italic leading-relaxed truncate">
                      "{vibe.note}"
                    </p>
                  )}
                </div>
                <span className="text-[8px] text-[#606060] font-bold shrink-0">
                  {new Date(vibe.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-[#242424] rounded-lg border border-[#2D2D2D] border-dashed">
            <p className="text-[10px] text-[#808080] italic">
              Sem atualizações ao vivo nas últimas 4 horas.
            </p>
            <p className="text-[9px] text-[#606060] mt-0.5">
              Chegou no pico? Manda a real de como tá a vibe! 🌵/🔥
            </p>
          </div>
        )}
      </Card>

      {/* Action buttons grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
        <Link to={`/restaurant/${restaurant.id}/illness`}>
          <Button
            variant="outline"
            className="w-full border-[#FF453A]/20 bg-[#FF453A]/5 text-[#FF453A] hover:bg-[#FF453A]/10 rounded-xl py-5 text-xs font-bold"
          >
            🤢 Passei Mal Aqui
          </Button>
        </Link>
        <Link to="/duel">
          <Button
            variant="outline"
            className="w-full border-secondary/20 bg-secondary/5 text-secondary hover:bg-secondary/10 rounded-xl py-5 text-xs font-bold"
          >
            🥊 Iniciar Duelo
          </Button>
        </Link>
        <Link to="/review" className="col-span-2">
          <Button className="w-full rounded-xl py-5 bg-gradient-to-tr from-primary to-[#FF8C61] font-black text-xs">
            Lançar a Real 🚀
          </Button>
        </Link>
      </div>

      {/* Average Metrics Cards */}
      <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-3 rounded-xl shadow-md">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
          <Award size={12} className="text-[#808080]" />
          <span>Métricas do Bonde</span>
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(restaurant.averageMetrics || {}).map(([metric, score]) => (
            <div
              key={metric}
              className="flex justify-between items-center bg-[#242424] p-2.5 rounded-lg border border-[#2D2D2D]"
            >
              <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">
                {metric.toLowerCase().replace('_', ' ')}
              </span>
              <span className="text-xs font-black text-primary">🌶️ {score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Reviews Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
          <MessageSquare size={16} className="text-[#808080]" />
          <span>O que falaram dele</span>
        </h3>

        {isReviewsLoading ? (
          <div className="text-center py-6 text-xs text-[#808080]">Carregando fofocas…</div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id} className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-2 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    @{review.userId.replace('u_', '')}
                  </span>
                  <span className="text-[10px] text-[#808080]">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {review.comment && <p className="text-xs text-[#D0D0D0]">"{review.comment}"</p>}
                {review.overallScore && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.overallScore }).map((_, i) => (
                      <span key={i} className="text-xs">
                        🌶️
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-[#808080] italic bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl">
            Sem reviews ainda. Seja o primeiro a dar o papo!
          </div>
        )}
      </div>

      {/* Vibe Check Creator Drawer */}
      <Sheet isOpen={isVibeSheetOpen} onClose={() => setIsVibeSheetOpen(false)} title="Dar o Papo ao Vivo">
        <div className="space-y-4 pb-8">
          <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
            Como tá a situação agora?
          </label>

          {/* Vibe Status selection grid */}
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {Object.entries(VIBE_LABELS).map(([status, label]) => {
              const isSelected = vibeStatus === status
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setVibeStatus(status as VibeStatus)}
                  className={`py-2 rounded-xl border text-xs font-bold text-center transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-white font-black'
                      : 'border-[#2D2D2D] bg-[#242424] text-[#808080] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Short note */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
              Qual a fofoca? (Max 100 caracteres)
            </label>
            <input
              type="text"
              placeholder="Ex: Fila de 15 minutos, som ao vivo de MPB massa."
              maxLength={100}
              value={vibeNote}
              onChange={(e) => setVibeNote(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary font-bold"
            />
            <div className="text-right text-[8px] text-[#808080] font-bold">
              {vibeNote.length}/100
            </div>
          </div>

          <Button
            onClick={handlePostVibeCheck}
            disabled={postVibeCheckMutation.isPending}
            className="w-full rounded-full font-bold py-3 mt-2"
          >
            Lançar Vibe Check ✌️
          </Button>
        </div>
      </Sheet>

      {/* Share preview Modal */}
      {isShareDialogOpen && (
        <ShareCardDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          restaurant={restaurant}
        />
      )}
    </div>
  )
}
