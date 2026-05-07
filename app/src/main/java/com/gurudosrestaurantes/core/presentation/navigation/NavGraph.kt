package com.gurudosrestaurantes.core.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.gurudosrestaurantes.presentation.common.PlaceholderScreen
import com.gurudosrestaurantes.presentation.groups.GroupDetailScreen
import com.gurudosrestaurantes.presentation.groups.GroupsScreen
import com.gurudosrestaurantes.presentation.home.HomeScreen
import com.gurudosrestaurantes.presentation.lists.ListDetailScreen
import com.gurudosrestaurantes.presentation.lists.ListsScreen
import com.gurudosrestaurantes.presentation.map.MapScreen
import com.gurudosrestaurantes.presentation.notifications.NotificationsScreen
import com.gurudosrestaurantes.presentation.profile.ProfileScreen
import com.gurudosrestaurantes.presentation.ranking.RankingScreen
import com.gurudosrestaurantes.presentation.review.ReviewFlowScreen
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
        composable(Route.Ranking.path) {
            RankingScreen(
                onRestaurantClick = { id -> navController.navigate(Route.RestaurantDetail.build(id)) },
                onMapClick = { navController.navigate(Route.Map.path) },
            )
        }
        composable(Route.Map.path) {
            MapScreen(
                onBack = { navController.popBackStack() },
                onRestaurantClick = { id -> navController.navigate(Route.RestaurantDetail.build(id)) },
            )
        }
        composable(Route.ReviewFlow.path) {
            ReviewFlowScreen(onClose = { navController.popBackStack() })
        }
        composable(Route.Notifications.path) { NotificationsScreen() }
        composable(Route.Profile.path) {
            ProfileScreen(
                onListsClick = { navController.navigate(Route.Lists.path) },
                onGroupsClick = { navController.navigate(Route.Groups.path) },
                onWishlistClick = { navController.navigate(Route.Lists.path) },
                onBadgesClick = { navController.navigate(Route.Lists.path) },
                onRestaurantClick = { id -> navController.navigate(Route.RestaurantDetail.build(id)) },
            )
        }
        composable(Route.Search.path) {
            SearchScreen(
                onBack = { navController.popBackStack() },
                onRestaurantClick = { id -> navController.navigate(Route.RestaurantDetail.build(id)) },
            )
        }
        composable(Route.Lists.path) {
            ListsScreen(
                onBack = { navController.popBackStack() },
                onListClick = { id -> navController.navigate(Route.ListDetail.build(id)) },
            )
        }
        composable(
            route = Route.ListDetail.path,
            arguments = listOf(navArgument("listId") { type = NavType.StringType }),
        ) {
            ListDetailScreen(
                onBack = { navController.popBackStack() },
                onRestaurantClick = { id -> navController.navigate(Route.RestaurantDetail.build(id)) },
            )
        }
        composable(Route.Groups.path) {
            GroupsScreen(
                onBack = { navController.popBackStack() },
                onGroupClick = { id -> navController.navigate(Route.GroupDetail.build(id)) },
            )
        }
        composable(
            route = Route.GroupDetail.path,
            arguments = listOf(navArgument("groupId") { type = NavType.StringType }),
        ) {
            GroupDetailScreen(
                onBack = { navController.popBackStack() },
                onRestaurantClick = { id -> navController.navigate(Route.RestaurantDetail.build(id)) },
            )
        }
        composable(
            route = Route.RestaurantDetail.path,
            arguments = listOf(navArgument("restaurantId") { type = NavType.StringType }),
        ) { entry ->
            val id = entry.arguments?.getString("restaurantId").orEmpty()
            PlaceholderScreen(
                title = "Restaurante",
                subtitle = "Página detalhada chega na próxima fase. ID: $id",
            )
        }
        composable(
            route = Route.UserProfile.path,
            arguments = listOf(navArgument("userId") { type = NavType.StringType }),
        ) { entry ->
            val id = entry.arguments?.getString("userId").orEmpty()
            PlaceholderScreen(title = "Perfil de outro user", subtitle = "ID: $id")
        }
        composable(
            route = Route.Badges.path,
            arguments = listOf(navArgument("userId") { type = NavType.StringType }),
        ) {
            PlaceholderScreen(title = "Badges", subtitle = "Coleção completa em breve.")
        }
        composable(Route.Settings.path) {
            PlaceholderScreen(title = "Ajustes", subtitle = "Em breve, parça.")
        }
    }
}
