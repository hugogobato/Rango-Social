package com.gurudosrestaurantes.presentation.lists

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.CustomList
import com.gurudosrestaurantes.domain.repository.ListRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import javax.inject.Inject

data class ListDetailUiState(
    val isLoading: Boolean = true,
    val list: CustomList? = null,
    val canEdit: Boolean = false,
)

@HiltViewModel
class ListDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val listRepository: ListRepository,
) : ViewModel() {

    private val listId: String = checkNotNull(savedStateHandle["listId"])

    val uiState: StateFlow<ListDetailUiState> = combine(
        listRepository.observeMyLists(),
        listRepository.observeCollabLists(),
        listRepository.observeFollowedLists(),
    ) { mine, collab, following ->
        val list = (mine + collab + following).firstOrNull { it.id == listId }
        ListDetailUiState(
            isLoading = list == null,
            list = list,
            canEdit = list != null && (mine.any { it.id == listId } || collab.any { it.id == listId }),
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = ListDetailUiState(),
    )

    fun moveItem(restaurantId: String, direction: Int) {
        viewModelScope.launch {
            val list = uiState.value.list ?: return@launch
            val items = list.restaurants.toMutableList()
            val index = items.indexOfFirst { it.restaurantId == restaurantId }
            if (index < 0) return@launch
            val newIndex = (index + direction).coerceIn(0, items.lastIndex)
            if (newIndex == index) return@launch
            val moved = items.removeAt(index)
            items.add(newIndex, moved)
            listRepository.update(list.copy(restaurants = items, updatedAt = Clock.System.now()))
        }
    }

    fun removeItem(restaurantId: String) {
        viewModelScope.launch {
            listRepository.removeRestaurant(listId, restaurantId)
        }
    }
}
