import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Flame, MapPin, ChevronDown, Check } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Sheet } from '../../components/ui/Sheet'
import {
  useRestaurants,
  useReviews,
  useSessionUser,
  useFollowing,
  useGroups,
} from '../../lib/query/hooks'
import { MetricId } from '../../domain/models'
import { calculateRestaurantRanking } from '../../domain/logic/ranking'
import { copy } from '../../copy/pt-BR'

const METRIC_LABELS: Record<MetricId, string> = {
  [MetricId.PRICE]: 'Preço',
  [MetricId.SERVICE]: 'Atendimento',
  [MetricId.LOCATION]: 'Localização',
  [MetricId.VIBE]: 'Vibe',
  [MetricId.AESTHETIC]: 'Visual/Aesthetic',
  [MetricId.PORTION]: 'Fartura',
  [MetricId.TASTE]: 'Sabor',
  [MetricId.COST_BENEFIT]: 'Custo-benefício',
  [MetricId.VEGAN_OPTIONS]: 'Opções Veganas',
  [MetricId.GLUTEN_FREE]: 'Sem Glúten',
  [MetricId.WAIT_TIME]: 'Tempo de Espera',
  [MetricId.CLEANLINESS]: 'Limpeza',
  [MetricId.NOISE_LEVEL]: 'Nível de Ruído',
  [MetricId.PARKING]: 'Estacionamento',
  [MetricId.ACCESSIBILITY]: 'Acessibilidade',
  [MetricId.DRINKS]: 'Bebidas',
  [MetricId.DESSERTS]: 'Sobremesas',
}

const CITIES = ['São Paulo', 'Ribeirão Preto']

