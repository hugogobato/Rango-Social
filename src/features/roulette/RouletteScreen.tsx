import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dices, RefreshCw, Sparkles, Navigation } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useRestaurants } from '../../lib/query/hooks'
import { RestaurantCategory } from '../../domain/models'
import { copy } from '../../copy/pt-BR'

export function RouletteScreen() {
  const { data: restaurants } = useRestaurants()
  const [spinning, setSpinning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<RestaurantCategory | null>(null)
  const [selected, setSelected] = useState<any | null>(null)

  const handleSpin = () => {
    if (!restaurants || restaurants.length === 0) return

    // Filter restaurants based on category selection
    const pool = selectedCategory
      ? restaurants.filter((r) => r.categories.includes(selectedCategory))
      : restaurants

    if (pool.length === 0) return

    setSpinning(true)
    setSelected(null)

    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * pool.length)
      setSelected(pool[randomIdx])
      setSpinning(false)
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-md mx-auto text-center py-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
          <Dices className="text-primary" />
          <span>Roletrar Rango</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">Deixa o destino decidir seu prato hoje</p>
      </div>

      {/* Pre-filters Selection */}
      <div className="space-y-2 text-left bg-[#1A1A1A] p-4 rounded-2xl border border-[#2D2D2D]">
        <label className="text-[10px] font-bold text-[#808080] uppercase tracking-wider">
          O que tá no esquema hoje?
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-primary border-primary text-white font-black'
                : 'bg-[#242424] border-[#2D2D2D] text-[#808080]'
            }`}
          >
            🍕 {copy.roulette.anywhere}
          </button>
          {Object.values(RestaurantCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary border-primary text-white font-black'
                  : 'bg-[#242424] border-[#2D2D2D] text-[#808080]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wheel Spinner Section */}
      <div className="relative h-56 w-56 mx-auto flex items-center justify-center rounded-full border-4 border-[#2D2D2D] bg-[#1A1A1A] shadow-[0_0_30px_rgba(255,107,53,0.1)]">
        <div className={`text-4xl ${spinning ? 'animate-spin' : ''}`}>
          🎲
        </div>
        {spinning && (
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        )}
      </div>

      {/* Main Spin CTA */}
      <Button
        onClick={handleSpin}
        disabled={spinning}
        className="w-full rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] py-6 text-sm font-black flex items-center justify-center gap-2"
      >
        {spinning ? (
          <>
            <RefreshCw className="animate-spin" size={16} /> Girando a roleta…
          </>
        ) : (
          copy.roulette.cta
        )}
      </Button>

      {/* Result Card */}
      {selected && (
        <Card className="border-primary bg-primary/5 p-4 text-left animate-slide-up space-y-3">
          <div>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">
              Destino traçado! 🎉
            </span>
            <h3 className="text-base font-extrabold text-white mt-1.5">{selected.name}</h3>
            <p className="text-xs text-[#A0A0A0]">{selected.address.neighborhood}</p>
          </div>

          <div className="flex gap-2">
            {/* Google Maps Redirect button */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                selected.name + ' ' + selected.address.street + ' ' + selected.address.city
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                size="sm"
                className="w-full rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Navigation size={13} />
                <span>{copy.roulette.letsGo}</span>
              </Button>
            </a>

            {/* Spin again button */}
            <Button
              onClick={handleSpin}
              size="sm"
              variant="outline"
              className="flex-1 rounded-full border-[#2D2D2D] hover:bg-[#242424] text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={12} />
              <span>{copy.roulette.again}</span>
            </Button>
          </div>

          {/* Direct detail page link */}
          <Link to={`/restaurant/${selected.id}`} className="block text-center mt-1">
            <span className="text-[10px] text-[#808080] hover:text-white transition-all font-bold">
              Ver cardápio e reviews do pico →
            </span>
          </Link>
        </Card>
      )}

      {/* AI Agent Alternative CTA */}
      <Card className="border-dashed border-[#2D2D2D] bg-[#1A1A1A] p-4 text-left space-y-2 mt-4">
        <div className="flex gap-2.5 items-start">
          <div className="p-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl">
            <Sparkles size={16} />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-bold text-white">Guru do Rango 🤖</h4>
            <p className="text-[10px] text-[#A0A0A0] leading-relaxed">
              Prefere uma recomendação inteligente baseada nos seus gostos em vez de pura sorte?
            </p>
          </div>
        </div>
        <Link to="/ai" className="block pt-1">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full border-secondary/20 hover:border-secondary/40 text-secondary hover:bg-secondary/5 text-xs font-bold py-2"
          >
            Conversar com o Guru
          </Button>
        </Link>
      </Card>
    </div>
  )
}
