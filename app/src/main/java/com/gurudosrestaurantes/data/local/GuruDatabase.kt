package com.gurudosrestaurantes.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.gurudosrestaurantes.data.local.converter.Converters
import com.gurudosrestaurantes.data.local.dao.RestaurantDao
import com.gurudosrestaurantes.data.local.dao.ReviewDao
import com.gurudosrestaurantes.data.local.dao.UserDao
import com.gurudosrestaurantes.data.local.entity.RestaurantEntity
import com.gurudosrestaurantes.data.local.entity.ReviewEntity
import com.gurudosrestaurantes.data.local.entity.UserEntity

@Database(
    entities = [
        RestaurantEntity::class,
        UserEntity::class,
        ReviewEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
@TypeConverters(Converters::class)
abstract class GuruDatabase : RoomDatabase() {

    abstract fun restaurantDao(): RestaurantDao
    abstract fun userDao(): UserDao
    abstract fun reviewDao(): ReviewDao

    companion object {
        const val DATABASE_NAME = "guru.db"
    }
}
