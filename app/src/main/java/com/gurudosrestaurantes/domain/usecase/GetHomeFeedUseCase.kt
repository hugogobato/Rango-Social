package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetHomeFeedUseCase @Inject constructor(
    private val reviewRepository: ReviewRepository,
) {
    operator fun invoke(): Flow<List<Review>> = reviewRepository.observeHomeFeed()
}
