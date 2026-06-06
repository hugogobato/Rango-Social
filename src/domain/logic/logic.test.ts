/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { validateCpf, formatCpf } from './cpf'
import { calculateElo } from './elo'
import { calculateStreak } from './streak'
import { calculateRestaurantRanking } from './ranking'
import { calculateHypeRanking } from './hype'
import { getUnionOfMetrics } from './metrics-union'
import { RestaurantCategory, PriceRange, MetricId } from '../models'
import type { Restaurant, Review } from '../models'

describe('Domain Logic Tests', () => {
  describe('CPF Verification Checksum', () => {
    it('validates a real valid CPF', () => {
      // 123.456.789-09 is mathematically valid
      expect(validateCpf('123.456.789-09')).toBe(true)
      expect(validateCpf('12345678909')).toBe(true)
    })

    it('rejects an invalid CPF', () => {
      expect(validateCpf('123.456.789-00')).toBe(false)
      expect(validateCpf('111.111.111-11')).toBe(false) // repeated pattern
      expect(validateCpf('123')).toBe(false)
    })

    it('formats input values as masked CPFs', () => {
      expect(formatCpf('123')).toBe('123')
      expect(formatCpf('1234')).toBe('123.4')
      expect(formatCpf('12345678909')).toBe('123.456.789-09')
    })
  })

  describe('ELO Score Calculations', () => {
    it('calculates expected ELO change on win', () => {
      const { ratingA, ratingB } = calculateElo(1000, 1000, 'A_win')
      expect(ratingA).toBe(1016)
      expect(ratingB).toBe(984)
    })

    it('calculates expected ELO change on draw', () => {
      const { ratingA, ratingB } = calculateElo(1200, 1000, 'draw')
      // Rating A is higher, so a draw should decrease A and increase B slightly
      expect(ratingA).toBeLessThan(1200)
      expect(ratingB).toBeGreaterThan(1000)
    })
  })

  describe('Streak Tracker', () => {
    it('calculates streak correctly with consecutive dates', () => {
      const dates = ['2026-06-06', '2026-06-05', '2026-06-04']
      const streak = calculateStreak(dates, '2026-06-06')
      expect(streak).toBe(3)
    })

    it('retains streak if last visit was yesterday', () => {
      const dates = ['2026-06-05', '2026-06-04']
      const streak = calculateStreak(dates, '2026-06-06')
      expect(streak).toBe(2)
    })

    it('breaks streak if last visit was before yesterday', () => {
      const dates = ['2026-06-04', '2026-06-03']
      const streak = calculateStreak(dates, '2026-06-06')
      expect(streak).toBe(0)
    })

    it('ignores duplicates and gaps', () => {
      const dates = ['2026-06-06', '2026-06-06', '2026-06-05', '2026-06-03']
      const streak = calculateStreak(dates, '2026-06-06')
      expect(streak).toBe(2) // 6 and 5 count, gap to 3 breaks it
    })
  })

  describe('Restaurant Ranking Algorithm', () => {
    const mockRestaurants: Restaurant[] = [
      {
        id: 'rest1',
        name: 'Podrão do Silva',
        description: null,
        categories: [RestaurantCategory.PODRAO],
        priceRange: PriceRange.CHEAP,
        address: {
          street: 'Rua A',
          number: '12',
          complement: null,
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: null,
          fullFormatted: 'Rua A, 12, Centro, SP',
        },
        coordinates: null,
        phone: null,
        website: null,
        openingHours: null,
        photos: [],
        menuPhotos: [],
        averageOverallScore: 4.5,
        averageMetrics: {
          [MetricId.PRICE]: 4.8,
          [MetricId.SERVICE]: 4.0,
        } as any,
        reviewCount: 1,
        vibeCheckCount: 0,
        isOpenNow: null,
        illnessReports90d: 0,
        illnessWarning: false,
        eloByCuisine: {},
        createdAt: '2026-06-01T00:00:00Z',
      },
    ]

    const mockReviews: Review[] = [
      {
        id: 'rev1',
        userId: 'user1',
        restaurantId: 'rest1',
        overallScore: 5,
        metrics: {
          [MetricId.PRICE]: 5,
          [MetricId.SERVICE]: 4,
        } as any,
        comment: 'Top!',
        photos: [],
        targetDestinations: [],
        receiptPhoto: null,
        visitDate: '2026-06-05',
        companions: null,
        likes: 10,
        comments: [
          {
            id: 'c1',
            reviewId: 'rev1',
            userId: 'u2',
            text: 'Vdd',
            parentId: null,
            likes: 0,
            isLikedByMe: false,
            createdAt: '2026-06-05T12:00:00Z',
          },
        ],
        isLikedByMe: false,
        createdAt: '2026-06-05T10:00:00Z',
      },
    ]

    it('calculates weighted score component correctly', () => {
      const results = calculateRestaurantRanking(
        mockRestaurants,
        mockReviews,
        null,
        '2026-06-01T00:00:00Z'
      )
      expect(results.length).toBe(1)
      expect(results[0].restaurant.id).toBe('rest1')
      expect(results[0].position).toBe(1)
      expect(results[0].score).toBeGreaterThan(0)
    })
  })

  describe('Hype Trending Detector', () => {
    const mockRestaurants: Restaurant[] = [
      { id: 'rest1', vibeCheckCount: 2 } as any,
      { id: 'rest2', vibeCheckCount: 0 } as any,
    ]
    const mockReviews: Review[] = [
      {
        id: 'r1',
        restaurantId: 'rest2',
        createdAt: '2026-06-05T10:00:00Z',
      } as any,
    ]

    it('calculates hype based on velocity in last 48h', () => {
      const hype = calculateHypeRanking(
        mockRestaurants,
        mockReviews,
        '2026-06-04T00:00:00Z'
      )
      expect(hype.length).toBe(2)
      // rest2 has 1 review in window (1 * 3 + 0 = 3 score)
      // rest1 has 2 vibeChecks (0 * 3 + 2 = 2 score)
      // rest2 should rank first
      expect(hype[0].id).toBe('rest2')
      expect(hype[1].id).toBe('rest1')
    })
  })

  describe('Metrics Union Binder', () => {
    it('merges mandatory metrics without duplicates', () => {
      const groupAMetrics = [MetricId.PRICE, MetricId.SERVICE]
      const groupBMetrics = [MetricId.SERVICE, MetricId.TASTE]
      const union = getUnionOfMetrics([groupAMetrics, groupBMetrics])
      expect(union.length).toBe(3)
      expect(union).toContain(MetricId.PRICE)
      expect(union).toContain(MetricId.SERVICE)
      expect(union).toContain(MetricId.TASTE)
    })
  })
})
