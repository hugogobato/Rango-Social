import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { HomeScreen } from '../features/home/HomeScreen'
import { RankingScreen } from '../features/ranking/RankingScreen'
import { ReviewFlowScreen } from '../features/review/ReviewFlowScreen'
import { NotificationsScreen } from '../features/notifications/NotificationsScreen'
import { ProfileScreen } from '../features/profile/ProfileScreen'
import { AiAgentScreen } from '../features/ai/AiAgentScreen'
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { BadgesScreen } from '../features/badges/BadgesScreen'
import { StoriesScreen } from '../features/stories/StoriesScreen'
import { DuelScreen } from '../features/duel/DuelScreen'
import { DuelLeaderboardScreen } from '../features/duel/DuelLeaderboardScreen'
import { IllnessReportScreen } from '../features/illness/IllnessReportScreen'
import { RestaurantDetailScreen } from '../features/restaurant/RestaurantDetailScreen'
import { GroupDetailScreen } from '../features/groups/GroupDetailScreen'
import { GroupsListScreen } from '../features/groups/GroupsListScreen'
import { ListDetailScreen } from '../features/lists/ListDetailScreen'
import { ListsListScreen } from '../features/lists/ListsListScreen'
import { SearchScreen } from '../features/search/SearchScreen'
import { RouletteScreen } from '../features/roulette/RouletteScreen'


export const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: <OnboardingScreen />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomeScreen />,
      },
      {
        path: 'ranking',
        element: <RankingScreen />,
      },
      {
        path: 'review',
        element: <ReviewFlowScreen />,
      },
      {
        path: 'notifications',
        element: <NotificationsScreen />,
      },
      {
        path: 'profile',
        element: <ProfileScreen />,
      },
      {
        path: 'profile/:userId',
        element: <ProfileScreen />,
      },
      {
        path: 'ai',
        element: <AiAgentScreen />,
      },
      {
        path: 'settings',
        element: <SettingsScreen />,
      },
      {
        path: 'badges/:userId',
        element: <BadgesScreen />,
      },
      {
        path: 'stories',
        element: <StoriesScreen />,
      },
      {
        path: 'duel',
        element: <DuelScreen />,
      },
      {
        path: 'duel/leaderboard',
        element: <DuelLeaderboardScreen />,
      },
      {
        path: 'restaurant/:restaurantId',
        element: <RestaurantDetailScreen />,
      },
      {
        path: 'restaurant/:restaurantId/illness',
        element: <IllnessReportScreen />,
      },
      {
        path: 'groups',
        element: <GroupsListScreen />,
      },
      {
        path: 'group/:groupId',
        element: <GroupDetailScreen />,
      },
      {
        path: 'lists',
        element: <ListsListScreen />,
      },
      {
        path: 'list/:listId',
        element: <ListDetailScreen />,
      },
      {
        path: 'search',
        element: <SearchScreen />,
      },
      {
        path: 'roulette',
        element: <RouletteScreen />,
      },
    ],
  },
])
