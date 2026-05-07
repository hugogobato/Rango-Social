package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.TimeZone
import javax.inject.Inject

/**
 * Detects "Tá bombando" restaurants: spec §7.6 says hype is review velocity in the last 48h.
 * We rank by a composite of recent review count and recent vibe-check count, restricted to
 * restaurants with at least one event in the window.
 */
class GetTrendingRestaurantsUseCase @Inject constructor(
    private val restaurantRepository: RestaurantRepository,
    private val reviewRepository: ReviewRepository,
) {

    operator fun invoke(city: String? = null): Flow<List<Restaurant>> = combine(
        if (city != null) restaurantRepository.observeByCity(city) else restaurantRepository.observeAll(),
        reviewRepository.observeHomeFeed(),
    ) { restaurants, reviews ->
        val cutoff = Clock.System.now().minus(48, DateTimeUnit.HOUR, TimeZone.currentSystemDefault())
        val recentReviewsByRestaurant = reviews
            .filter { it.createdAt >= cutoff }
            .groupBy { it.restaurantId }
            .mapValues { it.value.size }

        restaurants
            .mapNotNull { restaurant ->
                val velocity = recentReviewsByRestaurant[restaurant.id] ?: 0
                if (velocity == 0 && restaurant.vibeCheckCount == 0) return@mapNotNull null
                restaurant to (velocity * 3 + restaurant.vibeCheckCount)
            }
            .sortedByDescending { it.second }
            .map { it.first }
            .take(20)
    }
}
