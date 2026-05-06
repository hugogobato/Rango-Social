package com.gurudosrestaurantes.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.datetime.Instant

@Entity(tableName = "restaurants")
data class RestaurantEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String?,
    val categories: List<String>,        // RestaurantCategory.name list
    val priceRange: String,              // PriceRange.name
    val street: String,
    val number: String,
    val neighborhood: String,
    val city: String,
    val state: String,
    val fullAddress: String,
    val latitude: Double?,
    val longitude: Double?,
    val photos: List<String>,
    val averageOverallScore: Float?,
    val averageMetrics: Map<String, Float>,  // MetricId.name -> avg
    val reviewCount: Int,
    val vibeCheckCount: Int,
    val createdAt: Instant,
)
