import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('404 — Page Not Found');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-zinc-50/50">
      <div className="max-w-xl w-full bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-12 text-center shadow-xs">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold uppercase tracking-wider mb-6 border border-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Error 404</span>
        </div>

        {/* Big 404 Display */}
        <h1 className="text-6xl sm:text-7xl font-black text-zinc-900 tracking-tight mb-3">
          4<span className="text-zinc-400">0</span>4
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2">
          Page not found
        </h2>

        <p className="text-sm text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
          The page or product you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        {/* Quick Search */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or collections..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 active:scale-95 transition-all shadow-xs"
          >
            Find
          </button>
        </form>

        {/* Popular Categories */}
        <div className="pt-6 border-t border-zinc-100 mb-8">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
            Popular Collections
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Tech & Audio', to: '/shop?category=tech-audio' },
              { label: 'Home & Living', to: '/shop?category=home-living' },
              { label: 'Desk Setup', to: '/shop?category=desk-setup' },
              { label: 'All Catalog', to: '/shop' },
            ].map((cat) => (
              <Link
                key={cat.to}
                to={cat.to}
                className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-all hover:scale-105"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-950 text-white font-bold text-xs shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
