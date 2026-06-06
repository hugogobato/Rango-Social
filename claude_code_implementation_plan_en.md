# Detailed Implementation Plan for Claude Code: Guru dos Restaurantes (GR)

This document is a comprehensive, step-by-step action plan designed for **Claude Code** (or any AI coding assistant). It breaks down the Technical Specification (v2.0) into clear, actionable phases, specifying exactly which files, classes, and components need to be created.

> **Instruction for Claude Code:** Execute **one phase at a time**. Ask the user to verify and test the application at the end of each phase before proceeding to the next. Adhere strictly to Clean Architecture principles, MVVM, Jetpack Compose best practices, and the provided pt-BR UI copy glossary (e.g., "Mandar a real", "Tropa").

---

## 🚀 PHASE 1: Project Setup & Visual Theme

**Objective:** Establish the foundational architecture, dependencies, and Design System.

**Files & Tasks to Create:**

1. **Dependencies (`app/build.gradle.kts`):** Add Compose BOM, Navigation Compose, Hilt, Room, Retrofit, OkHttp, Coil, and `kotlinx.serialization`.
2. **DI Setup (`GuruApplication.kt`):** Create the custom Application class and annotate with `@HiltAndroidApp`.
3. **Theme & Design System (`core/presentation/theme/`):**
   - `Color.kt`: Define `DarkBackground` (#0F0F0F), `Surface` (#242424), `PrimaryOrange` (#FF6B35), `SecondaryPurple` (#7B61FF), `AccentGreen` (#00D9C0), and `ErrorRed` (#FF453A).
   - `Type.kt`: Define `Display Large`, `Body Large`, and `Label Large` using standard Compose Typography (or a Google Font if requested).
   - `Shape.kt`: Define 16dp rounded corners for Cards and 24dp fully rounded for Buttons.
   - `Theme.kt`: Assemble the Material 3 `darkColorScheme`.
4. **Strings Dictionary (`res/values/strings.xml`):** Add the pt-BR glossary (e.g., `<string name="review_cta">Mandar a real</string>`, `<string name="groups_tab">Tropa</string>`).
5. **Navigation Base (`core/presentation/navigation/`):**
   - `Route.kt`: Sealed class defining `Home`, `Ranking`, `ReviewFlow`, `Notifications`, `Profile`.
   - `NavGraph.kt`: Set up the Compose `NavHost`.
6. **Main UI (`MainActivity.kt` & `core/presentation/components/`):**
   - Implement `MainScreen.kt` with a `Scaffold`, standard `BottomNavigationBar`, and a prominent central `FloatingActionButton` for the Review flow.

---

## 📦 PHASE 2: Domain Models & Mock Data

**Objective:** Map out the domain entities and create a fake repository layer to supply mock data to the UI.

**Files & Tasks to Create:**

1. **Domain Models (`domain/model/`):**
   - `User.kt`, `Restaurant.kt`, `Review.kt`, `VibeCheck.kt`, `Group.kt`, `CustomList.kt`.
   - `Enums.kt`: Define `MetricId`, `InfluencerTier`, `PriceRange`, `VibeStatus`.
2. **Repository Interfaces (`domain/repository/`):**
   - `UserRepository.kt`, `RestaurantRepository.kt`, `ReviewRepository.kt`, `GroupRepository.kt`.
3. **Local Data Layer (`data/local/`):**
   - `entity/`: Create Room entities (e.g., `RestaurantEntity.kt`).
   - `dao/`: Create DAOs (e.g., `RestaurantDao.kt`).
   - `GuruDatabase.kt`: Setup the Room database.
4. **Fake Implementations (`data/repository/`):**
   - `FakeRestaurantRepositoryImpl.kt`: Generate ~30 mock restaurants for São Paulo and Ribeirão Preto.
   - `FakeUserRepositoryImpl.kt`: Generate mock influencers (Nano to Mega tiers).
   - `FakeReviewRepositoryImpl.kt`: Generate initial mock reviews and feed data.
5. **Use Cases (`domain/usecase/`):**
   - `GetHomeFeedUseCase.kt`, `GetRestaurantsUseCase.kt`.
6. **DI Modules (`di/`):**
   - `AppModule.kt`: Provide Room DB and standard singletons.
   - `RepositoryModule.kt`: Bind the Fake repository implementations to the interfaces.

---

## 🙋‍♂️ PHASE 3: Onboarding & "Authentication"

**Objective:** Capture user preferences and mock a logged-in state.

**Files & Tasks to Create:**

1. **Local Storage (`data/local/datastore/`):**
   - `UserPreferencesDataStore.kt`: Store boolean `hasCompletedOnboarding` and a mock `currentUserId`.
2. **Onboarding UI (`presentation/onboarding/`):**
   - `OnboardingViewModel.kt`: Manage onboarding state and save preferences.
   - `OnboardingScreen.kt`: Main host for the steps using `HorizontalPager`.
   - `components/WelcomeStep.kt`: Animated greeting.
   - `components/StyleSelectionStep.kt`: Select user vibe (e.g., "🍔 Sou do bonde", "📸 Influencer").
   - `components/CitySelectionStep.kt`: Dropdown for SP / Ribeirão Preto.
   - `components/FollowInfluencersStep.kt`: List of mock influencers with a toggle to follow.
3. **Use Cases (`domain/usecase/`):**
   - `CompleteOnboardingUseCase.kt`: Finalizes setup and writes the mock session user to the database.

---

## 📱 PHASE 4: Feed (Home) & Social Interactions

**Objective:** Build the main timeline, displaying reviews, vibe checks, and enabling social actions.

**Files & Tasks to Create:**

1. **Home UI (`presentation/home/`):**
   - `HomeViewModel.kt`: Fetches the feed via `GetHomeFeedUseCase`.
   - `HomeScreen.kt`: Displays the feed using a `LazyColumn`.
   - `components/StoriesRail.kt`: A `LazyRow` displaying active 4h `VibeCheck` avatars with gradient borders.
   - `components/ReviewCard.kt`: The core UI component for a review. Includes avatar, rating (peppers 🌶️), text, photos (using Coil), and footer.
   - `components/InteractionBar.kt`: Like (❤️), Comment (💬), Share (📤), Save (💾) buttons.
2. **Search UI (`presentation/search/`):**
   - `SearchScreen.kt` & `SearchViewModel.kt`.
   - `components/AdvancedFiltersBottomSheet.kt`: UI for selecting categories, price, and minimum rating.
   - `components/RouletteModal.kt`: The "🎲 Onde vou hoje?" randomized discovery feature.
3. **Notifications UI (`presentation/notifications/`):**
   - `NotificationsScreen.kt`: List of grouped notifications (`NotificationItem.kt`).

---

## 🌶️ PHASE 5: The Review Flow ("Mandar a Real")

**Objective:** Build the multi-step bottom sheet/dialog for posting a new review.

**Files & Tasks to Create:**

1. **Review Flow Navigation (`presentation/review/`):**
   - `ReviewFlowViewModel.kt`: Holds the entire draft state of the review across all steps.
2. **Step Screens (`presentation/review/steps/`):**
   - `RestaurantSearchStep.kt`: Search bar and "Lugar novo" (New place) form.
   - `DateAndCompanionsStep.kt`: Date picker and friend selector.
   - `DestinationSelectionStep.kt`: Critical logic step. UI to select Profile and/or Groups.
   - `MetricsRatingStep.kt`: Dynamic UI. Renders `MetricSlider.kt` (1-5 emojis). Must enforce mandatory metrics based on groups selected in the previous step.
   - `ReviewContentStep.kt`: Text area for the comment ("O papo"), photo upload grid, and receipt/cost input.
   - `ReviewPreviewStep.kt`: Renders a `ReviewCard` preview and handles the "Lançar a braba 🚀" submit action.
3. **Use Cases (`domain/usecase/`):**
   - `SubmitReviewUseCase.kt`: Validates all required metrics before saving to `FakeReviewRepositoryImpl`.

---

## 🏆 PHASE 6: Ranking & Discovery Maps

**Objective:** Implement the gamified leaderboards and map-based exploration.

**Files & Tasks to Create:**

1. **Ranking UI (`presentation/ranking/`):**
   - `RankingViewModel.kt` & `RankingScreen.kt`.
   - `components/RankingFiltersBar.kt`: Persisted filters (City, Reach, Metric).
   - `components/RankingListItem.kt`: Shows position (🥇🥈🥉), restaurant photo, score, and "Tá bombando 🔥" badge.
2. **Ranking Logic (`domain/usecase/`):**
   - `CalculateRankingUseCase.kt`: Implements the sorting formula: `(Overall * 0.4) + (SelectedMetric * 0.3) + (RecentReviewsFactor * 0.2) + (EngagementFactor * 0.1)`.
   - `GetTrendingRestaurantsUseCase.kt`: Detects hype spikes in the last 48 hours.
3. **Map UI (`presentation/map/`):**
   - `MapScreen.kt`: Implement OSMDroid (or Google Maps Compose). Plot `Restaurant.coordinates` with custom marker pins.

---

## 👤 PHASE 7: Profile, Groups ("Tropas") & Lists

**Objective:** Build user identity, communities, and saved lists.

**Files & Tasks to Create:**

1. **Profile UI (`presentation/profile/`):**
   - `ProfileViewModel.kt` & `ProfileScreen.kt`.
   - `components/ProfileHeader.kt`: Avatar, stats, bio.
   - `components/StreakIndicator.kt`: Visual fire 🔥 representation of consecutive review days.
   - `components/BadgesRow.kt`: Horizontal scroll of unlocked achievements.
2. **Lists ("Meus Rolês") (`presentation/lists/`):**
   - `ListsScreen.kt`: Tabbed view (Mine, Collab).
   - `components/CreateListBottomSheet.kt`: Name, emoji icon, privacy toggle.
   - `ListDetailScreen.kt`: Drag-and-drop reorderable list of saved restaurants.
3. **Groups ("Tropas") (`presentation/groups/`):**
   - `GroupsScreen.kt`: List of user's groups.
   - `components/CreateGroupDialog.kt`: Must include a selector for mandatory `MetricId`s.
   - `GroupDetailScreen.kt`: Tabs for `Feed`, `Ranking`, `Members`, and `Polls` (Enquetes).

---

## ✨ PHASE 8: Gamification & Final Polish

**Objective:** Implement micro-interactions, shareable content, and ensure production-like quality.

**Files & Tasks to Create:**

1. **Vibe Check Quick Post (`presentation/vibecheck/`):**
   - `CreateVibeCheckBottomSheet.kt`: Accessible from the home FAB or restaurant profile. Grid of 10 statuses (e.g., Empty, Busy, Good Music).
2. **Shareable Cards (`presentation/share/`):**
   - `ShareableCardGenerator.kt`: Logic to capture a Compose View to a Bitmap (or draw via Canvas) to create a 9:16 Instagram Story-style image of a review.
3. **Background/Logic Polish (`domain/usecase/`):**
   - `UpdateStreakUseCase.kt`: Triggered after review submission.
   - `CheckBadgesUseCase.kt`: Grants badges based on user stats.
4. **UX Polish:**
   - Add Compose `AnimatedVisibility` and `SharedTransitionLayout` where applicable.
   - Implement Skeleton Loaders for `HomeScreen` and `ProfileScreen`.
   - Ensure all empty states (e.g., "Nenhum review ainda") and error states ("Deu ruim") use correct pt-BR copy and visuals.

---

**Note to Claude Code:** Once you have read and understood this plan, explicitly state: _"I have loaded the detailed English implementation plan. Are we ready to begin PHASE 1 for Guru dos Restaurantes?"_
