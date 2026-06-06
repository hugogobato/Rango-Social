import { useParams, Link } from 'react-router-dom'
import { MapPin, AlertTriangle, MessageSquare } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useRestaurant, useReviews } from '../../lib/query/hooks'

export function RestaurantDetailScreen() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const { data: restaurant, isLoading: isRestaurantLoading } = useRestaurant(restaurantId || '')
  const { data: reviews, isLoading: isReviewsLoading } = useReviews({ restaurantId })

  if (isRestaurantLoading) {
    return <div className="text-center py-10 text-xs text-[#808080]">Carregando pico...</div>
  }

  if (!restaurant) {
    return <div className="text-center py-10 text-xs text-[#808080]">Pico não encontrado</div>
  }

  return (
    <div className="space-y-6 max-w-md mx-auto pb-16">
      {/* Restaurant Header visual */}
      <div className="h-48 bg-[#242424] rounded-2xl overflow-hidden relative border border-[#2D2D2D]">
        {restaurant.photos && restaurant.photos[0] ? (
          <img src={restaurant.photos[0]} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#808080]">Sem foto do local</div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className="bg-[#0F0F0F]/80 text-white font-extrabold border-none px-2.5 py-1">
            {restaurant.priceRange}
          </Badge>
        </div>
      </div>

      {/* Main Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{restaurant.name}</h1>
            <p className="text-xs text-[#A0A0A0] flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-[#808080]" />
              {restaurant.address.street}, {restaurant.address.number} • {restaurant.address.neighborhood}
            </p>
          </div>
          {restaurant.averageOverallScore && (
            <div className="flex items-center gap-1 rounded-xl bg-primary/15 border border-primary/20 px-2.5 py-1 text-sm font-black text-primary">
              🌶️ {restaurant.averageOverallScore.toFixed(1)}
            </div>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {restaurant.categories.map((cat, idx) => (
            <Badge key={idx} variant="outline" className="bg-[#1A1A1A] border-[#2D2D2D] text-xs py-1 px-2.5">
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Illness Warning Banner */}
      {restaurant.illnessWarning && (
        <Card className="border-[#FF453A]/30 bg-[#FF453A]/10 p-4">
          <div className="flex gap-2.5 text-[#FF453A]">
            <AlertTriangle size={20} className="flex-shrink-0" />
            <div>
              <p className="text-xs font-black">Alerta de Saúde</p>
              <p className="text-[11px] text-[#FFA19E] mt-0.5 leading-relaxed">
                Aviso: Esse pico recebeu {restaurant.illnessReports90d} relatos de mal-estar da galera nos últimos 90 dias. Fique esperto! 🤢
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Action buttons grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
        <Link to={`/restaurant/${restaurant.id}/illness`}>
          <Button variant="outline" className="w-full border-[#FF453A]/20 bg-[#FF453A]/5 text-[#FF453A] hover:bg-[#FF453A]/10 rounded-xl py-5">
            🤢 Passei Mal Aqui
          </Button>
        </Link>
        <Link to="/duel">
          <Button variant="outline" className="w-full border-secondary/20 bg-secondary/5 text-secondary hover:bg-secondary/10 rounded-xl py-5">
            🥊 Iniciar Duelo
          </Button>
        </Link>
        <Link to="/review" className="col-span-2">
          <Button className="w-full rounded-xl py-5 bg-gradient-to-tr from-primary to-[#FF8C61] font-black">
            Lançar a Real 🚀
          </Button>
        </Link>
      </div>

      {/* Average Metrics Cards */}
      <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Métricas do Bonde</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(restaurant.averageMetrics || {}).slice(0, 4).map(([metric, score]) => (
            <div key={metric} className="flex justify-between items-center bg-[#242424] p-2.5 rounded-lg border border-[#2D2D2D]">
              <span className="text-[11px] text-[#A0A0A0] font-semibold">{metric}</span>
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
          <div className="text-center py-6 text-xs text-[#808080]">Carregando fofocas...</div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id} className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">@{review.userId.replace('u_', '')}</span>
                  <span className="text-[10px] text-[#808080]">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {review.comment && <p className="text-xs text-[#D0D0D0]">"{review.comment}"</p>}
                {review.overallScore && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.overallScore }).map((_, i) => (
                      <span key={i} className="text-xs">🌶️</span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-[#808080] italic">
            Sem reviews ainda. Seja o primeiro a dar o papo!
          </div>
        )}
      </div>
    </div>
  )
}
