package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import javax.inject.Inject

class PostReviewUseCase @Inject constructor(
    private val reviewRepository: ReviewRepository,
) {
    suspend operator fun invoke(review: Review) = reviewRepository.postReview(review)
}
