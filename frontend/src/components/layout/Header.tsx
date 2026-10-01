import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useWishlist } from '../../store/WishlistContext';
import { useAuth } from '../../store/AuthContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import type { Product } from '../../types';
import logoImg from '../../assets/logo.png';
import { AnnouncementBar } from './AnnouncementBar';
import { usePlatform } from '../../store/PlatformContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const { toggleAppMode } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Live Instant Search autocomplete
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    const all = api.getCachedProducts();
    const matches = all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q) ||
        p.category_slug?.toLowerCase().includes(q)
    ).slice(0, 5);
    setSearchResults(matches);
    setIsSearchOpen(true);
  }, [searchQuery]);

  // Click outside to close desktop search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile input when toggled open
  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [isMobileSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMobileSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isCurrentNav = (path: string, query?: string) => {
    if (query) {
      return location.pathname === path && location.search.includes(query);
    }
    return location.pathname === path && !location.search;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] safe-top transition-all">
      <AnnouncementBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Leading Brand Logo & Nav */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img 
              src={logoImg} 
              alt="UniStore — Discover More. Live Better." 
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>

          {/* Desktop Navigation Links with active pill highlight */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold tracking-wide">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                isCurrentNav('/')
                  ? 'bg-zinc-950 text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/shop"
              className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                isCurrentNav('/shop')
                  ? 'bg-zinc-950 text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              Shop All
            </Link>
            <Link
              to="/shop?category=tech-audio"
              className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                isCurrentNav('/shop', 'category=tech-audio')
                  ? 'bg-zinc-950 text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              Tech & Audio
            </Link>
            <Link
              to="/shop?category=home-living"
              className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                isCurrentNav('/shop', 'category=home-living')
                  ? 'bg-zinc-950 text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              Home & Living
            </Link>
            <Link
              to="/shop?category=coffee-kitchen"
              className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                isCurrentNav('/shop', 'category=coffee-kitchen')
                  ? 'bg-zinc-950 text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              Coffee & Kitchen
            </Link>
          </nav>
        </div>

        {/* Desktop Central Search Bar with Live Autocomplete */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative flex items-center bg-zinc-100/90 border border-zinc-200/90 rounded-full px-3.5 py-2 shadow-xs focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-950/10 transition-all">
              <span className="material-symbols-outlined text-zinc-500 text-[20px] mr-2">search</span>
              <input
                type="text"
                placeholder="Search products, brands, gear..."
                value={searchQuery}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm focus:ring-0 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-400 hover:text-zinc-700 mr-1 text-xs p-1"
                >
                  ✕
                </button>
              )}
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 bg-zinc-200/60 rounded">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Instant Search Results Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-2 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Instant Matches
              </div>
              <div className="divide-y divide-zinc-100">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                  >
                    <img
                      src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-100 flex-shrink-0 border border-zinc-200/50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-900 truncate group-hover:text-zinc-600 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {product.category_name || product.category_slug}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-zinc-950 tabular-nums">
                      {formatCurrency(product.base_price)}
                    </div>
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full mt-1.5 py-2 text-center text-xs font-bold text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                View all results for "{searchQuery}" →
              </button>
            </div>
          )}
        </div>

        {/* Trailing Action Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            aria-label="Toggle search"
            className="md:hidden p-2 rounded-full text-zinc-800 hover:bg-zinc-100 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isMobileSearchOpen ? 'close' : 'search'}
            </span>
          </button>

          {/* Switch to Amazon App Experience (Preview Toggle) */}
          <button
            type="button"
            onClick={toggleAppMode}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[11px] font-bold transition shadow-2xs border border-zinc-200 active:scale-95"
            title="Preview Amazon Mobile App View"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-600">smartphone</span>
            <span>App Mode</span>
          </button>

          {/* Wishlist Button */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative p-2 rounded-full text-zinc-800 hover:bg-zinc-100 transition-colors duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-950 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
            className="relative p-2 rounded-full text-zinc-800 hover:bg-zinc-100 transition-colors duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {totalItemCount > 0 && (
              <span className="absolute top-1 right-1 bg-zinc-950 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Account menu"
              className="flex items-center gap-1 p-1 rounded-full text-zinc-800 hover:bg-zinc-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-xs border border-zinc-200">
                {user ? user.full_name.charAt(0).toUpperCase() : <span className="material-symbols-outlined text-[18px]">person</span>}
              </div>
              <span className="material-symbols-outlined text-zinc-400 text-[18px] hidden sm:inline">expand_more</span>
            </button>

            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowUserMenu(false)}
              >
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                      <div className="font-bold text-sm text-zinc-900 truncate">{user.full_name}</div>
                      <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {user.role}
                      </span>
                    </div>

                    <Link to="/account" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 rounded-xl hover:bg-zinc-100 transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-zinc-400">person</span>
                      My Account & Profile
                    </Link>

                    <Link to="/account" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 rounded-xl hover:bg-zinc-100 transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-zinc-400">package_2</span>
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-900 font-bold rounded-xl hover:bg-zinc-100 transition-colors">
                        <span className="material-symbols-outlined text-[18px] text-amber-500">admin_panel_settings</span>
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-zinc-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-zinc-950 rounded-xl hover:bg-zinc-100 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      Sign In / Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Search Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden border-t border-zinc-200/80 bg-white/95 px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center bg-zinc-100 rounded-full px-3.5 py-2 border border-zinc-200 focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-900/10">
              <span className="material-symbols-outlined text-zinc-500 text-[20px] mr-2">search</span>
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Search products, brands, gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-zinc-900 placeholder:text-zinc-400 text-xs focus:ring-0 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-400 hover:text-zinc-700 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Mobile Instant Matches */}
          {searchResults.length > 0 && (
            <div className="mt-2 divide-y divide-zinc-100 bg-white rounded-xl border border-zinc-200 shadow-md overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 p-2.5 hover:bg-zinc-50 transition-colors"
                >
                  <img
                    src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                    alt={product.name}
                    className="w-9 h-9 rounded-lg object-cover bg-zinc-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {product.category_name || product.category_slug}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-zinc-900 tabular-nums">
                    {formatCurrency(product.base_price)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
