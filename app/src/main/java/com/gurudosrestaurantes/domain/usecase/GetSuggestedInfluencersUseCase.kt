package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.User
import com.gurudosrestaurantes.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetSuggestedInfluencersUseCase @Inject constructor(
    private val userRepository: UserRepository,
) {
    operator fun invoke(): Flow<List<User>> = userRepository.observeInfluencers()
}
