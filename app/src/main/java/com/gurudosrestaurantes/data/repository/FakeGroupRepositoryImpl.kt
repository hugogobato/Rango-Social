package com.gurudosrestaurantes.data.repository

import com.gurudosrestaurantes.data.mock.MockData
import com.gurudosrestaurantes.domain.model.Group
import com.gurudosrestaurantes.domain.model.GroupMember
import com.gurudosrestaurantes.domain.model.GroupRole
import com.gurudosrestaurantes.domain.repository.GroupRepository
import com.gurudosrestaurantes.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.datetime.Clock
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FakeGroupRepositoryImpl @Inject constructor(
    private val userRepository: UserRepository,
) : GroupRepository {

    private val groupsFlow = MutableStateFlow(MockData.groups)

    override fun observeMyGroups(): Flow<List<Group>> =
        combine(groupsFlow, userRepository.observeCurrentUser()) { groups, me ->
            val meId = me?.id ?: return@combine emptyList()
            groups.filter { g -> g.members.any { it.userId == meId } }
        }

    override fun observeAdminGroups(): Flow<List<Group>> =
        combine(groupsFlow, userRepository.observeCurrentUser()) { groups, me ->
            val meId = me?.id ?: return@combine emptyList()
            groups.filter { meId in it.admins }
        }

    override suspend fun getById(id: String): Group? =
        groupsFlow.value.firstOrNull { it.id == id }

    override fun observeById(id: String): Flow<Group?> =
        groupsFlow.map { list -> list.firstOrNull { it.id == id } }

    override suspend fun create(group: Group) {
        groupsFlow.value = groupsFlow.value + group
    }

    override suspend fun joinGroup(groupId: String) {
        val me = userRepository.getCurrentUser() ?: return
        groupsFlow.value = groupsFlow.value.map { g ->
            if (g.id == groupId && g.members.none { it.userId == me.id }) {
                g.copy(
                    members = g.members + GroupMember(me.id, me, GroupRole.MEMBER, Clock.System.now()),
                    memberCount = g.memberCount + 1,
                )
            } else g
        }
    }

    override suspend fun leaveGroup(groupId: String) {
        val me = userRepository.getCurrentUser() ?: return
        groupsFlow.value = groupsFlow.value.map { g ->
            if (g.id == groupId) {
                g.copy(
                    members = g.members.filterNot { it.userId == me.id },
                    memberCount = (g.memberCount - 1).coerceAtLeast(0),
                )
            } else g
        }
    }
}
