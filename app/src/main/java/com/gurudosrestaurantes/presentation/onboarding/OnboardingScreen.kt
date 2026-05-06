package com.gurudosrestaurantes.presentation.onboarding

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.gurudosrestaurantes.R
import com.gurudosrestaurantes.presentation.onboarding.components.OnboardingPagerIndicator
import com.gurudosrestaurantes.presentation.onboarding.steps.CitySelectionStep
import com.gurudosrestaurantes.presentation.onboarding.steps.FollowInfluencersStep
import com.gurudosrestaurantes.presentation.onboarding.steps.StyleSelectionStep
import com.gurudosrestaurantes.presentation.onboarding.steps.WelcomeStep
import kotlinx.coroutines.launch

private const val PAGE_COUNT = 4
private const val PAGE_WELCOME = 0
private const val PAGE_STYLE = 1
private const val PAGE_CITY = 2
private const val PAGE_FOLLOW = 3

@Composable
fun OnboardingScreen(
    onFinished: () -> Unit,
    viewModel: OnboardingViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val pagerState = rememberPagerState(pageCount = { PAGE_COUNT })
    val scope = rememberCoroutineScope()

    LaunchedEffect(state.isFinished) {
        if (state.isFinished) onFinished()
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            HorizontalPager(
                state = pagerState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(0.dp),
                userScrollEnabled = canScrollFromPage(pagerState.currentPage, state),
            ) { page ->
                when (page) {
                    PAGE_WELCOME -> WelcomeStep()
                    PAGE_STYLE -> StyleSelectionStep(
                        selected = state.style,
                        onSelect = viewModel::selectStyle,
                    )
                    PAGE_CITY -> CitySelectionStep(
                        selected = state.city,
                        onSelect = viewModel::selectCity,
                    )
                    PAGE_FOLLOW -> FollowInfluencersStep(
                        suggestions = state.suggestedInfluencers,
                        followedIds = state.followedUserIds,
                        onToggle = viewModel::toggleFollow,
                    )
                }
            }

            OnboardingPagerIndicator(
                pageCount = PAGE_COUNT,
                currentPage = pagerState.currentPage,
                modifier = Modifier.align(Alignment.CenterHorizontally),
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (pagerState.currentPage > 0) {
                    TextButton(onClick = {
                        scope.launch { pagerState.animateScrollToPage(pagerState.currentPage - 1) }
                    }) {
                        Text(text = stringResource(R.string.action_back))
                    }
                }
                Spacer(Modifier.weight(1f))

                val isLastPage = pagerState.currentPage == PAGE_COUNT - 1
                val ctaEnabled = isStepReady(pagerState.currentPage, state) && !state.isSubmitting

                Button(
                    onClick = {
                        if (isLastPage) {
                            viewModel.finish()
                        } else {
                            scope.launch { pagerState.animateScrollToPage(pagerState.currentPage + 1) }
                        }
                    },
                    enabled = ctaEnabled,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary,
                    ),
                    modifier = Modifier.height(48.dp),
                ) {
                    if (state.isSubmitting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp,
                        )
                    } else {
                        Text(
                            text = stringResource(ctaTextRes(pagerState.currentPage)),
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        )
                    }
                }
            }
        }
    }
}

private fun ctaTextRes(page: Int): Int = when (page) {
    PAGE_FOLLOW -> R.string.onboarding_done
    else -> R.string.action_next
}

private fun isStepReady(page: Int, state: OnboardingUiState): Boolean = when (page) {
    PAGE_WELCOME -> true
    PAGE_STYLE -> state.canProceedFromStyle
    PAGE_CITY -> state.canProceedFromCity
    PAGE_FOLLOW -> state.canProceedFromCity && state.canProceedFromStyle
    else -> true
}

private fun canScrollFromPage(page: Int, state: OnboardingUiState): Boolean = isStepReady(page, state)
