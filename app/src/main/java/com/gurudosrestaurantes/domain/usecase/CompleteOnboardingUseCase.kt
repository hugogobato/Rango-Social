package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.OnboardingStyle
import com.gurudosrestaurantes.domain.repository.SessionRepository
import javax.inject.Inject

class CompleteOnboardingUseCase @Inject constructor(
    private val session: SessionRepository,
) {
    suspend operator fun invoke(
        style: OnboardingStyle,
        city: String,
        followedUserIds: List<String>,
    ) = session.completeOnboarding(style, city, followedUserIds)
}
