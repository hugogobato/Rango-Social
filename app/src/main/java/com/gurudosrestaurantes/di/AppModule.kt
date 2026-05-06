package com.gurudosrestaurantes.di

import android.content.Context
import androidx.room.Room
import com.gurudosrestaurantes.data.local.GuruDatabase
import com.gurudosrestaurantes.data.local.dao.RestaurantDao
import com.gurudosrestaurantes.data.local.dao.ReviewDao
import com.gurudosrestaurantes.data.local.dao.UserDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideGuruDatabase(@ApplicationContext context: Context): GuruDatabase =
        Room.databaseBuilder(context, GuruDatabase::class.java, GuruDatabase.DATABASE_NAME)
            .fallbackToDestructiveMigration()
            .build()

    @Provides
    fun provideRestaurantDao(database: GuruDatabase): RestaurantDao = database.restaurantDao()

    @Provides
    fun provideUserDao(database: GuruDatabase): UserDao = database.userDao()

    @Provides
    fun provideReviewDao(database: GuruDatabase): ReviewDao = database.reviewDao()
}
