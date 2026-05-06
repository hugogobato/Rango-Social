package com.gurudosrestaurantes.data.repository

import com.gurudosrestaurantes.data.mock.MockData
import com.gurudosrestaurantes.domain.model.VibeCheck
import com.gurudosrestaurantes.domain.repository.UserRepository
import com.gurudosrestaurantes.domain.repository.VibeCheckRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FakeVibeCheckRepositoryImpl @Inject constructor(
    private val userRepository: UserRepository,
) : VibeCheckRepository {

    private val vibeChecksFlow = MutableStateFlow(MockData.vibeChecks)

    override fun observeActiveFromFollowing(): Flow<List<VibeCheck>> =
        combine(vibeChecksFlow, userRepository.observeFollowing(), userRepository.observeCurrentUser()) { vibes, following, me ->
            val visibleIds = following.map { it.id }.toSet() + setOfNotNull(me?.id)
            vibes.filter { it.userId in visibleIds && it.expiresAt > MockData.now }
                .sortedByDescending { it.createdAt }
        }

    override fun observeActiveForRestaurant(restaurantId: String): Flow<List<VibeCheck>> =
        vibeChecksFlow.map { list ->
            list.filter { it.restaurantId == restaurantId && it.expiresAt > MockData.now }
                .sortedByDescending { it.createdAt }
        }

    override suspend fun post(vibeCheck: VibeCheck) {
        vibeChecksFlow.value = listOf(vibeCheck) + vibeChecksFlow.value
    }
}
