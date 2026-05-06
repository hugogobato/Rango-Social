package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Notification
import com.gurudosrestaurantes.domain.repository.NotificationRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetNotificationsUseCase @Inject constructor(
    private val notificationRepository: NotificationRepository,
) {
    operator fun invoke(): Flow<List<Notification>> = notificationRepository.observeAll()
}
