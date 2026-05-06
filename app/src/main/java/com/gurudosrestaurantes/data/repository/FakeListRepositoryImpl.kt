package com.gurudosrestaurantes.data.repository

import com.gurudosrestaurantes.data.mock.MockData
import com.gurudosrestaurantes.domain.model.CustomList
import com.gurudosrestaurantes.domain.model.ListItem
import com.gurudosrestaurantes.domain.repository.ListRepository
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import com.gurudosrestaurantes.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.datetime.Clock
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FakeListRepositoryImpl @Inject constructor(
    private val userRepository: UserRepository,
    private val restaurantRepository: RestaurantRepository,
) : ListRepository {

    private val listsFlow = MutableStateFlow(MockData.lists)

    override fun observeMyLists(): Flow<List<CustomList>> =
        combine(listsFlow, userRepository.observeCurrentUser()) { lists, me ->
            lists.filter { it.ownerId == me?.id }
        }

    override fun observeCollabLists(): Flow<List<CustomList>> =
        combine(listsFlow, userRepository.observeCurrentUser()) { lists, me ->
            val meId = me?.id ?: return@combine emptyList()
            lists.filter { meId in it.collaborators }
        }

    override fun observeFollowedLists(): Flow<List<CustomList>> =
        // No "follow list" mechanism in mock; expose curated public lists from influencers.
        listsFlow.map { lists ->
            lists.filter { it.isPublic && it.ownerId != MockData.currentUser.id }
        }

    override fun observeWishlist(): Flow<CustomList?> =
        combine(listsFlow, userRepository.observeCurrentUser()) { lists, me ->
            lists.firstOrNull { it.ownerId == me?.id && it.isWishlist }
        }

    override suspend fun getById(id: String): CustomList? =
        listsFlow.value.firstOrNull { it.id == id }

    override suspend fun create(list: CustomList) {
        listsFlow.value = listsFlow.value + list
    }

    override suspend fun update(list: CustomList) {
        listsFlow.value = listsFlow.value.map { if (it.id == list.id) list else it }
    }

    override suspend fun delete(id: String) {
        listsFlow.value = listsFlow.value.filterNot { it.id == id }
    }

    override suspend fun addRestaurant(listId: String, restaurantId: String, note: String?) {
        val me = userRepository.getCurrentUser() ?: return
        val rest = restaurantRepository.getById(restaurantId)
        listsFlow.value = listsFlow.value.map { list ->
            if (list.id == listId && list.restaurants.none { it.restaurantId == restaurantId }) {
                list.copy(
                    restaurants = list.restaurants + ListItem(
                        restaurantId = restaurantId,
                        restaurant = rest,
                        addedBy = me.id,
                        note = note,
                        priority = 1,
                        addedAt = Clock.System.now(),
                    ),
                    updatedAt = Clock.System.now(),
                )
            } else list
        }
    }

    override suspend fun removeRestaurant(listId: String, restaurantId: String) {
        listsFlow.value = listsFlow.value.map { list ->
            if (list.id == listId) {
                list.copy(
                    restaurants = list.restaurants.filterNot { it.restaurantId == restaurantId },
                    updatedAt = Clock.System.now(),
                )
            } else list
        }
    }
}
