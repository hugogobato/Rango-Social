package com.gurudosrestaurantes.presentation.share

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.gurudosrestaurantes.core.presentation.theme.PrimaryOrange
import com.gurudosrestaurantes.core.presentation.theme.SecondaryPurple
import com.gurudosrestaurantes.domain.model.Review

/**
 * Story-format (9:16) share card. Designed to be captured into a bitmap via
 * `rememberGraphicsLayer` and forwarded as an Instagram-friendly PNG.
 *
 * The composable itself is render-agnostic — it sizes to its parent, so the
 * caller picks the on-screen preview size and the resulting bitmap inherits
 * that resolution scaled by device density.
 */
@Composable
fun ShareableReviewCard(
    review: Review,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .aspectRatio(9f / 16f)
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xFF0E0E14)),
    ) {
        // Background gradient so cards without photos don't feel empty.
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            PrimaryOrange.copy(alpha = 0.20f),
                            Color(0xFF0E0E14),
                            SecondaryPurple.copy(alpha = 0.12f),
                        ),
                    ),
                ),
        )

        Column(modifier = Modifier.fillMaxSize()) {
            BrandHeader()

            review.photos.firstOrNull()?.let { photoUrl ->
                AsyncImage(
                    model = photoUrl,
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(0.dp)
                        .weight(0.5f)
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(16.dp)),
                )
            } ?: Spacer(Modifier.weight(0.1f))

            BodySection(review = review, modifier = Modifier.weight(1f))

            FooterRow(review = review)
        }
    }
}

@Composable
private fun BrandHeader() {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 14.dp),
    ) {
        Text(text = "🌶️", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.width(6.dp))
        Text(
            text = "Guru dos Restaurantes",
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
            color = Color.White,
        )
    }
}

@Composable
private fun BodySection(review: Review, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 18.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        review.restaurant?.let { r ->
            Text(
                text = r.name,
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black),
                color = Color.White,
                maxLines = 2,
            )
            Text(
                text = "${r.address.neighborhood}, ${r.address.city}",
                style = MaterialTheme.typography.labelLarge,
                color = Color.White.copy(alpha = 0.7f),
            )
        }

        Text(
            text = review.overallScore?.let { "🌶️".repeat(it) } ?: "👁️ só colei lá",
            style = MaterialTheme.typography.headlineSmall,
        )

        review.comment?.takeIf { it.isNotBlank() }?.let { comment ->
            Text(
                text = "“$comment”",
                style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Medium),
                color = Color.White,
                maxLines = 4,
            )
        }
    }
}

@Composable
private fun FooterRow(review: Review) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 18.dp),
    ) {
        AsyncImage(
            model = review.user?.avatarUrl,
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape),
        )
        Spacer(Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = review.user?.displayName ?: "anônimo",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = Color.White,
            )
            Text(
                text = review.user?.username ?: "@anônimo",
                style = MaterialTheme.typography.labelMedium,
                color = PrimaryOrange,
            )
        }
        Text(
            text = "Baixe o app",
            style = MaterialTheme.typography.labelMedium,
            color = Color.White.copy(alpha = 0.6f),
        )
    }
}
