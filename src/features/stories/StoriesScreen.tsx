import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Eye, Camera } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { toast } from '../../components/ui/Toast'
import { useStories, usePostStory, useSessionUser } from '../../lib/query/hooks'

export function StoriesScreen() {
  const navigate = useNavigate()
  const { data: stories, isLoading } = useStories()
  const { data: sessionUser } = useSessionUser()
  const postStoryMutation = usePostStory()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('https://picsum.photos/seed/storygen/1080/1920')

  // Story autoplay interval
  useEffect(() => {
    if (isCreating || !stories || stories.length === 0) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1)
            return 0
          } else {
            navigate('/')
            return 100
          }
        }
        return prev + 1
      })
    }, 40) // ~4 seconds total per story

    return () => clearInterval(interval)
  }, [currentIndex, stories, isCreating, navigate])

  const handleNext = () => {
    if (!stories) return
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setProgress(0)
    } else {
      navigate('/')
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setProgress(0)
    }
  }

  const handleCreate = async () => {
    if (!sessionUser) return
    try {
      await postStoryMutation.mutateAsync({
        userId: sessionUser.id,
        photoUrl: imageUrl,
        caption: caption || undefined,
      })
      toast('Story postado com sucesso! 📸', 'success')
      setIsCreating(false)
      setCaption('')
      setCurrentIndex(0)
      setProgress(0)
    } catch (err) {
      toast('Falha ao postar story', 'error')
    }
  }

  if (isLoading) {
    return <div className="text-center py-10 text-xs text-[#808080]">Carregando stories…</div>
  }

  if (isCreating) {
    return (
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-extrabold text-white flex items-center gap-1.5">
            <Camera className="text-primary" /> Novo Story
          </h1>
          <button onClick={() => setIsCreating(false)} className="text-white hover:opacity-85">
            <X size={20} />
          </button>
        </div>

        <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 space-y-4">
          <div className="h-60 rounded-xl bg-[#242424] border border-[#2D2D2D] relative overflow-hidden flex items-center justify-center">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setImageUrl(`https://picsum.photos/seed/${Math.random()}/1080/1920`)}
              className="absolute bottom-3 right-3 bg-[#0F0F0F]/80 text-[10px] text-white font-extrabold px-3 py-1.5 rounded-full hover:bg-black"
            >
              🔄 Tirar Outra Foto (Simulado)
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#A0A0A0]">Legenda do Story (opcional)</label>
            <input
              type="text"
              placeholder="Amassando no rolê com a tropa... 🍔"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-[#242424] border border-[#2D2D2D] rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-primary"
            />
          </div>

          <Button onClick={handleCreate} className="w-full rounded-full bg-gradient-to-tr from-primary to-[#FF8C61]">
            Lançar Story 🚀
          </Button>
        </Card>
      </div>
    )
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <p className="text-xs text-[#808080] italic">Nenhum story por aqui ainda.</p>
        <Button onClick={() => setIsCreating(true)} className="rounded-full text-xs">
          <Camera size={13} className="mr-1.5" /> Lançar o Primeiro!
        </Button>
      </div>
    )
  }

  const currentStory = stories[currentIndex]

  return (
    <div className="relative h-[calc(100vh-80px)] w-full max-w-md mx-auto rounded-3xl bg-[#000] overflow-hidden flex flex-col justify-between">
      {/* Background Image */}
      <img src={currentStory.photoUrl} alt="Story" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

      {/* Top Bar with progress indicators and author */}
      <div className="relative z-10 p-4 space-y-3">
        {/* Progress bars */}
        <div className="flex gap-1.5">
          {stories.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 border-2 border-primary text-white flex items-center justify-center font-bold text-xs uppercase">
              {currentStory.userId.replace('u_', '').slice(0, 2)}
            </div>
            <div>
              <p className="text-xs font-black text-white">@{currentStory.userId.replace('u_', '')}</p>
              <p className="text-[9px] text-white/70">
                {new Date(currentStory.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-all"
            >
              <Camera size={16} />
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation hotspots */}
      <div className="absolute inset-y-20 left-0 w-1/3 z-20 cursor-pointer" onClick={handlePrev} />
      <div className="absolute inset-y-20 right-0 w-1/3 z-20 cursor-pointer" onClick={handleNext} />

      {/* Bottom overlay with caption & viewers */}
      <div className="relative z-10 p-4 space-y-4">
        {currentStory.caption && (
          <p className="text-sm font-bold text-white text-shadow leading-relaxed">
            {currentStory.caption}
          </p>
        )}

        {/* Viewer count for authors */}
        <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold">
          <Eye size={12} />
          <span>{currentStory.viewers.length} visualizações</span>
        </div>
      </div>
    </div>
  )
}