export function RankingScreen() {
  const { data: restaurants, isLoading: loadingRestaurants } = useRestaurants()
  const { data: reviews, isLoading: loadingReviews } = useReviews()
  const { data: currentUser } = useSessionUser()
  const { data: followingUsers } = useFollowing(currentUser?.id || '')
  const { data: allGroups } = useGroups()

  // -------------------------------------------------------------
  // Filter States (persisted in localStorage between sessions)
  // -------------------------------------------------------------
  const [city, setCity] = useState<string>(
    () => localStorage.getItem('ranking_filter_city') || 'São Paulo'
  )
  const [reach, setReach] = useState<'EVERYONE' | 'FRIENDS' | 'GROUPS'>(
    () => (localStorage.getItem('ranking_filter_reach') as any) || 'EVERYONE'
  )
  const [metric, setMetric] = useState<MetricId | 'ALL'>(
    () => (localStorage.getItem('ranking_filter_metric') as any) || 'ALL'
  )
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    () => localStorage.getItem('ranking_filter_group_id') || ''
  )
  const [isTrending, setIsTrending] = useState<boolean>(
    () => localStorage.getItem('ranking_filter_trending') === 'true'
  )

  // Sheet Controls
  const [isMetricSheetOpen, setIsMetricSheetOpen] = useState(false)

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('ranking_filter_city', city)
  }, [city])

  useEffect(() => {
    localStorage.setItem('ranking_filter_reach', reach)
  }, [reach])

  useEffect(() => {
    localStorage.setItem('ranking_filter_metric', metric)
  }, [metric])

  useEffect(() => {
    localStorage.setItem('ranking_filter_group_id', selectedGroupId)
  }, [selectedGroupId])

  useEffect(() => {
    localStorage.setItem('ranking_filter_trending', isTrending ? 'true' : 'false')
  }, [isTrending])

  // Filter groups the current user is member of
  const myGroups = allGroups?.filter((g) =>
    g.members.some((m) => m.userId === currentUser?.id)
  ) || []

  // Ensure selectedGroupId is valid
  useEffect(() => {
    if (reach === 'GROUPS' && !selectedGroupId && myGroups.length > 0) {
      setSelectedGroupId(myGroups[0].id)
    }
  }, [reach, myGroups, selectedGroupId])

  const isLoading = loadingRestaurants || loadingReviews

  // -------------------------------------------------------------
  // Filter and Rank Calculations
  // -------------------------------------------------------------
  const now = new Date()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const doubleFourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // 1. Filter restaurants by city
  const cityRestaurants = restaurants?.filter(
    (r) => r.address.city.toLowerCase() === city.toLowerCase()
  ) || []

  // 2. Filter reviews by reach
  const friendsUserIds = currentUser
    ? [currentUser.id, ...(followingUsers || []).map((u) => u.id)]
    : []

  const reachReviews = (reviews || []).filter((rev) => {
    if (reach === 'FRIENDS') {
      return friendsUserIds.includes(rev.userId)
    }
    if (reach === 'GROUPS') {
      return rev.targetDestinations.some(
        (dest) => dest.type === 'group' && dest.id === selectedGroupId
      )
    }
    return true
  })

  // 3. Compute rankings
  let displayList: Array<{
    restaurant: typeof cityRestaurants[0]
    position: number
    scoreDisplay: string
    scoreLabel: string
    isTrending: boolean
    badgeType?: 'trending' | 'hype' | null
  }> = []

  if (isTrending) {
    // Mode Hype / "Tá bombando" calculation:
    // hype_score = (reviews_ultimas_48h * 2) + (media_movel_7_dias - media_movel_14_dias)
    displayList = cityRestaurants
      .map((restaurant) => {
        const restaurantReviews = reachReviews.filter(
          (r) => r.restaurantId === restaurant.id
        )

        const reviews48h = restaurantReviews.filter(
          (r) => r.createdAt >= fortyEightHoursAgo
        ).length

        const reviews7d = restaurantReviews.filter(
          (r) => r.createdAt >= sevenDaysAgo
        ).length

        const reviews14d = restaurantReviews.filter(
          (r) => r.createdAt >= doubleFourteenDaysAgo
        ).length

        const media7d = reviews7d / 7
        const media14d = reviews14d / 14
        const hypeScore = reviews48h * 2 + (media7d - media14d)

        const velocity = reviews48h

        // Custom badge indicators based on specification
        let badgeType: 'trending' | 'hype' | null = null
        if (hypeScore > 1.5 || velocity >= 3) {
          badgeType = 'trending' // "Tá bombando"
        } else if (hypeScore > 0.5) {
          badgeType = 'hype' // "No hype"
        }

        return {
          restaurant,
          score: hypeScore,
          scoreDisplay: hypeScore.toFixed(2),
          scoreLabel: 'pts Hype',
          isTrending: badgeType !== null,
          badgeType,
        }
      })
      .filter((item) => item.score > 0 || item.restaurant.vibeCheckCount > 0)
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        restaurant: item.restaurant,
        position: index + 1,
        scoreDisplay: item.scoreDisplay,
        scoreLabel: item.scoreLabel,
        isTrending: item.isTrending,
        badgeType: item.badgeType,
      }))
  } else {
    // Regular composite scoring algorithm
    const ranked = calculateRestaurantRanking(
      cityRestaurants,
      reachReviews,
      metric === 'ALL' ? null : metric,
      fourteenDaysAgo
    )

    displayList = ranked.map((item) => {
      // Determine if it should have trending badges based on its recent review count
      const isTrending = item.recentReviewCount >= 3
      return {
        restaurant: item.restaurant,
        position: item.position,
        scoreDisplay: item.score.toFixed(2),
        scoreLabel: 'pts',
        isTrending,
        badgeType: isTrending ? 'trending' : null,
      }
    })
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="text-primary" />
            <span>{copy.ranking.title}</span>
          </h1>
          <p className="text-xs text-[#A0A0A0] mt-1">
            {isTrending ? 'Os picos que estão movimentando a cena agora' : copy.ranking.subtitle}
          </p>
        </div>

        {/* Hype mode toggle */}
        <button
          onClick={() => setIsTrending(!isTrending)}
          className={`h-10 px-4 rounded-full border flex items-center gap-1.5 transition-all text-xs font-bold ${
            isTrending
              ? 'bg-gradient-to-tr from-orange-600 to-amber-500 border-amber-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
              : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#808080] hover:border-[#444] hover:text-white'
          }`}
          title="Modo Hype (Tá bombando)"
        >
          <Flame size={14} className={isTrending ? 'animate-pulse' : ''} />
          <span>Tá bombando</span>
        </button>
      </div>

      {/* Filter Options Bar */}
      <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-3 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center gap-2">
          {/* City Selector */}
          <div className="relative flex-1">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer focus:border-primary font-bold pr-8"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  📍 {c}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-3.5 text-[#808080] pointer-events-none" />
          </div>

          {/* Metric Selector Button */}
          <button
            onClick={() => setIsMetricSheetOpen(true)}
            className="flex-[1.2] bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-2 text-xs text-white font-bold flex items-center justify-between hover:border-[#444] transition-all"
            disabled={isTrending}
          >
            <span className="truncate">
              🎯 {metric === 'ALL' ? 'Nota Geral' : METRIC_LABELS[metric]}
            </span>
            <ChevronDown size={12} className="text-[#808080]" />
          </button>
        </div>

        {/* Reach Selector Segmented Button */}
        <div className="flex bg-[#242424] p-1 rounded-xl border border-[#2D2D2D]">
          <button
            onClick={() => setReach('EVERYONE')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all uppercase tracking-wider ${
              reach === 'EVERYONE'
                ? 'bg-[#1A1A1A] text-white border border-[#2D2D2D] shadow-sm'
                : 'text-[#808080] hover:text-white'
            }`}
          >
            {copy.ranking.filterEveryone}
          </button>
          <button
            onClick={() => setReach('FRIENDS')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all uppercase tracking-wider ${
              reach === 'FRIENDS'
                ? 'bg-[#1A1A1A] text-white border border-[#2D2D2D] shadow-sm'
                : 'text-[#808080] hover:text-white'
            }`}
          >
            {copy.ranking.filterFollowing}
          </button>
          <button
            onClick={() => setReach('GROUPS')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all uppercase tracking-wider ${
              reach === 'GROUPS'
                ? 'bg-[#1A1A1A] text-white border border-[#2D2D2D] shadow-sm'
                : 'text-[#808080] hover:text-white'
            }`}
          >
            {copy.ranking.filterGroups}
          </button>
        </div>

        {/* Group Dropdown Sub-selector */}
        {reach === 'GROUPS' && (
          <div className="space-y-1 animate-slide-up pt-1">
            <label className="text-[9px] font-bold text-[#808080] uppercase tracking-wider">
              Escolher Tropa
            </label>
            {myGroups.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer focus:border-primary font-bold pr-8"
                >
                  {myGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      👥 {g.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-3.5 text-[#808080] pointer-events-none" />
              </div>
            ) : (
              <p className="text-[10px] text-red-400 italic">
                Você ainda não faz parte de nenhuma tropa. Crie ou junte-se a uma na aba Perfil!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Ranked Restaurants List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-[#808080]">Calculando notas da tropa…</div>
        ) : displayList.length > 0 ? (
          displayList.map((item) => {
            const { restaurant, position, scoreDisplay, scoreLabel, badgeType } = item
            return (
              <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
                <Card className="border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#444] transition-all overflow-hidden relative group">
                  {/* Visual background indicator for high hype */}
                  {badgeType === 'trending' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none" />
                  )}

                  <CardContent className="p-3.5 flex gap-3 items-center">
                    {/* Position Medal / Badge */}
                    <div className="flex-shrink-0 flex items-center justify-center w-8">
                      {position === 1 ? (
                        <span className="text-2xl" role="img" aria-label="First Place">🥇</span>
                      ) : position === 2 ? (
                        <span className="text-2xl" role="img" aria-label="Second Place">🥈</span>
                      ) : position === 3 ? (
                        <span className="text-2xl" role="img" aria-label="Third Place">🥉</span>
                      ) : (
                        <span className="text-sm font-black text-[#808080] bg-[#242424] w-7 h-7 flex items-center justify-center rounded-full">
                          {position}
                        </span>
                      )}
                    </div>

                    {/* Restaurant Photo */}
                    <div className="h-14 w-14 bg-[#242424] rounded-xl overflow-hidden flex-shrink-0 relative border border-[#2D2D2D]">
                      {restaurant.photos && restaurant.photos[0] ? (
                        <img
                          src={restaurant.photos[0]}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-[#808080]">
                          Sem foto
                        </div>
                      )}
                    </div>

                    {/* Restaurant Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs font-bold text-white truncate max-w-[140px]">
                          {restaurant.name}
                        </h3>
                        {/* Hype/Trending Badges */}
                        {badgeType === 'trending' && (
                          <span className="text-[8px] bg-orange-500/10 border border-orange-500/20 text-orange-500 px-1.5 py-0.2 rounded font-black uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                            <Flame size={8} /> Bombando
                          </span>
                        )}
                        {badgeType === 'hype' && (
                          <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.2 rounded font-black uppercase tracking-wider flex items-center gap-0.5">
                            <Flame size={8} /> No Hype
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-[#808080] truncate flex items-center gap-0.5 mt-0.5">
                        <MapPin size={9} /> {restaurant.address.neighborhood} •{' '}
                        {restaurant.categories[0]}
                      </p>

                      <div className="flex gap-1 items-center mt-1">
                        <span className="text-[9px] text-[#A0A0A0] font-semibold bg-[#242424] px-1.5 py-0.5 rounded">
                          {restaurant.priceRange}
                        </span>
                        <span className="text-[9px] text-[#808080]">
                          {restaurant.reviewCount} reviews
                        </span>
                      </div>
                    </div>

                    {/* Ranking Score Badge */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-black text-primary flex items-center justify-end gap-0.5">
                        🌶️ {scoreDisplay}
                      </div>
                      <div className="text-[8px] text-[#808080] font-bold uppercase tracking-wider">
                        {scoreLabel}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        ) : (
          <div className="text-center py-16 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl">
            <p className="text-xs text-[#808080] italic">Nenhum pico pontuou com esses filtros ainda</p>
            <p className="text-[10px] text-[#606060] mt-1">
              Bora ser o primeiro a postar um review nesse esquema! 🚀
            </p>
          </div>
        )}
      </div>

      {/* Metric Picker Bottom Sheet */}
      <Sheet
        isOpen={isMetricSheetOpen}
        onClose={() => setIsMetricSheetOpen(false)}
        title="Filtrar por Aspecto / Métrica"
      >
        <div className="space-y-1 pb-8">
          {/* General option */}
          <button
            onClick={() => {
              setMetric('ALL')
              setIsMetricSheetOpen(false)
            }}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-[#242424] transition-all text-xs font-bold"
          >
            <span className={metric === 'ALL' ? 'text-primary font-black' : 'text-white'}>
              🌶️ Nota Geral (Média de Tudo)
            </span>
            {metric === 'ALL' && <Check size={14} className="text-primary" />}
          </button>

          {/* Metric options */}
          {Object.entries(METRIC_LABELS).map(([key, label]) => {
            const isSelected = metric === key
            return (
              <button
                key={key}
                onClick={() => {
                  setMetric(key as MetricId)
                  setIsMetricSheetOpen(false)
                }}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-[#242424] transition-all text-xs font-bold"
              >
                <span className={isSelected ? 'text-primary font-black' : 'text-white'}>
                  🎯 {label}
                </span>
                {isSelected && <Check size={14} className="text-primary" />}
              </button>
            )
          })}
        </div>
      </Sheet>
    </div>
  )
}

