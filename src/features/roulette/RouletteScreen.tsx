import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dices, RefreshCw, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useRestaurants } from '../../lib/query/hooks'
import type { Restaurant } from '../../domain/models'
import { copy } from '../../copy/pt-BR'

export function RouletteScreen() {
  const { data: restaurants } = useRestaurants()
  const [spinning, setSpinning] = useState(false)
  const [selected, setSelected] = useState<Restaurant | null>(null)

  const handleSpin = () => {
    if (!restaurants || restaurants.length === 0) return
    setSpinning(true)
    setSelected(null)

    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * restaurants.length)
      setSelected(restaurants[randomIdx])
      setSpinning(false)
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-md mx-auto text-center py-10 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
          <Dices className="text-primary" />
          <span>Roletrar Rango</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">Deixa o destino decidir seu prato hoje</p>
      </div>

      <div className="relative h-60 w-60 mx-auto flex items-center justify-center rounded-full border-4 border-[#2D2D2D] bg-[#1A1A1A] shadow-[0_0_30px_rgba(255,107,53,0.1)]">
        <div className={`text-4xl ${spinning ? 'animate-spin' : ''}`}>
          🎲
        </div>
        {spinning && (
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        )}
      </div>

      <Button
        onClick={handleSpin}
        disabled={spinning}
        className="w-full rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] py-6 text-sm font-black flex items-center justify-center gap-2"
      >
        {spinning ? (
          <>
            <RefreshCw className="animate-spin" size={16} /> Giro frenético...
          </>
        ) : (
          copy.roulette.cta
        )}
      </Button>

      {selected && (
        <Card className="border-primary bg-primary/5 p-4 text-left animate-slide-up space-y-3">
          <div>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-black uppercase">
              Resultado! 🎉
            </span>
            <h3 className="text-base font-extrabold text-white mt-1.5">{selected.name}</h3>
            <p className="text-xs text-[#A0A0A0]">{selected.address.neighborhood}</p>
          </div>
          <Link to={`/restaurant/${selected.id}`} className="block">
            <Button size="sm" className="w-full rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-1">
              Bora colar <ArrowRight size={13} />
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
