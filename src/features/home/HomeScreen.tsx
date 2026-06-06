import { Link } from 'react-router-dom'
import { Sparkles, Trophy, Plus, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useRestaurants, useReviews, useStories } from '../../lib/query/hooks'
import { ReviewCard } from '../../components/shared/ReviewCard'
import { copy } from '../../copy/pt-BR'

export function HomeScreen() {
  const { data: restaurants, isLoading: isRestaurantsLoading } = useRestaurants()
  const { data: reviews, isLoading: isReviewsLoading } = useReviews()
  const { data: stories } = useStories()

  return (
    <div className="space-y-6">
      {/* Stories Horizontal Rail */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#808080]">Stories da Galera</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {/* Post Story Add button */}
          <Link to="/stories" className="flex flex-col items-center flex-shrink-0 gap-1.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#2D2D2D] bg-[#1A1A1A] hover:bg-[#252525] transition-all">
              <Plus size={20} className="text-primary" />
            </div>
            <span className="text-[10px] text-[#A0A0A0] font-medium">Postar</span>
          </Link>

          {/* Stories list */}
          {stories && stories.length > 0 ? (
            stories.map((story) => (
              <Link key={story.id} to="/stories" className="flex flex-col items-center flex-shrink-0 gap-1.5">
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] shadow-[0_0_10px_rgba(255,107,53,0.2)]">
                  <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-[#0F0F0F] bg-[#242424]">
                    <img src={story.photoUrl} alt="Story" className="h-full w-full object-cover" />
                  </div>
                </div>
                <span className="text-[10px] text-white font-medium max-w-[60px] truncate">
                  {story.userId.replace('u_', '')}
                </span>
              </Link>
            ))
          ) : (
            <div className="flex items-center text-xs text-[#666] italic pl-2">Nenhum story ativo</div>
          )}
        </div>
      </section>

      {/* Vibe Checks Horizontal Rail */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#808080]">Como tá o rolê? (Vibe Check)</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['🤠 Vazio', '🔥 Bombando', '⏳ Fila Gigante', '🎵 Som Alto'].map((vibe, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="bg-[#1A1A1A] text-xs py-2 px-3 flex-shrink-0 border-[#2D2D2D] hover:bg-[#252525] cursor-pointer"
            >
              {vibe}
            </Badge>
          ))}
        </div>
      </section>

      {/* Top CTA Banner */}
      <Card className="border-none bg-gradient-to-r from-secondary/25 to-[#7B61FF]/10 text-white shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-secondary opacity-15">
          <Sparkles size={120} />
        </div>
        <CardContent className="p-5 relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-1 text-xs font-extrabold text-secondary tracking-widest uppercase">
            <Sparkles size={12} className="animate-pulse" />
            <span>Indicação da IA</span>
          </div>
          <div>
            <h4 className="text-base font-extrabold">Sem criatividade pro rango de hoje?</h4>
            <p className="text-xs text-[#C5B8FF] mt-1">Nossa IA vasculha os gostos do seu bonde e decide o melhor lugar pra vcs.</p>
          </div>
          <Link to="/ai">
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-full w-max text-xs">
              {copy.roulette.cta}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recommended Restaurants / Feed Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            <Trophy size={16} className="text-primary" />
            <span>Melhores Próximos</span>
          </h3>
          <Link to="/search" className="text-xs font-bold text-primary hover:underline">
            Ver tudo
          </Link>
        </div>

        {isRestaurantsLoading ? (
          <div className="py-6 text-center text-xs text-[#808080]">Carregando rango...</div>
        ) : (
          <div className="grid gap-4">
            {restaurants?.slice(0, 3).map((restaurant) => (
              <Card key={restaurant.id} className="border-[#2D2D2D] bg-[#1A1A1A] overflow-hidden hover:border-[#444] transition-all">
                <Link to={`/restaurant/${restaurant.id}`}>
                  <div className="h-32 bg-[#2D2D2D] relative overflow-hidden">
                    {restaurant.photos && restaurant.photos[0] ? (
                      <img src={restaurant.photos[0]} alt={restaurant.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#808080]">Sem foto</div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-[#0F0F0F]/80 text-white font-bold border-none px-2 py-0.5">
                        {restaurant.priceRange}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-bold text-white">{restaurant.name}</CardTitle>
                      {restaurant.averageOverallScore && (
                        <div className="flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-xs font-bold text-primary">
                          🌶️ {restaurant.averageOverallScore.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2">
                    <p className="text-xs text-[#A0A0A0] line-clamp-1 flex items-center gap-1">
                      <MapPin size={11} /> {restaurant.address.neighborhood}, {restaurant.address.city}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {restaurant.categories.map((cat, idx) => (
                        <span key={idx} className="text-[10px] bg-[#2A2A2A] text-white px-2 py-0.5 rounded font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Feed of Reviews */}
      <section className="space-y-4">
        <h3 className="text-sm font-extrabold text-white">Últimas do Bonde</h3>
        {isReviewsLoading ? (
          <div className="py-6 text-center text-xs text-[#808080]">Carregando fofocas...</div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#808080] italic">
            Nenhum review por aqui ainda. Bora postar um!
          </div>
        )}
      </section>
    </div>
  )
}
