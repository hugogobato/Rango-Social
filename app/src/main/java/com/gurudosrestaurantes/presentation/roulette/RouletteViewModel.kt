package com.gurudosrestaurantes.presentation.roulette

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.repository.RestaurantFilters
import com.gurudosrestaurantes.domain.usecase.GetSelectedCityUseCase
import com.gurudosrestaurantes.domain.usecase.RoulettePickUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RouletteUiState(
    val isSpinning: Boolean = true,
    val pick: Restaurant? = null,
    val anywhereMode: Boolean = false,
)

@HiltViewModel
class RouletteViewModel @Inject constructor(
    private val rouletteUseCase: RoulettePickUseCase,
    private val getSelectedCity: GetSelectedCityUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow(RouletteUiState())
    val uiState: StateFlow<RouletteUiState> = _uiState.asStateFlow()

    init {
        spin()
    }

    fun spin() {
        viewModelScope.launch {
            _uiState.update { it.copy(isSpinning = true, pick = null) }
            delay(700)
            val city = if (_uiState.value.anywhereMode) null else getSelectedCity().first()
            val pick = rouletteUseCase(RestaurantFilters(city = city))
            _uiState.update { it.copy(isSpinning = false, pick = pick) }
        }
    }

    fun toggleAnywhere() {
        _uiState.update { it.copy(anywhereMode = !it.anywhereMode) }
        spin()
    }
}
