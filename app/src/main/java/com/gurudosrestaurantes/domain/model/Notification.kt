package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.Instant

enum class NotificationType {
    LIKE_REVIEW,
    COMMENT_REVIEW,
    FOLLOW,
    GROUP_INVITE,
    LIST_COLLAB,
    LIST_SHARE,
    MENTION,
    STREAK_WARNING,
    BADGE_EARNED,
    TRENDING_RESTAURANT,
}

data class Notification(
    val id: String,
    val type: NotificationType,
    val actor: User? = null,
    val targetReview: Review? = null,
    val targetRestaurant: Restaurant? = null,
    val targetGroup: Group? = null,
    val targetList: CustomList? = null,
    val message: String,
    val isRead: Boolean = false,
    val createdAt: Instant,
)
