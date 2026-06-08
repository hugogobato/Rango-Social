import { BadgeRarity, RestaurantCategory, type Restaurant, type Review } from '../models'

/**
 * Aggregate signals used to evaluate which badges a user has earned.
 * Kept separate from {@link evaluateBadges} so the evaluation stays a pure,
 * trivially-testable function of plain numbers.
 */
export interface BadgeStats {
  totalReviews: number
  neighborhoodsVisited: number
  citiesVisited: number
  detailedReviews: number
  podraoReviews: number
  currentStreak: number
  totalPhotos: number
}

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string
  rarity: BadgeRarity
  /** Whether the badge is unlocked for the given stats. */
  requirement: (stats: BadgeStats) => boolean
  /** Progress toward unlocking, clamped to 0..1 (drives progress UI). */
  progress: (stats: BadgeStats) => number
}

export interface EvaluatedBadge {
  definition: BadgeDefinition
  earned: boolean
  progress: number
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'b_first_review',
    name: 'Estreante',
    description: 'Mandou a primeira real.',
    icon: '🎉',
    rarity: BadgeRarity.COMMON,
    requirement: (s) => s.totalReviews >= 1,
    progress: (s) => clamp01(s.totalReviews / 1),
  },
  {
    id: 'b_streak_7',
    name: 'Fogo nos Dedos',
    description: 'Manteve 7 dias de streak de reviews.',
    icon: '🔥',
    rarity: BadgeRarity.COMMON,
    requirement: (s) => s.currentStreak >= 7,
    progress: (s) => clamp01(s.currentStreak / 7),
  },
  {
    id: 'b_explorer',
    name: 'Explorador da Cidade',
    description: 'Visitou mais de 5 bairros diferentes.',
    icon: '🗺️',
    rarity: BadgeRarity.RARE,
    requirement: (s) => s.neighborhoodsVisited >= 5,
    progress: (s) => clamp01(s.neighborhoodsVisited / 5),
  },
  {
    id: 'b_photographer',
    name: 'Fotógrafo de Rango',
    description: 'Postou 20 fotos de comida.',
    icon: '📸',
    rarity: BadgeRarity.RARE,
    requirement: (s) => s.totalPhotos >= 20,
    progress: (s) => clamp01(s.totalPhotos / 20),
  },
  {
    id: 'b_critic',
    name: 'Crítico de Respeito',
    description: 'Escreveu 10 reviews detalhados.',
    icon: '✍️',
    rarity: BadgeRarity.EPIC,
    requirement: (s) => s.detailedReviews >= 10,
    progress: (s) => clamp01(s.detailedReviews / 10),
  },
  {
    id: 'b_pioneer',
    name: 'Desbravador do Podrão',
    description: 'Avaliou 3 podrões da quebrada.',
    icon: '🍔',
    rarity: BadgeRarity.LEGENDARY,
    requirement: (s) => s.podraoReviews >= 3,
    progress: (s) => clamp01(s.podraoReviews / 3),
  },
]

/**
 * Derives {@link BadgeStats} from a user's reviews. `currentStreak` comes from the
 * user record (already computed) so this stays independent of "today".
 */
export function computeBadgeStats(
  reviews: Review[],
  currentStreak: number,
  restaurantsById?: Record<string, Restaurant>
): BadgeStats {
  const neighborhoods = new Set<string>()
  const cities = new Set<string>()
  let detailedReviews = 0
  let podraoReviews = 0
  let totalPhotos = 0

  for (const review of reviews) {
    const restaurant =
      review.restaurant ?? restaurantsById?.[review.restaurantId]

    if (restaurant) {
      if (restaurant.address.neighborhood)
        neighborhoods.add(restaurant.address.neighborhood)
      if (restaurant.address.city) cities.add(restaurant.address.city)
      if (restaurant.categories.includes(RestaurantCategory.PODRAO))
        podraoReviews++
    }

    const hasComment = !!review.comment && review.comment.trim().length > 0
    const metricsCount = review.metrics ? Object.keys(review.metrics).length : 0
    if (hasComment && metricsCount >= 3) detailedReviews++

    totalPhotos += review.photos?.length ?? 0
  }

  return {
    totalReviews: reviews.length,
    neighborhoodsVisited: neighborhoods.size,
    citiesVisited: cities.size,
    detailedReviews,
    podraoReviews,
    currentStreak,
    totalPhotos,
  }
}

/** Evaluates the full catalog against the given stats. */
export function evaluateBadges(stats: BadgeStats): EvaluatedBadge[] {
  return BADGE_CATALOG.map((definition) => ({
    definition,
    earned: definition.requirement(stats),
    progress: clamp01(definition.progress(stats)),
  }))
}
