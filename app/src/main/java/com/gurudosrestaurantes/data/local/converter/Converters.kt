package com.gurudosrestaurantes.data.local.converter

import androidx.room.TypeConverter
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json

/**
 * Room type converters. Centralised so all entities reuse the same JSON format.
 */
class Converters {

    private val json = Json { ignoreUnknownKeys = true }

    @TypeConverter
    fun fromInstant(value: Instant?): Long? = value?.toEpochMilliseconds()

    @TypeConverter
    fun toInstant(value: Long?): Instant? = value?.let { Instant.fromEpochMilliseconds(it) }

    @TypeConverter
    fun fromLocalDate(value: LocalDate?): String? = value?.toString()

    @TypeConverter
    fun toLocalDate(value: String?): LocalDate? = value?.let { LocalDate.parse(it) }

    @TypeConverter
    fun fromStringList(value: List<String>?): String? =
        value?.let { json.encodeToString(ListSerializer(String.serializer()), it) }

    @TypeConverter
    fun toStringList(value: String?): List<String>? =
        value?.let { json.decodeFromString(ListSerializer(String.serializer()), it) }

    @TypeConverter
    fun fromStringFloatMap(value: Map<String, Float>?): String? = value?.let {
        json.encodeToString(MapSerializer(String.serializer(), Float.serializer()), it)
    }

    @TypeConverter
    fun toStringFloatMap(value: String?): Map<String, Float>? = value?.let {
        json.decodeFromString(MapSerializer(String.serializer(), Float.serializer()), it)
    }

    @TypeConverter
    fun fromStringIntMap(value: Map<String, Int>?): String? = value?.let {
        json.encodeToString(MapSerializer(String.serializer(), Int.serializer()), it)
    }

    @TypeConverter
    fun toStringIntMap(value: String?): Map<String, Int>? = value?.let {
        json.decodeFromString(MapSerializer(String.serializer(), Int.serializer()), it)
    }
}
