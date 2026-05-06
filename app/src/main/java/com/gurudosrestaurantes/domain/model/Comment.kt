package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.Instant

data class Comment(
    val id: String,
    val reviewId: String,
    val userId: String,
    val user: User? = null,
    val text: String,
    val parentId: String? = null,       // threaded reply
    val likes: Int = 0,
    val isLikedByMe: Boolean = false,
    val createdAt: Instant,
)
