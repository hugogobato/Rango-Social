package com.gurudosrestaurantes.domain.repository

import com.gurudosrestaurantes.domain.model.CustomList
import kotlinx.coroutines.flow.Flow

interface ListRepository {

    fun observeMyLists(): Flow<List<CustomList>>

    fun observeCollabLists(): Flow<List<CustomList>>

    fun observeFollowedLists(): Flow<List<CustomList>>

    fun observeWishlist(): Flow<CustomList?>

    suspend fun getById(id: String): CustomList?

    suspend fun create(list: CustomList)

    suspend fun update(list: CustomList)

    suspend fun delete(id: String)

    suspend fun addRestaurant(listId: String, restaurantId: String, note: String? = null)

    suspend fun removeRestaurant(listId: String, restaurantId: String)
}
