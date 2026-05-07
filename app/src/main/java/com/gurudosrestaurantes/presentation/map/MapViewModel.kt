package com.gurudosrestaurantes.presentation.map

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.usecase.GetSelectedCityUseCase
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MapUiState(
    val isLoading: Boolean = true,
    val city: String? = null,
    val restaurants: List<Restaurant> = emptyList(),
    val selectedRestaurantId: String? = null,
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class MapViewModel @Inject constructor(
    private val restaurantRepository: RestaurantRepository,
    getSelectedCity: GetSelectedCityUseCase,
) : ViewModel() {

    private val cityFlow = MutableStateFlow<String?>(null)
    private val selectedFlow = MutableStateFlow<String?>(null)

    init {
        viewModelScope.launch {
            getSelectedCity().collect { city ->
                cityFlow.update { current -> current ?: city }
            }
        }
    }

    private val restaurantsFlow = cityFlow
        .flatMapLatest { city ->
            if (city != null) restaurantRepository.observeByCity(city)
            else restaurantRepository.observeAll()
        }

    val uiState: StateFlow<MapUiState> = combine(
        cityFlow,
        restaurantsFlow,
        selectedFlow,
    ) { city, restaurants, selected ->
        MapUiState(
            isLoading = false,
            city = city,
            restaurants = restaurants.filter { it.coordinates != null },
            selectedRestaurantId = selected,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = MapUiState(),
    )

    fun setCity(city: String?) {
        cityFlow.value = city
        selectedFlow.value = null
    }

    fun selectRestaurant(id: String?) {
        selectedFlow.value = id
    }
}
