import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlatform } from '../../store/PlatformContext';
import { useCart } from '../../store/CartContext';
import { useWishlist } from '../../store/WishlistContext';
import { hapticFeedback } from '../../utils/haptics';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import type { Product } from '../../types';
import logoImg from '../../assets/logo.png';

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { isNative, toggleAppMode, setIsVoiceSearchOpen, setIsLensOpen } = usePlatform();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchInput, setSearchInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trendingSearches = [
    'Wireless Headphones',
    'Ergonomic Chair',
    'Aroma Diffuser',
    'Desk Mat',
    'Espresso Machine',
  ];

  const quickCategories = [
    { label: 'Audio', slug: 'tech-audio', icon: 'headphones' },
    { label: 'Desk Setup', slug: 'desk-setup', icon: 'desk' },
    { label: 'Living', slug: 'home-living', icon: 'chair' },
    { label: 'Coffee', slug: 'coffee-kitchen', icon: 'coffee' },
  ];

  // Live Instant Filter
  useEffect(() => {
    const q = searchInput.trim().toLowerCase();
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    const all = api.getCachedProducts();
    const filtered = all
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q) ||
          p.category_slug?.toLowerCase().includes(q)
      )
      .slice(0, 4);
    setSearchResults(filtered);
  }, [searchInput]);

  // Click outside and ESC listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      hapticFeedback.light();
      setIsDropdownOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleSelectKeyword = (kw: string) => {
    setSearchInput(kw);
    setIsDropdownOpen(false);
    hapticFeedback.light();
    navigate(`/search?q=${encodeURIComponent(kw)}`);
  };

  const handleSelectProduct = (slug: string) => {
    setIsDropdownOpen(false);
    setSearchInput('');
    hapticFeedback.light();
    navigate(`/products/${slug}`);
  };

  return (
    <>
      {/* Mobile Dimmer Backdrop when search dropdown is open */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-30 transition-opacity"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      <header className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] select-none safe-top transition-all">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-1.5 shrink-0" onClick={() => hapticFeedback.light()}>
            <img src={logoImg} alt="UniStore" className="h-7 w-auto object-contain" />
          </Link>

          {/* Search Bar Container with Auto-Suggest Dropdown */}
          <div ref={containerRef} className="flex-1 relative">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-zinc-100/90 rounded-full px-3 py-1.5 border border-zinc-200/70 focus-within:border-zinc-950 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-950/10 transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-zinc-400 mr-2 shrink-0">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Search curated products..."
                className="flex-1 bg-transparent text-xs font-medium placeholder:text-zinc-400 border-none outline-none focus:ring-0 p-0 text-zinc-900"
              />

              {searchInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchResults([]);
                    inputRef.current?.focus();
                  }}
                  className="p-0.5 text-zinc-400 hover:text-zinc-700 transition mr-1"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              ) : null}

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

            {/* Instant Auto-Suggest Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-zinc-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* 1. Results state */}
                {searchInput.trim().length > 0 ? (
                  <div className="p-2">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="px-3 py-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Matching Products</span>
                          <span className="text-[9px] text-zinc-400 font-normal">Press Enter to view all</span>
                        </div>
                        <div className="space-y-1">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleSelectProduct(product.slug)}
                              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100/80 transition-all text-left group cursor-pointer"
                            >
                              <img
                                src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover bg-zinc-100 flex-shrink-0 border border-zinc-200/60"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-zinc-900 truncate group-hover:text-zinc-600 transition-colors">
                                  {product.name}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-medium">
                                  {product.category_name || 'Curated Essential'}
                                </div>
                              </div>
                              <div className="text-xs font-black text-zinc-950 tabular-nums">
                                {formatCurrency(product.base_price)}
                              </div>
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="w-full mt-2 py-2 text-center text-xs font-bold text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors border-t border-zinc-100 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>See all results for "{searchInput}"</span>
                          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                        </button>
                      </>
                    ) : (
                      <div className="py-6 px-4 text-center">
                        <span className="material-symbols-outlined text-[28px] text-zinc-300 mb-1">
                          search_off
                        </span>
                        <p className="text-xs font-bold text-zinc-700">No direct matches found</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Try searching for "Headphones", "Chair", or "Lamp"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. Empty state: Trending Searches & Categories */
                  <div className="p-3.5 space-y-3.5">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                        <span className="material-symbols-outlined text-[13px] text-amber-500">trending_up</span>
                        <span>Trending Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {trendingSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handleSelectKeyword(term)}
                            className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-950 hover:text-white text-zinc-700 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100">
                      <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                        Browse by Category
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {quickCategories.map((cat) => (
                          <button
                            key={cat.slug}
                            type="button"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              hapticFeedback.light();
                              navigate(`/shop?category=${cat.slug}`);
                            }}
                            className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px] text-zinc-500">
                              {cat.icon}
                            </span>
                            <span>{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
              className="relative p-1.5 text-zinc-700 hover:text-zinc-950 active:scale-95 transition cursor-pointer"
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
                className="hidden lg:flex ml-1 px-2 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold items-center gap-1 border border-zinc-200 cursor-pointer"
                title="Switch to Web Mode"
              >
                <span className="material-symbols-outlined text-[13px]">desktop_windows</span>
                <span>Web</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
