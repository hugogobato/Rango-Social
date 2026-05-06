package com.gurudosrestaurantes.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate

@Entity(
    tableName = "reviews",
    foreignKeys = [
        ForeignKey(
            entity = UserEntity::class,
            parentColumns = ["id"],
            childColumns = ["userId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = RestaurantEntity::class,
            parentColumns = ["id"],
            childColumns = ["restaurantId"],
            onDelete = ForeignKey.CASCADE
        ),
    ],
    indices = [Index("userId"), Index("restaurantId")]
)
data class ReviewEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val restaurantId: String,
    val overallScore: Int?,
    val metrics: Map<String, Int>,       // MetricId.name -> 1..5
    val comment: String?,
    val photos: List<String>,
    val totalSpent: Double?,
    val visitDate: LocalDate,
    val likes: Int,
    val createdAt: Instant,
)
