package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.repository.RestaurantFilters
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetRestaurantsUseCase @Inject constructor(
    private val restaurantRepository: RestaurantRepository,
) {
    fun all(): Flow<List<Restaurant>> = restaurantRepository.observeAll()

    fun byCity(city: String): Flow<List<Restaurant>> = restaurantRepository.observeByCity(city)

    suspend fun search(query: String, filters: RestaurantFilters = RestaurantFilters()): List<Restaurant> =
        restaurantRepository.search(query, filters)
}
