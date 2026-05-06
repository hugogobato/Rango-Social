package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.repository.RestaurantFilters
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import javax.inject.Inject

class RoulettePickUseCase @Inject constructor(
    private val restaurantRepository: RestaurantRepository,
) {
    suspend operator fun invoke(filters: RestaurantFilters = RestaurantFilters()): Restaurant? =
        restaurantRepository.randomPick(filters)
}
