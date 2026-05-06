package com.gurudosrestaurantes.domain.repository

import com.gurudosrestaurantes.domain.model.VibeCheck
import kotlinx.coroutines.flow.Flow

interface VibeCheckRepository {

    /** Currently-active (non-expired) vibe checks from people the user follows. */
    fun observeActiveFromFollowing(): Flow<List<VibeCheck>>

    fun observeActiveForRestaurant(restaurantId: String): Flow<List<VibeCheck>>

    suspend fun post(vibeCheck: VibeCheck)
}
