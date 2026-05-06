package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.Instant

data class PollOption(
    val id: String,
    val restaurantId: String? = null,
    val text: String,
    val votes: List<String> = emptyList(),  // user IDs
    val voteCount: Int = 0,
)

data class Poll(
    val id: String,
    val groupId: String,
    val createdBy: String,
    val question: String,
    val options: List<PollOption>,
    val expiresAt: Instant,
    val isMultipleChoice: Boolean = false,
    val createdAt: Instant,
)
