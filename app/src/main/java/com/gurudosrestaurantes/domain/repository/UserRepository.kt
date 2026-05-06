package com.gurudosrestaurantes.domain.repository

import com.gurudosrestaurantes.domain.model.User
import kotlinx.coroutines.flow.Flow

interface UserRepository {

    /** The currently logged-in user. Mock-backed in Phase 2. */
    fun observeCurrentUser(): Flow<User?>

    suspend fun getCurrentUser(): User?

    suspend fun getUserById(id: String): User?

    fun observeUserById(id: String): Flow<User?>

    /** Verified influencers, ordered by tier descending then follower count. */
    fun observeInfluencers(): Flow<List<User>>

    /** Users that the current user follows. */
    fun observeFollowing(): Flow<List<User>>

    suspend fun follow(userId: String)

    suspend fun unfollow(userId: String)

    suspend fun isFollowing(userId: String): Boolean

    suspend fun searchUsers(query: String): List<User>
}
