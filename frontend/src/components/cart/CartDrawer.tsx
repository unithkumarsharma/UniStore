import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { formatCurrency } from '../../utils/currency';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    totalItemCount,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Animate in
  useEffect(() => {
    if (isCartOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsCartOpen(false), 300);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  const handleRemoveItem = (itemId: string) => {
    setRemovingItemId(itemId);
    setTimeout(() => {
      removeItem(itemId);
      setRemovingItemId(null);
    }, 300);
  };

  const freeShippingDifference = Math.max(0, cart.free_shipping_threshold - cart.subtotal);
  const freeShippingProgress = Math.min(100, (cart.subtotal / cart.free_shipping_threshold) * 100);
  const freeShippingUnlocked = freeShippingDifference === 0;

  const handleProceedToCheckout = () => {
    handleClose();
    setTimeout(() => navigate('/checkout'), 300);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isVisible ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* ── Header ────────────────────────────────────────────── */}
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">shopping_bag</span>
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900">Your Bag</h2>
                <p className="text-[11px] text-zinc-400 font-medium">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-all active:scale-90"
              aria-label="Close cart"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* ── Free Shipping Progress ────────────────────────────── */}
          <div className={`px-6 py-3.5 border-b border-zinc-100 ${freeShippingUnlocked ? 'bg-emerald-50' : 'bg-amber-50/50'}`}>
            {freeShippingUnlocked ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                <span>Free Express Shipping Unlocked! 🎉</span>
              </div>
            ) : (
              <div>
                <p className="text-xs text-zinc-600 mb-2 font-medium">
                  Add <span className="font-bold text-zinc-900 tabular-nums">{formatCurrency(freeShippingDifference)}</span> more for{' '}
                  <span className="font-bold text-emerald-700">FREE Express Delivery</span>
                </p>
                <div className="relative w-full h-2 bg-zinc-200/80 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                  {/* Progress dot */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow-sm transition-all duration-500"
                    style={{ left: `calc(${freeShippingProgress}% - 7px)` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Cart Items ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 no-scrollbar">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-300 mb-4 rotate-6">
                  <span className="material-symbols-outlined text-[40px]">shopping_bag</span>
                </div>
                <h3 className="text-lg font-black text-zinc-900 mb-1.5">Your bag is empty</h3>
                <p className="text-sm text-zinc-400 max-w-xs mb-6 leading-relaxed">
                  Discover our curated collections of premium lifestyle essentials.
                </p>
                <button
                  onClick={() => {
                    handleClose();
                    setTimeout(() => navigate('/shop'), 300);
                  }}
                  className="px-6 py-3 rounded-full bg-zinc-900 text-white font-bold text-sm shadow-md hover:bg-zinc-800 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">explore</span>
                  Start Exploring
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-3.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 transition-all duration-300 ${
                    removingItemId === item.id ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100'
                  }`}
                >
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.product.slug}`}
                    onClick={handleClose}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.variant?.image_url || item.product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                      alt={item.product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                      }}
                      className="w-20 h-20 rounded-xl object-cover bg-zinc-200 border border-zinc-200/60"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/products/${item.product.slug}`}
                          onClick={handleClose}
                          className="text-sm font-bold text-zinc-900 line-clamp-1 hover:text-zinc-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-zinc-300 hover:text-red-500 transition-colors p-0.5 flex-shrink-0"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                      {item.variant && (
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {Object.entries(item.variant.attributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-black text-zinc-900 tabular-nums">
                        {formatCurrency(item.price * item.quantity)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-white border border-zinc-200 rounded-full shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-900 font-bold text-xs transition-colors"
                        >
                          {item.quantity === 1 ? (
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          ) : (
                            '−'
                          )}
                        </button>
                        <span className="w-7 text-center text-xs font-black text-zinc-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-900 font-bold text-xs transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Footer: Coupon + Summary + Checkout ────────────────── */}
          {cart.items.length > 0 && (
            <div className="border-t border-zinc-100 bg-white">
              {/* Coupon Section */}
              <div className="px-6 py-3.5 border-b border-zinc-100">
                {cart.coupon_code ? (
                  <div className="flex items-center justify-between bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <span className="material-symbols-outlined text-[16px]">redeem</span>
                      <span>{cart.coupon_code} applied!</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-emerald-600 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-zinc-300">sell</span>
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-900 uppercase font-bold placeholder:text-zinc-300 placeholder:normal-case focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors active:scale-95"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p className={`text-[11px] mt-1.5 font-medium ${couponMessage.isError ? 'text-red-500' : 'text-emerald-600'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="px-6 py-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-700 tabular-nums font-medium">{formatCurrency(cart.subtotal)}</span>
                </div>
                {cart.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatCurrency(cart.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span className={`tabular-nums font-medium ${cart.shipping_fee === 0 ? 'text-emerald-600 font-bold' : 'text-zinc-700'}`}>
                    {cart.shipping_fee === 0 ? 'FREE' : formatCurrency(cart.shipping_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-900 pt-3 border-t border-zinc-100">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(cart.total_amount)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] space-y-2.5">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 px-6 rounded-2xl bg-zinc-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-zinc-800 active:scale-[0.98] transition-all"
                >
                  <span>Checkout</span>
                  <span className="text-zinc-400">•</span>
                  <span className="tabular-nums">{formatCurrency(cart.total_amount)}</span>
                  <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
                </button>

                {/* Continue Shopping Link */}
                <button
                  onClick={handleClose}
                  className="w-full text-center text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors py-1"
                >
                  or Continue Shopping →
                </button>

                {/* Payment Methods */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  {['UPI', 'Visa', 'MC', 'RuPay'].map(m => (
                    <span key={m} className="text-[9px] font-bold text-zinc-300 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                  <span className="text-[9px] text-zinc-300 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px]">lock</span>
                    Secure
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
