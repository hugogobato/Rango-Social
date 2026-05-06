package com.gurudosrestaurantes.data.repository

import com.gurudosrestaurantes.data.mock.MockData
import com.gurudosrestaurantes.domain.model.Notification
import com.gurudosrestaurantes.domain.repository.NotificationRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FakeNotificationRepositoryImpl @Inject constructor() : NotificationRepository {

    private val notificationsFlow = MutableStateFlow(MockData.notifications)

    override fun observeAll(): Flow<List<Notification>> =
        notificationsFlow.asStateFlow().map { list -> list.sortedByDescending { it.createdAt } }

    override fun observeUnreadCount(): Flow<Int> =
        notificationsFlow.map { list -> list.count { !it.isRead } }

    override suspend fun markAsRead(id: String) {
        notificationsFlow.value = notificationsFlow.value.map {
            if (it.id == id) it.copy(isRead = true) else it
        }
    }

    override suspend fun markAllAsRead() {
        notificationsFlow.value = notificationsFlow.value.map { it.copy(isRead = true) }
    }

    override suspend fun delete(id: String) {
        notificationsFlow.value = notificationsFlow.value.filterNot { it.id == id }
    }
}
