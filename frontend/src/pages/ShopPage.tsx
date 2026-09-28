import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/product/ProductCard';
import { api } from '../services/api';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import type { Product, Category } from '../types';

// ── Editorial category imagery & copy ───────────────────────────────────────
const categoryHeroes: Record<string, { headline: string; sub: string; img: string; accent: string }> = {
  'tech-audio': {
    headline: 'Acoustics & Precision',
    sub: 'Planar magnetic drivers, studio-grade ANC, and tactile keyboards engineered for the discerning audiophile.',
    img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1400&q=80',
    accent: '#3b82f6',
  },
  'home-living': {
    headline: 'Ergonomic Interiors',
    sub: 'Architectural seating, solid walnut furniture, and ambient lighting that transforms your living space.',
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=80',
    accent: '#a3e635',
  },
  'desk-setup': {
    headline: 'Workspace Studio',
    sub: 'Anodized aluminum risers, premium felt desk pads, and cable architecture for the modern workstation.',
    img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1400&q=80',
    accent: '#818cf8',
  },
  'travel-gear': {
    headline: 'Everyday Carry',
    sub: 'Vacuum titanium bottles, Cordura organizers, and tactical vessels built for nomadic lifestyles.',
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1400&q=80',
    accent: '#fb923c',
  },
  'coffee-kitchen': {
    headline: 'Brewing Rituals',
    sub: 'Precision gooseneck kettles, borosilicate glass, and manual grinders for the coffee connoisseur.',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1400&q=80',
    accent: '#f472b6',
  },
};

const FALLBACK_HERO = {
  headline: 'Curated Catalog',
  sub: 'Discover thoughtfully designed essentials for modern living — every object, intentionally chosen.',
  img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80',
  accent: '#a1a1aa',
};

