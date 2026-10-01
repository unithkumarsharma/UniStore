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
import { LocationPickerSheet } from '../components/app/LocationPickerSheet';
import { UniPaySheet } from '../components/app/UniPaySheet';
import { usePlatform } from '../store/PlatformContext';
import { useCapacitorApp } from '../hooks/useCapacitorApp';

export const StorefrontLayout: React.FC = () => {
  useCapacitorApp();
  const { isAppMode } = usePlatform();

  if (isAppMode) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-950 antialiased font-sans select-none">
        {/* Amazon-style Native App Header with Search, Lens, Mic, and Delivery Location */}
        <AppHeader />

        {/* Content padded for App Header and Bottom Nav Dock */}
        <main className="flex-grow pt-[calc(5.2rem+env(safe-area-inset-top,0px))] pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]">
          <Outlet />
        </main>

        {/* Amazon-style 5-Tab Bottom Dock (Home, Categories, UniPay, You, Cart) */}
        <AppBottomNav />

        {/* Native App Sheets & Modals */}
        <VoiceSearchModal />
        <VisualLensModal />
        <LocationPickerSheet />
        <UniPaySheet />

        <CartDrawer />
      </div>
    );
  }

  // Desktop / Web Mode (Amazon Web layout with Announcement bar, Mega links, 4-column footer)
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
