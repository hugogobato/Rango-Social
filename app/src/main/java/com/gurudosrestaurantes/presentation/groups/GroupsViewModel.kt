package com.gurudosrestaurantes.presentation.groups

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.Group
import com.gurudosrestaurantes.domain.model.GroupMember
import com.gurudosrestaurantes.domain.model.GroupRole
import com.gurudosrestaurantes.domain.model.MetricId
import com.gurudosrestaurantes.domain.repository.GroupRepository
import com.gurudosrestaurantes.domain.usecase.GetCurrentUserUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import javax.inject.Inject

data class GroupsUiState(
    val isLoading: Boolean = true,
    val myGroups: List<Group> = emptyList(),
    val isCreateOpen: Boolean = false,
)

@HiltViewModel
class GroupsViewModel @Inject constructor(
    private val groupRepository: GroupRepository,
    private val getCurrentUser: GetCurrentUserUseCase,
) : ViewModel() {

    private val createOpenFlow = MutableStateFlow(false)

    val uiState: StateFlow<GroupsUiState> = combine(
        groupRepository.observeMyGroups(),
        createOpenFlow,
    ) { groups, isCreateOpen ->
        GroupsUiState(
            isLoading = false,
            myGroups = groups.sortedByDescending { it.memberCount },
            isCreateOpen = isCreateOpen,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = GroupsUiState(),
    )

    fun openCreate() {
        createOpenFlow.value = true
    }

    fun dismissCreate() {
        createOpenFlow.value = false
    }

    fun createGroup(
        name: String,
        description: String,
        isOpen: Boolean,
        mandatoryMetrics: List<MetricId>,
    ) {
        if (name.isBlank() || mandatoryMetrics.isEmpty()) return
        viewModelScope.launch {
            val me = getCurrentUser().first() ?: return@launch
            val now = Clock.System.now()
            groupRepository.create(
                Group(
                    id = "g_${now.toEpochMilliseconds()}",
                    name = name.trim(),
                    description = description.takeIf { it.isNotBlank() },
                    coverUrl = null,
                    adminId = me.id,
                    admins = listOf(me.id),
                    isOpen = isOpen,
                    members = listOf(GroupMember(me.id, me, GroupRole.ADMIN, now)),
                    memberCount = 1,
                    mandatoryMetrics = mandatoryMetrics,
                    groupRankings = null,
                    createdAt = now,
                ),
            )
            createOpenFlow.value = false
        }
    }
}
