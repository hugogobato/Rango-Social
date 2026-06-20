import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Loader2, Search } from 'lucide-react'
import {
  BRAZIL_STATES,
  fetchCitiesByUf,
  reverseGeocode,
} from '../../lib/brazil'
import { getCurrentPosition } from '../../lib/platform'
import { toast } from '../ui/Toast'

interface LocationPickerProps {
  /** Selected UF (e.g. "SP"), or null. */
  uf: string | null
  /** Selected city name, or null. */
  city: string | null
  onChange: (next: { uf: string; city: string }) => void
}

/** Diacritic-insensitive lowercase, for forgiving city search. */
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

/**
 * Brazilian state → city selector. Pick a UF, then type to filter that state's
 * cities (fetched from IBGE, cached). Also supports "use my location" via
 * reverse geocoding. Free-typed city names are accepted as a fallback.
 */
export function LocationPicker({ uf, city, onChange }: LocationPickerProps) {
  const [cityQuery, setCityQuery] = useState(city ?? '')
  const [open, setOpen] = useState(false)
  const [locating, setLocating] = useState(false)

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['ibge-cities', uf],
    queryFn: () => fetchCitiesByUf(uf ?? ''),
    enabled: !!uf,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const filtered = useMemo(() => {
    const q = normalize(cityQuery)
    const base = q
      ? cities.filter((c) => normalize(c).includes(q))
      : cities
    return base.slice(0, 60)
  }, [cities, cityQuery])

  const handleSelectState = (nextUf: string) => {
    setCityQuery('')
    setOpen(false)
    onChange({ uf: nextUf, city: '' })
  }

  const commitCity = (value: string) => {
    setCityQuery(value)
    setOpen(false)
    if (uf) onChange({ uf, city: value })
  }

  const handleUseLocation = async () => {
    try {
      setLocating(true)
      const { latitude, longitude } = await getCurrentPosition()
      const { uf: foundUf, city: foundCity } = await reverseGeocode(
        latitude,
        longitude
      )
      if (foundUf && foundCity) {
        setCityQuery(foundCity)
        onChange({ uf: foundUf, city: foundCity })
        toast(`Achamos você em ${foundCity}! 📍`, 'success')
      } else {
        toast('Não consegui identificar sua cidade. Escolhe na mão 😉', 'error')
      }
    } catch {
      toast('Não rolou pegar sua localização', 'error')
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* State */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A0A0A0]">
          Estado
        </label>
        <select
          value={uf ?? ''}
          onChange={(e) => handleSelectState(e.target.value)}
          className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#1A1A1A] px-4 py-3.5 text-sm font-semibold text-white outline-none transition-all focus:border-primary"
        >
          <option value="" disabled>
            Escolhe teu estado
          </option>
          {BRAZIL_STATES.map((s) => (
            <option key={s.uf} value={s.uf}>
              {s.name} ({s.uf})
            </option>
          ))}
        </select>
      </div>

      {/* City combobox */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A0A0A0]">
          Cidade
        </label>
        <div className="relative">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]"
            />
            <input
              type="text"
              value={cityQuery}
              disabled={!uf}
              placeholder={uf ? 'Digita pra buscar…' : 'Escolhe o estado primeiro'}
              onChange={(e) => {
                setCityQuery(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                // Commit free text after the click handler has a chance to run.
                setTimeout(() => {
                  setOpen(false)
                  if (uf && cityQuery.trim()) commitCity(cityQuery.trim())
                }, 150)
              }}
              className="w-full rounded-xl border-2 border-[#2D2D2D] bg-[#1A1A1A] py-3.5 pl-10 pr-4 text-sm font-semibold text-white outline-none transition-all focus:border-primary disabled:opacity-50"
            />
            {isLoading && uf && (
              <Loader2
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[#666]"
              />
            )}
          </div>

          {open && uf && filtered.length > 0 && (
            <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[#2D2D2D] bg-[#1A1A1A] py-1 shadow-2xl">
              {filtered.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    // onMouseDown beats the input's onBlur so the click registers.
                    onMouseDown={(e) => {
                      e.preventDefault()
                      commitCity(c)
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#252525] ${
                      c === city ? 'font-bold text-primary' : 'text-white'
                    }`}
                  >
                    <MapPin size={13} className="text-[#666]" />
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleUseLocation}
        disabled={locating}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2D2D2D] bg-[#1A1A1A] py-3 text-xs font-semibold text-white transition-all hover:bg-[#242424] disabled:opacity-60"
      >
        {locating ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <MapPin size={14} />
        )}
        <span>{locating ? 'Buscando localização…' : 'Usar minha localização'}</span>
      </button>
    </div>
  )
}
