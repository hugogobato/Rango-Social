import { type Restaurant, type Review, type MetricId } from '../models'

export interface RankedRestaurant {
  restaurant: Restaurant
  position: number
  score: number
  overallComponent: number
  metricComponent: number
  recentComponent: number
  engagementComponent: number
  recentReviewCount: number
  totalReviewCount: number
  isTrending: boolean
}

const RECENT_REVIEW_SATURATION = 10
const ENGAGEMENT_SATURATION = 30
const TRENDING_THRESHOLD = 3

/**
 * Ranks restaurants using a composite scoring algorithm.
 * score = (overall * 0.4) + (metricAvg * 0.3) + (recentFactor * 0.2) + (engagementFactor * 0.1)
 */
export function calculateRestaurantRanking(
  restaurants: Restaurant[],
  reviews: Review[],
  selectedMetric: MetricId | null,
  recentCutoffDate: string // YYYY-MM-DD or ISO timestamp
): RankedRestaurant[] {
  const reviewsByRestaurant = reviews.reduce<Record<string, Review[]>>(
    (acc, rev) => {
      if (!acc[rev.restaurantId]) acc[rev.restaurantId] = []
      acc[rev.restaurantId].push(rev)
      return acc
    },
    {}
  )

  const computeRanked = (restaurant: Restaurant): RankedRestaurant => {
    const restaurantReviews = reviewsByRestaurant[restaurant.id] || []

    // 1. Overall component (average of 1..5 overallScore)
    const overallScores = restaurantReviews
      .map((r) => r.overallScore)
      .filter((s): s is number => s !== null && s !== undefined)

    const overall =
      overallScores.length > 0
        ? overallScores.reduce((sum, s) => sum + s, 0) / overallScores.length
        : restaurant.averageOverallScore || 0

    // 2. Selected Metric component (defaults to overall if none chosen)
    let metricAvg = overall
    if (selectedMetric) {
      const metricValues = restaurantReviews
        .map((r) => r.metrics[selectedMetric])
        .filter((v): v is number => v !== undefined && v !== null)

      metricAvg =
        metricValues.length > 0
          ? metricValues.reduce((sum, v) => sum + v, 0) / metricValues.length
          : restaurant.averageMetrics[selectedMetric] || 0
    }

    // 3. Recent Review component (last 14 days, saturates at 10 reviews)
    const recentReviews = restaurantReviews.filter(
      (r) => r.createdAt >= recentCutoffDate
    )
    const recentFactor =
      Math.min(recentReviews.length, RECENT_REVIEW_SATURATION) *
      (5 / RECENT_REVIEW_SATURATION)

    // 4. Social Engagement component (avg likes + 2 * comments per review, saturates at 30)
    const totalEngagement = restaurantReviews.reduce(
      (sum, r) => sum + r.likes + 2 * r.comments.length,
      0
    )
    const avgEngagement =
      restaurantReviews.length > 0
        ? totalEngagement / restaurantReviews.length
        : 0
    const engagementFactor =
      Math.min(avgEngagement / ENGAGEMENT_SATURATION, 1) * 5

    // Combined score calculations
    const score =
      overall * 0.4 +
      metricAvg * 0.3 +
      recentFactor * 0.2 +
      engagementFactor * 0.1
    const isTrending = recentReviews.length >= TRENDING_THRESHOLD

    return {
      restaurant,
      position: 0,
      score: parseFloat(score.toFixed(3)),
      overallComponent: parseFloat(overall.toFixed(2)),
      metricComponent: parseFloat(metricAvg.toFixed(2)),
      recentComponent: parseFloat(recentFactor.toFixed(2)),
      engagementComponent: parseFloat(engagementFactor.toFixed(2)),
      recentReviewCount: recentReviews.length,
      totalReviewCount: restaurantReviews.length,
      isTrending,
    }
  }

  return restaurants
    .map(computeRanked)
    .sort((a, b) => b.score - a.score)
    .map((ranked, index) => ({ ...ranked, position: index + 1 }))
}
export enum RankingReach {
  EVERYONE = 'EVERYONE',
  FRIENDS = 'FRIENDS',
  GROUPS = 'GROUPS',
}
