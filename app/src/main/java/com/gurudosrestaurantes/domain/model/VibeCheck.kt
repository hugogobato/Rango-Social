package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.Instant

enum class VibeStatus(val emoji: String, val label: String) {
    EMPTY("🌵", "Tá vazio"),
    BUSY("🔥", "Tá lotado"),
    QUEUE("⏳", "Fila grande"),
    GOOD_MUSIC("🎵", "Música boa"),
    GOOD_SERVICE("👏", "Atendimento on"),
    BAD_SERVICE("😤", "Atendimento off"),
    NOISY("📢", "Barulhento"),
    ROMANTIC("💡", "Clima de date"),
    GROUP_FRIENDLY("🍻", "Bom pra tropa"),
    OVERPRICED("💸", "Tá caro hoje");
}

data class VibeCheck(
    val id: String,
    val userId: String,
    val user: User? = null,
    val restaurantId: String,
    val restaurant: Restaurant? = null,
    val status: VibeStatus,
    val note: String? = null,           // max 100 chars
    val photo: String? = null,
    val expiresAt: Instant,             // 4h after createdAt
    val createdAt: Instant,
)
