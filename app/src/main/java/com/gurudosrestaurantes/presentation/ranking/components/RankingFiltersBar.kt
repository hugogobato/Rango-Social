package com.gurudosrestaurantes.presentation.ranking.components

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gurudosrestaurantes.domain.model.MetricId
import com.gurudosrestaurantes.domain.model.RankingReach
import com.gurudosrestaurantes.presentation.ranking.RankingFilters

private val SUPPORTED_CITIES = listOf("São Paulo", "Ribeirão Preto")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RankingFiltersBar(
    filters: RankingFilters,
    onCityChange: (String?) -> Unit,
    onReachChange: (RankingReach) -> Unit,
    onMetricChange: (MetricId?) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        FilterRow(label = "Cidade") {
            FilterChip(
                selected = filters.city == null,
                onClick = { onCityChange(null) },
                label = { Text("Todas") },
                colors = filterColors(),
            )
            SUPPORTED_CITIES.forEach { city ->
                FilterChip(
                    selected = filters.city == city,
                    onClick = { onCityChange(city) },
                    label = { Text(city) },
                    colors = filterColors(),
                )
            }
        }

        Spacer(Modifier.height(8.dp))

        FilterRow(label = "Alcance") {
            RankingReach.entries.forEach { reach ->
                FilterChip(
                    selected = filters.reach == reach,
                    onClick = { onReachChange(reach) },
                    label = { Text(reach.label) },
                    colors = filterColors(),
                )
            }
        }

        Spacer(Modifier.height(8.dp))

        FilterRow(label = "Métrica") {
            FilterChip(
                selected = filters.metric == null,
                onClick = { onMetricChange(null) },
                label = { Text("Geral") },
                colors = filterColors(),
            )
            MetricId.entries.forEach { metric ->
                FilterChip(
                    selected = filters.metric == metric,
                    onClick = { onMetricChange(metric) },
                    label = { Text("${metric.emoji} ${metric.label}") },
                    colors = filterColors(),
                )
            }
        }
    }
}

@Composable
private fun FilterRow(
    label: String,
    content: @Composable () -> Unit,
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(start = 20.dp, top = 8.dp, bottom = 4.dp),
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            content()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun filterColors() = FilterChipDefaults.filterChipColors(
    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
    selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer,
)
