# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in $ANDROID_HOME/tools/proguard/proguard-android.txt

# Kotlinx Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keep,includedescriptorclasses class com.gurudosrestaurantes.**$$serializer { *; }
-keepclassmembers class com.gurudosrestaurantes.** {
    *** Companion;
}
-keepclasseswithmembers class com.gurudosrestaurantes.** {
    kotlinx.serialization.KSerializer serializer(...);
}
