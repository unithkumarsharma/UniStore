import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/currency';
import { useCart } from '../../store/CartContext';
import { useWishlist } from '../../store/WishlistContext';
import { useToast } from '../../store/ToastContext';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('Obsidian');
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (product) {
      const primary = product.images?.[0]?.image_url || FALLBACK_IMAGE;
      setSelectedImage(primary);
      setQuantity(1);
      setSelectedColor('Obsidian');
      setJustAdded(false);
    }
  }, [product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isLiked = isInWishlist(product.id);
  const discountPercent = calculateDiscount(product.base_price, product.compare_at_price);
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.image_url) 
    : [FALLBACK_IMAGE];

  const handleAddToCart = () => {
    addToCart(product, undefined, quantity);
    setJustAdded(true);
    toast.cart(
      {
        name: product.name,
        image: selectedImage || FALLBACK_IMAGE,
        price: product.base_price * quantity,
      },
      {
        label: 'View Bag',
        onClick: () => {
          onClose();
          setIsCartOpen(true);
        },
      }
    );
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 600);
  };

  const handleBuyNow = () => {
    addToCart(product, undefined, quantity);
    onClose();
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    const wasLiked = isInWishlist(product.id);
    toggleWishlist(product.id);
    if (!wasLiked) {
      toast.success('Saved to Wishlist', product.name);
    } else {
      toast.info('Removed from Wishlist', product.name);
    }
  };

  const colorOptions = [
    { name: 'Obsidian', class: 'bg-zinc-950 border-zinc-700' },
    { name: 'Titanium', class: 'bg-zinc-300 border-zinc-400' },
    { name: 'Midnight', class: 'bg-slate-800 border-slate-600' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden z-10 animate-scale-up my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-transform active:scale-90"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Media Gallery */}
          <div className="p-6 bg-zinc-50/80 border-b md:border-b-0 md:border-r border-zinc-200/80 flex flex-col justify-between">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-zinc-200/60 shadow-sm flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={() => setSelectedImage(FALLBACK_IMAGE)}
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-zinc-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                      selectedImage === img ? 'border-zinc-900 scale-95 ring-2 ring-zinc-900/10' : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info, Price, Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  {product.category_name || 'UniStore Editorial'}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-[15px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="font-bold text-zinc-900">{(product.rating || 0).toFixed(1)}</span>
                  <span className="text-zinc-500">({product.review_count || 0})</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight leading-snug">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl font-black text-zinc-900 tabular-nums">
                  {formatCurrency(product.base_price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.base_price && (
                  <span className="text-sm text-zinc-400 line-through tabular-nums">
                    {formatCurrency(product.compare_at_price)}
                  </span>
                )}
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Only {product.stock} remaining
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-zinc-600 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Color Finish Picker */}
              <div className="mt-5">
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Finish: <span className="text-zinc-900 font-semibold">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-3">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => setSelectedColor(opt.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        selectedColor === opt.name
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                          : 'border-zinc-200 text-zinc-700 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${opt.class}`} />
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* High-Trust Specs List */}
              <div className="mt-5 pt-4 border-t border-zinc-100 grid grid-cols-2 gap-2 text-[11px] text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">local_shipping</span>
                  <span>Complimentary Shipping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
                  <span>1-Year Official Warranty</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">published_with_changes</span>
                  <span>7-Day Return Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">lock</span>
                  <span>Encrypted UPI / Card Checkout</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Stepper + Add to Bag + Buy Now + Wishlist */}
            <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Quantity Counter */}
                <div className="flex items-center border border-zinc-200 rounded-full bg-zinc-50 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-zinc-900 text-base font-bold disabled:opacity-30 cursor-pointer"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-zinc-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-zinc-900 text-base font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label="Wishlist"
                  className={`w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center transition-all hover:bg-zinc-50 active:scale-90 cursor-pointer ${
                    isLiked ? 'text-red-500 border-red-200 bg-red-50/50' : 'text-zinc-600'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    favorite
                  </span>
                </button>
              </div>

              <div className="flex-1 flex items-center gap-2">
                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {justAdded ? 'check' : 'shopping_bag'}
                  </span>
                  <span>{justAdded ? 'Added!' : 'Add to Bag'}</span>
                </button>

                {/* Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm bg-zinc-950 text-white hover:bg-zinc-800 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">bolt</span>
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Link to Full Page */}
            <div className="mt-3 text-center">
              <Link
                to={`/products/${product.slug}`}
                onClick={onClose}
                className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 underline transition-colors"
              >
                View full specifications and customer reviews →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
