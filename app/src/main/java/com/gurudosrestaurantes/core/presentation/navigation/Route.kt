package com.gurudosrestaurantes.core.presentation.navigation

sealed class Route(val path: String) {
    data object Home : Route("home")
    data object Ranking : Route("ranking")
    data object ReviewFlow : Route("review")
    data object Notifications : Route("notifications")
    data object Profile : Route("profile")

    // Detail routes (placeholder for now; built out in later phases)
    data object Search : Route("search")
    data object Roulette : Route("roulette")
    data object RestaurantDetail : Route("restaurant/{restaurantId}") {
        fun build(restaurantId: String) = "restaurant/$restaurantId"
    }
    data object GroupDetail : Route("group/{groupId}") {
        fun build(groupId: String) = "group/$groupId"
    }
    data object ListDetail : Route("list/{listId}") {
        fun build(listId: String) = "list/$listId"
    }
    data object UserProfile : Route("user/{userId}") {
        fun build(userId: String) = "user/$userId"
    }
    data object Badges : Route("badges/{userId}") {
        fun build(userId: String) = "badges/$userId"
    }
    data object Settings : Route("settings")
    data object Onboarding : Route("onboarding")
}

/** Top-level destinations shown in the bottom navigation bar. */
val BottomNavRoutes: List<Route> = listOf(
    Route.Home,
    Route.Ranking,
    Route.Notifications,
    Route.Profile,
)
