package com.gurudosrestaurantes.presentation.review

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.Group
import com.gurudosrestaurantes.domain.model.MetricId
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.model.TargetDestination
import com.gurudosrestaurantes.domain.model.User
import com.gurudosrestaurantes.domain.repository.RestaurantFilters
import com.gurudosrestaurantes.domain.usecase.GetCurrentUserUseCase
import com.gurudosrestaurantes.domain.usecase.GetMyGroupsUseCase
import com.gurudosrestaurantes.domain.usecase.GetRestaurantsUseCase
import com.gurudosrestaurantes.domain.usecase.GetSelectedCityUseCase
import com.gurudosrestaurantes.domain.usecase.PostReviewUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import javax.inject.Inject
import kotlin.random.Random
import kotlinx.coroutines.ExperimentalCoroutinesApi

enum class ReviewStep {
    PICK_RESTAURANT,
    SCORE,
    METRICS,
    MEDIA,
    DESTINATIONS,
    CONFIRM,
    DONE,
}

data class ReviewDraft(
    val restaurant: Restaurant? = null,
    val onlyVisited: Boolean = false,             // "só colei lá"
    val overallScore: Int? = null,                 // 1..5; null when onlyVisited
    val metrics: Map<MetricId, Int> = emptyMap(),
    val comment: String = "",
    val totalSpent: String = "",
    val photos: List<String> = emptyList(),
    val publishToProfile: Boolean = true,
    val groupTargetIds: Set<String> = emptySet(),
)

data class ReviewFlowUiState(
    val step: ReviewStep = ReviewStep.PICK_RESTAURANT,
    val draft: ReviewDraft = ReviewDraft(),
    val restaurantQuery: String = "",
    val restaurantResults: List<Restaurant> = emptyList(),
    val isSearchingRestaurants: Boolean = false,
    val myGroups: List<Group> = emptyList(),
    val currentUser: User? = null,
    val isPosting: Boolean = false,
    val errorMessage: String? = null,
)

