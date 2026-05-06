package com.gurudosrestaurantes.domain.repository

import com.gurudosrestaurantes.domain.model.Group
import kotlinx.coroutines.flow.Flow

interface GroupRepository {

    /** Groups the current user is a member of. */
    fun observeMyGroups(): Flow<List<Group>>

    /** Groups the current user administers. */
    fun observeAdminGroups(): Flow<List<Group>>

    suspend fun getById(id: String): Group?

    fun observeById(id: String): Flow<Group?>

    suspend fun create(group: Group)

    suspend fun joinGroup(groupId: String)

    suspend fun leaveGroup(groupId: String)
}
