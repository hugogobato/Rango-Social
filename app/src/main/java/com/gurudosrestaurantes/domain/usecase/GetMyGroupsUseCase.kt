package com.gurudosrestaurantes.domain.usecase

import com.gurudosrestaurantes.domain.model.Group
import com.gurudosrestaurantes.domain.repository.GroupRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetMyGroupsUseCase @Inject constructor(
    private val groupRepository: GroupRepository,
) {
    operator fun invoke(): Flow<List<Group>> = groupRepository.observeMyGroups()
}
