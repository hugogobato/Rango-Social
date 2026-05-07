package com.gurudosrestaurantes.presentation.share

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

/**
 * Persists a captured share card to the app's cache and builds the
 * `ACTION_SEND` intent that hands the PNG to Instagram / WhatsApp / Stories.
 *
 * Cache dir is wiped lazily — each share overwrites a deterministic filename
 * per review, so we don't pile up garbage if the user shares the same card
 * twice.
 */
object ShareCardSaver {

    private const val AUTHORITY_SUFFIX = ".fileprovider"
    private const val SHARE_DIR = "shares"

    /** Writes [bitmap] to a PNG and returns an `ACTION_SEND` intent ready for `startActivity`. */
    fun saveAndBuildIntent(context: Context, bitmap: ImageBitmap, fileName: String): Intent {
        val file = writePng(context, bitmap.asAndroidBitmap(), fileName)
        val uri = FileProvider.getUriForFile(
            context,
            context.packageName + AUTHORITY_SUFFIX,
            file,
        )
        return Intent(Intent.ACTION_SEND).apply {
            type = "image/png"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
    }

    private fun writePng(context: Context, bitmap: Bitmap, fileName: String): File {
        val dir = File(context.cacheDir, SHARE_DIR).apply { mkdirs() }
        val file = File(dir, "$fileName.png")
        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
        return file
    }
}
