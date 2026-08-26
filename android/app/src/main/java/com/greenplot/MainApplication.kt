package com.greenplot

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.hotupdater.HotUpdater

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
      // HotUpdater.getJSBundleFile() returns the latest downloaded OTA bundle
      // if one exists, falling back to null (the .apk's own bundle) in debug
      // builds or when nothing has been downloaded yet.
      jsBundleFilePath =
        if (BuildConfig.DEBUG) {
          null
        } else {
          HotUpdater.getJSBundleFile(applicationContext)
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
