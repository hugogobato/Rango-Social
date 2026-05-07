package com.gurudosrestaurantes.presentation.groups

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.Group
import com.gurudosrestaurantes.domain.model.Poll
import com.gurudosrestaurantes.domain.model.PollOption
import com.gurudosrestaurantes.domain.model.RestaurantRanking
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.repository.GroupRepository
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlin.time.Duration.Companion.days
import javax.inject.Inject

enum class GroupTab(val label: String) {
    FEED("Feed"),
    RANKING("Ranking"),
    MEMBERS("Membros"),
    POLLS("Enquetes"),
}

data class GroupDetailUiState(
    val isLoading: Boolean = true,
    val group: Group? = null,
    val tab: GroupTab = GroupTab.FEED,
    val feed: List<Review> = emptyList(),
    val ranking: List<RestaurantRanking> = emptyList(),
    val polls: List<Poll> = emptyList(),
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class GroupDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val groupRepository: GroupRepository,
    reviewRepository: ReviewRepository,
    private val restaurantRepository: RestaurantRepository,
) : ViewModel() {

    private val groupId: String = checkNotNull(savedStateHandle["groupId"])
    private val tabFlow = MutableStateFlow(GroupTab.FEED)
    private val pollsFlow = MutableStateFlow(seedPolls(groupId))

    private val groupFlow = groupRepository.observeById(groupId)
    private val reviewsFlow = groupFlow.flatMapLatest { group ->
        if (group == null) flowOf(emptyList())
        else reviewRepository.observeReviewsByGroup(groupId)
    }

    val uiState: StateFlow<GroupDetailUiState> = combine(
        groupFlow,
        reviewsFlow,
        tabFlow,
        pollsFlow,
    ) { group, reviews, tab, polls ->
        val ranking = if (group != null) buildRanking(reviews) else emptyList()
        GroupDetailUiState(
            isLoading = group == null,
            group = group,
            tab = tab,
            feed = reviews.sortedByDescending { it.createdAt },
            ranking = ranking,
            polls = polls,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = GroupDetailUiState(),
    )

    fun selectTab(tab: GroupTab) {
        tabFlow.value = tab
    }

    fun joinGroup() {
        viewModelScope.launch { groupRepository.joinGroup(groupId) }
    }

    fun leaveGroup() {
        viewModelScope.launch { groupRepository.leaveGroup(groupId) }
    }

    private suspend fun buildRanking(reviews: List<Review>): List<RestaurantRanking> {
        if (reviews.isEmpty()) return emptyList()
        val grouped = reviews.groupBy { it.restaurantId }
        val rankings = mutableListOf<RestaurantRanking>()
        for ((restaurantId, reviewsForRestaurant) in grouped) {
            val scored = reviewsForRestaurant.mapNotNull { it.overallScore?.toFloat() }
            if (scored.isEmpty()) continue
            val restaurant = reviewsForRestaurant.firstNotNullOfOrNull { it.restaurant }
                ?: restaurantRepository.getById(restaurantId)
            rankings += RestaurantRanking(
                restaurantId = restaurantId,
                restaurant = restaurant,
                score = scored.average().toFloat(),
                reviewCount = reviewsForRestaurant.size,
                position = 0,
            )
        }
        return rankings
            .sortedByDescending { it.score }
            .mapIndexed { index, r -> r.copy(position = index + 1) }
    }

    private fun seedPolls(groupId: String): List<Poll> {
        val now = Clock.System.now()
        return listOf(
            Poll(
                id = "poll_${groupId}_1",
                groupId = groupId,
                createdBy = "u_me",
                question = "Onde a tropa vai sextou?",
                options = listOf(
                    PollOption("opt_1", null, "Boteco do Léo", voteCount = 7),
                    PollOption("opt_2", null, "Pizzaria Bella", voteCount = 4),
                    PollOption("opt_3", null, "Hambúrguer da Esquina", voteCount = 9),
                ),
                expiresAt = now + 2.days,
                isMultipleChoice = false,
                createdAt = now - 1.days,
            ),
        )
    }
}
