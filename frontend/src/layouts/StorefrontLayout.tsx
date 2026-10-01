import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { AppHeader } from '../components/layout/AppHeader';
import { AppBottomNav } from '../components/layout/AppBottomNav';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';
import { BackToTop } from '../components/common/BackToTop';
import { VoiceSearchModal } from '../components/app/VoiceSearchModal';
import { VisualLensModal } from '../components/app/VisualLensModal';
import { usePlatform } from '../store/PlatformContext';
import { useCapacitorApp } from '../hooks/useCapacitorApp';

export const StorefrontLayout: React.FC = () => {
  useCapacitorApp();
  const { isAppMode } = usePlatform();

  // ── Native Mobile App Experience (Android APK & Mobile View) ──────────────
  if (isAppMode) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-950 antialiased font-sans select-none">
        {/* Minimalist Mobile App Header */}
        <AppHeader />

        {/* Content padded for App Top Bar & Bottom Dock */}
        <main className="flex-grow pt-[calc(3.75rem+env(safe-area-inset-top,0px))] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]">
          <Outlet />
        </main>

        {/* Tactile Native Bottom Dock (Discover, Shop, Wishlist, Bag, Account) */}
        <AppBottomNav />

        {/* Native Mobile Voice & Lens Overlays */}
        <VoiceSearchModal />
        <VisualLensModal />

        <CartDrawer />
      </div>
    );
  }

  // ── Luxury Desktop Web Experience (Browser View) ──────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      <Header />
      <main className="flex-grow pt-[calc(5.75rem+env(safe-area-inset-top,0px))] sm:pt-[calc(6rem+env(safe-area-inset-top,0px))] pb-0">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <BackToTop />
    </div>
  );
};
