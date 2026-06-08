import { useParams } from 'react-router-dom'
import { Award, Lock, Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useUser, useReviews } from '../../lib/query/hooks'
import { computeBadgeStats, evaluateBadges } from '../../domain/logic/badges'
import { BadgeRarity } from '../../domain/models'

const RARITY_CLASS: Record<BadgeRarity, string> = {
  [BadgeRarity.LEGENDARY]: 'bg-amber-500/10 text-amber-500',
  [BadgeRarity.EPIC]: 'bg-purple-500/10 text-purple-500',
  [BadgeRarity.RARE]: 'bg-blue-500/10 text-blue-500',
  [BadgeRarity.COMMON]: 'bg-zinc-500/10 text-zinc-400',
}

export function BadgesScreen() {
  const { userId } = useParams<{ userId: string }>()
  const { data: user, isLoading } = useUser(userId || 'u_me')
  const { data: reviews } = useReviews({ userId: userId || 'u_me' })

  if (isLoading) {
    return <div className="py-10 text-center text-xs text-[#808080]">Carregando conquistas…</div>
  }

  if (!user) {
    return <div className="py-10 text-center text-xs text-[#808080]">Usuário não encontrado</div>
  }

  const stats = computeBadgeStats(reviews || [], user.currentStreak)
  const evaluated = evaluateBadges(stats)
  const earnedCount = evaluated.filter((b) => b.earned).length

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <Award className="text-primary" />
          <span>Conquistas</span>
        </h1>
        <p className="mt-1 text-xs text-[#A0A0A0]">
          {earnedCount} de {evaluated.length} desbloqueadas. Complete desafios e libere
          badges premium.
        </p>
      </div>

      <div className="grid gap-3">
        {evaluated.map(({ definition, earned, progress }) => (
          <Card
            key={definition.id}
            className={`relative border-2 p-4 transition-all ${
              earned
                ? 'border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(255,107,53,0.05)]'
                : 'border-[#2D2D2D] bg-[#1A1A1A] opacity-70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                  earned
                    ? 'border border-primary/20 bg-[#2D2D2D]'
                    : 'border border-dashed border-[#3D3D3D] bg-[#151515]'
                }`}
              >
                {earned ? definition.icon : <Lock size={18} className="text-[#808080]" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-sm font-bold text-white">{definition.name}</h3>
                  <Badge
                    variant="outline"
                    className={`border-none px-1.5 py-0 text-[9px] font-black uppercase ${RARITY_CLASS[definition.rarity]}`}
                  >
                    {definition.rarity}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-[#A0A0A0]">{definition.description}</p>

                {/* Progress bar for not-yet-earned badges */}
                {!earned && progress > 0 && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#2D2D2D]">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {earned && (
              <div className="absolute right-2 top-2 text-primary">
                <Sparkles size={11} className="animate-pulse" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
