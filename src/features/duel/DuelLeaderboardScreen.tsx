import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { useEloLeaderboard } from '../../lib/query/hooks'
import { RestaurantCategory } from '../../domain/models'
import { copy } from '../../copy/pt-BR'

export function DuelLeaderboardScreen() {
  const [cuisine, setCuisine] = useState<RestaurantCategory>(RestaurantCategory.PODRAO)
  const { data: leaderboard, isLoading } = useEloLeaderboard(cuisine)

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="text-primary" />
            <span>Leaderboard ELO</span>
          </h1>
          <p className="text-xs text-[#A0A0A0] mt-1">{copy.duel.leaderboardTitle}</p>
        </div>
        <Link to="/duel">
          <button className="bg-primary hover:bg-primary/95 text-white text-[10px] font-black uppercase px-3.5 py-2 rounded-full">
            Duelo 🥊
          </button>
        </Link>
      </div>

      {/* Cuisine selector tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {Object.values(RestaurantCategory).slice(0, 5).map((cat) => (
          <button
            key={cat}
            onClick={() => setCuisine(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              cuisine === cat
                ? 'bg-primary border-primary text-white'
                : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#808080]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Leaderboard content */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-10 text-xs text-[#808080]">Carregando ranking ELO…</div>
        ) : leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((item, index) => (
            <Card key={item.restaurantId} className="border-[#2D2D2D] bg-[#1A1A1A] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#808080] w-4">#{index + 1}</span>
                  <div>
                    <Link to={`/restaurant/${item.restaurantId}`} className="text-xs font-bold text-white hover:underline">
                      Restaurante {item.restaurantId.replace('r_', '')}
                    </Link>
                    <p className="text-[9px] text-[#808080]">{item.duels} duelos jogados</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-primary">{item.rating.toFixed(0)} ELO</span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 text-xs text-[#808080] italic">
            Sem dados de ELO para essa categoria. Faça um duelo!
          </div>
        )}
      </div>
    </div>
  )
}
