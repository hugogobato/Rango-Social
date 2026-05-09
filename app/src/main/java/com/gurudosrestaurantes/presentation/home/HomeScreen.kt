package com.gurudosrestaurantes.presentation.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Casino
import androidx.compose.material.icons.rounded.LocalFireDepartment
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.gurudosrestaurantes.R
import com.gurudosrestaurantes.core.presentation.theme.PrimaryOrange
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.presentation.common.ReviewCardSkeleton
import com.gurudosrestaurantes.presentation.common.StoriesRailSkeleton
import com.gurudosrestaurantes.presentation.home.components.ReviewCard
import com.gurudosrestaurantes.presentation.home.components.StoriesRail
import com.gurudosrestaurantes.presentation.roulette.RouletteScreen
import com.gurudosrestaurantes.presentation.share.ShareReviewBottomSheet
import com.gurudosrestaurantes.presentation.vibecheck.CreateVibeCheckBottomSheet

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onSearchClick: () -> Unit = {},
    onRestaurantClick: (String) -> Unit = {},
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var showRoulette by remember { mutableStateOf(false) }
    var showVibeCheck by remember { mutableStateOf(false) }
    var sharingReview by remember { mutableStateOf<Review?>(null) }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.app_name),
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    )
                },
                actions = {
                    IconButton(onClick = { showVibeCheck = true }) {
                        Icon(
                            imageVector = Icons.Rounded.LocalFireDepartment,
                            contentDescription = stringResource(R.string.vibe_check_cta),
                            tint = PrimaryOrange,
                        )
                    }
                    IconButton(onClick = { showRoulette = true }) {
                        Icon(
                            imageVector = Icons.Rounded.Casino,
                            contentDescription = stringResource(R.string.roulette_cta),
                        )
                    }
                    IconButton(onClick = onSearchClick) {
                        Icon(
                            imageVector = Icons.Rounded.Search,
                            contentDescription = stringResource(R.string.search_title),
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.onBackground,
                ),
            )

            Box(modifier = Modifier.fillMaxSize()) {
                this@Column.AnimatedVisibility(
                    visible = uiState.isLoading,
                    enter = fadeIn(),
                    exit = fadeOut(),
                ) {
                    LoadingState()
                }
                this@Column.AnimatedVisibility(
                    visible = !uiState.isLoading && uiState.feed.isEmpty(),
                    enter = fadeIn(),
                    exit = fadeOut(),
                ) {
                    EmptyState()
                }
                this@Column.AnimatedVisibility(
                    visible = !uiState.isLoading && uiState.feed.isNotEmpty(),
                    enter = fadeIn(),
                    exit = fadeOut(),
                ) {
                    FeedContent(
                        state = uiState,
                        onLikeClick = viewModel::onLikeClick,
                        onShareClick = { sharingReview = it },
                    )
                }
            }
        }
    }

    if (showRoulette) {
        RouletteScreen(
            onDismiss = { showRoulette = false },
            onGo = { id ->
                showRoulette = false
                onRestaurantClick(id)
            },
        )
    }

    if (showVibeCheck) {
        CreateVibeCheckBottomSheet(onDismiss = { showVibeCheck = false })
    }

    sharingReview?.let { review ->
        ShareReviewBottomSheet(
            review = review,
            onDismiss = { sharingReview = null },
        )
    }
}

@Composable
private fun FeedContent(
    state: HomeUiState,
    onLikeClick: (String) -> Unit,
    onShareClick: (Review) -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 96.dp),
    ) {
        if (state.vibeChecks.isNotEmpty()) {
            item {
                StoriesRail(vibeChecks = state.vibeChecks)
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }

        items(items = state.feed, key = { it.id }) { review ->
            ReviewCard(
                review = review,
                onLikeClick = { onLikeClick(review.id) },
                onShareClick = { onShareClick(review) },
            )
        }
    }
}

@Composable
private fun LoadingState() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 96.dp),
    ) {
        item { StoriesRailSkeleton() }
        items(count = 4) { ReviewCardSkeleton() }
    }
}

@Composable
private fun EmptyState() {
    Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("🌵", style = MaterialTheme.typography.displayMedium)
            Text(
                text = stringResource(R.string.empty_no_friends),
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
