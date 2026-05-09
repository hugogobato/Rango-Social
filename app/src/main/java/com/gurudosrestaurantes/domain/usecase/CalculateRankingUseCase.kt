package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.MetricId
import com.gurudosrestaurantes.domain.model.RankedRestaurant
import com.gurudosrestaurantes.domain.model.RankingReach
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.model.TargetDestination
import com.gurudosrestaurantes.domain.repository.GroupRepository
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import com.gurudosrestaurantes.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.Instant
import kotlin.math.min
import javax.inject.Inject
import kotlinx.datetime.minus

/**
 * Computes the public ranking using the spec §7 formula:
 * `score = (overall * 0.4) + (metric * 0.3) + (recent * 0.2) + (engagement * 0.1)`
 *
 * Recent factor: review count in the last 14 days, normalised to 5.
 * Engagement factor: average (likes + 2 * comments) per review in window, normalised to 5.
 */
class CalculateRankingUseCase @Inject constructor(
    private val restaurantRepository: RestaurantRepository,
    private val reviewRepository: ReviewRepository,
    private val userRepository: UserRepository,
    private val groupRepository: GroupRepository,
) {

    operator fun invoke(
        city: String?,
        reach: RankingReach,
        metric: MetricId?,
    ): Flow<List<RankedRestaurant>> = combine(
        if (city != null) restaurantRepository.observeByCity(city) else restaurantRepository.observeAll(),
        reviewRepository.observeHomeFeed(),
        userRepository.observeFollowing(),
        groupRepository.observeMyGroups(),
    ) { restaurants, allReviews, following, groups ->
        val now = Clock.System.now()
        val recentCutoff = now.minus(14, DateTimeUnit.DAY, kotlinx.datetime.TimeZone.currentSystemDefault())

        val followingIds = following.map { it.id }.toSet()
        val groupIds = groups.map { it.id }.toSet()

        val filteredReviews = allReviews.filter { review ->
            when (reach) {
                RankingReach.EVERYONE -> true
                RankingReach.FRIENDS -> review.userId in followingIds
                RankingReach.GROUPS -> review.targetDestinations.any {
                    it is TargetDestination.GroupTarget && it.groupId in groupIds
                }
            }
        }

        val reviewsByRestaurant = filteredReviews.groupBy { it.restaurantId }

        restaurants
            .mapNotNull { restaurant ->
                val reviewsForRestaurant = reviewsByRestaurant[restaurant.id].orEmpty()
                if (reach != RankingReach.EVERYONE && reviewsForRestaurant.isEmpty()) return@mapNotNull null
                computeRanked(restaurant, reviewsForRestaurant, metric, recentCutoff)
            }
            .sortedByDescending { it.score }
            .mapIndexed { index, ranked -> ranked.copy(position = index + 1) }
    }

    private fun computeRanked(
        restaurant: Restaurant,
        reviews: List<Review>,
        metric: MetricId?,
        recentCutoff: Instant,
    ): RankedRestaurant {
        val overall = restaurant.averageOverallScore ?: averageOverall(reviews)
        val metricAvg = metric?.let { id ->
            restaurant.averageMetrics[id] ?: averageMetric(reviews, id)
        } ?: overall

        val recentReviews = reviews.filter { it.createdAt >= recentCutoff }
        val recentFactor = recentFactorFor(recentReviews.size)
        val engagementFactor = engagementFactorFor(reviews)

        val score = (overall * 0.4f) + (metricAvg * 0.3f) + (recentFactor * 0.2f) + (engagementFactor * 0.1f)

        val isTrending = recentReviews.size >= TRENDING_THRESHOLD

        return RankedRestaurant(
            restaurant = restaurant,
            position = 0,
            score = score,
            overallComponent = overall,
            metricComponent = metricAvg,
            recentComponent = recentFactor,
            engagementComponent = engagementFactor,
            recentReviewCount = recentReviews.size,
            totalReviewCount = reviews.size,
            isTrending = isTrending,
        )
    }

    private fun averageOverall(reviews: List<Review>): Float {
        val scored = reviews.mapNotNull { it.overallScore }
        return if (scored.isEmpty()) 0f else scored.average().toFloat()
    }

    private fun averageMetric(reviews: List<Review>, metric: MetricId): Float {
        val values = reviews.mapNotNull { it.metrics[metric] }
        return if (values.isEmpty()) 0f else values.average().toFloat()
    }

    /** Maps review count in the last 14d to a 0..5 factor (saturates at 10 reviews). */
    private fun recentFactorFor(count: Int): Float =
        min(count, RECENT_REVIEW_SATURATION) * (5f / RECENT_REVIEW_SATURATION)

    /** Maps average (likes + 2*comments) per review to a 0..5 factor. */
    private fun engagementFactorFor(reviews: List<Review>): Float {
        if (reviews.isEmpty()) return 0f
        val avg = reviews.sumOf { it.likes + 2 * it.comments.size }.toFloat() / reviews.size
        val ratio = (avg / ENGAGEMENT_SATURATION).coerceAtMost(1f)
        return ratio * 5f
    }

    private companion object {
        const val RECENT_REVIEW_SATURATION = 10
        const val ENGAGEMENT_SATURATION = 30f
        const val TRENDING_THRESHOLD = 3
    }
}
