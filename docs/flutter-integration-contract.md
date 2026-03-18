# Flutter ↔ Web Integration Contract

## Overview

This document defines the complete integration contract between the React web app (running inside a WebView) and the Flutter host app. Both sides MUST follow this contract exactly.

---

## 1. Safe Area CSS Variables

Flutter injects safe area insets into the WebView as CSS custom properties on `:root`.

### Variables

| CSS Variable            | Description                        | Set by      |
|-------------------------|------------------------------------|-------------|
| `--flutter-safe-top`    | Top safe area (status bar)         | Flutter     |
| `--flutter-safe-bottom` | Bottom safe area (home indicator)  | Flutter     |
| `--flutter-safe-left`   | Left safe area (landscape notch)   | Flutter     |
| `--flutter-safe-right`  | Right safe area (landscape notch)  | Flutter     |

### Web resolves them as:

```css
--safe-top: max(env(safe-area-inset-top, 0px), var(--flutter-safe-top, 0px));
--safe-bottom: max(env(safe-area-inset-bottom, 0px), var(--flutter-safe-bottom, 0px));
--safe-left: max(env(safe-area-inset-left, 0px), var(--flutter-safe-left, 0px));
--safe-right: max(env(safe-area-inset-right, 0px), var(--flutter-safe-right, 0px));
```

### Injection method (Flutter → WebView):

```dart
webViewController.runJavaScript('''
  document.documentElement.style.setProperty('--flutter-safe-top', '${padding.top}px');
  document.documentElement.style.setProperty('--flutter-safe-bottom', '${padding.bottom}px');
  document.documentElement.style.setProperty('--flutter-safe-left', '${padding.left}px');
  document.documentElement.style.setProperty('--flutter-safe-right', '${padding.right}px');
''');
```

---

## 2. Web Layout Architecture

```
┌─────────────── html/body/#root (height:100%, overflow:hidden) ───┐
│  ┌─── AppShell (flex:1, relative, overflow:hidden) ────────────┐  │
│  │  ┌─── <main> scroll area (flex:1, overflow-y:auto) ───────┐ │  │
│  │  │  padding-top: var(--safe-top)                          │ │  │
│  │  │  padding-left: var(--safe-left)                        │ │  │
│  │  │  padding-right: var(--safe-right)                      │ │  │
│  │  │  [page content scrolls here]                           │ │  │
│  │  │  padding-bottom: var(--safe-bottom) + 80px (nav)       │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │  ┌─── BottomNav (absolute, bottom:0, w-full) ────────────┐ │  │
│  │  │  padding-bottom: var(--safe-bottom)                    │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Critical rules:
- NO `position: fixed` anywhere
- NO `100vh`
- NO JS keyboard detection
- NO viewport resize dependency
- All positioning is `absolute` within the flex container

---

## 3. Flutter Requirements

| Requirement | Value |
|---|---|
| SystemUI mode | `SystemUiMode.edgeToEdge` |
| Status bar | Transparent |
| Nav bar | Transparent |
| `resizeToAvoidBottomInset` | `false` |
| Android `windowSoftInputMode` | `adjustPan` |
| WebView wrapper | NO `SafeArea`, NO padding |
| WebView sizing | Fill entire screen |

---

## 4. Keyboard Handling

The keyboard MUST NOT resize the WebView. This is achieved by:
1. `Scaffold(resizeToAvoidBottomInset: false)` — prevents Flutter from resizing
2. `android:windowSoftInputMode="adjustPan"` — Android pans instead of resizing
3. Web uses NO JS keyboard detection — the layout is static

---

## 5. Future Extensions (JS ↔ Flutter Channel)

For future features, use `JavaScriptChannel`:

```dart
JavaScriptChannel(
  name: 'FlutterBridge',
  onMessageReceived: (message) {
    // Handle messages from web
  },
)
```

Web sends messages via:
```js
window.FlutterBridge?.postMessage(JSON.stringify({ type: 'action', payload: {} }));
```
