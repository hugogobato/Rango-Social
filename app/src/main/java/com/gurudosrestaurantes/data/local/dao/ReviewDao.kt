package com.gurudosrestaurantes.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.gurudosrestaurantes.data.local.entity.ReviewEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ReviewDao {

    @Query("SELECT * FROM reviews ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<ReviewEntity>>

    @Query("SELECT * FROM reviews WHERE userId = :userId ORDER BY createdAt DESC")
    fun observeByUser(userId: String): Flow<List<ReviewEntity>>

    @Query("SELECT * FROM reviews WHERE restaurantId = :restaurantId ORDER BY createdAt DESC")
    fun observeByRestaurant(restaurantId: String): Flow<List<ReviewEntity>>

    @Query("SELECT * FROM reviews WHERE id = :id")
    suspend fun getById(id: String): ReviewEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(review: ReviewEntity)

    @Query("DELETE FROM reviews WHERE id = :id")
    suspend fun deleteById(id: String)
}
