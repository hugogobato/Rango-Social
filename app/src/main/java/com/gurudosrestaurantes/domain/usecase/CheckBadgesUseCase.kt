package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Badge
import com.gurudosrestaurantes.domain.model.BadgeRarity
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.model.RestaurantCategory
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.model.User
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import com.gurudosrestaurantes.domain.repository.UserRepository
import kotlinx.coroutines.flow.first
import kotlinx.datetime.Clock
import javax.inject.Inject

/**
 * Awards any badges the user has just qualified for based on their full review
 * history + current streak. Idempotent: badges already in `user.badges` are
 * never re-granted.
 *
 * Returns the list of newly earned badges (empty if none) so the UI can
 * surface a celebration.
 */
class CheckBadgesUseCase @Inject constructor(
    private val reviewRepository: ReviewRepository,
    private val userRepository: UserRepository,
    private val restaurantRepository: RestaurantRepository,
) {
    suspend operator fun invoke(userId: String): List<Badge> {
        val user = userRepository.getUserById(userId) ?: return emptyList()
        val reviews = reviewRepository.observeReviewsByUser(userId).first()
        val restaurants = resolveRestaurants(reviews)

        val stats = BadgeStats(
            totalReviews = reviews.size,
            totalPhotos = reviews.sumOf { it.photos.size },
            distinctCities = restaurants.map { it.address.city }.toSet().size,
            distinctCategories = restaurants.flatMap { it.categories }.toSet(),
            currentStreak = user.currentStreak,
            longestStreak = user.longestStreak,
        )

        val owned = user.badges.map { it.id }.toSet()
        val newlyEarned = Catalog.all
            .filter { it.id !in owned && it.qualifies(stats) }
            .map { it.toBadge() }

        if (newlyEarned.isEmpty()) return emptyList()

        userRepository.updateUser(user.copy(badges = user.badges + newlyEarned))
        return newlyEarned
    }

    private suspend fun resolveRestaurants(reviews: List<Review>): List<Restaurant> {
        val ids = reviews.map { it.restaurantId }.toSet()
        val denormalised = reviews.mapNotNull { it.restaurant }.associateBy { it.id }
        return ids.mapNotNull { id ->
            denormalised[id] ?: restaurantRepository.getById(id)
        }
    }
}

private data class BadgeStats(
    val totalReviews: Int,
    val totalPhotos: Int,
    val distinctCities: Int,
    val distinctCategories: Set<RestaurantCategory>,
    val currentStreak: Int,
    val longestStreak: Int,
)

private data class BadgeDef(
    val id: String,
    val name: String,
    val description: String,
    val icon: String,
    val rarity: BadgeRarity,
    val qualifies: (BadgeStats) -> Boolean,
) {
    fun toBadge() = Badge(
        id = id,
        name = name,
        description = description,
        iconUrl = icon,
        rarity = rarity,
        earnedAt = Clock.System.now(),
    )
}

private object Catalog {
    val all: List<BadgeDef> = listOf(
        BadgeDef("b_first", "Primeiro Review", "Mandou a primeira braba", "🥇", BadgeRarity.COMMON) {
            it.totalReviews >= 1
        },
        BadgeDef("b_reviews_10", "Dez na conta", "10 reviews mandados", "📝", BadgeRarity.COMMON) {
            it.totalReviews >= 10
        },
        BadgeDef("b_reviews_50", "Crítico de Bairro", "50 reviews mandados", "🗒️", BadgeRarity.RARE) {
            it.totalReviews >= 50
        },
        BadgeDef("b_reviews_100", "Lenda do Rango", "100 reviews mandados", "👑", BadgeRarity.EPIC) {
            it.totalReviews >= 100
        },
        BadgeDef("b_streak3", "Streak de 3", "3 dias seguidos com review", "🔥", BadgeRarity.COMMON) {
            it.longestStreak >= 3
        },
        BadgeDef("b_streak5", "Streak de 5", "5 dias seguidos com review", "🔥", BadgeRarity.RARE) {
            it.longestStreak >= 5
        },
        BadgeDef("b_streak7", "Semana Cheia", "7 dias seguidos com review", "🌶️", BadgeRarity.RARE) {
            it.longestStreak >= 7
        },
        BadgeDef("b_streak30", "Mês Insano", "30 dias seguidos com review", "🚀", BadgeRarity.LEGENDARY) {
            it.longestStreak >= 30
        },
        BadgeDef("b_photos_10", "Fotógrafo do Rango", "10 fotos em reviews", "📸", BadgeRarity.COMMON) {
            it.totalPhotos >= 10
        },
        BadgeDef("b_photos_50", "Olho de Câmera", "50 fotos em reviews", "🎞️", BadgeRarity.RARE) {
            it.totalPhotos >= 50
        },
        BadgeDef("b_cities_3", "Pé na Estrada", "Reviews em 3 cidades", "🛣️", BadgeRarity.RARE) {
            it.distinctCities >= 3
        },
        BadgeDef("b_cities_5", "Mochileiro do Rango", "Reviews em 5 cidades", "🌎", BadgeRarity.EPIC) {
            it.distinctCities >= 5
        },
        BadgeDef("b_categories_5", "Paladar Curioso", "5 tipos de cozinha provados", "🍽️", BadgeRarity.COMMON) {
            it.distinctCategories.size >= 5
        },
        BadgeDef("b_categories_10", "Boca Coringa", "10 tipos de cozinha provados", "🌮", BadgeRarity.EPIC) {
            it.distinctCategories.size >= 10
        },
    )
}
