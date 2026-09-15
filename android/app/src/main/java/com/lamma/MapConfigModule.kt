package com.lamma

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

class MapConfigModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "MapConfig"

  override fun getConstants(): Map<String, Any> =
    mapOf("isGoogleMapsConfigured" to BuildConfig.GOOGLE_MAPS_CONFIGURED)
}
