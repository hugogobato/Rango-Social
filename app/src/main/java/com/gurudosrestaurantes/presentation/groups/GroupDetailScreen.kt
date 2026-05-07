package com.gurudosrestaurantes.presentation.groups

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
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
import com.gurudosrestaurantes.domain.model.Group
import com.gurudosrestaurantes.domain.model.GroupMember
import com.gurudosrestaurantes.domain.model.GroupRole
import com.gurudosrestaurantes.domain.model.Poll
import com.gurudosrestaurantes.domain.model.RestaurantRanking
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.presentation.home.components.ReviewCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GroupDetailScreen(
    onBack: () -> Unit = {},
    onRestaurantClick: (String) -> Unit = {},
    viewModel: GroupDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            TopAppBar(
                title = {
                    Text(
                        text = state.group?.name ?: "Tropa",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = "Voltar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.onBackground,
                ),
            )

            when {
                state.isLoading -> Loading()
                state.group == null -> EmptyGroup()
                else -> Content(state = state, onTabSelect = viewModel::selectTab, onRestaurantClick = onRestaurantClick)
            }
        }
    }
}

@Composable
private fun Content(
    state: GroupDetailUiState,
    onTabSelect: (GroupTab) -> Unit,
    onRestaurantClick: (String) -> Unit,
) {
    val group = state.group ?: return
    Column(modifier = Modifier.fillMaxSize()) {
        GroupHero(group = group)

        TabRow(selectedTabIndex = state.tab.ordinal) {
            GroupTab.entries.forEach { tab ->
                Tab(
                    selected = tab == state.tab,
                    onClick = { onTabSelect(tab) },
                    text = {
                        Text(
                            text = tab.label,
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = if (tab == state.tab) FontWeight.SemiBold else FontWeight.Normal,
                            ),
                        )
                    },
                )
            }
        }

        when (state.tab) {
            GroupTab.FEED -> FeedTab(reviews = state.feed, onRestaurantClick = onRestaurantClick)
            GroupTab.RANKING -> RankingTab(ranking = state.ranking, onRestaurantClick = onRestaurantClick)
            GroupTab.MEMBERS -> MembersTab(members = group.members)
            GroupTab.POLLS -> PollsTab(polls = state.polls)
        }
    }
}

@Composable
private fun GroupHero(group: Group) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        AsyncImage(
            model = group.coverUrl,
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(MaterialTheme.colorScheme.surface),
        )
        group.description?.let {
            Spacer(Modifier.size(8.dp))
            Text(
                text = it,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface,
            )
        }
        Spacer(Modifier.size(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ChipBadge(label = if (group.isOpen) "Tropa aberta" else "Tropa fechada")
            ChipBadge(label = "👥 ${group.memberCount}")
            if (group.mandatoryMetrics.isNotEmpty()) {
                ChipBadge(label = "⭐ ${group.mandatoryMetrics.size} métricas")
            }
        }
    }
}

@Composable
private fun ChipBadge(label: String) {
    Text(
        text = label,
        style = MaterialTheme.typography.labelSmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surfaceContainerHighest)
            .padding(horizontal = 8.dp, vertical = 4.dp),
    )
}

@Composable
private fun FeedTab(
    reviews: List<Review>,
    onRestaurantClick: (String) -> Unit,
) {
    if (reviews.isEmpty()) {
        Empty(emoji = "🌶️", text = "Nenhum review na tropa ainda. Manda a primeira braba.")
        return
    }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(vertical = 8.dp),
    ) {
        items(items = reviews, key = { it.id }) { review ->
            ReviewCard(
                review = review,
                onLikeClick = {},
                onCommentClick = { review.restaurant?.let { onRestaurantClick(it.id) } },
            )
        }
    }
}

@Composable
private fun RankingTab(
    ranking: List<RestaurantRanking>,
    onRestaurantClick: (String) -> Unit,
) {
    if (ranking.isEmpty()) {
        Empty(emoji = "📊", text = "Sem ranking ainda. Bora postar uns reviews na tropa.")
        return
    }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(items = ranking, key = { it.restaurantId }) { item ->
            RankingRow(item = item, onClick = { onRestaurantClick(item.restaurantId) })
        }
    }
}

@Composable
private fun RankingRow(item: RestaurantRanking, onClick: () -> Unit) {
    val medal = when (item.position) {
        1 -> "🥇"
        2 -> "🥈"
        3 -> "🥉"
        else -> "${item.position}."
    }
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(text = medal, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.size(8.dp))
            AsyncImage(
                model = item.restaurant?.photos?.firstOrNull(),
                contentDescription = item.restaurant?.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant),
            )
            Spacer(Modifier.size(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.restaurant?.name ?: "Restaurante",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                )
                Text(
                    text = "${item.reviewCount} reviews da tropa",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text(
                text = "${"%.1f".format(item.score)} ⭐",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary,
            )
        }
    }
}

@Composable
private fun MembersTab(members: List<GroupMember>) {
    if (members.isEmpty()) {
        Empty(emoji = "👥", text = "Sem membros listados.")
        return
    }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(items = members, key = { it.userId }) { member ->
            MemberRow(member = member)
        }
    }
}

@Composable
private fun MemberRow(member: GroupMember) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AsyncImage(
            model = member.user?.avatarUrl,
            contentDescription = member.user?.displayName,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant),
        )
        Spacer(Modifier.size(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = member.user?.displayName ?: "Usuário",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface,
            )
            Text(
                text = member.user?.username ?: "",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        RoleBadge(role = member.role)
    }
}

@Composable
private fun RoleBadge(role: GroupRole) {
    val (label, color) = when (role) {
        GroupRole.ADMIN -> "Admin" to MaterialTheme.colorScheme.primary
        GroupRole.MODERATOR -> "Mod" to MaterialTheme.colorScheme.secondary
        GroupRole.MEMBER -> "Membro" to MaterialTheme.colorScheme.onSurfaceVariant
    }
    Text(
        text = label,
        style = MaterialTheme.typography.labelSmall,
        color = color,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.18f))
            .padding(horizontal = 8.dp, vertical = 2.dp),
    )
}

@Composable
private fun PollsTab(polls: List<Poll>) {
    if (polls.isEmpty()) {
        Empty(emoji = "🗳️", text = "Sem enquetes na tropa.")
        return
    }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(items = polls, key = { it.id }) { poll ->
            PollCard(poll = poll)
        }
    }
}

@Composable
private fun PollCard(poll: Poll) {
    val totalVotes = poll.options.sumOf { it.voteCount }.coerceAtLeast(1)
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = poll.question,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface,
            )
            Spacer(Modifier.size(10.dp))
            poll.options.forEach { option ->
                val ratio = option.voteCount.toFloat() / totalVotes
                Column(modifier = Modifier.padding(vertical = 4.dp)) {
                    Row {
                        Text(
                            text = option.text,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.weight(1f),
                        )
                        Text(
                            text = "${option.voteCount} votos",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Spacer(Modifier.size(4.dp))
                    LinearProgressIndicator(
                        progress = { ratio },
                        modifier = Modifier.fillMaxWidth(),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                    )
                }
            }
        }
    }
}

@Composable
private fun Empty(emoji: String, text: String) {
    Box(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = emoji, style = MaterialTheme.typography.displayMedium)
            Spacer(Modifier.size(6.dp))
            Text(
                text = text,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun Loading() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
    }
}

@Composable
private fun EmptyGroup() {
    Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("🌵", style = MaterialTheme.typography.displayMedium)
            Spacer(Modifier.size(6.dp))
            Text(
                text = "Tropa não rolou.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
