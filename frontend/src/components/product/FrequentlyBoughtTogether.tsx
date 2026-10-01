import React, { useState, useEffect } from 'react';
import { useCart } from '../../store/CartContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import type { Product } from '../../types';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({ currentProduct }) => {
  const { addToCart } = useCart();
  const [bundleProducts, setBundleProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([currentProduct.id]);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const all = api.getCachedProducts();
    // Pick 2 complementary products from other categories or bestsellers
    const complementary = all
      .filter((p) => p.id !== currentProduct.id && p.is_active)
      .slice(0, 2);

    setBundleProducts(complementary);
    setSelectedIds([currentProduct.id, ...complementary.map((p) => p.id)]);
  }, [currentProduct.id]);

  if (bundleProducts.length === 0) return null;

  const allItems = [currentProduct, ...bundleProducts];
  const activeItems = allItems.filter((it) => selectedIds.includes(it.id));

  const rawTotal = activeItems.reduce((sum, it) => sum + it.base_price, 0);
  // 10% Combo Bundle Discount
  const bundleDiscount = activeItems.length >= 2 ? Math.round(rawTotal * 0.10) : 0;
  const comboPrice = rawTotal - bundleDiscount;

  const toggleSelect = (id: string) => {
    // Current product cannot be deselected
    if (id === currentProduct.id) return;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddBundleToBag = () => {
    activeItems.forEach((it) => {
      addToCart(it, undefined, 1);
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <section className="my-10 bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 inline-block mb-1.5">
            Curator's Ritual Bundle
          </span>
          <h3 className="text-lg sm:text-xl font-black text-zinc-950 tracking-tight">
            Frequently Paired Together
          </h3>
        </div>
        {bundleDiscount > 0 && (
          <div className="text-right sm:text-right">
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Bundle Savings: Save {formatCurrency(bundleDiscount)} (10% Off)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Visual Product Cards with Plus Signs */}
        <div className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 overflow-x-auto">
          {allItems.map((prod, idx) => {
            const isSelected = selectedIds.includes(prod.id);
            const isBase = prod.id === currentProduct.id;
            return (
              <React.Fragment key={prod.id}>
                {idx > 0 && (
                  <span className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 font-bold flex items-center justify-center shrink-0 text-sm">
                    +
                  </span>
                )}
                <div
                  onClick={() => !isBase && toggleSelect(prod.id)}
                  className={`w-full sm:w-48 bg-zinc-50 rounded-2xl p-3.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-50/80 shadow-2xs'
                      : 'border-zinc-200 opacity-60'
                  }`}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-zinc-200/60 mb-2.5">
                    <img
                      src={prod.images?.[0]?.image_url || '/placeholder.png'}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isBase}
                      onChange={() => toggleSelect(prod.id)}
                      className="absolute top-2 left-2 w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                    {isBase && (
                      <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold bg-zinc-950 text-white px-2 py-0.5 rounded-full">
                        This Item
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">{prod.name}</h4>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-zinc-950 tabular-nums">
                      {formatCurrency(prod.base_price)}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Column: Financial Summary & 1-Click Action */}
        <div className="lg:col-span-4 bg-zinc-50/90 rounded-2xl p-5 border border-zinc-200/80 flex flex-col justify-between h-full">
          <div>
            <span className="text-[11px] text-zinc-500 font-semibold block mb-1">
              Combo Price for {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'}:
            </span>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-black text-zinc-950 tabular-nums">
                {formatCurrency(comboPrice)}
              </span>
              {bundleDiscount > 0 && (
                <span className="text-sm font-semibold text-zinc-400 line-through tabular-nums">
                  {formatCurrency(rawTotal)}
                </span>
              )}
            </div>
            {bundleDiscount > 0 ? (
              <p className="text-[11px] text-emerald-700 font-bold">
                ✓ 10% Bundle Discount applied instantly at checkout
              </p>
            ) : (
              <p className="text-[11px] text-zinc-400 font-medium">
                Select 2 or more items to unlock 10% combo discount
              </p>
            )}
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleAddBundleToBag}
              className={`w-full py-3.5 px-5 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-300 active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isAdded ? 'check_circle' : 'library_add'}
              </span>
              <span>{isAdded ? 'Added All to Bag!' : `Add All ${activeItems.length} Items to Bag`}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
