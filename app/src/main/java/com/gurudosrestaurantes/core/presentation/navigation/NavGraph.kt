package com.gurudosrestaurantes.core.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.gurudosrestaurantes.presentation.home.HomeScreen
import com.gurudosrestaurantes.presentation.notifications.NotificationsScreen
import com.gurudosrestaurantes.presentation.profile.ProfileScreen
import com.gurudosrestaurantes.presentation.ranking.RankingScreen
import com.gurudosrestaurantes.presentation.review.ReviewFlowPlaceholderScreen
import com.gurudosrestaurantes.presentation.search.SearchScreen

@Composable
fun GuruNavGraph(
    navController: NavHostController,
    startDestination: String = Route.Home.path,
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
    ) {
        composable(Route.Home.path) {
            HomeScreen(
                onSearchClick = { navController.navigate(Route.Search.path) },
                onRestaurantClick = { id -> navController.navigate(Route.RestaurantDetail.build(id)) },
            )
        }
        composable(Route.Ranking.path) { RankingScreen() }
        composable(Route.ReviewFlow.path) { ReviewFlowPlaceholderScreen() }
        composable(Route.Notifications.path) { NotificationsScreen() }
        composable(Route.Profile.path) { ProfileScreen() }
        composable(Route.Search.path) {
            SearchScreen(
                onBack = { navController.popBackStack() },
                onRestaurantClick = { id -> navController.navigate(Route.RestaurantDetail.build(id)) },
            )
        }
    }
}
