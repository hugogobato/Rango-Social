package com.gurudosrestaurantes.data.repository

import com.gurudosrestaurantes.data.mock.MockData
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.repository.RestaurantFilters
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FakeRestaurantRepositoryImpl @Inject constructor() : RestaurantRepository {

    private val restaurantsFlow = MutableStateFlow(MockData.restaurants)

    override fun observeAll(): Flow<List<Restaurant>> = restaurantsFlow.asStateFlow()

    override fun observeByCity(city: String): Flow<List<Restaurant>> =
        restaurantsFlow.map { list -> list.filter { it.address.city == city } }

    override suspend fun getById(id: String): Restaurant? =
        restaurantsFlow.value.firstOrNull { it.id == id }

    override fun observeById(id: String): Flow<Restaurant?> =
        restaurantsFlow.map { list -> list.firstOrNull { it.id == id } }

    override suspend fun search(query: String, filters: RestaurantFilters): List<Restaurant> {
        val q = query.trim().lowercase()
        return restaurantsFlow.value
            .asSequence()
            .filter { q.isBlank() || it.name.lowercase().contains(q) || it.address.neighborhood.lowercase().contains(q) }
            .filter { filters.city == null || it.address.city == filters.city }
            .filter { filters.categories.isEmpty() || it.categories.any { c -> c in filters.categories } }
            .filter { filters.priceRanges.isEmpty() || it.priceRange in filters.priceRanges }
            .filter { filters.minScore == null || (it.averageOverallScore ?: 0f) >= filters.minScore!! }
            .filter { !filters.openNow || it.isOpenNow == true }
            .filter {
                val metric = filters.mandatoryMetric ?: return@filter true
                val min = filters.mandatoryMetricMin ?: return@filter true
                (it.averageMetrics[metric] ?: 0f) >= min
            }
            .toList()
    }

    override suspend fun randomPick(filters: RestaurantFilters): Restaurant? {
        val pool = search(query = "", filters = filters)
        return pool.randomOrNull()
    }

    override fun observeTrending(city: String?): Flow<List<Restaurant>> =
        restaurantsFlow.map { list ->
            list
                .filter { city == null || it.address.city == city }
                .sortedByDescending { it.vibeCheckCount * 3 + it.reviewCount }
                .take(20)
        }
}
