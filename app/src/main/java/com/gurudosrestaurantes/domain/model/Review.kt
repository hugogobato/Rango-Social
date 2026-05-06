package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate

sealed class TargetDestination {
    data class Profile(val userId: String) : TargetDestination()
    data class GroupTarget(val groupId: String) : TargetDestination()
}

data class Review(
    val id: String,
    val userId: String,
    val user: User? = null,             // denormalised for feed rendering
    val restaurantId: String,
    val restaurant: Restaurant? = null, // denormalised for feed rendering
    val overallScore: Int? = null,      // 1–5; null = "só colei lá"
    val metrics: Map<MetricId, Int> = emptyMap(),
    val comment: String? = null,
    val photos: List<String> = emptyList(),
    val targetDestinations: List<TargetDestination> = emptyList(),
    val receiptPhoto: String? = null,
    val totalSpent: Double? = null,
    val visitDate: LocalDate,
    val companions: List<String>? = null,  // user IDs
    val likes: Int = 0,
    val comments: List<Comment> = emptyList(),
    val isLikedByMe: Boolean = false,
    val createdAt: Instant,
)
