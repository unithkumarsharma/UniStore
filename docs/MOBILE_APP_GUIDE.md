# UniStore — Cross-Platform Web & Mobile App Guide (Android & iOS)

UniStore is configured as a **single-codebase cross-platform application**. A single React + TypeScript + Vite codebase powers:
- **Web App**: Runs in any modern desktop & mobile browser (with PWA installability).
- **Android App**: Native Android Studio project producing APK/AAB for Google Play Store.
- **iOS App**: Native Xcode project producing IPA for Apple App Store / TestFlight.
- **Unified Backend**: Powered by the Python Flask REST API (`backend/`).

---

## 🚀 Quick Commands Cheat Sheet

Inside the `frontend/` directory:

| Command | Description |
|---|---|
| `npm run dev` | Start the Web development server (`http://localhost:5173`) |
| `npm run build` | Build the production web bundle into `dist/` |
| `npm run cap:sync` | **Build & Sync** web updates to Android and iOS projects |
| `npm run cap:android` | Open the native project in **Android Studio** |
| `npm run cap:ios` | Open the native project in **Xcode** (macOS) |
| `npm run cap:run:android` | Build and run directly on a connected Android device/emulator |
| `npm run cap:run:ios` | Build and run directly on an iOS simulator |

---

## 1. Web Development & Testing

Run the standard Vite development server:
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### PWA (Install on Mobile Browser)
When visited on Safari (iOS) or Chrome (Android), users can tap **"Add to Home Screen"** or **"Install App"** to run UniStore in standalone full-screen mode like a native app.

---

## 2. Android App (Android Studio & APK)

### Prerequisites:
- [Android Studio](https://developer.android.com/studio) installed.
- Android SDK & Command-line Tools installed.

### Step-by-Step:
1. **Sync latest code changes**:
   ```bash
   cd frontend
   npm run cap:sync
   ```
2. **Open in Android Studio**:
   ```bash
   npm run cap:android
   ```
3. **Build APK in Android Studio**:
   - Go to top menu: `Build` ➔ `Build Bundle(s) / APK(s)` ➔ `Build APK(s)`.
   - Once built, click **"locate"** in the bottom-right notification to get the `app-debug.apk`.
   - Send this APK to any Android phone to install and test!
4. **Run on Emulator or Real Phone**:
   - Plug in your Android phone with USB Debugging enabled (or start an Android Virtual Device emulator).
   - Press the green **▶ Run** button in Android Studio.

### API Connectivity on Android:
- **Android Emulator**: In Android Emulator, `localhost` points to the emulator itself. To connect to your local Flask backend, set `VITE_API_URL=http://10.0.2.2:5001/api` in `frontend/.env`.
- **Physical Phone**: Connect phone and computer to the same Wi-Fi, and set `VITE_API_URL=http://<YOUR_COMPUTER_IP>:5001/api` (e.g. `http://192.168.1.15:5001/api`).

---

## 3. iOS App (Xcode & iPhone)

### Prerequisites:
- macOS with [Xcode](https://developer.apple.com/xcode/) installed (from Mac App Store).

### Step-by-Step:
1. **Sync latest code changes**:
   ```bash
   cd frontend
   npm run cap:sync
   ```
2. **Open in Xcode**:
   ```bash
   npm run cap:ios
   ```
3. **Run on Simulator or iPhone**:
   - In Xcode, select your target simulator (e.g., iPhone 16 Pro) or your connected physical iPhone.
   - Click the **▶ Run** button.

---

## 4. Mobile Features Implemented

1. **Hardware Back Button Navigation (Android)**:
   - If the Cart Drawer is open, pressing the back button closes it.
   - If browsing sub-pages (`/shop`, `/products/:slug`, `/checkout`), it navigates back in history.
   - If on the Home screen (`/`), it gracefully minimizes/exits the app.
2. **Tactile Haptic Feedback**:
   - Native vibration feedback on "Add to Cart", adjusting item quantities, and switching bottom navigation tabs.
3. **Status Bar & Theming**:
   - Status bar styled to seamlessly blend with UniStore's warm `#fbf9f5` editorial aesthetic with dark readable icons.
4. **Edge-to-Edge Safe Area Insets**:
   - Optimized with `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` so camera notches, Dynamic Island, and home swipe bars never collide with the header or `MobileNavDock`.
5. **App Manifest & Standalone Mode**:
   - High-resolution icons and splash configuration included.

---

## 5. Daily Development Workflow

Whenever you change UI components or pages in `frontend/src`:

```bash
# 1. Test your changes instantly in the browser
npm run dev

# 2. When ready to update the mobile app
npm run cap:sync
```

Both Android Studio and Xcode will instantly reflect your latest changes without having to rewrite any code!
