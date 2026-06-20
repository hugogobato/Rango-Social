/**
 * Brazilian states + city lookup.
 *
 * States are a tiny static table (they never change). Cities are fetched on
 * demand from the public IBGE "localidades" API and cached by React Query, so
 * we ship a full state→city picker without bundling ~5.5k municipality names.
 */

export interface BrazilState {
  uf: string
  name: string
}

/** All 27 federative units, alphabetical by name. */
export const BRAZIL_STATES: BrazilState[] = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
]

const NAME_TO_UF = new Map(BRAZIL_STATES.map((s) => [s.name.toLowerCase(), s.uf]))

/** Resolve a state name (e.g. "São Paulo") to its UF ("SP"), or null. */
export function ufFromStateName(name: string | undefined | null): string | null {
  if (!name) return null
  return NAME_TO_UF.get(name.trim().toLowerCase()) ?? null
}

export function stateNameFromUf(uf: string | undefined | null): string | null {
  if (!uf) return null
  return BRAZIL_STATES.find((s) => s.uf === uf.toUpperCase())?.name ?? null
}

interface IbgeMunicipality {
  nome: string
}

/**
 * Fetch the list of city names for a UF from IBGE, sorted alphabetically.
 * Returns [] when the request fails (offline / API down) so the picker can
 * gracefully fall back to free-text entry.
 */
export async function fetchCitiesByUf(uf: string): Promise<string[]> {
  if (!uf) return []
  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
    )
    if (!res.ok) return []
    const data = (await res.json()) as IbgeMunicipality[]
    return data.map((m) => m.nome)
  } catch {
    return []
  }
}

interface NominatimReverse {
  address?: {
    state?: string
    city?: string
    town?: string
    municipality?: string
    village?: string
  }
}

/** Reverse-geocode a coordinate to { uf, city } using OSM Nominatim. */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ uf: string | null; city: string | null }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR&zoom=10`
    )
    if (!res.ok) return { uf: null, city: null }
    const data = (await res.json()) as NominatimReverse
    const a = data.address ?? {}
    const city =
      a.city ?? a.town ?? a.municipality ?? a.village ?? null
    return { uf: ufFromStateName(a.state), city }
  } catch {
    return { uf: null, city: null }
  }
}
