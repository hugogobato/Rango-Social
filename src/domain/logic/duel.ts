import {
  MetricId,
  RestaurantCategory,
  type Restaurant,
  type Review,
} from '../models'

/**
 * Restaurant Duel logic (§1.6).
 *
 * A duel becomes available when the user has reviewed two *different* restaurants of
 * the same cuisine within the last {@link DUEL_WINDOW_DAYS} days. The comparative
 * questions are drawn from the metrics both reviews share; the per-cuisine ELO update
 * itself lives in {@link ./elo}.
 */

export const DUEL_WINDOW_DAYS = 30
export const MIN_DUEL_QUESTIONS = 3
export const MAX_DUEL_QUESTIONS = 5

const MS_PER_DAY = 24 * 60 * 60 * 1000

export const DUEL_PROMPTS: Record<MetricId, string> = {
  [MetricId.PRICE]: 'Quem tem o melhor preço?',
  [MetricId.SERVICE]: 'Quem atende melhor?',
  [MetricId.LOCATION]: 'Qual tem a melhor localização?',
  [MetricId.VIBE]: 'Quem tem a melhor vibe?',
  [MetricId.AESTHETIC]: 'Qual é mais aesthetic?',
  [MetricId.PORTION]: 'Quem capricha mais na porção?',
  [MetricId.TASTE]: 'Quem tem o melhor sabor?',
  [MetricId.COST_BENEFIT]: 'Quem tem o melhor custo-benefício?',
  [MetricId.VEGAN_OPTIONS]: 'Quem tem as melhores opções veganas?',
  [MetricId.GLUTEN_FREE]: 'Quem manda melhor no sem glúten?',
  [MetricId.WAIT_TIME]: 'Quem te atende mais rápido?',
  [MetricId.CLEANLINESS]: 'Qual é mais limpo?',
  [MetricId.NOISE_LEVEL]: 'Qual é mais tranquilo (menos barulho)?',
  [MetricId.PARKING]: 'Qual tem o melhor estacionamento?',
  [MetricId.ACCESSIBILITY]: 'Qual é mais acessível?',
  [MetricId.DRINKS]: 'Quem tem as melhores bebidas?',
  [MetricId.DESSERTS]: 'Quem tem a melhor sobremesa?',
}

export const CUISINE_LABELS: Record<RestaurantCategory, string> = {
  [RestaurantCategory.PODRAO]: 'Podrão',
  [RestaurantCategory.JAPONES]: 'Japonês',
  [RestaurantCategory.ITALIANO]: 'Italiano',
  [RestaurantCategory.PIZZARIA]: 'Pizzaria',
  [RestaurantCategory.HAMBURGERIA]: 'Hamburgueria',
  [RestaurantCategory.VEGANO]: 'Vegano',
  [RestaurantCategory.CHURRASCARIA]: 'Churrascaria',
  [RestaurantCategory.CAFETERIA]: 'Cafeteria',
  [RestaurantCategory.BAR]: 'Bar',
  [RestaurantCategory.DOCERIA]: 'Doceria',
  [RestaurantCategory.BRASILEIRO]: 'Brasileiro',
  [RestaurantCategory.CHINESE]: 'Chinês',
  [RestaurantCategory.MEXICANO]: 'Mexicano',
  [RestaurantCategory.SAUDAVEL]: 'Saudável',
  [RestaurantCategory.ARABE]: 'Árabe',
}

// Sensible fallback aspects when two reviews share fewer than MIN_DUEL_QUESTIONS metrics.
const DEFAULT_ASPECTS: MetricId[] = [
  MetricId.TASTE,
  MetricId.SERVICE,
  MetricId.COST_BENEFIT,
]

export interface DuelQuestionDef {
  aspect: MetricId
  prompt: string
}

export interface DuelOpportunity {
  cuisine: RestaurantCategory
  aRestaurantId: string
  bRestaurantId: string
  aName: string
  bName: string
  sharedMetrics: MetricId[]
  questions: DuelQuestionDef[]
}

/** Metrics rated in both reviews. */
export function getSharedMetrics(
  a: Partial<Record<MetricId, number>>,
  b: Partial<Record<MetricId, number>>
): MetricId[] {
  const bKeys = new Set(Object.keys(b))
  return (Object.keys(a) as MetricId[]).filter((k) => bKeys.has(k))
}

/**
 * Builds 3–5 comparative questions, preferring the metrics both reviews share and
 * padding with default aspects when there aren't enough.
 */
export function generateDuelQuestions(sharedMetrics: MetricId[]): DuelQuestionDef[] {
  const ordered: MetricId[] = []
  for (const m of sharedMetrics) {
    if (!ordered.includes(m)) ordered.push(m)
  }
  for (const m of DEFAULT_ASPECTS) {
    if (ordered.length >= MIN_DUEL_QUESTIONS) break
    if (!ordered.includes(m)) ordered.push(m)
  }
  return ordered
    .slice(0, MAX_DUEL_QUESTIONS)
    .map((aspect) => ({ aspect, prompt: DUEL_PROMPTS[aspect] }))
}

/**
 * Finds eligible duel matchups from a user's reviews: per cuisine, the two most
 * recently reviewed *distinct* restaurants within the rolling window.
 */
export function detectDuelOpportunities(
  reviews: Review[],
  restaurantsById: Record<string, Restaurant> = {},
  now: Date = new Date()
): DuelOpportunity[] {
  const cutoff = new Date(now.getTime() - DUEL_WINDOW_DAYS * MS_PER_DAY).toISOString()

  const recent = reviews
    .filter((r) => r.createdAt >= cutoff)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) // newest first

  // cuisine → newest distinct-restaurant reviews (insertion order = recency)
  const byCuisine = new Map<RestaurantCategory, Review[]>()
  for (const review of recent) {
    const restaurant = review.restaurant ?? restaurantsById[review.restaurantId]
    if (!restaurant) continue
    for (const cat of restaurant.categories) {
      const arr = byCuisine.get(cat) ?? []
      if (!arr.some((rv) => rv.restaurantId === review.restaurantId)) {
        arr.push(review)
        byCuisine.set(cat, arr)
      }
    }
  }

  const opportunities: DuelOpportunity[] = []
  for (const [cuisine, arr] of byCuisine) {
    if (arr.length < 2) continue
    const [a, b] = arr
    const aR = a.restaurant ?? restaurantsById[a.restaurantId]
    const bR = b.restaurant ?? restaurantsById[b.restaurantId]
    const sharedMetrics = getSharedMetrics(a.metrics, b.metrics)
    opportunities.push({
      cuisine,
      aRestaurantId: a.restaurantId,
      bRestaurantId: b.restaurantId,
      aName: aR?.name ?? a.restaurantId,
      bName: bR?.name ?? b.restaurantId,
      sharedMetrics,
      questions: generateDuelQuestions(sharedMetrics),
    })
  }
  return opportunities
}

/** Majority of per-aspect answers decides the winner; a tie favors A. */
export function computeDuelWinner(
  answers: Record<string, string>,
  aId: string,
  bId: string
): string {
  let aVotes = 0
  let bVotes = 0
  for (const chosen of Object.values(answers)) {
    if (chosen === aId) aVotes++
    else if (chosen === bId) bVotes++
  }
  return bVotes > aVotes ? bId : aId
}
