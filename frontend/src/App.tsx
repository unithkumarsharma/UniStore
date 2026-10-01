import React, { useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';
import { AuthProvider } from './store/AuthContext';
import { CartProvider } from './store/CartContext';
import { WishlistProvider } from './store/WishlistContext';
import { AppRouter } from './router/AppRouter';

const NativeAppLifecycle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Hide splash screen gracefully after first paint
    SplashScreen.hide().catch(() => {});

    // 2. Configure native Status Bar
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

    // 3. Handle Android Hardware Back Button navigation
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/' || !canGoBack) {
        CapApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      backListener.then((h) => h.remove()).catch(() => {});
    };
  }, [navigate, location.pathname]);

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <NativeAppLifecycle>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <AppRouter />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </NativeAppLifecycle>
    </BrowserRouter>
  );
}

export default App;
