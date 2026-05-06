package com.gurudosrestaurantes.core.presentation.components

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material.icons.outlined.EmojiEvents
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import com.gurudosrestaurantes.R
import com.gurudosrestaurantes.core.presentation.navigation.Route

private data class BottomNavItem(
    val route: Route,
    val labelRes: Int,
    val iconSelected: ImageVector,
    val iconUnselected: ImageVector,
)

private val bottomNavItems = listOf(
    BottomNavItem(
        route = Route.Home,
        labelRes = R.string.nav_home,
        iconSelected = Icons.Rounded.Home,
        iconUnselected = Icons.Outlined.Home,
    ),
    BottomNavItem(
        route = Route.Ranking,
        labelRes = R.string.nav_ranking,
        iconSelected = Icons.Rounded.EmojiEvents,
        iconUnselected = Icons.Outlined.EmojiEvents,
    ),
    BottomNavItem(
        route = Route.Notifications,
        labelRes = R.string.nav_notifications,
        iconSelected = Icons.Rounded.Notifications,
        iconUnselected = Icons.Outlined.Notifications,
    ),
    BottomNavItem(
        route = Route.Profile,
        labelRes = R.string.nav_profile,
        iconSelected = Icons.Rounded.Person,
        iconUnselected = Icons.Outlined.Person,
    ),
)

@Composable
fun GuruBottomNavBar(
    currentDestination: NavDestination?,
    onNavigate: (Route) -> Unit,
    modifier: Modifier = Modifier,
) {
    NavigationBar(modifier = modifier) {
        // Two slots on the left of the central FAB
        bottomNavItems.subList(0, 2).forEach { item ->
            NavBarItem(item, currentDestination, onNavigate)
        }
        // Spacer where the floating FAB hovers
        NavigationBarItem(
            selected = false,
            onClick = {},
            enabled = false,
            icon = { Spacer(Modifier.size(24.dp)) },
            colors = NavigationBarItemDefaults.colors(disabledIconColor = androidx.compose.ui.graphics.Color.Transparent),
        )
        // Two slots on the right
        bottomNavItems.subList(2, 4).forEach { item ->
            NavBarItem(item, currentDestination, onNavigate)
        }
    }
}

@Composable
private fun androidx.compose.foundation.layout.RowScope.NavBarItem(
    item: BottomNavItem,
    currentDestination: NavDestination?,
    onNavigate: (Route) -> Unit,
) {
    val selected = currentDestination
        ?.hierarchy
        ?.any { it.route == item.route.path } == true

    NavigationBarItem(
        selected = selected,
        onClick = { onNavigate(item.route) },
        icon = {
            Icon(
                imageVector = if (selected) item.iconSelected else item.iconUnselected,
                contentDescription = stringResource(item.labelRes),
            )
        },
        label = { Text(text = stringResource(item.labelRes)) },
        alwaysShowLabel = false,
    )
}
