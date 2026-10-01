import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useWishlist } from '../store/WishlistContext';
import { usePlatform } from '../store/PlatformContext';
import { hapticFeedback } from '../utils/haptics';

export const AppYouPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { setIsUniPayOpen } = usePlatform();
  const navigate = useNavigate();

  const userName = user?.full_name?.split(' ')[0] || 'Arjun';

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 select-none">
      {/* Top Profile Header */}
      <div className="bg-white border-b border-zinc-200/80 px-4 pt-4 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-lg shadow-sm">
              {userName[0]}
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-medium">Welcome back,</span>
              <h1 className="text-lg font-black text-zinc-950 tracking-tight">
                Hello, {userName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded-full font-semibold border border-zinc-200">
              🇮🇳 EN
            </span>
          </div>
        </div>

        {/* 4 Iconic Amazon Quick-Action Pills */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <Link
            to="/orders/UNI-839210/track"
            onClick={() => hapticFeedback.light()}
            className="py-3 px-4 rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-center text-xs font-bold text-zinc-900 transition active:scale-95 shadow-2xs"
          >
            Your Orders
          </Link>
          <Link
            to="/shop"
            onClick={() => hapticFeedback.light()}
            className="py-3 px-4 rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-center text-xs font-bold text-zinc-900 transition active:scale-95 shadow-2xs"
          >
            Buy Again
          </Link>
          <Link
            to="/account"
            onClick={() => hapticFeedback.light()}
            className="py-3 px-4 rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-center text-xs font-bold text-zinc-900 transition active:scale-95 shadow-2xs"
          >
            Your Account
          </Link>
          <Link
            to="/wishlist"
            onClick={() => hapticFeedback.light()}
            className="py-3 px-4 rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-center text-xs font-bold text-zinc-900 transition active:scale-95 shadow-2xs"
          >
            Your Wishlist ({wishlistCount})
          </Link>
        </div>
      </div>

      {/* Recent Order Status Card */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Recent Delivery Update
          </h2>
          <Link to="/orders/UNI-839210/track" className="text-xs font-bold text-blue-600">
            See all
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900">Order #UNI-839210</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Out for Delivery
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-zinc-600 text-[24px]">headphones</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-800 line-clamp-1">
                Acoustic Elite Active ANC Headphones
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Arriving Today by 4:00 PM via Bluedart
              </p>
            </div>
          </div>

          <Link
            to="/orders/UNI-839210/track"
            onClick={() => hapticFeedback.light()}
            className="w-full py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">location_searching</span>
            <span>Track Delivery Live</span>
          </Link>
        </div>
      </div>

      {/* UniPay Quick Widget */}
      <div className="px-4 pb-2">
        <div
          onClick={() => {
            hapticFeedback.light();
            setIsUniPayOpen(true);
          }}
          className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-900 text-white rounded-2xl p-4 border border-emerald-800/40 shadow-xs cursor-pointer active:scale-95 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[22px]">
                account_balance_wallet
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                UniPay Wallet
              </span>
            </div>
            <span className="text-xs font-mono font-black text-white">₹1,500.00</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Tap to scan UPI QR, pay bills, or view earned cashbacks.
          </p>
        </div>
      </div>

      {/* Account Settings & App Shortcuts */}
      <div className="p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
          Account & App Settings
        </h2>

        <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100 shadow-2xs overflow-hidden">
          <Link
            to="/account"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-600 text-[20px]">pin_drop</span>
              <span className="text-xs font-semibold text-zinc-900">Manage Addresses</span>
            </div>
            <span className="material-symbols-outlined text-zinc-400 text-[18px]">chevron_right</span>
          </Link>

          <Link
            to="/account"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-600 text-[20px]">credit_card</span>
              <span className="text-xs font-semibold text-zinc-900">Payment Methods & UPI</span>
            </div>
            <span className="material-symbols-outlined text-zinc-400 text-[18px]">chevron_right</span>
          </Link>

          <a
            href="mailto:support@unistore.com"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-600 text-[20px]">headset_mic</span>
              <span className="text-xs font-semibold text-zinc-900">24/7 Customer Care</span>
            </div>
            <span className="material-symbols-outlined text-zinc-400 text-[18px]">chevron_right</span>
          </a>

          <div
            onClick={() => {
              hapticFeedback.light();
              logout();
              navigate('/');
            }}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-rose-50 text-rose-600 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-xs font-bold">Sign Out</span>
            </div>
          </div>
        </div>

        {/* Native App Footer Note */}
        <div className="text-center pt-6 text-[10px] text-zinc-400 space-y-1">
          <p className="font-bold text-zinc-600">UniStore Android App • v2.4.1</p>
          <p>© 2026 UniStore Retail Private Limited</p>
        </div>
      </div>
    </div>
  );
};
