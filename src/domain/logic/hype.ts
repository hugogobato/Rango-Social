import { type Restaurant, type Review } from '../models'

/**
 * Calculates trending ("Tá bombando") restaurants based on review velocity in the last 48 hours.
 * Returns a sorted list of restaurants (up to 20) with at least one recent event.
 * Formula: score = (recent reviews * 3) + vibeCheckCount
 */
export function calculateHypeRanking(
  restaurants: Restaurant[],
  reviews: Review[],
  cutoffDateString: string // ISO timestamp or YYYY-MM-DD YYYY-MM-DD
): Restaurant[] {
  const recentReviewsByRestaurant = reviews
    .filter((r) => r.createdAt >= cutoffDateString)
    .reduce<Record<string, number>>((acc, rev) => {
      acc[rev.restaurantId] = (acc[rev.restaurantId] || 0) + 1
      return acc
    }, {})

  return restaurants
    .map((restaurant) => {
      const velocity = recentReviewsByRestaurant[restaurant.id] || 0
      const score = velocity * 3 + restaurant.vibeCheckCount
      return { restaurant, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.restaurant)
    .slice(0, 20)
}
