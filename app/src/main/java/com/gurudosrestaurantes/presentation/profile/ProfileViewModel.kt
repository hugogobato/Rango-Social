package com.gurudosrestaurantes.presentation.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.Badge
import com.gurudosrestaurantes.domain.model.CustomList
import com.gurudosrestaurantes.domain.model.Group
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.model.User
import com.gurudosrestaurantes.domain.repository.GroupRepository
import com.gurudosrestaurantes.domain.repository.ListRepository
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import com.gurudosrestaurantes.domain.usecase.GetCurrentUserUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

enum class ProfileTab(val label: String) {
    REVIEWS("Reviews"),
    PHOTOS("Fotos"),
    LIKES("Curtidas"),
}

data class ProfileUiState(
    val isLoading: Boolean = true,
    val user: User? = null,
    val badges: List<Badge> = emptyList(),
    val recentReviews: List<Review> = emptyList(),
    val photoUrls: List<String> = emptyList(),
    val likedReviews: List<Review> = emptyList(),
    val listCount: Int = 0,
    val groupCount: Int = 0,
    val wishlist: CustomList? = null,
    val groups: List<Group> = emptyList(),
    val selectedTab: ProfileTab = ProfileTab.REVIEWS,
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class ProfileViewModel @Inject constructor(
    getCurrentUser: GetCurrentUserUseCase,
    reviewRepository: ReviewRepository,
    listRepository: ListRepository,
    groupRepository: GroupRepository,
) : ViewModel() {

    private val tabFlow = MutableStateFlow(ProfileTab.REVIEWS)

    private val userFlow = getCurrentUser()

    private val myReviewsFlow = userFlow.flatMapLatest { user ->
        if (user == null) flowOf(emptyList())
        else reviewRepository.observeReviewsByUser(user.id)
    }

    private val likedReviewsFlow = reviewRepository.observeHomeFeed()
        .map { feed -> feed.filter { it.isLikedByMe } }

    private data class CoreSnapshot(
        val user: User?,
        val myReviews: List<Review>,
        val likedReviews: List<Review>,
        val myLists: List<CustomList>,
        val myGroups: List<Group>,
    )

    private val coreFlow = combine(
        userFlow,
        myReviewsFlow,
        likedReviewsFlow,
        listRepository.observeMyLists(),
        groupRepository.observeMyGroups(),
    ) { user, myReviews, likedReviews, myLists, myGroups ->
        CoreSnapshot(user, myReviews, likedReviews, myLists, myGroups)
    }

    val uiState: StateFlow<ProfileUiState> = combine(
        coreFlow,
        listRepository.observeWishlist(),
        tabFlow,
    ) { core, wishlist, tab ->
        ProfileUiState(
            isLoading = core.user == null,
            user = core.user,
            badges = core.user?.badges.orEmpty(),
            recentReviews = core.myReviews.sortedByDescending { it.createdAt },
            photoUrls = core.myReviews.flatMap { it.photos },
            likedReviews = core.likedReviews,
            listCount = core.myLists.size,
            groupCount = core.myGroups.size,
            wishlist = wishlist,
            groups = core.myGroups,
            selectedTab = tab,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = ProfileUiState(),
    )

    fun selectTab(tab: ProfileTab) {
        tabFlow.value = tab
    }

    val tabState: StateFlow<ProfileTab> get() = tabFlow.asStateFlow()
}
