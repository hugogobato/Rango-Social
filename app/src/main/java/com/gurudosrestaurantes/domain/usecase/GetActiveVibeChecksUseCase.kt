package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.VibeCheck
import com.gurudosrestaurantes.domain.repository.VibeCheckRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetActiveVibeChecksUseCase @Inject constructor(
    private val vibeCheckRepository: VibeCheckRepository,
) {
    operator fun invoke(): Flow<List<VibeCheck>> = vibeCheckRepository.observeActiveFromFollowing()
}
