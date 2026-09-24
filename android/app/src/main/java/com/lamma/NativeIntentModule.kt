package com.lamma

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class NativeIntentModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "NativeIntent"

  @ReactMethod
  fun openUrlInPackage(url: String, packageName: String, promise: Promise) {
    try {
      val intent =
        Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
          setPackage(packageName)
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
      reactContext.startActivity(intent)
      promise.resolve(null)
    } catch (error: ActivityNotFoundException) {
      promise.reject("activity_not_found", error)
    } catch (error: Exception) {
      promise.reject("open_url_failed", error)
    }
  }

  @ReactMethod
  fun statFile(uri: String, promise: Promise) {
    try {
      val parsed = Uri.parse(uri)
      val path = if (parsed.scheme == "file") parsed.path else uri
      val file = if (path == null) null else File(path)
      val result =
        Arguments.createMap().apply {
          putBoolean("exists", file?.exists() == true)
          putDouble("size", file?.length()?.toDouble() ?: 0.0)
        }
      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("stat_file_failed", error)
    }
  }
}
