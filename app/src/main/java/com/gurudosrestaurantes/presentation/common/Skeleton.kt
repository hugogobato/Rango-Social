package com.gurudosrestaurantes.presentation.common

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Single shimmering placeholder. The shimmer is a horizontal gradient sweep
 * driven by an infinite transition; reuse via [SkeletonBox] / [SkeletonLine].
 */
@Composable
fun ShimmerBrush(): Brush {
    val transition = rememberInfiniteTransition(label = "skeleton")
    val translate by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "skeleton-translate",
    )
    val base = MaterialTheme.colorScheme.surfaceVariant
    val highlight = MaterialTheme.colorScheme.surface
    return Brush.linearGradient(
        colors = listOf(base, highlight, base),
        start = Offset(translate - 600f, 0f),
        end = Offset(translate, 0f),
    )
}

@Composable
fun SkeletonBox(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(8.dp),
) {
    Box(
        modifier = modifier
            .clip(shape)
            .background(ShimmerBrush()),
    )
}

@Composable
fun SkeletonLine(
    width: Dp,
    height: Dp = 14.dp,
    modifier: Modifier = Modifier,
) {
    SkeletonBox(
        modifier = modifier.size(width = width, height = height),
        shape = RoundedCornerShape(6.dp),
    )
}

/** Feed-card-shaped skeleton that mirrors [com.gurudosrestaurantes.presentation.home.components.ReviewCard]. */
@Composable
fun ReviewCardSkeleton(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 6.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(14.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                SkeletonBox(modifier = Modifier.size(44.dp), shape = CircleShape)
                Spacer(Modifier.width(10.dp))
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    SkeletonLine(width = 120.dp)
                    SkeletonLine(width = 80.dp, height = 10.dp)
                }
            }
            SkeletonLine(width = 220.dp, height = 12.dp)
            SkeletonBox(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp),
                shape = RoundedCornerShape(12.dp),
            )
            SkeletonLine(width = 160.dp, height = 12.dp)
        }
    }
}

@Composable
fun StoriesRailSkeleton(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        repeat(6) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                SkeletonBox(modifier = Modifier.size(60.dp), shape = CircleShape)
                Spacer(Modifier.height(6.dp))
                SkeletonLine(width = 48.dp, height = 8.dp)
            }
        }
    }
}

/** Profile-shaped skeleton: header, action grid stand-ins, two faux cards. */
@Composable
fun ProfileScreenSkeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        SkeletonBox(
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp),
            shape = RoundedCornerShape(16.dp),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            SkeletonBox(modifier = Modifier.size(72.dp), shape = CircleShape)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SkeletonLine(width = 160.dp)
                SkeletonLine(width = 100.dp, height = 10.dp)
                SkeletonLine(width = 220.dp, height = 10.dp)
            }
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            repeat(4) {
                SkeletonBox(
                    modifier = Modifier
                        .weight(1f)
                        .height(72.dp),
                    shape = RoundedCornerShape(12.dp),
                )
            }
        }
        repeat(2) { ReviewCardSkeleton() }
    }
}
