import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  Check,
  List as ListIcon,
  Map as MapIcon,
  X,
  ChevronDown,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { useRestaurants } from '../../lib/query/hooks'
import { RestaurantCategory, PriceRange } from '../../domain/models'
import { copy } from '../../copy/pt-BR'

const NEIGHBORHOODS = [
  'Pinheiros',
  'Vila Madalena',
  'Consolação',
  'Liberdade',
  'Itaim Bibi',
  'Jardins',
  'Moema',
  'Centro',
  'Jardim Paulista',
  'Vila Seixas',
  'Ribeirânia',
]

const CITIES = ['São Paulo', 'Ribeirão Preto']

// Coords for cities
const CITY_COORDS: Record<string, [number, number]> = {
  'São Paulo': [-23.5505, -46.6333],
  'Ribeirão Preto': [-21.1775, -47.8103],
}

// Custom Leaflet Marker Icon with optional pulsing effect for vibe checks
const createCustomMarker = (name: string, hasVibeCheck: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${
          hasVibeCheck
            ? `<div class="absolute -inset-2 rounded-full bg-orange-500/30 animate-ping"></div>`
            : ''
        }
        <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-[#FF8C61] border-2 border-[#1A1A1A] shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-xs font-black text-white hover:scale-110 transition-all">
          🌶️
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

// Helper component to recenter map dynamically when city center changes
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  return null
}

export function SearchScreen() {
  const { data: restaurants, isLoading } = useRestaurants()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<RestaurantCategory | null>(null)

  // View mode: 'LIST' or 'MAP'
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>(
    () => (localStorage.getItem('search_view_mode') as any) || 'LIST'
  )

  // Selected city
  const [city, setCity] = useState<string>(
    () => localStorage.getItem('ranking_filter_city') || 'São Paulo'
  )

  // Advanced filters state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null)

  // Map active selection
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('search_view_mode', viewMode)
  }, [viewMode])

  // Persist city filter and sync with other screens
  useEffect(() => {
    localStorage.setItem('ranking_filter_city', city)
  }, [city])

  // Get coordinates for active city
  const activeCenter = CITY_COORDS[city] || CITY_COORDS['São Paulo']

  // Filter restaurants
  const filtered =
    restaurants?.filter((r) => {
      const matchesCity = r.address.city.toLowerCase() === city.toLowerCase()
      const matchesQuery =
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.address.neighborhood.toLowerCase().includes(query.toLowerCase())
      const matchesCat = selectedCategory ? r.categories.includes(selectedCategory) : true
      const matchesPrice = selectedPrice ? r.priceRange === selectedPrice : true
      const matchesNeighborhood = selectedNeighborhood
        ? r.address.neighborhood === selectedNeighborhood
        : true
      return matchesCity && matchesQuery && matchesCat && matchesPrice && matchesNeighborhood
    }) || []

  const resetFilters = () => {
    setSelectedPrice(null)
    setSelectedNeighborhood(null)
    setSelectedCategory(null)
  }

  const hasActiveFilters =
    selectedPrice !== null || selectedNeighborhood !== null || selectedCategory !== null

  const selectedRestaurant = restaurants?.find((r) => r.id === selectedRestaurantId)

  return (
    <div className="space-y-4 max-w-md mx-auto pb-10">
      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Search className="text-primary" />
            <span>{copy.search.title}</span>
          </h1>
          <p className="text-xs text-[#A0A0A0] mt-1">{copy.search.subtitle}</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-[#1A1A1A] p-0.5 rounded-full border border-[#2D2D2D]">
          <button
            onClick={() => setViewMode('LIST')}
            className={`p-2 rounded-full transition-all ${
              viewMode === 'LIST' ? 'bg-primary text-white' : 'text-[#808080] hover:text-white'
            }`}
            title="Visualização em Lista"
          >
            <ListIcon size={14} />
          </button>
          <button
            onClick={() => setViewMode('MAP')}
            className={`p-2 rounded-full transition-all ${
              viewMode === 'MAP' ? 'bg-primary text-white' : 'text-[#808080] hover:text-white'
            }`}
            title="Visualização em Mapa"
          >
            <MapIcon size={14} />
          </button>
        </div>
      </div>

      {/* City & Filters Bar */}
      <div className="flex gap-2">
        {/* City Selector */}
        <div className="relative w-36">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-full pl-3 pr-8 py-2.5 text-xs text-white outline-none appearance-none cursor-pointer focus:border-primary font-bold"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                📍 {c}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3.5 top-3.5 text-[#808080] pointer-events-none" />
        </div>

        {/* Query Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={copy.search.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-full pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-primary transition-all"
          />
          <Search className="absolute left-3.5 top-3 text-[#808080]" size={14} />
        </div>

        {/* Filter Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsFilterSheetOpen(true)}
          className={`h-9 w-9 flex items-center justify-center rounded-full border transition-all ${
            hasActiveFilters
              ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(255,107,53,0.3)]'
              : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#808080] hover:border-[#444]'
          }`}
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Categories Horizontal Quick Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
            selectedCategory === null
              ? 'bg-primary border-primary text-white'
              : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#808080]'
          }`}
        >
          Todos
        </button>
        {Object.values(RestaurantCategory).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-primary border-primary text-white'
                : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#808080]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active filters badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 bg-[#1A1A1A] p-2 rounded-xl border border-[#2D2D2D] animate-slide-up">
          <span className="text-[10px] font-bold text-[#808080] uppercase">Filtros:</span>
          {selectedCategory && (
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              {selectedCategory}
              <button onClick={() => setSelectedCategory(null)} className="hover:text-white font-black">
                ×
              </button>
            </span>
          )}
          {selectedPrice && (
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              Preço: {selectedPrice}
              <button onClick={() => setSelectedPrice(null)} className="hover:text-white font-black">
                ×
              </button>
            </span>
          )}
          {selectedNeighborhood && (
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              Bairro: {selectedNeighborhood}
              <button onClick={() => setSelectedNeighborhood(null)} className="hover:text-white font-black">
                ×
              </button>
            </span>
          )}
          <button onClick={resetFilters} className="text-[10px] text-primary hover:underline font-bold ml-auto">
            Limpar tudo
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative min-h-[380px]">
        {isLoading ? (
          <div className="text-center py-20 text-xs text-[#808080]">Procurando rango...</div>
        ) : viewMode === 'LIST' ? (
          // -------------------- LIST VIEW --------------------
          <div className="space-y-3">
            {filtered.length > 0 ? (
              filtered.map((restaurant) => (
                <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
                  <Card className="border-[#2D2D2D] bg-[#1A1A1A] p-3 flex gap-3 hover:border-[#444] transition-all overflow-hidden relative group">
                    <div className="h-16 w-16 bg-[#242424] rounded-lg overflow-hidden flex-shrink-0 border border-[#2D2D2D]">
                      {restaurant.photos && restaurant.photos[0] ? (
                        <img
                          src={restaurant.photos[0]}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-[#808080]">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-white truncate">{restaurant.name}</h3>
                      <p className="text-[10px] text-[#808080] truncate flex items-center gap-0.5 mt-0.5">
                        <MapPin size={9} /> {restaurant.address.neighborhood}
                      </p>
                      <div className="flex gap-1.5 items-center mt-1.5">
                        <span className="text-[9px] bg-[#242424] text-[#A0A0A0] px-1.5 py-0.5 rounded font-semibold">
                          {restaurant.priceRange}
                        </span>
                        {restaurant.categories.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="text-[9px] bg-[#242424] text-[#808080] px-1.5 py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      {restaurant.averageOverallScore ? (
                        <div className="text-xs font-black text-primary">
                          🌶️ {restaurant.averageOverallScore.toFixed(1)}
                        </div>
                      ) : (
                        <div className="text-[9px] text-[#606060]">Novo</div>
                      )}
                      {restaurant.vibeCheckCount > 0 && (
                        <span className="text-[8px] bg-orange-500/10 border border-orange-500/20 text-orange-500 px-1 rounded font-bold uppercase tracking-wider animate-pulse">
                          Ao Vivo
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-16 space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl">
                <p className="text-xs text-[#808080] italic">Flopou... Nenhum pico com esse critério</p>
                <Link to="/ai">
                  <Button size="sm" className="rounded-full text-xs bg-secondary hover:bg-secondary/90">
                    <Sparkles size={11} className="mr-1" /> Perguntar pra IA
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          // -------------------- MAP VIEW --------------------
          <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-[#2D2D2D] shadow-inner bg-[#151515]">
            <MapContainer
              center={activeCenter}
              zoom={13}
              scrollWheelZoom={true}
              className="w-full h-full z-10"
              zoomControl={false}
            >
              <ChangeMapView center={activeCenter} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {filtered.map((restaurant) => {
                const lat = restaurant.coordinates?.latitude || activeCenter[0]
                const lng = restaurant.coordinates?.longitude || activeCenter[1]
                const hasVibeCheck = restaurant.vibeCheckCount > 0

                return (
                  <Marker
                    key={restaurant.id}
                    position={[lat, lng]}
                    icon={createCustomMarker(restaurant.name, hasVibeCheck)}
                    eventHandlers={{
                      click: () => {
                        setSelectedRestaurantId(restaurant.id)
                      },
                    }}
                  />
                )
              })}
            </MapContainer>

            {/* Selected Restaurant Floating Card Overlay */}
            {selectedRestaurant && (
              <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
                <Card className="border-primary bg-[#1A1A1A] p-3 flex gap-3 shadow-2xl relative">
                  <button
                    onClick={() => setSelectedRestaurantId(null)}
                    className="absolute top-2 right-2 text-[#808080] hover:text-white"
                  >
                    <X size={14} />
                  </button>

                  <div className="h-16 w-16 bg-[#242424] rounded-lg overflow-hidden flex-shrink-0 border border-[#2D2D2D]">
                    {selectedRestaurant.photos && selectedRestaurant.photos[0] ? (
                      <img
                        src={selectedRestaurant.photos[0]}
                        alt={selectedRestaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-[#808080]">
                        Sem foto
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-xs font-bold text-white truncate">
                      {selectedRestaurant.name}
                    </h3>
                    <p className="text-[10px] text-[#808080] truncate flex items-center gap-0.5 mt-0.5">
                      <MapPin size={9} /> {selectedRestaurant.address.neighborhood}
                    </p>
                    <div className="flex gap-1.5 items-center mt-1.5">
                      <span className="text-[9px] bg-[#242424] text-[#A0A0A0] px-1.5 py-0.5 rounded font-semibold">
                        {selectedRestaurant.priceRange}
                      </span>
                      <Link
                        to={`/restaurant/${selectedRestaurant.id}`}
                        className="text-[9px] text-primary hover:underline font-extrabold"
                      >
                        Ver Detalhes →
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end py-1">
                    {selectedRestaurant.averageOverallScore ? (
                      <div className="text-xs font-black text-primary">
                        🌶️ {selectedRestaurant.averageOverallScore.toFixed(1)}
                      </div>
                    ) : (
                      <div className="text-[9px] text-[#606060]">Novo</div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters Drawer/Sheet */}
      <Sheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title={copy.search.filtersTitle}
      >
        <div className="space-y-6 pb-10">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Faixa de Preço</h4>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(PriceRange).map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => setSelectedPrice(selectedPrice === price ? null : price)}
                  className={`py-2.5 rounded-lg border text-xs font-black transition-all ${
                    selectedPrice === price
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-[#2D2D2D] bg-[#242424] text-[#808080]'
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Bairro / Região</h4>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
              {NEIGHBORHOODS.map((neighborhood) => {
                const isActive = selectedNeighborhood === neighborhood
                return (
                  <button
                    key={neighborhood}
                    type="button"
                    onClick={() => setSelectedNeighborhood(isActive ? null : neighborhood)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1 ${
                      isActive
                        ? 'border-primary bg-primary/10 text-white font-black'
                        : 'border-[#2D2D2D] bg-[#242424] text-[#808080]'
                    }`}
                  >
                    {isActive && <Check size={11} className="text-primary" />}
                    <span>{neighborhood}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <Button onClick={() => setIsFilterSheetOpen(false)} className="w-full rounded-full mt-4">
            Aplicar Filtros
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
