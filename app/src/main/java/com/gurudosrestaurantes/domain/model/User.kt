package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.Instant

enum class InfluencerTier(val label: String) {
    NANO("Cria Verificado"),         // 1K–10K
    MICRO("Influencer de Bairro"),   // 10K–100K
    MACRO("Chef de Conteúdo"),       // 100K–1M
    MEGA("Lenda do Rango")           // 1M+
}

enum class SlangLevel { LOW, MEDIUM, HIGH }

data class UserPreferences(
    val defaultCity: String? = null,
    val notifyLikes: Boolean = true,
    val notifyComments: Boolean = true,
    val notifyGroupActivity: Boolean = true,
    val darkMode: Boolean = true,
    val slangLevel: SlangLevel = SlangLevel.MEDIUM,
)

data class User(
    val id: String,
    val username: String,            // @handle
    val displayName: String,
    val bio: String? = null,
    val avatarUrl: String? = null,
    val coverUrl: String? = null,
    val followerCount: Int = 0,
    val followingCount: Int = 0,
    val reviewCount: Int = 0,
    val isVerified: Boolean = false,
    val influencerTier: InfluencerTier? = null,
    val badges: List<Badge> = emptyList(),
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val preferences: UserPreferences = UserPreferences(),
    val createdAt: Instant,
)
