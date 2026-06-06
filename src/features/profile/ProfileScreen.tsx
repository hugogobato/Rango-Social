import { useParams, Link } from 'react-router-dom'
import { Settings, Trophy, UserCheck } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { useUser, useSessionUser, useReviews } from '../../lib/query/hooks'

export function ProfileScreen() {
  const { userId } = useParams<{ userId?: string }>()
  const { data: sessionUser } = useSessionUser()
  
  const targetId = userId || sessionUser?.id || 'u_me'
  const isMe = targetId === sessionUser?.id

  const { data: user, isLoading: isUserLoading } = useUser(targetId)
  const { data: reviews, isLoading: isReviewsLoading } = useReviews({ userId: targetId })

  if (isUserLoading) {
    return <div className="text-center py-10 text-xs text-[#808080]">Carregando perfil…</div>
  }

  if (!user) {
    return <div className="text-center py-10 text-xs text-[#808080]">Perfil não encontrado</div>
  }

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      {/* Profile Header Details */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <Avatar
            src={user.avatarUrl || undefined}
            fallback={user.displayName.slice(0, 2).toUpperCase()}
            size="lg"
            className="border-2 border-primary"
          />
          {user.currentStreak > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-primary to-[#FF8C61] text-white text-[10px] font-black rounded-full px-2 py-0.5 shadow-md flex items-center gap-0.5">
              🔥 {user.currentStreak}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-black text-white flex items-center justify-center gap-1">
            {user.displayName}
            {user.isVerified && <span className="text-xs">✔️</span>}
          </h2>
          <p className="text-xs text-[#808080]">@{user.username}</p>
        </div>

        {user.bio && (
          <p className="text-xs text-[#C0C0C0] max-w-sm">"{user.bio}"</p>
        )}

        <div className="flex gap-4 text-xs font-bold text-white pt-1">
          <div>
            <span className="text-primary font-black">{user.followerCount}</span> seguidores
          </div>
          <div>
            <span className="text-primary font-black">{user.followingCount}</span> seguindo
          </div>
          <div>
            <span className="text-primary font-black">{reviews?.length || 0}</span> reviews
          </div>
        </div>

        <div className="flex gap-2 w-full pt-2">
          {isMe ? (
            <>
              <Link to="/settings" className="flex-1">
                <Button variant="outline" className="w-full rounded-full border-[#2D2D2D] hover:bg-[#1A1A1A] text-xs h-9">
                  <Settings size={13} className="mr-1.5" /> Ajustes
                </Button>
              </Link>
              <Link to={`/badges/${user.id}`} className="flex-1">
                <Button variant="outline" className="w-full rounded-full border-[#2D2D2D] hover:bg-[#1A1A1A] text-xs h-9">
                  <Trophy size={13} className="mr-1.5" /> Conquistas
                </Button>
              </Link>
            </>
          ) : (
            <Button className="w-full rounded-full text-xs h-9">
              <UserCheck size={13} className="mr-1.5" /> Seguir
            </Button>
          )}
        </div>
      </div>

      {/* Grid of Profile Actions / Links */}
      {isMe && (
        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <Link to="/groups" className="flex items-center gap-2 p-3 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl hover:border-[#444] transition-all">
            👥 Minhas Tropas
          </Link>
          <Link to="/lists" className="flex items-center gap-2 p-3 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl hover:border-[#444] transition-all">
            📝 Listas Salvas
          </Link>
        </div>
      )}

      {/* Contribution Tabs */}
      <Tabs defaultValue="reviews">
        <TabsList className="grid w-full grid-cols-3 bg-[#1A1A1A]">
          <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
          <TabsTrigger value="photos" className="text-xs">Fotos</TabsTrigger>
          <TabsTrigger value="badges" className="text-xs">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-3 mt-4">
          {isReviewsLoading ? (
            <div className="text-center py-6 text-xs text-[#808080]">Carregando papos...</div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Link to={`/restaurant/${review.restaurantId}`} className="text-xs font-bold text-white hover:underline">
                    📍 {review.restaurant?.name || 'Pico'}
                  </Link>
                  <span className="text-[10px] text-[#808080]">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-xs text-[#D0D0D0]">"{review.comment}"</p>
                )}
                {review.overallScore && (
                  <div className="flex gap-1">
                    {Array.from({ length: review.overallScore }).map((_, i) => (
                      <span key={i} className="text-xs">🌶️</span>
                    ))}
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-[#808080] italic">Nenhum review publicado</div>
          )}
        </TabsContent>

        <TabsContent value="photos" className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {reviews?.flatMap(r => r.photos).map((url, idx) => (
              <div key={idx} className="aspect-square bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#2D2D2D]">
                <img src={url} alt="Rango" className="w-full h-full object-cover" />
              </div>
            ))}
            {(!reviews || reviews.flatMap(r => r.photos).length === 0) && (
              <div className="col-span-3 text-center py-10 text-xs text-[#808080] italic">
                Nenhuma foto enviada ainda.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-3 mt-4">
          {user.badges && user.badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {user.badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-2 p-2 bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg">
                  <span className="text-xl">🏆</span>
                  <div>
                    <p className="text-xs font-bold text-white">{badge.name}</p>
                    <p className="text-[9px] text-[#808080]">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-[#808080] italic">Nenhuma conquista desbloqueada ainda.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
