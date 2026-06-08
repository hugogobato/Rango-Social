import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import {
  useEloLeaderboard,
  useRestaurants,
  useReviews,
  useFollowing,
  useSessionUser,
} from '../../lib/query/hooks'
import { RestaurantCategory } from '../../domain/models'
import { CUISINE_LABELS } from '../../domain/logic/duel'
import { copy } from '../../copy/pt-BR'

type Scope = 'global' | 'bonde'

const CUISINES = Object.values(RestaurantCategory).slice(0, 6)

export function DuelLeaderboardScreen() {
  const [cuisine, setCuisine] = useState<RestaurantCategory>(RestaurantCategory.PODRAO)
  const [scope, setScope] = useState<Scope>('global')

  const { data: leaderboard, isLoading } = useEloLeaderboard(cuisine)
  const { data: restaurants } = useRestaurants()
  const { data: sessionUser } = useSessionUser()
  const { data: following } = useFollowing(sessionUser?.id || '')
  const { data: allReviews } = useReviews()

  const restaurantsById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const r of restaurants ?? []) map[r.id] = r.name
    return map
  }, [restaurants])

  // "No meu bonde" = restaurants reviewed by me or anyone I follow.
  const bondeRestaurantIds = useMemo(() => {
    const crew = new Set<string>(
      [sessionUser?.id, ...(following ?? []).map((u) => u.id)].filter(
        (id): id is string => !!id
      )
    )
    return new Set(
      (allReviews ?? [])
        .filter((r) => crew.has(r.userId))
        .map((r) => r.restaurantId)
    )
  }, [allReviews, following, sessionUser?.id])

  const rows = useMemo(() => {
    const list = leaderboard ?? []
    return scope === 'bonde'
      ? list.filter((item) => bondeRestaurantIds.has(item.restaurantId))
      : list
  }, [leaderboard, scope, bondeRestaurantIds])

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
            <Trophy className="text-primary" />
            <span>Leaderboard ELO</span>
          </h1>
          <p className="mt-1 text-xs text-[#A0A0A0]">{copy.duel.leaderboardTitle}</p>
        </div>
        <Link to="/duel">
          <button className="rounded-full bg-primary px-3.5 py-2 text-[10px] font-black uppercase text-white hover:bg-primary/95">
            Duelo 🥊
          </button>
        </Link>
      </div>

      {/* Global vs bonde scope toggle */}
      <div className="flex gap-1 rounded-full border border-[#2D2D2D] bg-[#1A1A1A] p-1">
        {(['global', 'bonde'] as Scope[]).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all ${
              scope === s ? 'bg-primary text-white' : 'text-[#808080]'
            }`}
          >
            {s === 'global' ? copy.duel.leaderboardGlobal : copy.duel.leaderboardBonde}
          </button>
        ))}
      </div>

      {/* Cuisine selector */}
      <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1.5">
        {CUISINES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCuisine(cat)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              cuisine === cat
                ? 'border-primary bg-primary text-white'
                : 'border-[#2D2D2D] bg-[#1A1A1A] text-[#808080]'
            }`}
          >
            {CUISINE_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Leaderboard content */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="py-10 text-center text-xs text-[#808080]">
            Carregando ranking ELO…
          </div>
        ) : rows.length > 0 ? (
          rows.map((item, index) => (
            <Card key={item.restaurantId} className="border-[#2D2D2D] bg-[#1A1A1A] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-sm font-black text-[#808080]">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <div>
                    <Link
                      to={`/restaurant/${item.restaurantId}`}
                      className="text-xs font-bold text-white hover:underline"
                    >
                      {restaurantsById[item.restaurantId] ??
                        `Restaurante ${item.restaurantId.replace('r_', '')}`}
                    </Link>
                    <p className="text-[9px] text-[#808080]">
                      {item.duels} {item.duels === 1 ? 'duelo' : 'duelos'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-primary">
                  {item.rating.toFixed(0)} ELO
                </span>
              </div>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-[#2D2D2D] bg-[#1A1A1A] py-10 text-center text-xs italic text-[#808080]">
            {scope === 'bonde'
              ? copy.duel.emptyBonde
              : 'Sem dados de ELO para essa categoria. Faça um duelo!'}
          </div>
        )}
      </div>
    </div>
  )
}
