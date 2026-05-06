package com.gurudosrestaurantes.domain.repository

import com.gurudosrestaurantes.domain.model.OnboardingStyle
import kotlinx.coroutines.flow.Flow

interface SessionRepository {

    val hasCompletedOnboarding: Flow<Boolean>

    val currentUserId: Flow<String?>

    val selectedCity: Flow<String?>

    val selectedStyle: Flow<OnboardingStyle?>

    suspend fun completeOnboarding(
        style: OnboardingStyle,
        city: String,
        followedUserIds: List<String>,
    )

    suspend fun setSelectedCity(city: String)

    suspend fun setSelectedStyle(style: OnboardingStyle)

    suspend fun resetOnboarding()
}
