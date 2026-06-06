import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useRestaurants } from '../../lib/query/hooks'
import { RestaurantCategory } from '../../domain/models'
import { copy } from '../../copy/pt-BR'

export function SearchScreen() {
  const { data: restaurants, isLoading } = useRestaurants()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<RestaurantCategory | null>(null)

  const filtered = restaurants?.filter((r) => {
    const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase()) || 
      r.address.neighborhood.toLowerCase().includes(query.toLowerCase())
    const matchesCat = selectedCategory ? r.categories.includes(selectedCategory) : true
    return matchesQuery && matchesCat
  }) || []

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Search className="text-primary animate-pulse" />
          <span>{copy.search.title}</span>
        </h1>
        <p className="text-xs text-[#A0A0A0] mt-1">{copy.search.subtitle}</p>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          placeholder={copy.search.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-full pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-primary transition-all"
        />
        <Search className="absolute left-3.5 top-3.5 text-[#808080]" size={15} />
      </div>

      {/* Categories Horizontal */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
            selectedCategory === null
              ? 'bg-primary border-primary text-white'
              : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#808080]'
          }`}
        >
          Todos
        </button>
        {Object.values(RestaurantCategory).slice(0, 8).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selectedCategory === cat
                ? 'bg-primary border-primary text-white'
                : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#808080]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-xs text-[#808080]">Procurando rango...</div>
        ) : filtered.length > 0 ? (
          filtered.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
              <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-4 flex gap-3 hover:border-[#444] transition-all">
                <div className="h-16 w-16 bg-[#242424] rounded-lg overflow-hidden flex-shrink-0">
                  {restaurant.photos && restaurant.photos[0] ? (
                    <img src={restaurant.photos[0]} alt={restaurant.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#808080]">Sem foto</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">{restaurant.name}</h3>
                  <p className="text-[10px] text-[#808080] truncate flex items-center gap-0.5 mt-0.5">
                    <MapPin size={9} /> {restaurant.address.neighborhood}
                  </p>
                  <div className="flex gap-1 mt-1.5">
                    {restaurant.categories.map((cat, idx) => (
                      <span key={idx} className="text-[9px] bg-[#242424] text-[#A0A0A0] px-1.5 py-0.5 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                {restaurant.averageOverallScore && (
                  <div className="flex items-center text-xs font-bold text-primary">
                    🌶️ {restaurant.averageOverallScore.toFixed(1)}
                  </div>
                )}
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-16 space-y-4">
            <p className="text-xs text-[#808080] italic">Flopou... Nenhum pico com esse critério</p>
            <Link to="/ai">
              <Button size="sm" className="rounded-full text-xs bg-secondary hover:bg-secondary/90">
                <Sparkles size={11} className="mr-1" /> Perguntar pra IA
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
