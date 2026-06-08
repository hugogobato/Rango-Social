import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Share2, Trophy, Swords } from 'lucide-react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { toast } from '../ui/Toast'
import { shareContent } from '../../lib/platform'

interface DuelRecapCardProps {
  isOpen: boolean
  onClose: () => void
  cuisineLabel: string
  winnerName: string
  loserName: string
}

/** Shareable 9:16 recap of a finished duel (html-to-image → Web Share / download). */
export function DuelRecapCard({
  isOpen,
  onClose,
  cuisineLabel,
  winnerName,
  loserName,
}: DuelRecapCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const render = () =>
    toPng(cardRef.current as HTMLDivElement, {
      cacheBust: true,
      width: 360,
      height: 640,
    })

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      setBusy(true)
      const dataUrl = await render()
      const link = document.createElement('a')
      link.download = `rango-duelo-${cuisineLabel.toLowerCase()}.png`
      link.href = dataUrl
      link.click()
      toast('Recap baixado! 📸', 'success')
    } catch {
      toast('Algo deu ruim ao gerar imagem', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleShare = async () => {
    if (!cardRef.current) return
    try {
      setBusy(true)
      const dataUrl = await render()
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'rango-duelo.png', { type: 'image/png' })
      const result = await shareContent({
        files: [file],
        title: 'Duelo no Rango Social',
        text: `🥊 ${winnerName} venceu ${loserName} no duelo de ${cuisineLabel}!`,
        url: window.location.href,
      })
      if (result === 'shared') toast('Compartilhado! 🚀', 'success')
      else if (result === 'copied') {
        handleDownload()
        toast('Link copiado & imagem baixada! 📋', 'success')
      } else toast('Flopou o compartilhamento', 'error')
    } catch {
      toast('Flopou o compartilhamento', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Compartilhar Duelo">
      <div className="flex flex-col items-center space-y-4 pb-6">
        <div className="overflow-hidden rounded-2xl border border-[#2D2D2D] shadow-2xl">
          <div
            ref={cardRef}
            className="relative flex h-[568px] w-[320px] flex-col justify-between bg-gradient-to-b from-[#1E1E1E] to-[#121212] p-6 text-center"
            style={{ fontFamily: 'sans-serif' }}
          >
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />

            <div className="z-10 flex items-center justify-center gap-1.5">
              <Swords size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#808080]">
                Rango Social · Duelo
              </span>
            </div>

            <div className="z-10 flex-1 flex flex-col items-center justify-center gap-4">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase text-primary">
                Duelo de {cuisineLabel}
              </span>

              <div className="flex flex-col items-center gap-1">
                <Trophy size={40} className="text-amber-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#808080]">
                  Venceu
                </p>
                <h2 className="text-2xl font-black leading-tight text-white">
                  {winnerName}
                </h2>
              </div>

              <div className="text-[11px] text-[#808080]">
                bateu <span className="font-bold text-[#A0A0A0]">{loserName}</span>
              </div>
            </div>

            <div className="z-10 border-t border-[#2D2D2D] pt-4">
              <p className="text-[9px] font-black uppercase tracking-wider text-white">
                Quem manda melhor? 🥊
              </p>
              <p className="text-[8px] text-[#808080]">Duela você também no Rango Social</p>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-2 pt-2">
          <Button
            onClick={handleDownload}
            disabled={busy}
            variant="outline"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border-[#2D2D2D] text-xs font-bold"
          >
            <Download size={14} />
            <span>Baixar</span>
          </Button>
          <Button
            onClick={handleShare}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] text-xs font-bold"
          >
            <Share2 size={14} />
            <span>Compartilhar</span>
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
