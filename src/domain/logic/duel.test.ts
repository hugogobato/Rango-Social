import { describe, it, expect } from 'vitest'
import {
  getSharedMetrics,
  generateDuelQuestions,
  detectDuelOpportunities,
  computeDuelWinner,
  MAX_DUEL_QUESTIONS,
  MIN_DUEL_QUESTIONS,
} from './duel'
import {
  MetricId,
  RestaurantCategory,
  PriceRange,
  type Restaurant,
  type Review,
} from '../models'

const NOW = new Date('2026-06-06T12:00:00.000Z')
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString()

function makeRestaurant(id: string, categories: RestaurantCategory[]): Restaurant {
  return {
    id,
    name: `Pico ${id}`,
    description: null,
    categories,
    priceRange: PriceRange.MODERATE,
    address: {
      street: 'Rua A',
      number: '1',
      complement: null,
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: null,
      fullFormatted: '',
    },
    coordinates: null,
    phone: null,
    website: null,
    openingHours: null,
    photos: [],
    menuPhotos: [],
    averageOverallScore: null,
    averageMetrics: {} as Restaurant['averageMetrics'],
    reviewCount: 0,
    vibeCheckCount: 0,
    isOpenNow: null,
    illnessReports90d: 0,
    illnessWarning: false,
    eloByCuisine: {},
    createdAt: daysAgo(100),
  }
}

function makeReview(
  id: string,
  restaurant: Restaurant,
  createdAt: string,
  metrics: Partial<Record<MetricId, number>> = {}
): Review {
  return {
    id,
    userId: 'u_me',
    restaurantId: restaurant.id,
    restaurant,
    overallScore: 4,
    metrics: metrics as Review['metrics'],
    comment: null,
    photos: [],
    targetDestinations: [],
    receiptPhoto: null,
    visitDate: createdAt.split('T')[0],
    companions: null,
    likes: 0,
    comments: [],
    isLikedByMe: false,
    createdAt,
  }
}

describe('Duel logic', () => {
  describe('getSharedMetrics', () => {
    it('returns the intersection of rated metrics', () => {
      const a = { [MetricId.TASTE]: 5, [MetricId.SERVICE]: 4, [MetricId.VIBE]: 3 }
      const b = { [MetricId.TASTE]: 2, [MetricId.SERVICE]: 5, [MetricId.PRICE]: 1 }
      expect(getSharedMetrics(a, b).sort()).toEqual(
        [MetricId.TASTE, MetricId.SERVICE].sort()
      )
    })

    it('returns empty when nothing overlaps', () => {
      expect(getSharedMetrics({ [MetricId.TASTE]: 1 }, { [MetricId.PRICE]: 1 })).toEqual([])
    })
  })

  describe('generateDuelQuestions', () => {
    it('uses shared metrics and caps at the max', () => {
      const shared = [
        MetricId.TASTE,
        MetricId.SERVICE,
        MetricId.PRICE,
        MetricId.VIBE,
        MetricId.AESTHETIC,
        MetricId.PORTION, // 6 → should be capped to 5
      ]
      const q = generateDuelQuestions(shared)
      expect(q).toHaveLength(MAX_DUEL_QUESTIONS)
      expect(q[0].aspect).toBe(MetricId.TASTE)
      expect(q.every((x) => x.prompt.length > 0)).toBe(true)
    })

    it('pads with default aspects to reach the minimum', () => {
      const q = generateDuelQuestions([MetricId.VIBE])
      expect(q.length).toBeGreaterThanOrEqual(MIN_DUEL_QUESTIONS)
      expect(q[0].aspect).toBe(MetricId.VIBE) // shared metric kept first
    })

    it('does not duplicate an aspect already shared', () => {
      const q = generateDuelQuestions([MetricId.TASTE])
      const aspects = q.map((x) => x.aspect)
      expect(new Set(aspects).size).toBe(aspects.length)
    })
  })

  describe('detectDuelOpportunities', () => {
    const sushiA = makeRestaurant('r_a', [RestaurantCategory.JAPONES])
    const sushiB = makeRestaurant('r_b', [RestaurantCategory.JAPONES])
    const pizza = makeRestaurant('r_c', [RestaurantCategory.PIZZARIA])

    it('surfaces a matchup for two same-cuisine reviews within the window', () => {
      const reviews = [
        makeReview('1', sushiA, daysAgo(2), { [MetricId.TASTE]: 5, [MetricId.SERVICE]: 4, [MetricId.VIBE]: 3 }),
        makeReview('2', sushiB, daysAgo(10), { [MetricId.TASTE]: 3, [MetricId.SERVICE]: 5, [MetricId.PRICE]: 2 }),
      ]
      const ops = detectDuelOpportunities(reviews, {}, NOW)
      expect(ops).toHaveLength(1)
      expect(ops[0].cuisine).toBe(RestaurantCategory.JAPONES)
      // newest review first → A is the more recent restaurant
      expect(ops[0].aRestaurantId).toBe('r_a')
      expect(ops[0].bRestaurantId).toBe('r_b')
      expect(ops[0].sharedMetrics.sort()).toEqual(
        [MetricId.TASTE, MetricId.SERVICE].sort()
      )
    })

    it('does not trigger with only one restaurant of a cuisine', () => {
      const reviews = [makeReview('1', sushiA, daysAgo(2)), makeReview('2', pizza, daysAgo(3))]
      expect(detectDuelOpportunities(reviews, {}, NOW)).toHaveLength(0)
    })

    it('ignores reviews outside the 30-day window', () => {
      const reviews = [
        makeReview('1', sushiA, daysAgo(2)),
        makeReview('2', sushiB, daysAgo(45)), // too old
      ]
      expect(detectDuelOpportunities(reviews, {}, NOW)).toHaveLength(0)
    })

    it('does not pair a restaurant with itself', () => {
      const reviews = [
        makeReview('1', sushiA, daysAgo(1)),
        makeReview('2', sushiA, daysAgo(2)), // same restaurant twice
      ]
      expect(detectDuelOpportunities(reviews, {}, NOW)).toHaveLength(0)
    })

    it('resolves restaurants via the lookup when review.restaurant is absent', () => {
      const bare = (id: string, r: Restaurant, when: string): Review => ({
        ...makeReview(id, r, when),
        restaurant: undefined,
      })
      const reviews = [bare('1', sushiA, daysAgo(1)), bare('2', sushiB, daysAgo(2))]
      const ops = detectDuelOpportunities(
        reviews,
        { r_a: sushiA, r_b: sushiB },
        NOW
      )
      expect(ops).toHaveLength(1)
    })
  })

  describe('computeDuelWinner', () => {
    it('picks the majority winner', () => {
      expect(computeDuelWinner({ TASTE: 'a', SERVICE: 'a', PRICE: 'b' }, 'a', 'b')).toBe('a')
      expect(computeDuelWinner({ TASTE: 'b', SERVICE: 'b', PRICE: 'a' }, 'a', 'b')).toBe('b')
    })

    it('breaks ties in favor of A', () => {
      expect(computeDuelWinner({ TASTE: 'a', SERVICE: 'b' }, 'a', 'b')).toBe('a')
    })
  })
})
