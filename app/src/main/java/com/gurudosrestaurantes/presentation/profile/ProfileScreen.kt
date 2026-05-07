package com.gurudosrestaurantes.presentation.profile

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.presentation.common.ProfileScreenSkeleton
import com.gurudosrestaurantes.presentation.home.components.ReviewCard
import com.gurudosrestaurantes.presentation.profile.components.BadgesRow
import com.gurudosrestaurantes.presentation.profile.components.ProfileActionGrid
import com.gurudosrestaurantes.presentation.profile.components.ProfileHeader
import com.gurudosrestaurantes.presentation.profile.components.StreakIndicator

@Composable
fun ProfileScreen(
    onListsClick: () -> Unit = {},
    onGroupsClick: () -> Unit = {},
    onWishlistClick: () -> Unit = {},
    onBadgesClick: () -> Unit = {},
    onRestaurantClick: (String) -> Unit = {},
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            AnimatedVisibility(
                visible = state.isLoading || state.user == null,
                enter = fadeIn(),
                exit = fadeOut(),
            ) {
                ProfileScreenSkeleton()
            }
            AnimatedVisibility(
                visible = !state.isLoading && state.user != null,
                enter = fadeIn(),
                exit = fadeOut(),
            ) {
                Content(
                    state = state,
                    onTabSelect = viewModel::selectTab,
                    onListsClick = onListsClick,
                    onGroupsClick = onGroupsClick,
                    onWishlistClick = onWishlistClick,
                    onBadgesClick = onBadgesClick,
                    onRestaurantClick = onRestaurantClick,
                )
            }
        }
    }
}

@Composable
private fun Content(
    state: ProfileUiState,
    onTabSelect: (ProfileTab) -> Unit,
    onListsClick: () -> Unit,
    onGroupsClick: () -> Unit,
    onWishlistClick: () -> Unit,
    onBadgesClick: () -> Unit,
    onRestaurantClick: (String) -> Unit,
) {
    val user = state.user ?: return
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item("header") { ProfileHeader(user = user) }

        item("streak") {
            StreakIndicator(
                currentStreak = user.currentStreak,
                longestStreak = user.longestStreak,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }

        item("actions") {
            ProfileActionGrid(
                listCount = state.listCount,
                groupCount = state.groupCount,
                wishlistCount = state.wishlist?.restaurants?.size ?: 0,
                badgeCount = state.badges.size,
                onListsClick = onListsClick,
                onGroupsClick = onGroupsClick,
                onWishlistClick = onWishlistClick,
                onBadgesClick = onBadgesClick,
            )
        }

        item("badges") { BadgesRow(badges = state.badges, onSeeAllClick = onBadgesClick) }

        item("tabs") {
            TabsBar(selected = state.selectedTab, onSelect = onTabSelect)
        }

        when (state.selectedTab) {
            ProfileTab.REVIEWS -> reviewsSection(state.recentReviews, onRestaurantClick)
            ProfileTab.PHOTOS -> photosSection(state.photoUrls)
            ProfileTab.LIKES -> reviewsSection(state.likedReviews, onRestaurantClick)
        }
    }
}

@Composable
private fun TabsBar(selected: ProfileTab, onSelect: (ProfileTab) -> Unit) {
    TabRow(selectedTabIndex = selected.ordinal) {
        ProfileTab.entries.forEach { tab ->
            Tab(
                selected = tab == selected,
                onClick = { onSelect(tab) },
                text = {
                    Text(
                        text = tab.label,
                        style = MaterialTheme.typography.labelLarge.copy(
                            fontWeight = if (tab == selected) FontWeight.SemiBold else FontWeight.Normal,
                        ),
                    )
                },
            )
        }
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.reviewsSection(
    reviews: List<Review>,
    onRestaurantClick: (String) -> Unit,
) {
    if (reviews.isEmpty()) {
        item("reviews_empty") {
            EmptyTabState(emoji = "🌶️", text = "Sem reviews ainda. Manda a primeira braba.")
        }
    } else {
        items(items = reviews, key = { it.id }) { review ->
            ReviewCard(
                review = review,
                onLikeClick = {},
                onCommentClick = { review.restaurant?.let { onRestaurantClick(it.id) } },
            )
        }
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.photosSection(photos: List<String>) {
    if (photos.isEmpty()) {
        item("photos_empty") {
            EmptyTabState(emoji = "📸", text = "Sem fotos ainda. Bora documentar o rango.")
        }
    } else {
        items(
            items = photos.chunked(3),
            key = { row -> row.first() },
        ) { row ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 2.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                row.forEach { url ->
                    AsyncImage(
                        model = url,
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .weight(1f)
                            .aspectRatio(1f)
                            .clip(RoundedCornerShape(8.dp)),
                    )
                }
                repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

@Composable
private fun EmptyTabState(emoji: String, text: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(text = emoji, style = MaterialTheme.typography.displayMedium)
        Spacer(Modifier.height(6.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

