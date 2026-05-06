package com.gurudosrestaurantes.di

import com.gurudosrestaurantes.data.repository.FakeGroupRepositoryImpl
import com.gurudosrestaurantes.data.repository.FakeListRepositoryImpl
import com.gurudosrestaurantes.data.repository.FakeNotificationRepositoryImpl
import com.gurudosrestaurantes.data.repository.FakeRestaurantRepositoryImpl
import com.gurudosrestaurantes.data.repository.FakeReviewRepositoryImpl
import com.gurudosrestaurantes.data.repository.FakeUserRepositoryImpl
import com.gurudosrestaurantes.data.repository.FakeVibeCheckRepositoryImpl
import com.gurudosrestaurantes.data.repository.SessionRepositoryImpl
import com.gurudosrestaurantes.domain.repository.GroupRepository
import com.gurudosrestaurantes.domain.repository.ListRepository
import com.gurudosrestaurantes.domain.repository.NotificationRepository
import com.gurudosrestaurantes.domain.repository.RestaurantRepository
import com.gurudosrestaurantes.domain.repository.ReviewRepository
import com.gurudosrestaurantes.domain.repository.SessionRepository
import com.gurudosrestaurantes.domain.repository.UserRepository
import com.gurudosrestaurantes.domain.repository.VibeCheckRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: FakeUserRepositoryImpl): UserRepository

    @Binds
    @Singleton
    abstract fun bindRestaurantRepository(impl: FakeRestaurantRepositoryImpl): RestaurantRepository

    @Binds
    @Singleton
    abstract fun bindReviewRepository(impl: FakeReviewRepositoryImpl): ReviewRepository

    @Binds
    @Singleton
    abstract fun bindGroupRepository(impl: FakeGroupRepositoryImpl): GroupRepository

    @Binds
    @Singleton
    abstract fun bindListRepository(impl: FakeListRepositoryImpl): ListRepository

    @Binds
    @Singleton
    abstract fun bindNotificationRepository(impl: FakeNotificationRepositoryImpl): NotificationRepository

    @Binds
    @Singleton
    abstract fun bindVibeCheckRepository(impl: FakeVibeCheckRepositoryImpl): VibeCheckRepository

    @Binds
    @Singleton
    abstract fun bindSessionRepository(impl: SessionRepositoryImpl): SessionRepository
}
