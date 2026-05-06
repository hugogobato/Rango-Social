package com.gurudosrestaurantes

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.gurudosrestaurantes.core.presentation.components.MainScreen
import com.gurudosrestaurantes.core.presentation.theme.GuruTheme
import com.gurudosrestaurantes.presentation.session.SessionUiState
import com.gurudosrestaurantes.presentation.session.SessionViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val sessionViewModel: SessionViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        var keepSplash = true
        splash.setKeepOnScreenCondition { keepSplash }

        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                sessionViewModel.uiState.collect { state ->
                    if (state != SessionUiState.Loading) keepSplash = false
                }
            }
        }

        setContent {
            GuruTheme {
                MainScreen(sessionViewModel = sessionViewModel)
            }
        }
    }
}
