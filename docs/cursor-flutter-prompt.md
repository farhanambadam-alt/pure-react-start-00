# Cursor AI Prompt — Flutter WebView Host App

> Copy-paste this entire prompt into Cursor AI to generate the Flutter app that hosts the React web app.

---

## Context

You are building a Flutter app that displays a React web app inside a WebView. The web app handles ALL UI rendering including safe areas and navigation. The Flutter app is a thin shell that:

1. Runs the WebView fullscreen edge-to-edge
2. Injects safe area values as CSS variables
3. Prevents keyboard from resizing the WebView

The web app URL is: `https://YOUR_WEB_APP_URL_HERE`

---

## Requirements

### 1. Project Setup

Create a Flutter project with these dependencies in `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.10.0
  webview_flutter_android: ^3.16.0
  webview_flutter_wkwebview: ^3.16.0
```

### 2. Android Configuration

#### `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:label="Salon App"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:taskAffinity=""
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustPan">

            <meta-data
                android:name="io.flutter.embedding.android.NormalTheme"
                android:resource="@style/NormalTheme" />

            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>
```

**CRITICAL**: `android:windowSoftInputMode="adjustPan"` prevents the keyboard from resizing the WebView.

#### `android/app/build.gradle`

Set `minSdkVersion` to 21 or higher:

```gradle
android {
    compileSdk = flutter.compileSdkVersion

    defaultConfig {
        applicationId = "com.example.salonapp"
        minSdk = 21
        targetSdk = flutter.targetSdkVersion
        versionCode = 1
        versionName = "1.0"
    }
}
```

### 3. iOS Configuration

#### `ios/Runner/Info.plist`

Ensure these keys exist:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
<key>io.flutter.embedded_views_preview</key>
<true/>
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
```

### 4. Main Dart Code

#### `lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

const String kWebAppUrl = 'https://YOUR_WEB_APP_URL_HERE';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Edge-to-edge: transparent system bars
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: Colors.transparent,
    systemNavigationBarIconBrightness: Brightness.dark,
    systemNavigationBarDividerColor: Colors.transparent,
  ));
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

  runApp(const SalonApp());
}

class SalonApp extends StatelessWidget {
  const SalonApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Salon App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isReady = false;

  @override
  void initState() {
    super.initState();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.transparent)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) {
            _injectSafeArea();
            if (!_isReady) {
              setState(() => _isReady = true);
            }
          },
        ),
      )
      ..addJavaScriptChannel(
        'FlutterBridge',
        onMessageReceived: (JavaScriptMessage message) {
          debugPrint('FlutterBridge message: ${message.message}');
          // Handle messages from web app here
        },
      )
      ..loadRequest(Uri.parse(kWebAppUrl));
  }

  void _injectSafeArea() {
    final padding = MediaQuery.of(context).padding;
    _controller.runJavaScript('''
      (function() {
        var root = document.documentElement;
        root.style.setProperty('--flutter-safe-top', '${padding.top}px');
        root.style.setProperty('--flutter-safe-bottom', '${padding.bottom}px');
        root.style.setProperty('--flutter-safe-left', '${padding.left}px');
        root.style.setProperty('--flutter-safe-right', '${padding.right}px');
      })();
    ''');
  }

  @override
  Widget build(BuildContext context) {
    // CRITICAL: resizeToAvoidBottomInset: false prevents keyboard resize
    // CRITICAL: No SafeArea wrapper — web handles safe areas via CSS
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          // WebView fills the ENTIRE screen, no padding, no SafeArea
          Positioned.fill(
            child: WebViewWidget(controller: _controller),
          ),

          // Optional: loading indicator while web app loads
          if (!_isReady)
            const Positioned.fill(
              child: ColoredBox(
                color: Colors.white,
                child: Center(
                  child: CircularProgressIndicator(),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
```

### 5. Critical Rules Summary

| Rule | Implementation |
|------|---------------|
| **NO SafeArea wrapper** | WebView fills entire screen; web handles safe areas |
| **NO padding on WebView** | `Positioned.fill` with no margins |
| **Keyboard doesn't resize** | `resizeToAvoidBottomInset: false` + `adjustPan` |
| **Edge-to-edge** | `SystemUiMode.edgeToEdge` + transparent bars |
| **Safe area injection** | CSS variables injected on `onPageFinished` |
| **No flicker** | Loading overlay until web app is ready |

### 6. How It Works

1. Flutter renders WebView fullscreen with transparent system bars
2. On page load, Flutter reads `MediaQuery.of(context).padding` (device safe areas)
3. Flutter injects these as `--flutter-safe-top`, `--flutter-safe-bottom`, etc. via JavaScript
4. Web app's CSS resolves: `--safe-top: max(env(safe-area-inset-top), var(--flutter-safe-top))`
5. Web layout uses these variables for padding — no `position: fixed`, no `100vh`
6. Keyboard opens → Android pans (doesn't resize) → WebView stays stable → no nav movement

### 7. Testing Checklist

- [ ] Status bar content is visible and not overlapped
- [ ] Bottom navigation sits above the home indicator
- [ ] Content scrolls behind status bar area
- [ ] Keyboard opens without moving the bottom navigation
- [ ] No white flash or flicker on load
- [ ] Landscape mode respects left/right safe areas
- [ ] Back button/gesture works correctly
- [ ] Pull-to-refresh is disabled (no overscroll bounce)
