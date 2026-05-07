package com.gurudosrestaurantes.presentation.ranking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.MetricId
import com.gurudosrestaurantes.domain.model.RankedRestaurant
import com.gurudosrestaurantes.domain.model.RankingReach
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.usecase.CalculateRankingUseCase
import com.gurudosrestaurantes.domain.usecase.GetSelectedCityUseCase
import com.gurudosrestaurantes.domain.usecase.GetTrendingRestaurantsUseCase
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

data class RankingFilters(
    val city: String? = null,
    val reach: RankingReach = RankingReach.EVERYONE,
    val metric: MetricId? = null,
)

data class RankingUiState(
    val isLoading: Boolean = true,
    val filters: RankingFilters = RankingFilters(),
    val ranked: List<RankedRestaurant> = emptyList(),
    val trending: List<Restaurant> = emptyList(),
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class RankingViewModel @Inject constructor(
    private val calculateRanking: CalculateRankingUseCase,
    private val getTrending: GetTrendingRestaurantsUseCase,
    getSelectedCity: GetSelectedCityUseCase,
) : ViewModel() {

    private val filtersFlow = MutableStateFlow(RankingFilters())

    init {
        viewModelScope.launch {
            getSelectedCity().collect { city ->
                filtersFlow.update { current ->
                    if (current.city != null) current else current.copy(city = city)
                }
            }
        }
    }

    private val rankedFlow = filtersFlow
        .flatMapLatest { filters ->
            calculateRanking(filters.city, filters.reach, filters.metric)
        }

    private val trendingFlow = filtersFlow
        .flatMapLatest { filters -> getTrending(filters.city) }

    val uiState: StateFlow<RankingUiState> = combine(
        filtersFlow,
        rankedFlow,
        trendingFlow,
    ) { filters, ranked, trending ->
        RankingUiState(
            isLoading = false,
            filters = filters,
            ranked = ranked,
            trending = trending,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = RankingUiState(),
    )

    fun setCity(city: String?) {
        filtersFlow.update { it.copy(city = city) }
    }

    fun setReach(reach: RankingReach) {
        filtersFlow.update { it.copy(reach = reach) }
    }

    fun setMetric(metric: MetricId?) {
        filtersFlow.update { it.copy(metric = metric) }
    }
}
