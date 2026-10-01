import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlatform } from '../../store/PlatformContext';
import { useCart } from '../../store/CartContext';
import { useWishlist } from '../../store/WishlistContext';
import { hapticFeedback } from '../../utils/haptics';
import logoImg from '../../assets/logo.png';

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { isNative, toggleAppMode, setIsVoiceSearchOpen, setIsLensOpen } = usePlatform();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      hapticFeedback.light();
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] select-none safe-top transition-all">
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0" onClick={() => hapticFeedback.light()}>
          <img src={logoImg} alt="UniStore" className="h-7 w-auto object-contain" />
        </Link>

        {/* Minimal Search Pill */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex items-center bg-zinc-100/80 rounded-full px-3 py-1.5 border border-zinc-200/60 focus-within:border-zinc-950 focus-within:bg-white transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-[18px] text-zinc-400 mr-2 shrink-0">
            search
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search curated products..."
            className="flex-1 bg-transparent text-xs font-medium placeholder:text-zinc-400 border-none outline-none focus:ring-0 p-0 text-zinc-900"
          />

          <button
            type="button"
            onClick={() => {
              hapticFeedback.light();
              setIsVoiceSearchOpen(true);
            }}
            className="p-0.5 text-zinc-400 hover:text-zinc-900 transition"
            title="Voice Search"
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
          </button>

          <button
            type="button"
            onClick={() => {
              hapticFeedback.light();
              setIsLensOpen(true);
            }}
            className="p-0.5 pl-1.5 text-zinc-400 hover:text-zinc-900 transition"
            title="Visual Search"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          </button>
        </form>

        {/* Quick Actions (Wishlist & Cart) */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/wishlist"
            onClick={() => hapticFeedback.light()}
            className="relative p-1.5 text-zinc-700 hover:text-zinc-950 active:scale-95 transition"
            aria-label="Wishlist"
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-zinc-950 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => {
              hapticFeedback.light();
              setIsCartOpen(true);
            }}
            className="relative p-1.5 text-zinc-700 hover:text-zinc-950 active:scale-95 transition"
            aria-label="Shopping Bag"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            {totalItemCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-zinc-950 text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* Desktop Preview Switcher */}
          {!isNative && (
            <button
              type="button"
              onClick={toggleAppMode}
              className="hidden lg:flex ml-1 px-2 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold items-center gap-1 border border-zinc-200"
              title="Switch to Web Mode"
            >
              <span className="material-symbols-outlined text-[13px]">desktop_windows</span>
              <span>Web</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
