import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { useRestaurants } from '../../lib/query/hooks'
import { copy } from '../../copy/pt-BR'

export function RankingScreen() {
  const { data: restaurants, isLoading } = useRestaurants()
  const [, setFilter] = useState<'EVERYONE' | 'FOLLOWING'>('EVERYONE')

  // Simple client-side mock ranking ordering based on averageOverallScore
  const rankedRestaurants = restaurants
    ? [...restaurants].sort((a, b) => (b.averageOverallScore || 0) - (a.averageOverallScore || 0))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Trophy className="text-primary" />
          <span>{copy.ranking.title}</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">{copy.ranking.subtitle}</p>
      </div>

      <Tabs defaultValue="everyone" onValueChange={(v) => setFilter(v === 'everyone' ? 'EVERYONE' : 'FOLLOWING')}>
        <TabsList className="grid w-full grid-cols-2 bg-[#1A1A1A]">
          <TabsTrigger value="everyone">{copy.ranking.filterEveryone}</TabsTrigger>
          <TabsTrigger value="following">{copy.ranking.filterFollowing}</TabsTrigger>
        </TabsList>

        <TabsContent value="everyone" className="space-y-3 mt-4">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-[#808080]">Calculando pontuações…</div>
          ) : rankedRestaurants.length > 0 ? (
            rankedRestaurants.map((restaurant, index) => (
              <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
                <Card className="border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#444] transition-all p-4">
                  <div className="flex items-center gap-3">
                    {/* Position Badge */}
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-black text-sm ${
                      index === 0
                        ? 'bg-amber-400 text-black'
                        : index === 1
                          ? 'bg-zinc-300 text-black'
                          : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-[#2D2D2D] text-[#A0A0A0]'
                    }`}>
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{restaurant.name}</h3>
                      <p className="text-[10px] text-[#808080] truncate">
                        {restaurant.address.neighborhood} • {restaurant.categories[0]}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 font-extrabold text-primary text-sm">
                        🌶️ {restaurant.averageOverallScore?.toFixed(1) || 'N/A'}
                      </div>
                      <p className="text-[9px] text-[#808080]">{restaurant.reviewCount} reviews</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-[#808080] italic">Nenhum restaurante encontrado</div>
          )}
        </TabsContent>

        <TabsContent value="following" className="space-y-3 mt-4">
          <div className="text-center py-10 text-xs text-[#808080] italic">
            Siga mais crias para ver os restaurantes preferidos do seu bonde de verdade! 🤝
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
