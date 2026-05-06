package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.Instant

enum class GroupRole { ADMIN, MODERATOR, MEMBER }

data class GroupMember(
    val userId: String,
    val user: User? = null,
    val role: GroupRole,
    val joinedAt: Instant,
)

data class RestaurantRanking(
    val restaurantId: String,
    val restaurant: Restaurant?,
    val score: Float,
    val reviewCount: Int,
    val position: Int,
)

data class UserRanking(
    val userId: String,
    val user: User?,
    val reviewCount: Int,
    val likesReceived: Int,
    val position: Int,
)

data class GroupRanking(
    val topRestaurants: List<RestaurantRanking>,
    val topReviewers: List<UserRanking>,
    val lastUpdated: Instant,
)

data class Group(
    val id: String,
    val name: String,
    val description: String? = null,
    val coverUrl: String? = null,
    val adminId: String,
    val admins: List<String> = emptyList(),
    val isOpen: Boolean = true,
    val members: List<GroupMember> = emptyList(),
    val memberCount: Int = 0,
    val mandatoryMetrics: List<MetricId> = emptyList(),
    val groupRankings: GroupRanking? = null,
    val createdAt: Instant,
)
