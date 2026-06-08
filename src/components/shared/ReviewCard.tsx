import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageSquare, Bookmark, Share2, Send } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { toast } from '../ui/Toast'
import { useSessionUser, useToggleLike, useAddComment } from '../../lib/query/hooks'
import { type Review } from '../../domain/models'
import { copy } from '../../copy/pt-BR'
import { shareContent } from '../../lib/platform'
import { LazyImage } from './LazyImage'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { data: sessionUser } = useSessionUser()
  const toggleLikeMutation = useToggleLike()
  const addCommentMutation = useAddComment()

  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false)
  const [newCommentText, setNewCommentText] = useState('')
  const [lastTap, setLastTap] = useState(0)

  const handleLike = () => {
    if (!sessionUser) {
      toast('Faça login ou complete o onboarding primeiro!', 'error')
      return
    }
    toggleLikeMutation.mutate({ reviewId: review.id, userId: sessionUser.id })
  }

  // Double tap to like gesture simulation
  const handlePhotoClick = () => {
    const now = Date.now()
    if (now - lastTap < 300) {
      if (!review.isLikedByMe) {
        handleLike()
        toast('Amassei! ❤️', 'success')
      }
    }
    setLastTap(now)
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionUser || !newCommentText.trim()) return

    try {
      await addCommentMutation.mutateAsync({
        reviewId: review.id,
        userId: sessionUser.id,
        text: newCommentText.trim(),
      })
      setNewCommentText('')
      toast('Comentário enviado!', 'success')
    } catch {
      toast('Falha ao comentar', 'error')
    }
  }

  const handleShare = async () => {
    const result = await shareContent({
      title: `Review de ${review.restaurant?.name ?? 'um pico'}`,
      text: review.comment || 'Olha esse review no Rango Social!',
      url: window.location.href,
    })
    if (result === 'copied') {
      toast('Link copiado pro clipboard, cria! 📋', 'success')
    } else if (result === 'failed') {
      toast('Não rolou compartilhar', 'error')
    }
  }

  const perPersonCost = review.totalSpent && review.partySize && review.partySize > 0
    ? (review.totalSpent / review.partySize).toFixed(0)
    : null

  return (
    <>
      <Card className="border-[#2D2D2D] bg-[#1A1A1A] overflow-hidden hover:border-[#444] transition-all duration-200">
        {/* Card Header (User profile, handle & tier) */}
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={review.user?.avatarUrl || undefined}
              fallback={review.userId.replace('u_', '').slice(0, 2).toUpperCase()}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-1">
                <Link to={`/profile/${review.userId}`} className="text-xs font-black text-white hover:underline">
                  @{review.userId.replace('u_', '')}
                </Link>
                {review.user?.isVerified && (
                  <span className="text-[10px] text-primary" title="Verificado">✔️</span>
                )}
                {review.user?.influencerTier && (
                  <span className="text-[9px] bg-secondary/15 border border-secondary/20 text-secondary px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                    {review.user.influencerTier}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-[#808080]">
                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {review.overallScore && (
            <div className="flex gap-0.5">
              {Array.from({ length: review.overallScore }).map((_, i) => (
                <span key={i} className="text-xs">🌶️</span>
              ))}
            </div>
          )}
        </CardHeader>

        {/* Card Main Photo Area with Double-tap gesture */}
        {review.photos && review.photos[0] && (
          <div
            onClick={handlePhotoClick}
            className="aspect-video bg-[#242424] overflow-hidden relative cursor-pointer group"
          >
            <LazyImage
              src={review.photos[0]}
              alt={`Foto de ${review.restaurant?.name ?? 'um rango'}`}
              className="group-hover:scale-[1.02] transition-transform duration-300"
            />
            {perPersonCost && (
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-primary border border-primary/20 shadow-md">
                💸 R$ {perPersonCost}/pessoa
              </div>
            )}
          </div>
        )}

        {/* Review Comments & Restaurant details */}
        <CardContent className="p-4 space-y-2.5">
          <div className="space-y-1">
            <Link
              to={`/restaurant/${review.restaurantId}`}
              className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
            >
              📍 {review.restaurant?.name || 'Ver Restaurante'}
            </Link>
            {review.comment && (
              <p className="text-xs text-[#E0E0E0] leading-relaxed">
                "{review.comment}"
              </p>
            )}
          </div>

          {/* Render individual metrics briefly if present */}
          {review.metrics && Object.keys(review.metrics).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(review.metrics).slice(0, 3).map(([key, val]) => (
                <span key={key} className="text-[9px] bg-[#2A2A2A] text-[#A0A0A0] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {key}: {val}/5
                </span>
              ))}
            </div>
          )}

          {/* Action Footer Bar */}
          <div className="flex items-center gap-4 pt-3 border-t border-[#2A2A2A] text-[#808080]">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 hover:text-white transition-colors text-[11px] font-semibold ${
                review.isLikedByMe ? 'text-primary' : ''
              }`}
            >
              <Heart size={14} className={review.isLikedByMe ? 'fill-current text-primary' : ''} />
              <span>{review.likes}</span>
            </button>

            <button
              onClick={() => setIsCommentSheetOpen(true)}
              className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px] font-semibold"
            >
              <MessageSquare size={14} />
              <span>{review.comments?.length || 0}</span>
            </button>

            <button
              onClick={handleShare}
              aria-label="Compartilhar review"
              className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px] font-semibold"
            >
              <Share2 size={14} />
            </button>

            <button
              aria-label="Salvar review"
              className="ml-auto hover:text-white transition-colors"
            >
              <Bookmark size={14} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Review Comments Bottom Sheet */}
      <Sheet
        isOpen={isCommentSheetOpen}
        onClose={() => setIsCommentSheetOpen(false)}
        title={copy.comments.title}
      >
        <div className="space-y-4 pb-10 flex flex-col h-[50vh]">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
            {review.comments && review.comments.length > 0 ? (
              review.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                  <Avatar
                    src={comment.user?.avatarUrl || undefined}
                    fallback={comment.userId.replace('u_', '').slice(0, 2).toUpperCase()}
                    size="sm"
                  />
                  <div className="flex-1 bg-[#242424] border border-[#2D2D2D] rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">@{comment.userId.replace('u_', '')}</span>
                      <span className="text-[9px] text-[#808080]">
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-[#C0C0C0] leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-[#808080] italic">
                Nenhum comentário por aqui ainda. Lança o papo! 🗣️
              </div>
            )}
          </div>

          {/* Add Comment Input Form */}
          <form onSubmit={handleAddComment} className="flex gap-2 border-t border-[#2D2D2D] pt-3 mt-auto">
            <input
              type="text"
              placeholder="Comente o que achou..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 rounded-full border border-[#2D2D2D] bg-[#242424] px-4 py-3 text-xs text-white outline-none focus:border-primary transition-all"
            />
            <Button
              type="submit"
              disabled={!newCommentText.trim()}
              className="h-10 w-10 p-0 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-lg"
            >
              <Send size={15} />
            </Button>
          </form>
        </div>
      </Sheet>
    </>
  )
}
