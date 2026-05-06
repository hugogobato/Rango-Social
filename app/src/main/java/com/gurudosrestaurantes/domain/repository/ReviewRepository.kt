package com.gurudosrestaurantes.domain.repository

import com.gurudosrestaurantes.domain.model.Comment
import com.gurudosrestaurantes.domain.model.Review
import kotlinx.coroutines.flow.Flow

interface ReviewRepository {

    /** Personalised home feed for the current user. */
    fun observeHomeFeed(): Flow<List<Review>>

    fun observeReviewsByUser(userId: String): Flow<List<Review>>

    fun observeReviewsByRestaurant(restaurantId: String): Flow<List<Review>>

    fun observeReviewsByGroup(groupId: String): Flow<List<Review>>

    suspend fun getById(id: String): Review?

    suspend fun postReview(review: Review)

    suspend fun toggleLike(reviewId: String)

    suspend fun postComment(comment: Comment)

    fun observeCommentsForReview(reviewId: String): Flow<List<Comment>>
}
