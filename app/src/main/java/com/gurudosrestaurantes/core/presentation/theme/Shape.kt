package com.gurudosrestaurantes.core.presentation.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val GuruShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),     // Chips
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),         // Cards
    large = RoundedCornerShape(20.dp),
    extraLarge = RoundedCornerShape(24.dp),     // Bottom Sheet (top), elevated containers
)

val PillShape = RoundedCornerShape(percent = 50)  // Buttons (24dp pill = fully rounded)
val BottomSheetShape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
