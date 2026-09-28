# 🛍️ UniStore — Modern Full-Stack E-Commerce Platform & Mobile App

<p align="center">
  <img src="frontend/public/logo.png" alt="UniStore Logo" width="120" style="border-radius: 24px;" />
</p>

<p align="center">
  A premium, high-performance cross-platform e-commerce ecosystem built for modern shopping experiences across Web, Android, and iOS.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646cff?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Capacitor-8.5-119EFF?style=flat-square&logo=capacitor" alt="Capacitor" />
  <img src="https://img.shields.io/badge/Flask-Python%203.9+-000000?style=flat-square&logo=flask" alt="Flask" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
</p>

---

## ✨ Features

- **🎨 Modern Luxury Storefront**: Curated typography, fluid animations, dynamic product cards, quick view modals, and interactive "Shop The Look" highlights.
- **📱 Native Mobile Ready**: Powered by Capacitor 8 with haptics feedback, native status bar control, splash screen, and Android/iOS native wrappers.
- **⚡ Zero-Latency Caching**: Client-side memory caching and instant optimistic rendering for smooth browsing.
- **🔐 Multi-Cloud Authentication**: Firebase Auth integrated alongside custom JWT session handling.
- **🗄️ Relational Cloud Database**: Supabase PostgreSQL database architecture with connection pooling, migrations, and seed pipelines.
- **💳 Multi-Gateway Ready**: Razorpay payment integration with webhook validation and order receipt generation.
- **📦 Comprehensive Order & Cart Management**: Real-time cart updates, coupon engine, dynamic shipping calculations, and live order tracking.
- **📊 Admin Portal**: Inventory controls, category management, order lifecycle management, and database backup controls.

---

## 🏗️ Architecture

```
UniStore/
├── backend/                  # Flask RESTful API & Supabase integration
│   ├── app/                  # Application blueprints (auth, products, orders, cart, etc.)
│   ├── config/               # Environment & configuration modules
│   ├── migrations/           # PostgreSQL schema migration scripts
│   ├── run.py                # Server entry point (0.0.0.0:5001)
│   └── seed.py               # Database seeder
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/                  # Components, pages, contexts, router, services
│   ├── android/              # Native Android project (Capacitor)
│   ├── ios/                  # Native iOS project (Capacitor Xcode project)
│   ├── capacitor.config.ts   # Mobile configuration
│   └── vite.config.ts        # Vite build configuration
├── docs/                     # Documentation & design specifications
├── shared/                   # Shared TypeScript models and constants
└── .env.example              # Environment variables template
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.9+)
- (Optional for Android) Android Studio & JDK 17+
- (Optional for iOS) macOS with Xcode 15+

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment & activate
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env with your Supabase, Razorpay, and Firebase credentials

# Start the Flask API server
python run.py
```
> The API server will start on `http://localhost:5001` (accessible locally and over LAN on `0.0.0.0`).

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set your VITE_API_URL and Supabase/Firebase credentials

# Start development server
npm run dev
```
> Open `http://localhost:5173` in your browser.

---

## 📱 Mobile App Development (Capacitor)

### Android
```bash
cd frontend

# Build frontend & sync native bridge
npm run cap:sync

# Open in Android Studio
npm run cap:android

# Or assemble debug APK directly
cd android && ./gradlew assembleDebug
```

### iOS
```bash
cd frontend

# Sync native assets
npm run cap:sync

# Open Xcode
npm run cap:ios
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
