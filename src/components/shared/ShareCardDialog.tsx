import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Share2, Sparkles, MapPin } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { toast } from '../ui/Toast'
import { shareContent } from '../../lib/platform'
import type { Restaurant } from '../../domain/models'

interface ShareCardDialogProps {
  isOpen: boolean
  onClose: () => void
  restaurant: Restaurant
}

export function ShareCardDialog({ isOpen, onClose, restaurant }: ShareCardDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)

  // Download Card as PNG
  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      setSharing(true)
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        width: 360,
        height: 640,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      })
      const link = document.createElement('a')
      link.download = `rango-${restaurant.id}.png`
      link.href = dataUrl
      link.click()
      toast('Card baixado com sucesso! 📸', 'success')
    } catch (err) {
      console.error(err)
      toast('Algo deu ruim ao gerar imagem', 'error')
    } finally {
      setSharing(false)
    }
  }

  // Share Card via Web Share API
  const handleShare = async () => {
    if (!cardRef.current) return
    try {
      setSharing(true)
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        width: 360,
        height: 640,
      })

      // Convert dataUrl to Blob/File for sharing
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `rango-${restaurant.id}.png`, { type: 'image/png' })

      const result = await shareContent({
        files: [file],
        title: restaurant.name,
        text: `Confira esse pico que achei no Rango Social: ${restaurant.name}! 🌶️`,
        url: window.location.href,
      })

      if (result === 'shared') {
        toast('Compartilhado com sucesso! 🚀', 'success')
      } else if (result === 'copied') {
        // Clipboard fallback (no file share support) — also save the image.
        handleDownload()
        toast('Link copiado & imagem baixada! 📋', 'success')
      } else {
        toast('Flopou o compartilhamento', 'error')
      }
    } catch (err) {
      console.error(err)
      toast('Flopou o compartilhamento', 'error')
    } finally {
      setSharing(false)
    }
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Compartilhar Pico">
      <div className="space-y-4 pb-6 flex flex-col items-center">
        {/* Preview Frame Container (hidden off-screen or scaled for display) */}
        <div className="border border-[#2D2D2D] rounded-2xl overflow-hidden shadow-2xl bg-[#0F0F0F]">
          {/* Card to be converted to image (360x640) */}
          <div
            ref={cardRef}
            className="w-[320px] h-[568px] bg-gradient-to-b from-[#1E1E1E] to-[#121212] p-6 flex flex-col justify-between relative text-left"
            style={{ fontFamily: 'sans-serif' }}
          >
            {/* Background glowing gradients */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header Branding */}
            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#808080]">
                Rango Social 🌶️
              </span>
              <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase">
                Recomendação
              </span>
            </div>

            {/* Card Content body */}
            <div className="space-y-4 z-10 flex-1 flex flex-col justify-center">
              {/* Photo placeholder/frame */}
              <div className="h-40 w-full bg-[#242424] rounded-2xl overflow-hidden border border-[#2D2D2D]">
                {restaurant.photos && restaurant.photos[0] ? (
                  <img
                    src={restaurant.photos[0]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#808080]">
                    Sem foto
                  </div>
                )}
              </div>

              {/* Text details */}
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {restaurant.name}
                </h2>
                <p className="text-[11px] text-[#A0A0A0] flex items-center gap-1">
                  <MapPin size={10} className="text-[#808080]" />
                  <span>{restaurant.address.neighborhood}, {restaurant.address.city}</span>
                </p>
              </div>

              {/* Rating */}
              {restaurant.averageOverallScore ? (
                <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#2D2D2D] p-3 rounded-xl">
                  <span className="text-xl">🌶️</span>
                  <div>
                    <p className="text-[11px] text-white font-extrabold">
                      Nota Geral: {restaurant.averageOverallScore.toFixed(1)}/5
                    </p>
                    <p className="text-[9px] text-[#808080]">Média baseada em reviews do bonde</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#2D2D2D] p-3 rounded-xl">
                  <span className="text-xl">✨</span>
                  <div>
                    <p className="text-[11px] text-white font-extrabold">Pico Novo!</p>
                    <p className="text-[9px] text-[#808080]">Seja o primeiro a mandar a real aqui</p>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="border-t border-[#2D2D2D] pt-4 flex items-center gap-2 z-10">
              <div className="p-1.5 bg-gradient-to-tr from-primary to-[#FF8C61] text-white rounded-lg">
                <Sparkles size={14} />
              </div>
              <div>
                <p className="text-[9px] font-black text-white uppercase tracking-wider">
                  Quer saber o veredito?
                </p>
                <p className="text-[8px] text-[#808080]">
                  Escaneie ou acesse o Rango Social
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2 w-full pt-2">
          <Button
            onClick={handleDownload}
            disabled={sharing}
            variant="outline"
            className="flex-1 rounded-full border-[#2D2D2D] text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            <span>Baixar Foto</span>
          </Button>

          <Button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 rounded-full text-xs font-bold bg-gradient-to-tr from-primary to-[#FF8C61] flex items-center justify-center gap-1.5"
          >
            <Share2 size={14} />
            <span>Compartilhar</span>
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
