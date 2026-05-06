package com.gurudosrestaurantes.data.repository

import com.gurudosrestaurantes.data.mock.MockData
import com.gurudosrestaurantes.domain.model.User
import com.gurudosrestaurantes.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FakeUserRepositoryImpl @Inject constructor() : UserRepository {

    private val currentUserFlow = MutableStateFlow<User?>(MockData.currentUser)
    private val usersFlow = MutableStateFlow(MockData.allUsers)
    private val followingFlow = MutableStateFlow(
        // Pre-follow a few influencers so the feed isn't empty.
        MockData.influencers.take(4).map { it.id }.toSet()
    )

    override fun observeCurrentUser(): Flow<User?> = currentUserFlow.asStateFlow()

    override suspend fun getCurrentUser(): User? = currentUserFlow.value

    override suspend fun getUserById(id: String): User? = usersFlow.value.firstOrNull { it.id == id }

    override fun observeUserById(id: String): Flow<User?> =
        usersFlow.map { list -> list.firstOrNull { it.id == id } }

    override fun observeInfluencers(): Flow<List<User>> = usersFlow.map { list ->
        list.filter { it.isVerified }
            .sortedWith(compareByDescending<User> { it.influencerTier?.ordinal ?: -1 }.thenByDescending { it.followerCount })
    }

    override fun observeFollowing(): Flow<List<User>> =
        combine(usersFlow, followingFlow) { users, following ->
            users.filter { it.id in following }
        }

    override suspend fun follow(userId: String) {
        followingFlow.value = followingFlow.value + userId
    }

    override suspend fun unfollow(userId: String) {
        followingFlow.value = followingFlow.value - userId
    }

    override suspend fun isFollowing(userId: String): Boolean = userId in followingFlow.value

    override suspend fun searchUsers(query: String): List<User> {
        val q = query.trim().lowercase()
        if (q.isBlank()) return emptyList()
        return usersFlow.value.filter {
            it.username.lowercase().contains(q) || it.displayName.lowercase().contains(q)
        }
    }
}
