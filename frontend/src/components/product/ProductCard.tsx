import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/currency';
import { useCart } from '../../store/CartContext';
import { useWishlist } from '../../store/WishlistContext';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

// Deterministic swatch derivation based on product slug/category
const getSwatches = (categorySlug?: string, name?: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('chair') || n.includes('desk') || n.includes('wood')) {
    return [
      { name: 'Walnut', color: '#5c3a21' },
      { name: 'Matte Black', color: '#18181b' },
      { name: 'Oak', color: '#c49a6c' },
    ];
  }
  if (categorySlug === 'tech-audio' || n.includes('headphone') || n.includes('speaker')) {
    return [
      { name: 'Obsidian Black', color: '#09090b' },
      { name: 'Platinum Silver', color: '#d4d4d8' },
      { name: 'Midnight Blue', color: '#1e293b' },
    ];
  }
  return [
    { name: 'Black', color: '#18181b' },
    { name: 'Smoke Gray', color: '#71717a' },
    { name: 'Chalk White', color: '#f4f4f5' },
  ];
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const initialImage = product.images?.[0]?.image_url || FALLBACK_IMAGE;
  const [imgSrc, setImgSrc] = useState(initialImage);

  const isLiked = isInWishlist(product.id);
  const discountPercent = calculateDiscount(product.base_price, product.compare_at_price);
  const swatches = getSwatches(product.category_slug, product.name);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-zinc-200/90 shadow-xs hover:shadow-card-hover hover:border-zinc-300 flex flex-col justify-between group transition-all duration-300 ease-out relative">
        <div>
          {/* Image & Overlays Container */}
          <div className="relative w-full aspect-square rounded-xl bg-zinc-50 overflow-hidden mb-3 border border-zinc-100">
            <Link to={`/products/${product.slug}`} className="block w-full h-full">
              <img
                src={imgSrc}
                alt={product.name}
                loading="lazy"
                onError={() => setImgSrc(FALLBACK_IMAGE)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </Link>

            {/* Badges (Top Left) */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
              {(product.badge || discountPercent > 0) && (
                <span
                  className={`font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs tracking-wide uppercase backdrop-blur-md ${
                    product.badge === 'HOT' || product.badge === 'POPULAR'
                      ? 'bg-zinc-950 text-white'
                      : product.badge === 'Bestseller'
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-zinc-900/90 text-white'
                  }`}
                >
                  {product.badge || `${discountPercent}% OFF`}
                </span>
              )}
            </div>

            {/* Low Stock Indicator */}
            {product.stock > 0 && product.stock <= 10 && (
              <span className="absolute bottom-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/95 text-white shadow-xs backdrop-blur-sm z-10">
                Only {product.stock} left
              </span>
            )}

            {/* Wishlist Button (Top Right) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-90 z-10 ${
                isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                favorite
              </span>
            </button>

            {/* Quick View Button (Desktop Hover Overlay) */}
            <div className="hidden sm:flex absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
              <button
                type="button"
                onClick={handleOpenQuickView}
                className="w-full py-2 px-3 rounded-xl bg-white/95 backdrop-blur-md text-zinc-900 text-xs font-bold shadow-md hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-zinc-200"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Quick View</span>
              </button>
            </div>
          </div>

          {/* Color Swatch Dots & Category */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1">
              {swatches.map((swatch) => (
                <span
                  key={swatch.name}
                  title={swatch.name}
                  className="w-2.5 h-2.5 rounded-full border border-zinc-300 shadow-2xs hover:scale-125 transition-transform"
                  style={{ backgroundColor: swatch.color }}
                />
              ))}
              <span className="text-[10px] text-zinc-400 ml-1 font-medium hidden sm:inline">
                {swatches.length} finishes
              </span>
            </div>

            {/* Category tag */}
            {product.category_name && (
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate max-w-[100px]">
                {product.category_name}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] mb-1">
            <span className="font-extrabold flex items-center text-zinc-900">
              <span
                className="material-symbols-outlined text-[14px] text-amber-500 mr-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              {product.rating.toFixed(1)}
            </span>
            <span className="text-zinc-400 font-medium">({product.review_count.toLocaleString('en-IN')})</span>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-zinc-700 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Tactile Add-to-Cart Button */}
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <div className="text-sm sm:text-base font-extrabold text-zinc-950 tabular-nums">
              {formatCurrency(product.base_price)}
            </div>
            {product.compare_at_price && product.compare_at_price > product.base_price && (
              <div className="text-[10px] sm:text-[11px] text-zinc-400 line-through tabular-nums">
                {formatCurrency(product.compare_at_price)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className={`h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full flex items-center justify-center gap-1 text-xs font-bold transition-all duration-200 active:scale-90 shadow-xs ${
              justAdded
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-zinc-950 text-white hover:bg-zinc-800'
            }`}
          >
            {justAdded ? (
              <>
                <span className="material-symbols-outlined text-[15px]">check</span>
                <span>Added</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
};
