import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const results = await api.getProducts({ search: query });
        setProducts(results);
      } catch (err) {
        console.error('Failed to search Supabase products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const popularKeywords = ['Headphones', 'Coffee', 'Diffuser', 'Desk Chair', 'Wireless', 'Backpack', 'Speaker', 'Lamp'];

  const handleKeywordClick = (kw: string) => {
    setQuery(kw);
    setSearchParams({ q: kw });
  };

  // Sort results
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.base_price - b.base_price;
    if (sortBy === 'price-high') return b.base_price - a.base_price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // relevance = default order
  });

  const trendingCategories = [
    { name: 'Tech & Audio', slug: 'tech-audio', icon: 'headphones', color: '#3b82f6' },
    { name: 'Home & Living', slug: 'home-living', icon: 'chair', color: '#a3e635' },
    { name: 'Desk Setup', slug: 'desk-setup', icon: 'desktop_windows', color: '#818cf8' },
    { name: 'Travel Gear', slug: 'travel-gear', icon: 'luggage', color: '#fb923c' },
    { name: 'Coffee & Kitchen', slug: 'coffee-kitchen', icon: 'coffee', color: '#f472b6' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      {/* ══════════════════════════════════════════════════════════════════
          SEARCH HERO — Premium search experience
          ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center bg-zinc-50 border-2 border-zinc-200 rounded-2xl px-5 py-4 shadow-sm focus-within:border-zinc-900 focus-within:shadow-md transition-all duration-300">
              <span className="material-symbols-outlined text-zinc-400 text-[24px] mr-3">search</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchParams({ q: e.target.value });
                }}
                placeholder="Search products, categories, brands..."
                className="w-full bg-transparent border-0 p-0 text-zinc-900 text-base sm:text-lg font-medium placeholder:text-zinc-400 focus:ring-0 focus:outline-none"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setSearchParams({});
                    inputRef.current?.focus();
                  }}
                  className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-500 hover:bg-zinc-900 hover:text-white flex items-center justify-center transition-all active:scale-90"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Popular Searches */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Popular:</span>
              {popularKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleKeywordClick(kw)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    query.toLowerCase() === kw.toLowerCase()
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 shadow-xs'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ══════════════════════════════════════════════════════════════════
            RESULTS HEADER
            ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              {query ? (
                <>
                  Results for "<span className="text-zinc-500">{query}</span>"
                </>
              ) : (
                'Discover Curated Items'
              )}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                  Searching catalog...
                </span>
              ) : query ? (
                `Found ${sortedProducts.length} matching ${sortedProducts.length === 1 ? 'item' : 'items'}`
              ) : (
                'Type a query or choose a category to begin'
              )}
            </p>
          </div>

          {/* Sort */}
          {query && sortedProducts.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2 shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-zinc-400">swap_vert</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-zinc-700 focus:ring-0 focus:outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="relevance">Most Relevant</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            CONTENT
            ══════════════════════════════════════════════════════════════════ */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <div className="aspect-square bg-zinc-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-zinc-100 rounded-full w-3/4 animate-pulse" />
                  <div className="h-3 bg-zinc-100 rounded-full w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : query && sortedProducts.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-24 h-24 rounded-3xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-300 mb-6 rotate-6">
              <span className="material-symbols-outlined text-[48px]">search_off</span>
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2">No results found</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              We couldn't find any products matching "<span className="font-bold text-zinc-700">{query}</span>". Try different keywords or browse categories below.
            </p>

            {/* Category Quick Links */}
            <div className="flex flex-wrap gap-2 justify-center">
              {trendingCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-700 hover:border-zinc-400 hover:shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ color: cat.color }}>{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        ) : !query ? (
          /* Browse Categories When No Query */
          <div>
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.15em] mb-4">Browse Collections</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {trendingCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  className="group bg-white rounded-2xl border border-zinc-200/80 p-5 text-center hover:shadow-md hover:border-zinc-300 transition-all duration-300"
                >
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: `${cat.color}15` }}
                  >
                    <span className="material-symbols-outlined text-[28px]" style={{ color: cat.color }}>{cat.icon}</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">{cat.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Results Grid */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
