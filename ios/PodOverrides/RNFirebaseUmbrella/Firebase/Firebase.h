#pragma once

#import <FirebaseCore/FirebaseCore.h>

#if !defined(__has_include)
#error "Firebase.h won't import anything if your compiler doesn't support __has_include. Please import the Firebase headers individually."
#else
#if __has_include(<FirebaseAnalytics/FirebaseAnalytics.h>)
#import <FirebaseAnalytics/FirebaseAnalytics.h>
#endif

#if __has_include(<FirebaseAppCheck/FirebaseAppCheck.h>)
#import <FirebaseAppCheck/FirebaseAppCheck.h>
#endif

#if __has_include(<FirebaseAuth/FirebaseAuth.h>)
#import <FirebaseAuth/FirebaseAuth.h>
#if __has_include(<UIKit/UIKit.h>)
#import <UIKit/UIKit.h>
#endif
#if __has_include(<FirebaseAuthInterop/FIRAuthInterop.h>)
#import <FirebaseAuthInterop/FIRAuthInterop.h>
#endif
#if __has_feature(modules)
@import FirebaseAuth.Swift;
#endif
#endif

#if __has_include(<FirebaseCrashlytics/FirebaseCrashlytics.h>)
#import <FirebaseCrashlytics/FirebaseCrashlytics.h>
#endif

#if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)
#import <FirebaseFirestore/FirebaseFirestore.h>
#endif

#if __has_include(<FirebaseInstallations/FirebaseInstallations.h>)
#import <FirebaseInstallations/FirebaseInstallations.h>
#endif

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import <FirebaseMessaging/FirebaseMessaging.h>
#endif

#if __has_include(<FirebaseRemoteConfig/FirebaseRemoteConfig.h>)
#import <FirebaseRemoteConfig/FirebaseRemoteConfig.h>
#endif

#endif
