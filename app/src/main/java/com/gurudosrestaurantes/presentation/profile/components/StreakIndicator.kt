package com.gurudosrestaurantes.presentation.profile.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gurudosrestaurantes.core.presentation.theme.PrimaryOrange
import com.gurudosrestaurantes.core.presentation.theme.PrimaryOrangeDark

@Composable
fun StreakIndicator(
    currentStreak: Int,
    longestStreak: Int,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Brush.horizontalGradient(listOf(PrimaryOrangeDark.copy(alpha = 0.4f), PrimaryOrange.copy(alpha = 0.25f))))
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "🔥",
            style = MaterialTheme.typography.displaySmall,
        )
        Spacer(Modifier.size(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "$currentStreak ${if (currentStreak == 1) "dia" else "dias"} no fogo",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground,
            )
            Text(
                text = if (longestStreak > currentStreak) "Recorde: $longestStreak dias"
                else "Recorde pessoal — segue assim",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        StreakDots(currentStreak = currentStreak)
    }
}

@Composable
private fun StreakDots(currentStreak: Int) {
    val dotsToShow = 7
    val activeDots = currentStreak.coerceAtMost(dotsToShow)
    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        repeat(dotsToShow) { i ->
            val active = i < activeDots
            Text(
                text = if (active) "🔥" else "·",
                style = MaterialTheme.typography.labelMedium,
                color = if (active) PrimaryOrange else MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
