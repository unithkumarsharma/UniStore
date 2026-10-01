import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../store/WishlistContext';
import { useCart } from '../store/CartContext';
import { api } from '../services/api';
import type { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { formatCurrency } from '../utils/currency';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const WishlistPage: React.FC = () => {
  useDocumentTitle('Your Curated Wishlist');
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const allProducts = await api.getProducts();
        const saved = allProducts.filter((p) => wishlist.includes(p.id));
        setProducts(saved);
        // If empty or small, pick top recommendations
        setRecommended(allProducts.filter((p) => !wishlist.includes(p.id)).slice(0, 4));
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  const totalValue = products.reduce((sum, p) => sum + p.base_price, 0);

  const handleAddAllToCart = () => {
    products.forEach((p) => addToCart(p, undefined, 1));
    setAddedAllSuccess(true);
    setTimeout(() => {
      setAddedAllSuccess(false);
      setIsCartOpen(true);
    }, 600);
  };

  const handleClearWishlist = () => {
    if (window.confirm('Remove all items from your wishlist?')) {
      products.forEach((p) => toggleWishlist(p.id));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 sm:pb-8 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-zinc-500 mb-1">
              <span>Personal Collection</span>
              <span>•</span>
              <span>Curated Vault</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Saved Pieces
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-lg">
              Every curated essential you have earmarked for your space, audio setup, or daily carry.
            </p>
          </div>

          {/* Header Action Bar */}
          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="text-xs text-zinc-500 mr-2">
                <span className="font-bold text-zinc-900">{products.length} items</span> ({formatCurrency(totalValue)})
              </div>
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {addedAllSuccess ? 'check' : 'add_shopping_cart'}
                </span>
                <span>{addedAllSuccess ? 'Added to Bag' : 'Add All to Bag'}</span>
              </button>
              <button
                type="button"
                onClick={handleClearWishlist}
                className="px-3.5 py-2 sm:py-2.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 font-semibold text-xs transition-colors"
                title="Clear all wishlist items"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-[36px] text-zinc-400 animate-spin mb-3">
              progress_activity
            </span>
            <p className="text-xs text-zinc-500 font-medium">Retrieving saved essentials...</p>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="py-12 sm:py-16">
            <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/80 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4 border border-zinc-200/60">
                <span className="material-symbols-outlined text-[30px]">favorite_border</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-950">Your archive is empty</h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-2 mb-6 leading-relaxed">
                Explore our catalog of premium audio, workspace ergonomics, and living essentials. Tap the heart to curate your personal lineup.
              </p>

              {/* Quick Jump Category Chips */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Link
                  to="/shop?category=tech-audio"
                  className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors"
                >
                  Tech & Audio
                </Link>
                <Link
                  to="/shop?category=home-living"
                  className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors"
                >
                  Home & Living
                </Link>
                <Link
                  to="/shop?category=coffee-kitchen"
                  className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors"
                >
                  Coffee & Kitchen
                </Link>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 text-white font-bold text-xs shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <span>Browse Full Collection</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {/* Recommended Products Strip */}
            {recommended.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950">Recommended For You</h3>
                    <p className="text-xs text-zinc-500">Popular items trending across UniStore</p>
                  </div>
                  <Link to="/shop" className="text-xs font-bold text-zinc-900 hover:underline">
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {recommended.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Wishlist Products Grid */
          <div className="pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
