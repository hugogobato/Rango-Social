package com.gurudosrestaurantes.presentation.map

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.gurudosrestaurantes.domain.model.Restaurant

private val SUPPORTED_CITIES = listOf("São Paulo", "Ribeirão Preto")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    onBack: () -> Unit = {},
    onRestaurantClick: (String) -> Unit = {},
    viewModel: MapViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val selected = remember(state.selectedRestaurantId, state.restaurants) {
        state.restaurants.firstOrNull { it.id == state.selectedRestaurantId }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            TopAppBar(
                title = {
                    Text(
                        text = "Cadê os rangos",
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

            CityChips(
                selectedCity = state.city,
                onSelect = viewModel::setCity,
            )

            Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                PinMap(
                    restaurants = state.restaurants,
                    selectedId = state.selectedRestaurantId,
                    onPinClick = { id -> viewModel.selectRestaurant(id) },
                    onBackdropClick = { viewModel.selectRestaurant(null) },
                )

                AnimatedVisibility(
                    visible = selected != null,
                    enter = fadeIn() + slideInVertically(initialOffsetY = { it / 2 }),
                    exit = fadeOut() + slideOutVertically(targetOffsetY = { it / 2 }),
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(16.dp),
                ) {
                    selected?.let {
                        SelectedRestaurantCard(
                            restaurant = it,
                            onClose = { viewModel.selectRestaurant(null) },
                            onOpen = { onRestaurantClick(it.id) },
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CityChips(
    selectedCity: String?,
    onSelect: (String?) -> Unit,
) {
    val colors = FilterChipDefaults.filterChipColors(
        selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
        selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer,
    )
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        FilterChip(
            selected = selectedCity == null,
            onClick = { onSelect(null) },
            label = { Text("Todas") },
            colors = colors,
        )
        SUPPORTED_CITIES.forEach { city ->
            FilterChip(
                selected = selectedCity == city,
                onClick = { onSelect(city) },
                label = { Text(city) },
                colors = colors,
            )
        }
    }
}

@Composable
private fun PinMap(
    restaurants: List<Restaurant>,
    selectedId: String?,
    onPinClick: (String) -> Unit,
    onBackdropClick: () -> Unit,
) {
    val gridColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.18f)
    val backdropTop = MaterialTheme.colorScheme.surfaceVariant
    val backdropBottom = MaterialTheme.colorScheme.surface

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(
                brush = Brush.verticalGradient(listOf(backdropTop, backdropBottom)),
            )
            .drawBehind {
                val cellSize = 48f
                val effect = PathEffect.dashPathEffect(floatArrayOf(2f, 6f), 0f)
                var x = 0f
                while (x < size.width) {
                    drawLine(
                        color = gridColor,
                        start = Offset(x, 0f),
                        end = Offset(x, size.height),
                        strokeWidth = 1f,
                        pathEffect = effect,
                    )
                    x += cellSize
                }
                var y = 0f
                while (y < size.height) {
                    drawLine(
                        color = gridColor,
                        start = Offset(0f, y),
                        end = Offset(size.width, y),
                        strokeWidth = 1f,
                        pathEffect = effect,
                    )
                    y += cellSize
                }
            }
            .clickable(onClick = onBackdropClick),
    ) {
        if (restaurants.isEmpty()) {
            Column(
                modifier = Modifier.fillMaxSize().padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text("📍", style = MaterialTheme.typography.displayMedium)
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "Sem rangos com coordenadas",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface,
                )
            }
            return@BoxWithConstraints
        }

        val density = LocalDensity.current
        val widthPx = with(density) { maxWidth.toPx() }
        val heightPx = with(density) { maxHeight.toPx() }
        val padPx = with(density) { 28.dp.toPx() }

        val (minLat, maxLat, minLng, maxLng) = remember(restaurants) {
            val lats = restaurants.mapNotNull { it.coordinates?.latitude }
            val lngs = restaurants.mapNotNull { it.coordinates?.longitude }
            BoundingBox(
                minLat = lats.min(),
                maxLat = lats.max(),
                minLng = lngs.min(),
                maxLng = lngs.max(),
            )
        }

        val latRange = (maxLat - minLat).takeIf { it > 0.0 } ?: 0.001
        val lngRange = (maxLng - minLng).takeIf { it > 0.0 } ?: 0.001

        restaurants.forEach { restaurant ->
            val coords = restaurant.coordinates ?: return@forEach
            val xPx = padPx + ((coords.longitude - minLng) / lngRange).toFloat() * (widthPx - 2 * padPx)
            val yPx = padPx + ((maxLat - coords.latitude) / latRange).toFloat() * (heightPx - 2 * padPx)

            val xDp = with(density) { xPx.toDp() }
            val yDp = with(density) { yPx.toDp() }

            Pin(
                restaurant = restaurant,
                isSelected = restaurant.id == selectedId,
                xOffset = xDp,
                yOffset = yDp,
                onClick = { onPinClick(restaurant.id) },
            )
        }
    }
}

private data class BoundingBox(
    val minLat: Double,
    val maxLat: Double,
    val minLng: Double,
    val maxLng: Double,
)

@Composable
private fun Pin(
    restaurant: Restaurant,
    isSelected: Boolean,
    xOffset: Dp,
    yOffset: Dp,
    onClick: () -> Unit,
) {
    val pinSize: Dp = if (isSelected) 44.dp else 36.dp
    val container = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
    val content = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface

    Box(
        modifier = Modifier
            .offset(x = xOffset - pinSize / 2, y = yOffset - pinSize)
            .size(pinSize)
            .clip(CircleShape)
            .background(container)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        val emoji = restaurant.categories.firstOrNull()?.emoji ?: "📍"
        Text(
            text = emoji,
            style = MaterialTheme.typography.titleSmall,
            color = content,
        )
    }
}

@Composable
private fun SelectedRestaurantCard(
    restaurant: Restaurant,
    onClose: () -> Unit,
    onOpen: () -> Unit,
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .clickable(onClick = onOpen),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 6.dp,
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            AsyncImage(
                model = restaurant.photos.firstOrNull(),
                contentDescription = restaurant.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(12.dp)),
            )
            Spacer(Modifier.size(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = restaurant.name,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                )
                Text(
                    text = restaurant.address.fullFormatted,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                )
                Spacer(Modifier.size(2.dp))
                Text(
                    text = "${restaurant.priceRange.symbol} · ${restaurant.categories.firstOrNull()?.label ?: ""}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
            IconButton(onClick = onClose) {
                Icon(
                    imageVector = Icons.Rounded.Close,
                    contentDescription = "Fechar",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