@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
@HiltViewModel
class ReviewFlowViewModel @Inject constructor(
    private val getRestaurants: GetRestaurantsUseCase,
    getMyGroups: GetMyGroupsUseCase,
    getCurrentUser: GetCurrentUserUseCase,
    private val getSelectedCity: GetSelectedCityUseCase,
    private val postReview: PostReviewUseCase,
) : ViewModel() {

    private val draft = MutableStateFlow(ReviewDraft())
    private val step = MutableStateFlow(ReviewStep.PICK_RESTAURANT)
    private val query = MutableStateFlow("")
    private val isPosting = MutableStateFlow(false)
    private val error = MutableStateFlow<String?>(null)

    private val searchResults = query
        .debounce(180)
        .distinctUntilChanged()
        .flatMapLatest { q ->
            flow {
                emit(emptyList<Restaurant>() to true)
                val city = getSelectedCity().first()
                val results = getRestaurants.search(q, RestaurantFilters(city = city))
                emit(results to false)
            }
        }

    val uiState: StateFlow<ReviewFlowUiState> = combine(
        draft,
        step,
        query,
        searchResults,
        getMyGroups(),
        getCurrentUser(),
        isPosting,
        error,
    ) { values ->
        val d = values[0] as ReviewDraft
        val s = values[1] as ReviewStep
        val q = values[2] as String
        @Suppress("UNCHECKED_CAST")
        val (results, searching) = values[3] as Pair<List<Restaurant>, Boolean>
        @Suppress("UNCHECKED_CAST")
        val groups = values[4] as List<Group>
        val user = values[5] as User?
        val posting = values[6] as Boolean
        val err = values[7] as String?
        ReviewFlowUiState(
            step = s,
            draft = d,
            restaurantQuery = q,
            restaurantResults = results,
            isSearchingRestaurants = searching,
            myGroups = groups,
            currentUser = user,
            isPosting = posting,
            errorMessage = err,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = ReviewFlowUiState(),
    )

    fun onQueryChange(q: String) {
        query.value = q
    }

    fun selectRestaurant(restaurant: Restaurant) {
        draft.update { it.copy(restaurant = restaurant) }
    }

    fun toggleOnlyVisited() {
        draft.update {
            val newValue = !it.onlyVisited
            it.copy(
                onlyVisited = newValue,
                overallScore = if (newValue) null else it.overallScore,
                metrics = if (newValue) emptyMap() else it.metrics,
            )
        }
    }

    fun setOverallScore(score: Int) {
        draft.update { it.copy(overallScore = score, onlyVisited = false) }
    }

    fun setMetric(metric: MetricId, value: Int) {
        draft.update {
            val updated = it.metrics.toMutableMap()
            if (value == 0) updated.remove(metric) else updated[metric] = value
            it.copy(metrics = updated)
        }
    }

    fun setComment(value: String) {
        draft.update { it.copy(comment = value) }
    }

    fun setTotalSpent(value: String) {
        draft.update { it.copy(totalSpent = value.filter { ch -> ch.isDigit() || ch == '.' || ch == ',' }) }
    }

    fun addPhoto(url: String) {
        if (url.isBlank()) return
        draft.update { it.copy(photos = it.photos + url.trim()) }
    }

    fun addRandomMockPhoto() {
        val seed = Random.nextInt(100, 999)
        val url = "https://picsum.photos/seed/rangocria$seed/800/600"
        draft.update { it.copy(photos = it.photos + url) }
    }

    fun removePhoto(url: String) {
        draft.update { it.copy(photos = it.photos.filterNot { p -> p == url }) }
    }

    fun togglePublishToProfile() {
        draft.update { it.copy(publishToProfile = !it.publishToProfile) }
    }

    fun toggleGroupTarget(groupId: String) {
        draft.update {
            val updated = it.groupTargetIds.toMutableSet().apply {
                if (!add(groupId)) remove(groupId)
            }
            it.copy(groupTargetIds = updated)
        }
    }

    fun next() {
        val current = uiState.value
        val validation = validate(current.step, current.draft, current.myGroups)
        if (validation != null) {
            error.value = validation
            return
        }
        error.value = null
        step.value = nextStep(current.step)
    }

    fun back() {
        error.value = null
        step.value = previousStep(step.value)
    }

    fun goTo(target: ReviewStep) {
        error.value = null
        step.value = target
    }

    fun submit() {
        val current = uiState.value
        val draftSnapshot = current.draft
        val restaurant = draftSnapshot.restaurant ?: return
        val user = current.currentUser ?: return

        val mandatoryMissing = mandatoryMetricsMissing(draftSnapshot, current.myGroups)
        if (mandatoryMissing.isNotEmpty()) {
            error.value = "A tropa exige métrica: ${mandatoryMissing.joinToString { it.label }}"
            step.value = ReviewStep.METRICS
            return
        }

        viewModelScope.launch {
            isPosting.value = true
            val now = Clock.System.now()
            val visitDate = now.toLocalDateTime(TimeZone.currentSystemDefault()).date
            val targets = buildList<TargetDestination> {
                if (draftSnapshot.publishToProfile) add(TargetDestination.Profile(user.id))
                draftSnapshot.groupTargetIds.forEach { add(TargetDestination.GroupTarget(it)) }
            }
            val review = Review(
                id = "rev_${now.toEpochMilliseconds()}",
                userId = user.id,
                user = user,
                restaurantId = restaurant.id,
                restaurant = restaurant,
                overallScore = if (draftSnapshot.onlyVisited) null else draftSnapshot.overallScore,
                metrics = draftSnapshot.metrics,
                comment = draftSnapshot.comment.takeIf { it.isNotBlank() },
                photos = draftSnapshot.photos,
                targetDestinations = targets,
                totalSpent = draftSnapshot.totalSpent.replace(',', '.').toDoubleOrNull(),
                visitDate = visitDate,
                createdAt = now,
            )
            postReview(review)
            isPosting.value = false
            step.value = ReviewStep.DONE
        }
    }

    fun reset() {
        draft.value = ReviewDraft()
        query.value = ""
        error.value = null
        step.value = ReviewStep.PICK_RESTAURANT
    }

    private fun validate(step: ReviewStep, draft: ReviewDraft, groups: List<Group>): String? = when (step) {
        ReviewStep.PICK_RESTAURANT ->
            if (draft.restaurant == null) "Escolhe um rango antes." else null
        ReviewStep.SCORE ->
            if (!draft.onlyVisited && draft.overallScore == null) "Manda uma nota de 1 a 5." else null
        ReviewStep.METRICS -> {
            val missing = mandatoryMetricsMissing(draft, groups)
            if (missing.isNotEmpty()) "A tropa exige métrica: ${missing.joinToString { it.label }}" else null
        }
        ReviewStep.MEDIA -> null
        ReviewStep.DESTINATIONS -> {
            if (!draft.publishToProfile && draft.groupTargetIds.isEmpty()) {
                "Escolhe pra onde vai mandar."
            } else null
        }
        else -> null
    }

    private fun mandatoryMetricsMissing(draft: ReviewDraft, groups: List<Group>): List<MetricId> {
        if (draft.onlyVisited) return emptyList()
        val targetGroups = groups.filter { it.id in draft.groupTargetIds }
        val mandatory = targetGroups.flatMap { it.mandatoryMetrics }.toSet()
        return mandatory.filter { it !in draft.metrics.keys }
    }

    private fun nextStep(current: ReviewStep): ReviewStep = when (current) {
        ReviewStep.PICK_RESTAURANT -> ReviewStep.SCORE
        ReviewStep.SCORE -> if (uiState.value.draft.onlyVisited) ReviewStep.MEDIA else ReviewStep.METRICS
        ReviewStep.METRICS -> ReviewStep.MEDIA
        ReviewStep.MEDIA -> ReviewStep.DESTINATIONS
        ReviewStep.DESTINATIONS -> ReviewStep.CONFIRM
        ReviewStep.CONFIRM -> ReviewStep.DONE
        ReviewStep.DONE -> ReviewStep.DONE
    }

    private fun previousStep(current: ReviewStep): ReviewStep = when (current) {
        ReviewStep.PICK_RESTAURANT -> ReviewStep.PICK_RESTAURANT
        ReviewStep.SCORE -> ReviewStep.PICK_RESTAURANT
        ReviewStep.METRICS -> ReviewStep.SCORE
        ReviewStep.MEDIA -> if (uiState.value.draft.onlyVisited) ReviewStep.SCORE else ReviewStep.METRICS
        ReviewStep.DESTINATIONS -> ReviewStep.MEDIA
        ReviewStep.CONFIRM -> ReviewStep.DESTINATIONS
        ReviewStep.DONE -> ReviewStep.CONFIRM
    }
}
