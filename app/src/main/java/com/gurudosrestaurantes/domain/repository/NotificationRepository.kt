package com.gurudosrestaurantes.domain.repository

import com.gurudosrestaurantes.domain.model.Notification
import kotlinx.coroutines.flow.Flow

interface NotificationRepository {

    fun observeAll(): Flow<List<Notification>>

    fun observeUnreadCount(): Flow<Int>

    suspend fun markAsRead(id: String)

    suspend fun markAllAsRead()

    suspend fun delete(id: String)
}
