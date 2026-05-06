package com.gurudosrestaurantes.presentation.search.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SheetState
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gurudosrestaurantes.domain.model.MetricId
import com.gurudosrestaurantes.domain.model.PriceRange
import com.gurudosrestaurantes.domain.model.RestaurantCategory
import com.gurudosrestaurantes.presentation.search.SearchFilters

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdvancedFiltersBottomSheet(
    sheetState: SheetState,
    filters: SearchFilters,
    onDismiss: () -> Unit,
    onToggleCategory: (RestaurantCategory) -> Unit,
    onTogglePrice: (PriceRange) -> Unit,
    onSetOpenNow: (Boolean) -> Unit,
    onSetMandatoryMetric: (MetricId?, Float) -> Unit,
    onClear: () -> Unit,
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.surface,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "Refinar o rolê",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f),
                )
                TextButton(onClick = onClear) {
                    Text(text = "Limpar")
                }
            }

            SectionLabel(text = "Tipo de rango")
            CategoryChips(
                selected = filters.categories,
                onToggle = onToggleCategory,
            )

            SectionLabel(text = "Preço")
            PriceChips(
                selected = filters.priceRanges,
                onToggle = onTogglePrice,
            )

            Spacer(Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "Só os abertos agora",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f),
                )
                Switch(
                    checked = filters.openNow,
                    onCheckedChange = onSetOpenNow,
                )
            }

            SectionLabel(text = "Métrica obrigatória")
            MetricChips(
                selected = filters.mandatoryMetric,
                onToggle = { metric ->
                    val newMin = filters.mandatoryMetricMin ?: 3f
                    if (filters.mandatoryMetric == metric) {
                        onSetMandatoryMetric(null, newMin)
                    } else {
                        onSetMandatoryMetric(metric, newMin)
                    }
                },
            )
            if (filters.mandatoryMetric != null) {
                val min = filters.mandatoryMetricMin ?: 3f
                Text(
                    text = "Nota mínima: %.1f".format(min),
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 12.dp),
                )
                Slider(
                    value = min,
                    onValueChange = { onSetMandatoryMetric(filters.mandatoryMetric, it) },
                    valueRange = 1f..5f,
                    steps = 7,
                )
            }

            Spacer(Modifier.height(20.dp))
            Button(
                onClick = onDismiss,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            ) {
                Text(
                    text = "Aplicar (${filters.activeCount})",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                )
            }
        }
    }
}

@Composable
private fun SectionLabel(text: String) {
    Spacer(Modifier.height(20.dp))
    Text(
        text = text,
        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
        color = MaterialTheme.colorScheme.onSurface,
    )
    Spacer(Modifier.height(8.dp))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CategoryChips(
    selected: Set<RestaurantCategory>,
    onToggle: (RestaurantCategory) -> Unit,
) {
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(RestaurantCategory.entries.toList()) { category ->
            FilterChip(
                selected = category in selected,
                onClick = { onToggle(category) },
                label = { Text(text = "${category.emoji} ${category.label}") },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                ),
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PriceChips(
    selected: Set<PriceRange>,
    onToggle: (PriceRange) -> Unit,
) {
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(PriceRange.entries.toList()) { price ->
            FilterChip(
                selected = price in selected,
                onClick = { onToggle(price) },
                label = { Text(text = "${price.symbol} ${price.label}") },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                ),
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MetricChips(
    selected: MetricId?,
    onToggle: (MetricId) -> Unit,
) {
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(MetricId.entries.toList()) { metric ->
            FilterChip(
                selected = metric == selected,
                onClick = { onToggle(metric) },
                label = { Text(text = "${metric.emoji} ${metric.label}") },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                ),
            )
        }
    }
}
