package com.gurudosrestaurantes.presentation.review

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.gurudosrestaurantes.presentation.review.steps.ConfirmStep
import com.gurudosrestaurantes.presentation.review.steps.DestinationsStep
import com.gurudosrestaurantes.presentation.review.steps.DoneStep
import com.gurudosrestaurantes.presentation.review.steps.MediaStep
import com.gurudosrestaurantes.presentation.review.steps.MetricsStep
import com.gurudosrestaurantes.presentation.review.steps.PickRestaurantStep
import com.gurudosrestaurantes.presentation.review.steps.ScoreStep

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReviewFlowScreen(
    onClose: () -> Unit,
    viewModel: ReviewFlowViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(state.errorMessage) {
        state.errorMessage?.let { snackbarHostState.showSnackbar(it) }
    }

    val isDone = state.step == ReviewStep.DONE

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            topBar = {
                if (!isDone) {
                    Column {
                        CenterAlignedTopAppBar(
                            title = {
                                Text(
                                    text = stepTitle(state.step),
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                                )
                            },
                            navigationIcon = {
                                IconButton(
                                    onClick = {
                                        if (state.step == ReviewStep.PICK_RESTAURANT) onClose() else viewModel.back()
                                    },
                                ) {
                                    Icon(
                                        imageVector = if (state.step == ReviewStep.PICK_RESTAURANT)
                                            Icons.Rounded.Close else Icons.AutoMirrored.Rounded.ArrowBack,
                                        contentDescription = "Voltar",
                                    )
                                }
                            },
                            actions = {
                                Text(
                                    text = stepIndicator(state.step),
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(end = 16.dp),
                                )
                            },
                            colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                                containerColor = MaterialTheme.colorScheme.background,
                                titleContentColor = MaterialTheme.colorScheme.onBackground,
                            ),
                        )
                        LinearProgressIndicator(
                            progress = { stepProgress(state.step) },
                            modifier = Modifier.fillMaxWidth(),
                            color = MaterialTheme.colorScheme.primary,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant,
                        )
                    }
                }
            },
            bottomBar = {
                if (!isDone) {
                    ReviewFlowFooter(
                        step = state.step,
                        isPosting = state.isPosting,
                        onBack = viewModel::back,
                        onNext = viewModel::next,
                        onSubmit = viewModel::submit,
                    )
                }
            },
            snackbarHost = { SnackbarHost(snackbarHostState) },
        ) { padding ->
            AnimatedContent(
                targetState = state.step,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize(),
                label = "review-step",
            ) { step ->
                when (step) {
                    ReviewStep.PICK_RESTAURANT -> PickRestaurantStep(
                        query = state.restaurantQuery,
                        onQueryChange = viewModel::onQueryChange,
                        results = state.restaurantResults,
                        isSearching = state.isSearchingRestaurants,
                        selected = state.draft.restaurant,
                        onSelect = viewModel::selectRestaurant,
                        onClearSelection = viewModel::clearRestaurant,
                    )
                    ReviewStep.SCORE -> ScoreStep(
                        overallScore = state.draft.overallScore,
                        onlyVisited = state.draft.onlyVisited,
                        onScoreChange = viewModel::setOverallScore,
                        onToggleOnlyVisited = viewModel::toggleOnlyVisited,
                    )
                    ReviewStep.METRICS -> MetricsStep(
                        metrics = state.draft.metrics,
                        mandatoryMetrics = state.myGroups
                            .filter { it.id in state.draft.groupTargetIds }
                            .flatMap { it.mandatoryMetrics }
                            .toSet(),
                        onMetricChange = viewModel::setMetric,
                    )
                    ReviewStep.MEDIA -> MediaStep(
                        comment = state.draft.comment,
                        onCommentChange = viewModel::setComment,
                        totalSpent = state.draft.totalSpent,
                        onTotalSpentChange = viewModel::setTotalSpent,
                        photos = state.draft.photos,
                        onAddMockPhoto = viewModel::addRandomMockPhoto,
                        onRemovePhoto = viewModel::removePhoto,
                    )
                    ReviewStep.DESTINATIONS -> DestinationsStep(
                        publishToProfile = state.draft.publishToProfile,
                        groups = state.myGroups,
                        selectedGroupIds = state.draft.groupTargetIds,
                        onTogglePublishToProfile = viewModel::togglePublishToProfile,
                        onToggleGroup = viewModel::toggleGroupTarget,
                    )
                    ReviewStep.CONFIRM -> ConfirmStep(
                        draft = state.draft,
                        groups = state.myGroups,
                    )
                    ReviewStep.DONE -> DoneStep(
                        onClose = {
                            viewModel.reset()
                            onClose()
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun ReviewFlowFooter(
    step: ReviewStep,
    isPosting: Boolean,
    onBack: () -> Unit,
    onNext: () -> Unit,
    onSubmit: () -> Unit,
) {
    Surface(
        color = MaterialTheme.colorScheme.background,
        tonalElevation = 4.dp,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (step != ReviewStep.PICK_RESTAURANT) {
                OutlinedButton(
                    onClick = onBack,
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                ) {
                    Text(
                        text = "Voltar",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                    )
                }
            }

            Button(
                onClick = if (step == ReviewStep.CONFIRM) onSubmit else onNext,
                enabled = !isPosting,
                modifier = Modifier
                    .weight(if (step == ReviewStep.PICK_RESTAURANT) 1f else 2f)
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            ) {
                if (isPosting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp,
                    )
                    Spacer(Modifier.size(8.dp))
                    Text(text = "Lançando…")
                } else {
                    Text(
                        text = primaryActionLabel(step),
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    )
                }
            }
        }
    }
}

private fun stepTitle(step: ReviewStep): String = when (step) {
    ReviewStep.PICK_RESTAURANT -> "Mandar a real"
    ReviewStep.SCORE -> "Que nota?"
    ReviewStep.METRICS -> "Detalhes"
    ReviewStep.MEDIA -> "Foto e resenha"
    ReviewStep.DESTINATIONS -> "Pra onde?"
    ReviewStep.CONFIRM -> "Confere o papo"
    ReviewStep.DONE -> "Mandou bem!"
}

private fun stepIndicator(step: ReviewStep): String {
    val index = when (step) {
        ReviewStep.PICK_RESTAURANT -> 1
        ReviewStep.SCORE -> 2
        ReviewStep.METRICS -> 3
        ReviewStep.MEDIA -> 4
        ReviewStep.DESTINATIONS -> 5
        ReviewStep.CONFIRM -> 6
        ReviewStep.DONE -> 6
    }
    return "$index/6"
}

private fun stepProgress(step: ReviewStep): Float = when (step) {
    ReviewStep.PICK_RESTAURANT -> 1f / 6f
    ReviewStep.SCORE -> 2f / 6f
    ReviewStep.METRICS -> 3f / 6f
    ReviewStep.MEDIA -> 4f / 6f
    ReviewStep.DESTINATIONS -> 5f / 6f
    ReviewStep.CONFIRM -> 6f / 6f
    ReviewStep.DONE -> 1f
}

private fun primaryActionLabel(step: ReviewStep): String = when (step) {
    ReviewStep.CONFIRM -> "Lançar a braba 🚀"
    else -> "Próximo"
}
