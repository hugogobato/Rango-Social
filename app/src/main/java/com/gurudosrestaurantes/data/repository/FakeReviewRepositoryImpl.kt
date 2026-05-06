package com.gurudosrestaurantes.data.repository

import com.gurudosrestaurantes.data.mock.MockData
import com.gurudosrestaurantes.domain.model.Comment
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.model.TargetDestination
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import com.gurudosrestaurantes.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FakeReviewRepositoryImpl @Inject constructor(
    private val userRepository: UserRepository,
) : ReviewRepository {

    private val reviewsFlow = MutableStateFlow(MockData.reviews)
    private val commentsFlow = MutableStateFlow(MockData.comments)

    override fun observeHomeFeed(): Flow<List<Review>> =
        combine(reviewsFlow, userRepository.observeFollowing(), userRepository.observeCurrentUser()) { reviews, following, me ->
            val followingIds = following.map { it.id }.toSet() + (me?.id ?: "")
            // Spec §7.5: weight reviews by source. We approximate it for the mock by surfacing
            // followed users' reviews first, then verified influencers, then everyone else.
            val (relevant, rest) = reviews.partition { it.userId in followingIds || it.user?.isVerified == true }
            (relevant + rest).sortedByDescending { it.createdAt }
        }

    override fun observeReviewsByUser(userId: String): Flow<List<Review>> =
        reviewsFlow.map { list -> list.filter { it.userId == userId }.sortedByDescending { it.createdAt } }

    override fun observeReviewsByRestaurant(restaurantId: String): Flow<List<Review>> =
        reviewsFlow.map { list -> list.filter { it.restaurantId == restaurantId }.sortedByDescending { it.createdAt } }

    override fun observeReviewsByGroup(groupId: String): Flow<List<Review>> =
        reviewsFlow.map { list ->
            list.filter { rev -> rev.targetDestinations.any { it is TargetDestination.GroupTarget && it.groupId == groupId } }
                .sortedByDescending { it.createdAt }
        }

    override suspend fun getById(id: String): Review? = reviewsFlow.value.firstOrNull { it.id == id }

    override suspend fun postReview(review: Review) {
        reviewsFlow.value = listOf(review) + reviewsFlow.value
    }

    override suspend fun toggleLike(reviewId: String) {
        reviewsFlow.value = reviewsFlow.value.map { r ->
            if (r.id == reviewId) {
                r.copy(
                    isLikedByMe = !r.isLikedByMe,
                    likes = r.likes + if (r.isLikedByMe) -1 else 1,
                )
            } else r
        }
    }

    override suspend fun postComment(comment: Comment) {
        commentsFlow.value = commentsFlow.value + comment
    }

    override fun observeCommentsForReview(reviewId: String): Flow<List<Comment>> =
        commentsFlow.map { list -> list.filter { it.reviewId == reviewId }.sortedBy { it.createdAt } }
}
