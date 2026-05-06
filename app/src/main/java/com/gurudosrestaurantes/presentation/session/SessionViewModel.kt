package com.gurudosrestaurantes.presentation.session

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.usecase.ObserveOnboardingStateUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

sealed interface SessionUiState {
    data object Loading : SessionUiState
    data object Onboarding : SessionUiState
    data object Authenticated : SessionUiState
}

@HiltViewModel
class SessionViewModel @Inject constructor(
    observeOnboardingState: ObserveOnboardingStateUseCase,
) : ViewModel() {

    val uiState: StateFlow<SessionUiState> = observeOnboardingState()
        .map { completed -> if (completed) SessionUiState.Authenticated else SessionUiState.Onboarding }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = SessionUiState.Loading,
        )
}
