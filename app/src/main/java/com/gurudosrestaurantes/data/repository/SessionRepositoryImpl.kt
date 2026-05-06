package com.gurudosrestaurantes.data.repository

import com.gurudosrestaurantes.data.local.datastore.UserPreferencesDataStore
import com.gurudosrestaurantes.data.mock.MockData
import com.gurudosrestaurantes.domain.model.OnboardingStyle
import com.gurudosrestaurantes.domain.repository.SessionRepository
import com.gurudosrestaurantes.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionRepositoryImpl @Inject constructor(
    private val dataStore: UserPreferencesDataStore,
    private val userRepository: UserRepository,
) : SessionRepository {

    override val hasCompletedOnboarding: Flow<Boolean> = dataStore.hasCompletedOnboarding
    override val currentUserId: Flow<String?> = dataStore.currentUserId
    override val selectedCity: Flow<String?> = dataStore.selectedCity
    override val selectedStyle: Flow<OnboardingStyle?> = dataStore.selectedStyle

    override suspend fun completeOnboarding(
        style: OnboardingStyle,
        city: String,
        followedUserIds: List<String>,
    ) {
        dataStore.setSelectedStyle(style)
        dataStore.setSelectedCity(city)
        dataStore.setCurrentUserId(MockData.currentUser.id)
        followedUserIds.forEach { userRepository.follow(it) }
        dataStore.setHasCompletedOnboarding(true)
    }

    override suspend fun setSelectedCity(city: String) {
        dataStore.setSelectedCity(city)
    }

    override suspend fun setSelectedStyle(style: OnboardingStyle) {
        dataStore.setSelectedStyle(style)
    }

    override suspend fun resetOnboarding() {
        dataStore.clear()
    }
}
