package com.gurudosrestaurantes.presentation.lists

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gurudosrestaurantes.domain.model.CustomList
import com.gurudosrestaurantes.domain.repository.ListRepository
import com.gurudosrestaurantes.domain.usecase.GetCurrentUserUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import javax.inject.Inject

enum class ListsTab(val label: String) {
    MINE("Minhas"),
    COLLAB("Tropa"),
    FOLLOWING("Curtidas"),
}

data class ListsUiState(
    val isLoading: Boolean = true,
    val tab: ListsTab = ListsTab.MINE,
    val mine: List<CustomList> = emptyList(),
    val collab: List<CustomList> = emptyList(),
    val following: List<CustomList> = emptyList(),
    val isCreateOpen: Boolean = false,
)

@HiltViewModel
class ListsViewModel @Inject constructor(
    private val listRepository: ListRepository,
    private val getCurrentUser: GetCurrentUserUseCase,
) : ViewModel() {

    private val tabFlow = MutableStateFlow(ListsTab.MINE)
    private val createOpenFlow = MutableStateFlow(false)

    val uiState: StateFlow<ListsUiState> = combine(
        tabFlow,
        listRepository.observeMyLists(),
        listRepository.observeCollabLists(),
        listRepository.observeFollowedLists(),
        createOpenFlow,
    ) { tab, mine, collab, following, isCreateOpen ->
        ListsUiState(
            isLoading = false,
            tab = tab,
            mine = mine.sortedByDescending { it.updatedAt },
            collab = collab.sortedByDescending { it.updatedAt },
            following = following.sortedByDescending { it.followerCount },
            isCreateOpen = isCreateOpen,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = ListsUiState(),
    )

    fun selectTab(tab: ListsTab) {
        tabFlow.value = tab
    }

    fun openCreate() {
        createOpenFlow.value = true
    }

    fun dismissCreate() {
        createOpenFlow.value = false
    }

    fun createList(name: String, emoji: String, isPublic: Boolean) {
        if (name.isBlank()) return
        viewModelScope.launch {
            val me = getCurrentUser().first() ?: return@launch
            val now = Clock.System.now()
            listRepository.create(
                CustomList(
                    id = "l_${now.toEpochMilliseconds()}",
                    ownerId = me.id,
                    name = name.trim(),
                    description = null,
                    iconUrl = emoji.ifBlank { "📝" },
                    coverColor = null,
                    isPublic = isPublic,
                    isWishlist = false,
                    collaborators = emptyList(),
                    sharedWith = emptyList(),
                    themes = emptyList(),
                    restaurants = emptyList(),
                    followerCount = 0,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
            createOpenFlow.value = false
        }
    }
}
