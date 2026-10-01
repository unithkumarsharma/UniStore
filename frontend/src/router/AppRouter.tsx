import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StorefrontLayout } from '../layouts/StorefrontLayout';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { LoginPage } from '../pages/LoginPage';

// Code-split heavy routes to maximize initial page load speed
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const WishlistPage = lazy(() => import('../pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const SearchPage = lazy(() => import('../pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('../pages/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage })));
const OrderTrackingPage = lazy(() => import('../pages/OrderTrackingPage').then((m) => ({ default: m.OrderTrackingPage })));
const AccountPage = lazy(() => import('../pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const InfoPage = lazy(() => import('../pages/InfoPage').then((m) => ({ default: m.InfoPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const RouteLoading: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center text-secondary">
    <span className="material-symbols-outlined text-[32px] animate-spin mb-2">progress_activity</span>
    <p className="text-xs">Loading experience...</p>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<StorefrontLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="category/:slug" element={<ShopPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<AccountPage />} />
          <Route path="orders/:orderId" element={<OrderTrackingPage />} />
          <Route path="orders/:orderId/confirmation" element={<OrderConfirmationPage />} />
          <Route path="orders/:orderId/track" element={<OrderTrackingPage />} />
          <Route path="orders/track" element={<OrderTrackingPage />} />
          <Route path="account/*" element={<AccountPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<LoginPage />} />
          <Route path="admin/*" element={<AdminDashboardPage />} />
          <Route path="about" element={<InfoPage />} />
          <Route path="story" element={<InfoPage />} />
          <Route path="terms" element={<InfoPage />} />
          <Route path="privacy" element={<InfoPage />} />
          <Route path="careers" element={<InfoPage />} />
          <Route path="press" element={<InfoPage />} />
          <Route path="sustainability" element={<InfoPage />} />
          <Route path="cookies" element={<InfoPage />} />
          <Route path="sitemap" element={<InfoPage />} />
          <Route path="shipping" element={<InfoPage />} />
          <Route path="returns" element={<InfoPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
