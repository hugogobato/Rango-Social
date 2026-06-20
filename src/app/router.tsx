import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { ScreenSkeleton } from '../components/shared/Skeletons'

/** Lazy-load a screen by its named export (route-level code-splitting). */
function lazyScreen<M, K extends keyof M>(loader: () => Promise<M>, key: K) {
  return lazy(() =>
    loader().then((m) => ({ default: m[key] as unknown as ComponentType }))
  )
}

const HomeScreen = lazyScreen(() => import('../features/home/HomeScreen'), 'HomeScreen')
const RankingScreen = lazyScreen(() => import('../features/ranking/RankingScreen'), 'RankingScreen')
const ReviewFlowScreen = lazyScreen(() => import('../features/review/ReviewFlowScreen'), 'ReviewFlowScreen')
const NotificationsScreen = lazyScreen(() => import('../features/notifications/NotificationsScreen'), 'NotificationsScreen')
const ProfileScreen = lazyScreen(() => import('../features/profile/ProfileScreen'), 'ProfileScreen')
const FindFriendsScreen = lazyScreen(() => import('../features/profile/FindFriendsScreen'), 'FindFriendsScreen')
const AiAgentScreen = lazyScreen(() => import('../features/ai/AiAgentScreen'), 'AiAgentScreen')
const OnboardingScreen = lazyScreen(() => import('../features/onboarding/OnboardingScreen'), 'OnboardingScreen')
const AuthScreen = lazyScreen(() => import('../features/auth/AuthScreen'), 'AuthScreen')
const SettingsScreen = lazyScreen(() => import('../features/settings/SettingsScreen'), 'SettingsScreen')
const BadgesScreen = lazyScreen(() => import('../features/badges/BadgesScreen'), 'BadgesScreen')
const StoriesScreen = lazyScreen(() => import('../features/stories/StoriesScreen'), 'StoriesScreen')
const DuelScreen = lazyScreen(() => import('../features/duel/DuelScreen'), 'DuelScreen')
const DuelLeaderboardScreen = lazyScreen(() => import('../features/duel/DuelLeaderboardScreen'), 'DuelLeaderboardScreen')
const IllnessReportScreen = lazyScreen(() => import('../features/illness/IllnessReportScreen'), 'IllnessReportScreen')
const RestaurantDetailScreen = lazyScreen(() => import('../features/restaurant/RestaurantDetailScreen'), 'RestaurantDetailScreen')
const GroupDetailScreen = lazyScreen(() => import('../features/groups/GroupDetailScreen'), 'GroupDetailScreen')
const GroupsListScreen = lazyScreen(() => import('../features/groups/GroupsListScreen'), 'GroupsListScreen')
const ListDetailScreen = lazyScreen(() => import('../features/lists/ListDetailScreen'), 'ListDetailScreen')
const ListsListScreen = lazyScreen(() => import('../features/lists/ListsListScreen'), 'ListsListScreen')
const SearchScreen = lazyScreen(() => import('../features/search/SearchScreen'), 'SearchScreen')
const RouletteScreen = lazyScreen(() => import('../features/roulette/RouletteScreen'), 'RouletteScreen')

export const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: (
      <Suspense fallback={<ScreenSkeleton />}>
        <OnboardingScreen />
      </Suspense>
    ),
  },
  {
    path: '/auth',
    element: (
      <Suspense fallback={<ScreenSkeleton />}>
        <AuthScreen />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'ranking', element: <RankingScreen /> },
      { path: 'review', element: <ReviewFlowScreen /> },
      { path: 'notifications', element: <NotificationsScreen /> },
      { path: 'profile', element: <ProfileScreen /> },
      { path: 'profile/:userId', element: <ProfileScreen /> },
      { path: 'find-friends', element: <FindFriendsScreen /> },
      { path: 'ai', element: <AiAgentScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
      { path: 'badges/:userId', element: <BadgesScreen /> },
      { path: 'stories', element: <StoriesScreen /> },
      { path: 'duel', element: <DuelScreen /> },
      { path: 'duel/leaderboard', element: <DuelLeaderboardScreen /> },
      { path: 'restaurant/:restaurantId', element: <RestaurantDetailScreen /> },
      { path: 'restaurant/:restaurantId/illness', element: <IllnessReportScreen /> },
      { path: 'groups', element: <GroupsListScreen /> },
      { path: 'group/:groupId', element: <GroupDetailScreen /> },
      { path: 'lists', element: <ListsListScreen /> },
      { path: 'list/:listId', element: <ListDetailScreen /> },
      { path: 'search', element: <SearchScreen /> },
      { path: 'roulette', element: <RouletteScreen /> },
    ],
  },
])
