package com.gurudosrestaurantes.presentation.vibecheck

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.LocationOn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.gurudosrestaurantes.core.presentation.theme.PrimaryOrange
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.model.VibeStatus

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateVibeCheckBottomSheet(
    onDismiss: () -> Unit,
    viewModel: CreateVibeCheckViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    LaunchedEffect(state.isPosted) {
        if (state.isPosted) {
            viewModel.reset()
            onDismiss()
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.surface,
    ) {
        Content(
            state = state,
            onQueryChange = viewModel::onQueryChange,
            onSelectRestaurant = viewModel::selectRestaurant,
            onClearRestaurant = viewModel::clearRestaurant,
            onSelectStatus = viewModel::selectStatus,
            onNoteChange = viewModel::onNoteChange,
            onPost = viewModel::post,
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun Content(
    state: CreateVibeCheckUiState,
    onQueryChange: (String) -> Unit,
    onSelectRestaurant: (Restaurant) -> Unit,
    onClearRestaurant: () -> Unit,
    onSelectStatus: (VibeStatus) -> Unit,
    onNoteChange: (String) -> Unit,
    onPost: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text(
            text = "Como tá o rolê?",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurface,
        )
        Text(
            text = "Manda um vibe check rapidinho — some em 4h.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        OutlinedTextField(
            value = state.query,
            onValueChange = onQueryChange,
            singleLine = true,
            placeholder = { Text("Onde tu tá?") },
            trailingIcon = {
                if (state.selectedRestaurant != null) {
                    IconButton(onClick = onClearRestaurant) {
                        Icon(Icons.Rounded.Close, contentDescription = "Limpar")
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
        )

        if (state.selectedRestaurant == null && state.query.isNotBlank()) {
            RestaurantResults(
                isSearching = state.isSearching,
                results = state.restaurantResults,
                onSelect = onSelectRestaurant,
            )
        }

        StatusGrid(selected = state.selectedStatus, onSelect = onSelectStatus)

        OutlinedTextField(
            value = state.note,
            onValueChange = onNoteChange,
            placeholder = { Text("Conta a real… (opcional, máx 100)") },
            supportingText = { Text("${state.note.length}/100") },
            modifier = Modifier.fillMaxWidth(),
        )

        state.errorMessage?.let { msg ->
            Text(
                text = msg,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.error,
            )
        }

        Button(
            onClick = onPost,
            enabled = !state.isPosting && state.selectedRestaurant != null && state.selectedStatus != null,
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryOrange),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
        ) {
            if (state.isPosting) {
                CircularProgressIndicator(
                    strokeWidth = 2.dp,
                    modifier = Modifier.size(18.dp),
                    color = MaterialTheme.colorScheme.onPrimary,
                )
            } else {
                Text("Mandar vibe 🔥", fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(Modifier.height(4.dp))
    }
}

@Composable
private fun RestaurantResults(
    isSearching: Boolean,
    results: List<Restaurant>,
    onSelect: (Restaurant) -> Unit,
) {
    when {
        isSearching -> Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center,
        ) {
            CircularProgressIndicator(strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
        }
        results.isEmpty() -> Text(
            text = "Sem rolês com esse nome.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        else -> LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(max = 200.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            items(items = results, key = { it.id }) { restaurant ->
                RestaurantRow(restaurant = restaurant, onClick = { onSelect(restaurant) })
            }
        }
    }
}

@Composable
private fun RestaurantRow(restaurant: Restaurant, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() },
        color = MaterialTheme.colorScheme.surfaceVariant,
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                imageVector = Icons.Rounded.LocationOn,
                contentDescription = null,
                tint = PrimaryOrange,
                modifier = Modifier.size(18.dp),
            )
            Spacer(Modifier.size(8.dp))
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = restaurant.name,
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Text(
                    text = "${restaurant.address.neighborhood}, ${restaurant.address.city}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun StatusGrid(selected: VibeStatus?, onSelect: (VibeStatus) -> Unit) {
    val statuses = VibeStatus.entries
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        statuses.chunked(2).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { status ->
                    StatusTile(
                        status = status,
                        isSelected = status == selected,
                        onClick = { onSelect(status) },
                        modifier = Modifier.weight(1f),
                    )
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun StatusTile(
    status: VibeStatus,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .clickable { onClick() },
        color = if (isSelected) PrimaryOrange.copy(alpha = 0.16f) else MaterialTheme.colorScheme.surfaceVariant,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(text = status.emoji, style = MaterialTheme.typography.titleLarge)
            Text(
                text = status.label,
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                ),
                color = if (isSelected) PrimaryOrange else MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
