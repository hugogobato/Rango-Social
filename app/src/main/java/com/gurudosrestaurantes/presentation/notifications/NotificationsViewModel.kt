package com.gurudosrestaurantes.presentation.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.Notification
import com.gurudosrestaurantes.domain.usecase.GetNotificationsUseCase
import com.gurudosrestaurantes.domain.usecase.MarkNotificationReadUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.TimeZone
import kotlinx.datetime.minus
import kotlinx.datetime.toLocalDateTime
import javax.inject.Inject

enum class NotificationBucket(val label: String) {
    TODAY("Hoje"),
    YESTERDAY("Ontem"),
    THIS_WEEK("Esta semana"),
    OLDER("Antes disso"),
}

data class NotificationsUiState(
    val sections: Map<NotificationBucket, List<Notification>> = emptyMap(),
    val unreadCount: Int = 0,
)

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    getNotifications: GetNotificationsUseCase,
    private val markRead: MarkNotificationReadUseCase,
) : ViewModel() {

    val uiState: StateFlow<NotificationsUiState> = getNotifications()
        .map { all ->
            NotificationsUiState(
                sections = bucketize(all),
                unreadCount = all.count { !it.isRead },
            )
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = NotificationsUiState(),
        )

    fun onNotificationClick(notification: Notification) {
        if (notification.isRead) return
        viewModelScope.launch { markRead(notification.id) }
    }

    fun markAllRead() {
        viewModelScope.launch { markRead.all() }
    }

    private fun bucketize(notifications: List<Notification>): Map<NotificationBucket, List<Notification>> {
        val tz = TimeZone.currentSystemDefault()
        val now = Clock.System.now()
        val todayStart = now.toLocalDateTime(tz).date
        val yesterdayStart = now.minus(1, DateTimeUnit.DAY, tz).toLocalDateTime(tz).date
        val weekAgo = now.minus(7, DateTimeUnit.DAY, tz)

        return notifications.groupBy { n ->
            val day = n.createdAt.toLocalDateTime(tz).date
            when {
                day == todayStart -> NotificationBucket.TODAY
                day == yesterdayStart -> NotificationBucket.YESTERDAY
                n.createdAt > weekAgo -> NotificationBucket.THIS_WEEK
                else -> NotificationBucket.OLDER
            }
        }
            .toSortedMap(compareBy { it.ordinal })
    }
}
