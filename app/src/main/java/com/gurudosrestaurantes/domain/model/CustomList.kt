package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.Instant

data class ListItem(
    val restaurantId: String,
    val restaurant: Restaurant? = null,
    val addedBy: String,
    val note: String? = null,           // "Pedir o strogonoff"
    val priority: Int = 1,              // 1–3 stars
    val addedAt: Instant,
)

data class CustomList(
    val id: String,
    val ownerId: String,
    val name: String,
    val description: String? = null,
    val iconUrl: String? = null,        // emoji or upload
    val coverColor: String? = null,     // hex fallback
    val isPublic: Boolean = true,
    val isWishlist: Boolean = false,
    val collaborators: List<String> = emptyList(),
    val sharedWith: List<String> = emptyList(),
    val themes: List<RestaurantCategory> = emptyList(),
    val restaurants: List<ListItem> = emptyList(),
    val followerCount: Int = 0,
    val createdAt: Instant,
    val updatedAt: Instant,
)