// ── Animated product wrapper for stagger-in ─────────────────────────────────
const AnimatedCard: React.FC<{ children: React.ReactNode; index: number }> = ({ children, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${Math.min(index * 80, 400)}ms`,
      }}
    >
      {children}
    </div>
  );
};

export const ShopPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort') || 'popularity';

  const [products, setProducts] = useState<Product[]>(() => api.getCachedProducts());
  const [categories, setCategories] = useState<Category[]>(() => api.getCachedCategories());
  const [isLoading, setIsLoading] = useState<boolean>(() => api.getCachedProducts().length === 0);

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<string>(sortParam);
  const [priceMax, setPriceMax] = useState<number>(20000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadCatalog = async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load shop catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useRealtimeSync({
    onProductChange: () => loadCatalog(),
    onCategoryChange: () => loadCatalog(),
  });

  // Sync category param if changed in URL
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== 'all' && product.category_slug !== selectedCategory) {
        return false;
      }
      if (product.base_price > priceMax) {
        return false;
      }
      if (onlyInStock && product.stock <= 0) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.base_price - b.base_price;
      if (sortBy === 'price-high') return b.base_price - a.base_price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') {
        const discA = a.compare_at_price ? (a.compare_at_price - a.base_price) : 0;
        const discB = b.compare_at_price ? (b.compare_at_price - b.base_price) : 0;
        return discB - discA;
      }
      return b.review_count - a.review_count; // Popularity default
    });
  }, [products, selectedCategory, sortBy, priceMax, onlyInStock]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const heroData = selectedCategory !== 'all' && categoryHeroes[selectedCategory]
    ? categoryHeroes[selectedCategory]
    : FALLBACK_HERO;

  // Price range stats
  const priceStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 20000 };
    const prices = products.map(p => p.base_price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>

      {/* ══════════════════════════════════════════════════════════════════
          EDITORIAL HERO BANNER
          ══════════════════════════════════════════════════════════════════ */}
      <div className="relative h-[220px] sm:h-[280px] md:h-[340px] overflow-hidden">
        <img
          src={heroData.img}
          alt={heroData.headline}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80';
          }}
        />
        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent" />

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] text-zinc-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300 font-semibold">
              {activeCategoryObj ? activeCategoryObj.name : 'Catalog'}
            </span>
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 backdrop-blur-md border"
                style={{
                  background: `${heroData.accent}15`,
                  borderColor: `${heroData.accent}30`,
                  color: heroData.accent,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: heroData.accent }} />
                {selectedCategory !== 'all' ? categoryHeroes[selectedCategory]?.headline || 'Collection' : 'All Collections'}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {activeCategoryObj ? activeCategoryObj.name : 'Curated Shop'}
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 max-w-lg leading-relaxed hidden sm:block">
                {heroData.sub}
              </p>
            </div>

            <div className="flex-shrink-0 hidden sm:flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-medium tabular-nums">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════════════
          CATEGORY PILLS BAR — Horizontal scroll, luxury pill design
          ══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 border-b border-zinc-200/80" style={{ background: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(16px) saturate(180%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3 overflow-x-auto no-scrollbar">
            {/* All button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                selectedCategory === 'all'
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 shadow-xs'
              }`}
            >
              All ({products.length})
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-zinc-200 flex-shrink-0" />

            {categories.map((cat) => {
              const count = products.filter(
                (p) => p.category_id === cat.id || p.category_slug === cat.slug
              ).length;
              const displayCount = count > 0 ? count : (cat.item_count || 1);
              const isActive = selectedCategory === cat.slug;
              const catAccent = categoryHeroes[cat.slug]?.accent || '#71717a';

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 border ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 shadow-xs'
                  }`}
                  style={isActive ? { background: catAccent, borderColor: catAccent } : undefined}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {displayCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT: Luxury Sidebar + Product Grid
          ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Toolbar: Sort + View Mode + Mobile Filter Toggle */}
        <div className="flex items-center justify-between gap-3 mb-6">
          {/* Left: Results info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-1.5 px-4 py-2.5 bg-white rounded-xl text-xs font-bold text-zinc-700 border border-zinc-200 shadow-xs hover:border-zinc-400 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>{showMobileFilters ? 'Hide' : 'Filters'}</span>
            </button>

            <p className="text-xs text-zinc-500 hidden sm:block">
              Showing <span className="font-bold text-zinc-900">{filteredProducts.length}</span> of {products.length} results
            </p>
          </div>

          {/* Right: View Mode + Sort */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="hidden sm:flex items-center bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'}`}
                aria-label="Grid view"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700'}`}
                aria-label="List view"
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2 shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-zinc-400">swap_vert</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-zinc-700 focus:ring-0 focus:outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
          {/* ── FILTER SIDEBAR ──────────────────────────────────────────── */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block col-span-1`}>
            <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs sticky top-16">
              {/* Sidebar Header */}
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-zinc-500">tune</span>
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Filters</h3>
                </div>
                {(selectedCategory !== 'all' || priceMax < 20000 || onlyInStock) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceMax(20000);
                      setOnlyInStock(false);
                    }}
                    className="text-[10px] font-bold text-zinc-500 hover:text-red-500 uppercase tracking-wider transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="px-5 py-4">
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3">Collections</h4>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                      selectedCategory === 'all'
                        ? 'bg-zinc-900 text-white font-bold shadow-sm'
                        : 'text-zinc-600 hover:bg-zinc-50 font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">category</span>
                      All Categories
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCategory === 'all' ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'
                    }`}>{products.length}</span>
                  </button>

                  {categories.map((cat) => {
                    const count = products.filter(
                      (p) => p.category_id === cat.id || p.category_slug === cat.slug
                    ).length;
                    const displayCount = count > 0 ? count : (cat.item_count || 1);
                    const isActive = selectedCategory === cat.slug;
                    const catAccent = categoryHeroes[cat.slug]?.accent || '#71717a';

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                          isActive
                            ? 'text-white font-bold shadow-sm'
                            : 'text-zinc-600 hover:bg-zinc-50 font-medium'
                        }`}
                        style={isActive ? { background: catAccent } : undefined}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: isActive ? '#fff' : catAccent }}
                          />
                          {cat.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'
                        }`}>{displayCount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="px-5 py-4 border-t border-zinc-100">
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3">Price Range</h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-zinc-500 font-medium">₹{priceStats.min.toLocaleString('en-IN')}</span>
                  <span className="text-sm font-black text-zinc-900 tabular-nums">
                    ₹{priceMax.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="relative">
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full transition-all duration-200"
                      style={{ width: `${((priceMax - 1000) / (20000 - 1000)) * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-zinc-400 font-medium">₹1,000</span>
                  <span className="text-[10px] text-zinc-400 font-medium">₹20,000</span>
                </div>
              </div>

              {/* Availability */}
              <div className="px-5 py-4 border-t border-zinc-100">
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3">Availability</h4>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-10 h-5.5 rounded-full transition-all duration-300 relative cursor-pointer ${
                      onlyInStock ? 'bg-zinc-900' : 'bg-zinc-200'
                    }`}
                    onClick={() => setOnlyInStock(!onlyInStock)}
                  >
                    <div
                      className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                        onlyInStock ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-zinc-700 font-medium group-hover:text-zinc-900 transition-colors">
                    In Stock Only
                  </span>
                </label>
              </div>

              {/* Active Filters Summary */}
              {(selectedCategory !== 'all' || priceMax < 20000 || onlyInStock) && (
                <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/80">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold">
                        {activeCategoryObj?.name}
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className="hover:text-red-300 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </span>
                    )}
                    {priceMax < 20000 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold">
                        ≤ ₹{priceMax.toLocaleString('en-IN')}
                        <button
                          onClick={() => setPriceMax(20000)}
                          className="hover:text-red-300 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </span>
                    )}
                    {onlyInStock && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold">
                        In Stock
                        <button
                          onClick={() => setOnlyInStock(false)}
                          className="hover:text-red-300 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* ── PRODUCT GRID ────────────────────────────────────────────── */}
          <div className="col-span-1 md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                    <div className="aspect-square bg-zinc-100 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-zinc-100 rounded-full w-3/4 animate-pulse" />
                      <div className="h-3 bg-zinc-100 rounded-full w-1/2 animate-pulse" />
                      <div className="h-8 bg-zinc-100 rounded-xl animate-pulse mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* ── Empty State ──────────────────────────────────────────── */
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-12 sm:p-16 text-center shadow-xs">
                <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-5 rotate-6">
                  <span className="material-symbols-outlined text-[40px]">search_off</span>
                </div>
                <h3 className="text-xl font-black text-zinc-900 mb-2">No pieces found</h3>
                <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto leading-relaxed">
                  Your current filters don't match any items in our catalog. Try adjusting the price range or explore a different collection.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceMax(20000);
                    setOnlyInStock(false);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-md hover:bg-zinc-800 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* ── Products ─────────────────────────────────────────────── */
              <div className={`grid gap-3 sm:gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {filteredProducts.map((product, idx) => (
                  <AnimatedCard key={product.id} index={idx}>
                    <ProductCard product={product} />
                  </AnimatedCard>
                ))}
              </div>
            )}

            {/* Results Footer */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-zinc-200/80 text-center">
                <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-widest">
                  Showing all {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                  {selectedCategory !== 'all' && activeCategoryObj && ` in ${activeCategoryObj.name}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
