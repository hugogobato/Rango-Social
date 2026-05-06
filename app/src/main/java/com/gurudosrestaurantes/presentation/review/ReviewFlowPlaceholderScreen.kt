package com.gurudosrestaurantes.presentation.review

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.gurudosrestaurantes.R
import com.gurudosrestaurantes.presentation.common.PlaceholderScreen

@Composable
fun ReviewFlowPlaceholderScreen() {
    PlaceholderScreen(
        title = stringResource(R.string.cta_review_primary),
        subtitle = stringResource(R.string.phase1_screen_in_progress),
    )
}
