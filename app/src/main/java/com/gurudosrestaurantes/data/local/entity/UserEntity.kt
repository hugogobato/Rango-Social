package com.gurudosrestaurantes.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.datetime.Instant

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val username: String,
    val displayName: String,
    val bio: String?,
    val avatarUrl: String?,
    val coverUrl: String?,
    val followerCount: Int,
    val followingCount: Int,
    val reviewCount: Int,
    val isVerified: Boolean,
    val influencerTier: String?,         // InfluencerTier.name
    val currentStreak: Int,
    val longestStreak: Int,
    val createdAt: Instant,
)
