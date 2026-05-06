package com.gurudosrestaurantes.presentation.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.OnboardingStyle
import com.gurudosrestaurantes.domain.model.User
import com.gurudosrestaurantes.domain.usecase.CompleteOnboardingUseCase
import com.gurudosrestaurantes.domain.usecase.GetSuggestedInfluencersUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OnboardingUiState(
    val style: OnboardingStyle? = null,
    val city: String? = null,
    val followedUserIds: Set<String> = emptySet(),
    val suggestedInfluencers: List<User> = emptyList(),
    val isSubmitting: Boolean = false,
    val isFinished: Boolean = false,
) {
    val canProceedFromStyle: Boolean get() = style != null
    val canProceedFromCity: Boolean get() = !city.isNullOrBlank()
}

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    getSuggestedInfluencers: GetSuggestedInfluencersUseCase,
    private val completeOnboarding: CompleteOnboardingUseCase,
) : ViewModel() {

    private val internal = MutableStateFlow(OnboardingUiState())

    val uiState: StateFlow<OnboardingUiState> = combine(
        internal,
        getSuggestedInfluencers(),
    ) { state, influencers ->
        state.copy(suggestedInfluencers = influencers)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = internal.value,
    )

    fun selectStyle(style: OnboardingStyle) {
        internal.update { it.copy(style = style) }
    }

    fun selectCity(city: String) {
        internal.update { it.copy(city = city) }
    }

    fun toggleFollow(userId: String) {
        internal.update {
            val updated = it.followedUserIds.toMutableSet().apply {
                if (!add(userId)) remove(userId)
            }
            it.copy(followedUserIds = updated)
        }
    }

    fun finish() {
        val current = internal.value
        val style = current.style ?: return
        val city = current.city ?: return
        viewModelScope.launch {
            internal.update { it.copy(isSubmitting = true) }
            completeOnboarding(
                style = style,
                city = city,
                followedUserIds = current.followedUserIds.toList(),
            )
            internal.update { it.copy(isSubmitting = false, isFinished = true) }
        }
    }
}
