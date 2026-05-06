package com.gurudosrestaurantes.presentation.profile

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.gurudosrestaurantes.R
import com.gurudosrestaurantes.presentation.common.PlaceholderScreen

@Composable
fun ProfileScreen() {
    PlaceholderScreen(
        title = stringResource(R.string.profile_title),
        subtitle = stringResource(R.string.profile_my),
    )
}
