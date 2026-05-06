package com.gurudosrestaurantes.domain.repository

import com.gurudosrestaurantes.domain.model.MetricId
import com.gurudosrestaurantes.domain.model.PriceRange
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.model.RestaurantCategory
import kotlinx.coroutines.flow.Flow

data class RestaurantFilters(
    val city: String? = null,
    val categories: List<RestaurantCategory> = emptyList(),
    val priceRanges: List<PriceRange> = emptyList(),
    val minScore: Float? = null,
    val openNow: Boolean = false,
    val mandatoryMetric: MetricId? = null,
    val mandatoryMetricMin: Float? = null,
)

interface RestaurantRepository {

    fun observeAll(): Flow<List<Restaurant>>

    fun observeByCity(city: String): Flow<List<Restaurant>>

    suspend fun getById(id: String): Restaurant?

    fun observeById(id: String): Flow<Restaurant?>

    suspend fun search(query: String, filters: RestaurantFilters = RestaurantFilters()): List<Restaurant>

    /** Random pick for the "🎲 Onde vou hoje?" roulette. */
    suspend fun randomPick(filters: RestaurantFilters = RestaurantFilters()): Restaurant?

    /** Trending in the last 48h, ranked by review velocity. */
    fun observeTrending(city: String? = null): Flow<List<Restaurant>>
}
