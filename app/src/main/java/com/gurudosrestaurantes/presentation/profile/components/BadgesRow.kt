package com.gurudosrestaurantes.presentation.profile.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gurudosrestaurantes.core.presentation.theme.BadgeCommon
import com.gurudosrestaurantes.core.presentation.theme.BadgeEpic
import com.gurudosrestaurantes.core.presentation.theme.BadgeLegendary
import com.gurudosrestaurantes.core.presentation.theme.BadgeRare
import com.gurudosrestaurantes.domain.model.Badge
import com.gurudosrestaurantes.domain.model.BadgeRarity

@Composable
fun BadgesRow(
    badges: List<Badge>,
    modifier: Modifier = Modifier,
    onSeeAllClick: () -> Unit = {},
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "🏆 Conquistas",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.weight(1f),
            )
            if (badges.isNotEmpty()) {
                Text(
                    text = "Ver tudo",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.clickable(onClick = onSeeAllClick),
                )
            }
        }
        Spacer(Modifier.size(8.dp))
        if (badges.isEmpty()) {
            Text(
                text = "Faz uns reviews pra desbloquear",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        } else {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(items = badges, key = { it.id }) { badge ->
                    BadgePill(badge = badge)
                }
            }
        }
    }
}

@Composable
private fun BadgePill(badge: Badge) {
    val color = badge.rarity.color()
    Column(
        modifier = Modifier
            .width(96.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(color.copy(alpha = 0.18f)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = badge.iconUrl.ifBlank { "🏅" },
                style = MaterialTheme.typography.titleLarge,
            )
        }
        Spacer(Modifier.size(8.dp))
        Text(
            text = badge.name,
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurface,
            maxLines = 1,
        )
        Text(
            text = badge.rarity.label,
            style = MaterialTheme.typography.labelSmall,
            color = color,
        )
    }
}

private fun BadgeRarity.color(): Color = when (this) {
    BadgeRarity.COMMON -> BadgeCommon
    BadgeRarity.RARE -> BadgeRare
    BadgeRarity.EPIC -> BadgeEpic
    BadgeRarity.LEGENDARY -> BadgeLegendary
}
