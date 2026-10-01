import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/home/HeroSection';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { ShopTheLook } from '../components/home/ShopTheLook';
import { MaterialCraft } from '../components/home/MaterialCraft';
import { CommunityGallery } from '../components/home/CommunityGallery';
import { TrustFeatures } from '../components/home/TrustFeatures';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { FaqSection } from '../components/home/FaqSection';
import { ProductCard } from '../components/product/ProductCard';
import { api } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import type { Product, Category } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [products, setProducts] = useState<Product[]>(() => api.getCachedProducts());
  const [categories, setCategories] = useState<Category[]>(() => api.getCachedCategories());
  const [isLoading, setIsLoading] = useState(() => api.getCachedProducts().length === 0);

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load data from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Realtime Supabase Sync
  useRealtimeSync({
    onProductChange: () => loadData(),
    onCategoryChange: () => loadData(),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const trendingProducts = products.slice(0, 4);
  const customerFavorites = products.filter((p) => p.is_bestseller).slice(0, 4);

  return (
    <div className="w-full">
      {/* Subheader: Location, Quick Search & Express Dispatch */}
      <section className="bg-white border-b border-zinc-200/80 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Mobile Search input */}
            <form
              onSubmit={handleSearchSubmit}
              className="md:hidden relative flex items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 shadow-2xs focus-within:border-zinc-900 transition-all"
            >
              <span className="material-symbols-outlined text-zinc-400 text-[20px] mr-2">search</span>
              <input
                type="text"
                placeholder="Search curated lifestyle, tech & home..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-zinc-900 placeholder:text-zinc-400 text-xs focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Scan"
                className="text-zinc-400 hover:text-zinc-900 pl-2 border-l border-zinc-200 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
              </button>
            </form>

            {/* Delivery Location Chip */}
            <div className="flex items-center justify-between md:justify-start gap-3">
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">location_on</span>
                <span className="text-zinc-400">Deliver to</span>
                <span className="font-bold text-zinc-900">
                  {user?.full_name ? user.full_name.split(' ')[0] : 'Member'} • Mumbai 400050
                </span>
              </div>
              <span className="text-emerald-700 text-[10px] font-extrabold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                INSTANT DISPATCH
              </span>
            </div>

            {/* Desktop USPs */}
            <div className="hidden md:flex items-center gap-6 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-500">bolt</span>
                Same-Day Metros Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                100% Brand Authentic
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-zinc-700">inventory_2</span>
                Plastic-Free Eco Packaging
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-12">
        {/* 1. DYNAMIC MULTI-STORY HERO BANNER */}
        <HeroSection />

        {/* 2. ARCHITECTURAL EDITORIAL CATEGORIES */}
        <CategoryGrid categories={categories} products={products} />

        {/* 3. TRENDING NEW ARRIVALS (Product Cards with Quick View & Finishes) */}
        <section className="py-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Hand-Selected</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Trending New Arrivals</h2>
            </div>
            <Link
              to="/shop?sort=trending"
              className="inline-flex items-center gap-1 text-zinc-900 font-bold text-xs sm:text-sm hover:underline group"
            >
              <span>Explore All</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-shimmer rounded-2xl h-80 border border-zinc-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 4. INTERACTIVE "SHOP THE LOOK" STUDIO HOTSPOTS */}
        <ShopTheLook />

        {/* 5. TACTILE CRAFTSMANSHIP & MATERIALS */}
        <MaterialCraft />

        {/* 6. CUSTOMER FAVORITES (BESTSELLERS) */}
        <section className="py-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Community Approved</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Customer Favorites</h2>
            </div>
            <Link to="/shop?filter=bestseller" className="text-zinc-900 font-bold text-xs sm:text-sm hover:underline">
              See All Bestsellers →
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 sm:grid sm:grid-cols-4 sm:overflow-visible">
            {customerFavorites.map((product) => (
              <div key={product.id} className="w-64 sm:w-auto flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        {/* 7. WHY UNISTORE BRAND PROMISE GRID */}
        <TrustFeatures />

        {/* 8. COMMUNITY LOOKBOOK (#UniStoreSetup) */}
        <CommunityGallery />

        {/* 9. VERIFIED COMMUNITY TESTIMONIALS */}
        <TestimonialsSection />

        {/* 10. FREQUENTLY ASKED QUESTIONS */}
        <FaqSection />
      </div>
    </div>
  );
};
