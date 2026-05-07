package com.gurudosrestaurantes.presentation.vibecheck

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.model.VibeCheck
import com.gurudosrestaurantes.domain.model.VibeStatus
import com.gurudosrestaurantes.domain.repository.RestaurantFilters
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import com.gurudosrestaurantes.domain.repository.UserRepository
import com.gurudosrestaurantes.domain.repository.VibeCheckRepository
import com.gurudosrestaurantes.domain.usecase.GetSelectedCityUseCase
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
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.coroutines.ExperimentalCoroutinesApi
import javax.inject.Inject
import kotlin.time.Duration.Companion.hours

data class CreateVibeCheckUiState(
    val query: String = "",
    val isSearching: Boolean = false,
    val restaurantResults: List<Restaurant> = emptyList(),
    val selectedRestaurant: Restaurant? = null,
    val selectedStatus: VibeStatus? = null,
    val note: String = "",
    val isPosting: Boolean = false,
    val isPosted: Boolean = false,
    val errorMessage: String? = null,
)

@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
@HiltViewModel
class CreateVibeCheckViewModel @Inject constructor(
    private val vibeCheckRepository: VibeCheckRepository,
    private val restaurantRepository: RestaurantRepository,
    private val userRepository: UserRepository,
    private val getSelectedCity: GetSelectedCityUseCase,
) : ViewModel() {

    private val query = MutableStateFlow("")
    private val selectedRestaurant = MutableStateFlow<Restaurant?>(null)
    private val selectedStatus = MutableStateFlow<VibeStatus?>(null)
    private val note = MutableStateFlow("")
    private val isPosting = MutableStateFlow(false)
    private val isPosted = MutableStateFlow(false)
    private val error = MutableStateFlow<String?>(null)

    private val searchResults = query
        .debounce(180)
        .distinctUntilChanged()
        .flatMapLatest { q ->
            flow {
                emit(emptyList<Restaurant>() to true)
                val city = getSelectedCity().first()
                val results = restaurantRepository.search(q, RestaurantFilters(city = city))
                emit(results.take(10) to false)
            }
        }

    private val metaFlow = combine(note, isPosting, isPosted, error) { n, posting, posted, err ->
        Meta(n, posting, posted, err)
    }

    val uiState: StateFlow<CreateVibeCheckUiState> = combine(
        query,
        searchResults,
        selectedRestaurant,
        selectedStatus,
        metaFlow,
    ) { q, results, restaurant, status, meta ->
        CreateVibeCheckUiState(
            query = q,
            restaurantResults = results.first,
            isSearching = results.second,
            selectedRestaurant = restaurant,
            selectedStatus = status,
            note = meta.note,
            isPosting = meta.posting,
            isPosted = meta.posted,
            errorMessage = meta.error,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = CreateVibeCheckUiState(),
    )

    fun onQueryChange(value: String) {
        if (selectedRestaurant.value != null && value != selectedRestaurant.value?.name) {
            selectedRestaurant.value = null
        }
        query.value = value
    }

    fun selectRestaurant(restaurant: Restaurant) {
        selectedRestaurant.value = restaurant
        query.value = restaurant.name
    }

    fun clearRestaurant() {
        selectedRestaurant.value = null
        query.value = ""
    }

    fun selectStatus(status: VibeStatus) {
        selectedStatus.value = if (selectedStatus.value == status) null else status
    }

    fun onNoteChange(value: String) {
        note.value = value.take(100)
    }

    fun post() {
        val restaurant = selectedRestaurant.value ?: run {
            error.value = "Escolhe o rolê primeiro."
            return
        }
        val status = selectedStatus.value ?: run {
            error.value = "Manda a vibe."
            return
        }
        viewModelScope.launch {
            isPosting.value = true
            error.value = null
            val user = userRepository.getCurrentUser()
            if (user == null) {
                error.value = "Precisa estar logado."
                isPosting.value = false
                return@launch
            }
            val now = Clock.System.now()
            vibeCheckRepository.post(
                VibeCheck(
                    id = "vibe_${now.toEpochMilliseconds()}",
                    userId = user.id,
                    user = user,
                    restaurantId = restaurant.id,
                    restaurant = restaurant,
                    status = status,
                    note = note.value.takeIf { it.isNotBlank() },
                    expiresAt = now + 4.hours,
                    createdAt = now,
                )
            )
            isPosting.value = false
            isPosted.value = true
        }
    }

    fun reset() {
        query.value = ""
        selectedRestaurant.value = null
        selectedStatus.value = null
        note.value = ""
        isPosting.value = false
        isPosted.value = false
        error.value = null
    }

    private data class Meta(
        val note: String,
        val posting: Boolean,
        val posted: Boolean,
        val error: String?,
    )
}
