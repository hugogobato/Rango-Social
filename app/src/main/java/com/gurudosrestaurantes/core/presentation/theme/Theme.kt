package com.gurudosrestaurantes.core.presentation.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val GuruDarkColors = darkColorScheme(
    primary = PrimaryOrange,
    onPrimary = OnPrimaryOrange,
    primaryContainer = PrimaryOrangeDark,
    onPrimaryContainer = TextPrimary,
    secondary = SecondaryPurple,
    onSecondary = OnSecondaryPurple,
    secondaryContainer = SecondaryPurpleDark,
    onSecondaryContainer = TextPrimary,
    tertiary = AccentTeal,
    onTertiary = OnAccentTeal,
    tertiaryContainer = AccentTealDark,
    onTertiaryContainer = TextPrimary,
    error = ErrorRed,
    onError = OnErrorRed,
    background = DarkBackground,
    onBackground = TextPrimary,
    surface = DarkSurface,
    onSurface = TextPrimary,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = TextSecondary,
    surfaceContainerLowest = DarkBackground,
    surfaceContainerLow = DarkSurfaceVariant,
    surfaceContainer = DarkSurface,
    surfaceContainerHigh = DarkSurfaceElevated,
    surfaceContainerHighest = DarkSurfaceElevated,
    outline = OutlineDim,
    outlineVariant = OutlineSubtle,
)

private val GuruLightColors = lightColorScheme(
    primary = PrimaryOrange,
    onPrimary = OnPrimaryOrange,
    secondary = SecondaryPurple,
    onSecondary = OnSecondaryPurple,
    tertiary = AccentTeal,
    onTertiary = OnAccentTeal,
    error = ErrorRed,
    onError = OnErrorRed,
    background = LightBackground,
    surface = LightSurface,
)

@Composable
fun GuruTheme(
    // Default: dark-first per spec.
    darkTheme: Boolean = true,
    // Brand palette over dynamic color — Gen Z aesthetic must stay consistent.
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalView.current.context
            if (darkTheme) {
                androidx.compose.material3.dynamicDarkColorScheme(context)
            } else {
                androidx.compose.material3.dynamicLightColorScheme(context)
            }
        }
        darkTheme -> GuruDarkColors
        else -> GuruLightColors
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = GuruTypography,
        shapes = GuruShapes,
        content = content
    )
}
