package com.gurudosrestaurantes.domain.model

/** Reach scope used in the public ranking screen. */
enum class RankingReach(val label: String) {
    EVERYONE("Todo mundo"),
    FRIENDS("Bonde"),
    GROUPS("Minha tropa"),
}

/** A restaurant ranked by the spec §7 formula, with a breakdown for transparency. */
data class RankedRestaurant(
    val restaurant: Restaurant,
    val position: Int,
    val score: Float,
    val overallComponent: Float,
    val metricComponent: Float,
    val recentComponent: Float,
    val engagementComponent: Float,
    val recentReviewCount: Int,
    val totalReviewCount: Int,
    val isTrending: Boolean,
)
