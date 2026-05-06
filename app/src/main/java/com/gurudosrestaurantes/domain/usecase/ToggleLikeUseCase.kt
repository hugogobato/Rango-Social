package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.repository.ReviewRepository
import javax.inject.Inject

class ToggleLikeUseCase @Inject constructor(
    private val reviewRepository: ReviewRepository,
) {
    suspend operator fun invoke(reviewId: String) = reviewRepository.toggleLike(reviewId)
}
