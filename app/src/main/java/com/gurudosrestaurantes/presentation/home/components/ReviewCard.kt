package com.gurudosrestaurantes.presentation.home.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.LocationOn
import androidx.compose.material.icons.rounded.Verified
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.gurudosrestaurantes.core.presentation.theme.PrimaryOrange
import com.gurudosrestaurantes.domain.model.Review
import kotlinx.datetime.Clock
import kotlin.math.absoluteValue

@Composable
fun ReviewCard(
    review: Review,
    onLikeClick: () -> Unit,
    onCommentClick: () -> Unit = {},
    onShareClick: () -> Unit = {},
    onSaveClick: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            HeaderRow(review)
            Spacer(Modifier.height(10.dp))

            review.restaurant?.let { restaurant ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Rounded.LocationOn,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "${restaurant.name} · ${restaurant.address.neighborhood}, ${restaurant.address.city}",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.height(8.dp))
            }

            review.comment?.let {
                Text(
                    text = "\"$it\"",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Spacer(Modifier.height(10.dp))
            }

            if (review.photos.isNotEmpty()) {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(review.photos) { url ->
                        AsyncImage(
                            model = url,
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(width = 200.dp, height = 140.dp)
                                .clip(RoundedCornerShape(12.dp)),
                        )
                    }
                }
                Spacer(Modifier.height(10.dp))
            }

            if (review.totalSpent != null) {
                Text(
                    text = "💰 R$ ${"%.0f".format(review.totalSpent)} · ${review.companions?.size?.let { "👥 com $it" } ?: ""}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(8.dp))
            }

            FooterRow(
                review = review,
                onLikeClick = onLikeClick,
                onCommentClick = onCommentClick,
                onShareClick = onShareClick,
                onSaveClick = onSaveClick,
            )
        }
    }
}

@Composable
private fun HeaderRow(review: Review) {
    val user = review.user
    Row(verticalAlignment = Alignment.CenterVertically) {
        AsyncImage(
            model = user?.avatarUrl,
            contentDescription = user?.displayName,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape),
        )
        Spacer(Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = user?.username ?: "@anônimo",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface,
                )
                if (user?.isVerified == true) {
                    Spacer(Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Rounded.Verified,
                        contentDescription = "verificado",
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.tertiary,
                    )
                }
                Spacer(Modifier.width(6.dp))
                Text(
                    text = "· ${formatRelativeTime(review.createdAt.toEpochMilliseconds())}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        // Score as peppers (or "só colei lá")
        Box(
            modifier = Modifier
                .clip(CircleShape)
                .padding(horizontal = 4.dp, vertical = 2.dp),
        ) {
            Text(
                text = review.overallScore?.let { "🌶️".repeat(it) } ?: "👁️ só colei",
                style = MaterialTheme.typography.titleMedium,
            )
        }
    }
}

@Composable
private fun FooterRow(
    review: Review,
    onLikeClick: () -> Unit,
    onCommentClick: () -> Unit,
    onShareClick: () -> Unit,
    onSaveClick: () -> Unit,
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = onLikeClick, modifier = Modifier.size(32.dp)) {
            Icon(
                imageVector = if (review.isLikedByMe) Icons.Rounded.Favorite else Icons.Outlined.FavoriteBorder,
                contentDescription = "amar",
                tint = if (review.isLikedByMe) PrimaryOrange else MaterialTheme.colorScheme.onSurface,
            )
        }
        Text(
            text = review.likes.toString(),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.width(12.dp))
        IconButton(onClick = onCommentClick, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Outlined.ChatBubbleOutline, contentDescription = "papo")
        }
        Text(
            text = review.comments.size.toString(),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.weight(1f))
        IconButton(onClick = onShareClick, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Outlined.Share, contentDescription = "compartilhar")
        }
        IconButton(onClick = onSaveClick, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Outlined.BookmarkBorder, contentDescription = "salvar")
        }
    }
}

/** Quick relative formatter — replaces with real i18n in Phase 8. */
private fun formatRelativeTime(epochMillis: Long): String {
    val diff = (Clock.System.now().toEpochMilliseconds() - epochMillis).absoluteValue
    val mins = diff / 60_000
    return when {
        mins < 1 -> "agora"
        mins < 60 -> "${mins}min"
        mins < 1440 -> "${mins / 60}h"
        mins < 1440 * 7 -> "${mins / 1440}d"
        else -> "${mins / (1440 * 7)}sem"
    }
}
