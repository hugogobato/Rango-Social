import { describe, it, expect } from 'vitest'
import {
  computeBadgeStats,
  evaluateBadges,
  type BadgeStats,
} from './badges'
import { isStreakAtRisk } from './streak'
import {
  RestaurantCategory,
  PriceRange,
  type Restaurant,
  type Review,
} from '../models'

function makeRestaurant(over: Partial<Restaurant> = {}): Restaurant {
  return {
    id: 'r1',
    name: 'Pico Teste',
    description: null,
    categories: [RestaurantCategory.PODRAO],
    priceRange: PriceRange.CHEAP,
    address: {
      street: 'Rua A',
      number: '1',
      complement: null,
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: null,
      fullFormatted: 'Rua A, 1 - Centro',
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
    createdAt: '2026-01-01T00:00:00.000Z',
    ...over,
  }
}

function makeReview(over: Partial<Review> = {}): Review {
  return {
    id: 'rev1',
    userId: 'u_me',
    restaurantId: 'r1',
    overallScore: 4,
    metrics: {} as Review['metrics'],
    comment: null,
    photos: [],
    targetDestinations: [],
    receiptPhoto: null,
    visitDate: '2026-06-01',
    companions: null,
    likes: 0,
    comments: [],
    isLikedByMe: false,
    createdAt: '2026-06-01T12:00:00.000Z',
    ...over,
  }
}

describe('Badges logic', () => {
  describe('computeBadgeStats', () => {
    it('counts distinct neighborhoods and cities across reviews', () => {
      const reviews = [
        makeReview({
          id: 'a',
          restaurant: makeRestaurant({ address: addr('Centro', 'São Paulo') }),
        }),
        makeReview({
          id: 'b',
          restaurant: makeRestaurant({ address: addr('Pinheiros', 'São Paulo') }),
        }),
        makeReview({
          id: 'c',
          restaurant: makeRestaurant({ address: addr('Centro', 'Ribeirão Preto') }),
        }),
      ]
      const stats = computeBadgeStats(reviews, 0)
      expect(stats.totalReviews).toBe(3)
      expect(stats.neighborhoodsVisited).toBe(2) // Centro, Pinheiros
      expect(stats.citiesVisited).toBe(2) // SP, Ribeirão
    })

    it('falls back to the restaurantsById lookup when review.restaurant is absent', () => {
      const reviews = [makeReview({ restaurant: undefined, restaurantId: 'r1' })]
      const byId = { r1: makeRestaurant({ id: 'r1' }) }
      const stats = computeBadgeStats(reviews, 0, byId)
      expect(stats.neighborhoodsVisited).toBe(1)
      expect(stats.podraoReviews).toBe(1)
    })

    it('only counts detailed reviews (comment + 3 metrics)', () => {
      const reviews = [
        makeReview({ id: '1', comment: 'massa', metrics: threeMetrics() }),
        makeReview({ id: '2', comment: 'massa', metrics: {} as Review['metrics'] }), // too few metrics
        makeReview({ id: '3', comment: null, metrics: threeMetrics() }), // no comment
      ]
      expect(computeBadgeStats(reviews, 0).detailedReviews).toBe(1)
    })

    it('sums photos across reviews', () => {
      const reviews = [
        makeReview({ id: '1', photos: ['a', 'b'] }),
        makeReview({ id: '2', photos: ['c'] }),
      ]
      expect(computeBadgeStats(reviews, 0).totalPhotos).toBe(3)
    })
  })

  describe('evaluateBadges', () => {
    const baseStats: BadgeStats = {
      totalReviews: 0,
      neighborhoodsVisited: 0,
      citiesVisited: 0,
      detailedReviews: 0,
      podraoReviews: 0,
      currentStreak: 0,
      totalPhotos: 0,
    }

    it('earns the streak badge at 7 days and reports partial progress below', () => {
      const earned = evaluateBadges({ ...baseStats, currentStreak: 7 }).find(
        (b) => b.definition.id === 'b_streak_7'
      )!
      expect(earned.earned).toBe(true)
      expect(earned.progress).toBe(1)

      const partial = evaluateBadges({ ...baseStats, currentStreak: 3 }).find(
        (b) => b.definition.id === 'b_streak_7'
      )!
      expect(partial.earned).toBe(false)
      expect(partial.progress).toBeCloseTo(3 / 7)
    })

    it('earns the legendary podrão badge at 3 podrão reviews', () => {
      const b = evaluateBadges({ ...baseStats, podraoReviews: 3 }).find(
        (x) => x.definition.id === 'b_pioneer'
      )!
      expect(b.earned).toBe(true)
    })

    it('clamps progress to a maximum of 1', () => {
      const b = evaluateBadges({ ...baseStats, totalReviews: 50 }).find(
        (x) => x.definition.id === 'b_first_review'
      )!
      expect(b.progress).toBe(1)
    })
  })
})

describe('isStreakAtRisk', () => {
  it('is at risk when the last review was yesterday but not today', () => {
    expect(isStreakAtRisk(['2026-06-04', '2026-06-05'], '2026-06-06')).toBe(true)
  })

  it('is not at risk when already reviewed today', () => {
    expect(isStreakAtRisk(['2026-06-05', '2026-06-06'], '2026-06-06')).toBe(false)
  })

  it('is not at risk when there is no live streak', () => {
    expect(isStreakAtRisk(['2026-05-01'], '2026-06-06')).toBe(false)
    expect(isStreakAtRisk([], '2026-06-06')).toBe(false)
  })
})

// ---- helpers ----
function addr(neighborhood: string, city: string): Restaurant['address'] {
  return {
    street: 'Rua X',
    number: '0',
    complement: null,
    neighborhood,
    city,
    state: 'SP',
    zipCode: null,
    fullFormatted: `${neighborhood}, ${city}`,
  }
}

function threeMetrics(): Review['metrics'] {
  return {
    TASTE: 5,
    SERVICE: 4,
    PRICE: 3,
  } as Review['metrics']
}
