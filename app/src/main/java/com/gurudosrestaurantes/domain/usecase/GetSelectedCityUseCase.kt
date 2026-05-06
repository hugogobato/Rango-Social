package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.repository.SessionRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetSelectedCityUseCase @Inject constructor(
    private val session: SessionRepository,
) {
    operator fun invoke(): Flow<String?> = session.selectedCity
}
