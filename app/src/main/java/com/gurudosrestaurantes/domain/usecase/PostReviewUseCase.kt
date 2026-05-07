package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import javax.inject.Inject

/**
 * Posts a review and fires the post-review gamification chain: streak first
 * (so badge thresholds see the new streak value), then badges. Failures in the
 * gamification side are swallowed — the review is already saved and a missed
 * badge isn't worth surfacing an error for.
 */
class PostReviewUseCase @Inject constructor(
    private val reviewRepository: ReviewRepository,
    private val updateStreak: UpdateStreakUseCase,
    private val checkBadges: CheckBadgesUseCase,
) {
    suspend operator fun invoke(review: Review) {
        reviewRepository.postReview(review)
        runCatching { updateStreak(review.userId) }
        runCatching { checkBadges(review.userId) }
    }
}
