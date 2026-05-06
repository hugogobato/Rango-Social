package com.gurudosrestaurantes.data.local.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.gurudosrestaurantes.domain.model.OnboardingStyle
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.preferencesDataStore: DataStore<Preferences> by preferencesDataStore(name = "guru_prefs")

@Singleton
class UserPreferencesDataStore @Inject constructor(
    @ApplicationContext context: Context,
) {
    private val store = context.preferencesDataStore

    val hasCompletedOnboarding: Flow<Boolean> =
        store.data.map { it[Keys.HAS_COMPLETED_ONBOARDING] ?: false }

    val currentUserId: Flow<String?> =
        store.data.map { it[Keys.CURRENT_USER_ID] }

    val selectedCity: Flow<String?> =
        store.data.map { it[Keys.SELECTED_CITY] }

    val selectedStyle: Flow<OnboardingStyle?> =
        store.data.map { prefs ->
            prefs[Keys.SELECTED_STYLE]?.let { runCatching { OnboardingStyle.valueOf(it) }.getOrNull() }
        }

    suspend fun setHasCompletedOnboarding(completed: Boolean) {
        store.edit { it[Keys.HAS_COMPLETED_ONBOARDING] = completed }
    }

    suspend fun setCurrentUserId(userId: String) {
        store.edit { it[Keys.CURRENT_USER_ID] = userId }
    }

    suspend fun setSelectedCity(city: String) {
        store.edit { it[Keys.SELECTED_CITY] = city }
    }

    suspend fun setSelectedStyle(style: OnboardingStyle) {
        store.edit { it[Keys.SELECTED_STYLE] = style.name }
    }

    suspend fun clear() {
        store.edit { it.clear() }
    }

    private object Keys {
        val HAS_COMPLETED_ONBOARDING = booleanPreferencesKey("has_completed_onboarding")
        val CURRENT_USER_ID = stringPreferencesKey("current_user_id")
        val SELECTED_CITY = stringPreferencesKey("selected_city")
        val SELECTED_STYLE = stringPreferencesKey("selected_style")
    }
}
