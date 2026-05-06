package com.gurudosrestaurantes.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.model.User
import com.gurudosrestaurantes.domain.model.VibeCheck
import com.gurudosrestaurantes.domain.usecase.GetActiveVibeChecksUseCase
import com.gurudosrestaurantes.domain.usecase.GetCurrentUserUseCase
import com.gurudosrestaurantes.domain.usecase.GetHomeFeedUseCase
import com.gurudosrestaurantes.domain.usecase.ToggleLikeUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = true,
    val feed: List<Review> = emptyList(),
    val vibeChecks: List<VibeCheck> = emptyList(),
    val currentUser: User? = null,
    val error: String? = null,
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    getHomeFeed: GetHomeFeedUseCase,
    getActiveVibeChecks: GetActiveVibeChecksUseCase,
    getCurrentUser: GetCurrentUserUseCase,
    private val toggleLike: ToggleLikeUseCase,
) : ViewModel() {

    val uiState: StateFlow<HomeUiState> = combine(
        getHomeFeed(),
        getActiveVibeChecks(),
        getCurrentUser(),
    ) { feed, vibes, user ->
        HomeUiState(
            isLoading = false,
            feed = feed,
            vibeChecks = vibes,
            currentUser = user,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = HomeUiState(),
    )

    fun onLikeClick(reviewId: String) {
        viewModelScope.launch {
            toggleLike(reviewId)
        }
    }
}
