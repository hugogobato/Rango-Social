import { useParams } from 'react-router-dom'
import { Award, Lock, Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useUser } from '../../lib/query/hooks'

const ALL_MOCK_BADGES = [
  { id: 'b_explorer', name: 'Explorador da Cidade', desc: 'Visitou mais de 5 bairros diferentes.', rarity: 'RARE', icon: '🗺️' },
  { id: 'b_critic', name: 'Crítico de Respeito', desc: 'Escreveu 10 reviews detalhados.', rarity: 'EPIC', icon: '✍️' },
  { id: 'b_streak_7', name: 'Fogo nos Dedos', desc: 'Manteve 7 dias de streak de reviews.', rarity: 'COMMON', icon: '🔥' },
  { id: 'b_pioneer', name: 'Desbravador do Podrão', desc: 'Primeiro a avaliar 3 podrões da quebrada.', rarity: 'LEGENDARY', icon: '🍔' },
]

export function BadgesScreen() {
  const { userId } = useParams<{ userId: string }>()
  const { data: user, isLoading } = useUser(userId || 'u_me')

  if (isLoading) {
    return <div className="text-center py-10 text-xs text-[#808080]">Carregando conquistas…</div>
  }

  if (!user) {
    return <div className="text-center py-10 text-xs text-[#808080]">Usuário não encontrado</div>
  }

  const earnedBadgeIds = user.badges.map((b) => b.id)

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Award className="text-primary" />
          <span>Conquistas</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">
          Complete desafios e libere gírias secretas e badges premium.
        </p>
      </div>

      <div className="grid gap-3">
        {ALL_MOCK_BADGES.map((badge) => {
          const isEarned = earnedBadgeIds.includes(badge.id) || badge.id === 'b_streak_7' // force one for demo
          return (
            <Card
              key={badge.id}
              className={`border-2 p-4 transition-all relative ${
                isEarned
                  ? 'border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(255,107,53,0.05)]'
                  : 'border-[#2D2D2D] bg-[#1A1A1A] opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                  isEarned ? 'bg-[#2D2D2D] border border-primary/20' : 'bg-[#151515] border border-dashed border-[#3D3D3D]'
                }`}>
                  {isEarned ? badge.icon : <Lock size={18} className="text-[#808080]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white truncate">{badge.name}</h3>
                    <Badge variant="outline" className={`text-[9px] font-black uppercase px-1.5 py-0 border-none ${
                      badge.rarity === 'LEGENDARY'
                        ? 'bg-amber-500/10 text-amber-500'
                        : badge.rarity === 'EPIC'
                          ? 'bg-purple-500/10 text-purple-500'
                          : badge.rarity === 'RARE'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {badge.rarity}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">{badge.desc}</p>
                </div>
              </div>

              {isEarned && (
                <div className="absolute top-2 right-2 text-primary">
                  <Sparkles size={11} className="animate-pulse" />
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
