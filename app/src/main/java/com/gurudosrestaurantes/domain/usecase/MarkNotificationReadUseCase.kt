package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.repository.NotificationRepository
import javax.inject.Inject

class MarkNotificationReadUseCase @Inject constructor(
    private val notificationRepository: NotificationRepository,
) {
    suspend operator fun invoke(id: String) = notificationRepository.markAsRead(id)

    suspend fun all() = notificationRepository.markAllAsRead()
}
