import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { useCart } from '../store/CartContext';

/**
 * Initializes native mobile features (Status Bar, Splash Screen, Android Back Button)
 * when running inside Capacitor on iOS / Android.
 */
export function useCapacitorApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Configure Native Status Bar
    const configureStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#fbf9f5' });
      } catch (err) {
        console.warn('StatusBar configuration not supported:', err);
      }
    };

    // 2. Hide Splash Screen after initial load
    const hideSplash = async () => {
      try {
        await SplashScreen.hide({ fadeOutDuration: 300 });
      } catch (err) {
        console.warn('SplashScreen hide failed:', err);
      }
    };

    configureStatusBar();
    hideSplash();
  }, []);

  // 3. Android Hardware Back Button listener
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backButtonHandler = CapApp.addListener('backButton', ({ canGoBack }) => {
      // If Cart Drawer is open, close it first
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }

      // If user is not on home screen, navigate back in history
      if (location.pathname !== '/' && canGoBack) {
        navigate(-1);
        return;
      }

      // If at root of app, minimize/exit
      CapApp.exitApp();
    });

    return () => {
      backButtonHandler.then((handler) => handler.remove()).catch(() => {});
    };
  }, [location.pathname, isCartOpen, setIsCartOpen, navigate]);
}
