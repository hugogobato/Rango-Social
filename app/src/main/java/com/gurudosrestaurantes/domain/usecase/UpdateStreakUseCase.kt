package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.model.User
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import com.gurudosrestaurantes.domain.repository.UserRepository
import kotlinx.coroutines.flow.first
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.minus
import kotlinx.datetime.toLocalDateTime
import javax.inject.Inject

/**
 * Recomputes the user's current and longest streak from their review history.
 *
 * Streak = consecutive calendar days of review activity ending today (or
 * yesterday — a single missed day at the tail still counts so momentum doesn't
 * die at midnight). Days are bucketed by `visitDate` in the device timezone.
 */
class UpdateStreakUseCase @Inject constructor(
    private val reviewRepository: ReviewRepository,
    private val userRepository: UserRepository,
) {
    suspend operator fun invoke(userId: String): User? {
        val user = userRepository.getUserById(userId) ?: return null
        val reviews = reviewRepository.observeReviewsByUser(userId).first()
        val streak = computeStreak(reviews)
        val newLongest = maxOf(user.longestStreak, streak)
        if (streak == user.currentStreak && newLongest == user.longestStreak) return user
        val updated = user.copy(currentStreak = streak, longestStreak = newLongest)
        userRepository.updateUser(updated)
        return updated
    }

    private fun computeStreak(reviews: List<Review>): Int {
        if (reviews.isEmpty()) return 0
        val days = reviews.map { it.visitDate }.toSortedSet()
        val today = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date
        val yesterday = today.minus(1, DateTimeUnit.DAY)
        val anchor: LocalDate = when {
            today in days -> today
            yesterday in days -> yesterday
            else -> return 0
        }
        var streak = 0
        var cursor = anchor
        while (cursor in days) {
            streak += 1
            cursor = cursor.minus(1, DateTimeUnit.DAY)
        }
        return streak
    }
}
