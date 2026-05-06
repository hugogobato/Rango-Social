package com.gurudosrestaurantes.presentation.ranking

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.gurudosrestaurantes.R
import com.gurudosrestaurantes.presentation.common.PlaceholderScreen

@Composable
fun RankingScreen() {
    PlaceholderScreen(
        title = stringResource(R.string.ranking_title),
        subtitle = stringResource(R.string.ranking_subtitle),
    )
}
