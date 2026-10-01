import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { MobileNavDock } from '../components/layout/MobileNavDock';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';
import { BackToTop } from '../components/common/BackToTop';

import { useCapacitorApp } from '../hooks/useCapacitorApp';

export const StorefrontLayout: React.FC = () => {
  useCapacitorApp();

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      <Header />
      <main className="flex-grow pt-[calc(5.75rem+env(safe-area-inset-top,0px))] sm:pt-[calc(6rem+env(safe-area-inset-top,0px))] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNavDock />
      <CartDrawer />
      <BackToTop />
    </div>
  );
};
