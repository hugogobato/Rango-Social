package com.gurudosrestaurantes.presentation.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.MetricId
import com.gurudosrestaurantes.domain.model.PriceRange
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.model.RestaurantCategory
import com.gurudosrestaurantes.domain.repository.RestaurantFilters
import com.gurudosrestaurantes.domain.usecase.GetRestaurantsUseCase
import com.gurudosrestaurantes.domain.usecase.GetSelectedCityUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import kotlinx.coroutines.ExperimentalCoroutinesApi

data class SearchFilters(
    val categories: Set<RestaurantCategory> = emptySet(),
    val priceRanges: Set<PriceRange> = emptySet(),
    val openNow: Boolean = false,
    val mandatoryMetric: MetricId? = null,
    val mandatoryMetricMin: Float? = 3f,
) {
    val activeCount: Int
        get() = categories.size +
            priceRanges.size +
            (if (openNow) 1 else 0) +
            (if (mandatoryMetric != null) 1 else 0)
}

data class SearchUiState(
    val query: String = "",
    val filters: SearchFilters = SearchFilters(),
    val results: List<Restaurant> = emptyList(),
    val isSearching: Boolean = false,
    val city: String? = null,
)

@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
@HiltViewModel
class SearchViewModel @Inject constructor(
    private val getRestaurants: GetRestaurantsUseCase,
    getSelectedCity: GetSelectedCityUseCase,
) : ViewModel() {

    private val query = MutableStateFlow("")
    private val filters = MutableStateFlow(SearchFilters())
    private val cityFlow = getSelectedCity()

    val uiState: StateFlow<SearchUiState> = combine(
        query,
        filters,
        cityFlow,
    ) { q, f, city -> Triple(q, f, city) }
        .debounce(180)
        .distinctUntilChanged()
        .flatMapLatest { (q, f, city) ->
            flow {
                emit(SearchUiState(query = q, filters = f, isSearching = true, city = city))
                val combined = RestaurantFilters(
                    city = city,
                    categories = f.categories.toList(),
                    priceRanges = f.priceRanges.toList(),
                    openNow = f.openNow,
                    mandatoryMetric = f.mandatoryMetric,
                    mandatoryMetricMin = f.mandatoryMetricMin,
                )
                val results = getRestaurants.search(q, combined)
                emit(SearchUiState(query = q, filters = f, results = results, city = city))
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = SearchUiState(),
        )

    fun onQueryChange(value: String) {
        query.value = value
    }

    fun toggleCategory(category: RestaurantCategory) {
        filters.update { f ->
            val updated = f.categories.toMutableSet().apply {
                if (!add(category)) remove(category)
            }
            f.copy(categories = updated)
        }
    }

    fun togglePrice(price: PriceRange) {
        filters.update { f ->
            val updated = f.priceRanges.toMutableSet().apply {
                if (!add(price)) remove(price)
            }
            f.copy(priceRanges = updated)
        }
    }

    fun setOpenNow(enabled: Boolean) {
        filters.update { it.copy(openNow = enabled) }
    }

    fun setMandatoryMetric(metric: MetricId?, min: Float = 3f) {
        filters.update { it.copy(mandatoryMetric = metric, mandatoryMetricMin = min) }
    }

    fun clearFilters() {
        filters.value = SearchFilters()
    }
}
