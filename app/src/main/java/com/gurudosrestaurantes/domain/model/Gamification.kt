package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.Instant

enum class BadgeRarity(val hexColor: String, val label: String) {
    COMMON("#A0A0A0", "Comum"),
    RARE("#4A90D9", "Raro"),
    EPIC("#7B61FF", "Épico"),
    LEGENDARY("#FFD700", "Lendário");
}

data class Badge(
    val id: String,
    val name: String,
    val description: String,
    val iconUrl: String,
    val rarity: BadgeRarity,
    val earnedAt: Instant? = null,
)

data class UserStats(
    val totalReviews: Int,
    val totalPhotos: Int,
    val totalCitiesVisited: Int,
    val totalCategoriesTried: Int,
    val favoriteCategory: RestaurantCategory? = null,
    val averageScoreGiven: Float,
    val longestStreak: Int,
    val currentStreak: Int,
    val totalLikesReceived: Int,
    val rankingInCity: Int? = null,
)
