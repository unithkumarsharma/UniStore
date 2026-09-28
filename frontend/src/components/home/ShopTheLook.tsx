import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { useCart } from '../../store/CartContext';
import { api } from '../../services/api';

interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  name: string;
  price: number;
  slug: string;
  image: string;
  category: string;
}

const LOOKS = [
  {
    id: 'workspace',
    title: 'The Minimalist Executive Suite',
    subtitle: 'Curated by Arjun Mehra, Spatial Designer',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1600&q=85',
    hotspots: [
      {
        id: 'spot-1',
        x: 48,
        y: 42,
        name: 'Aura Sound Pro Wireless Noise-Cancelling Headphones',
        price: 8499,
        slug: 'aura-sound-pro-wireless-noise-cancelling-headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
        category: 'Tech & Audio',
      },
      {
        id: 'spot-2',
        x: 28,
        y: 65,
        name: 'Lumbar Ergonomic Sculpt Desk Chair',
        price: 18999,
        slug: 'lumbar-ergonomic-sculpt-desk-chair',
        image: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=400&q=80',
        category: 'Home & Living',
      },
      {
        id: 'spot-3',
        x: 75,
        y: 52,
        name: 'Thermal Vessel Vacuum Insulated Bottle 750ml',
        price: 1499,
        slug: 'thermal-vessel-vacuum-insulated-bottle-750ml',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',
        category: 'Travel Gear',
      },
    ],
  },
  {
    id: 'audio-lounge',
    title: 'Acoustic Sanctuary & Lounge',
    subtitle: 'Curated by Studio Mono, Tokyo / Mumbai',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=85',
    hotspots: [
      {
        id: 'spot-4',
        x: 52,
        y: 48,
        name: 'Aura Sound Pro Wireless Noise-Cancelling Headphones',
        price: 8499,
        slug: 'aura-sound-pro-wireless-noise-cancelling-headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
        category: 'Tech & Audio',
      },
      {
        id: 'spot-5',
        x: 35,
        y: 62,
        name: 'Lumbar Ergonomic Sculpt Desk Chair',
        price: 18999,
        slug: 'lumbar-ergonomic-sculpt-desk-chair',
        image: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=400&q=80',
        category: 'Home & Living',
      },
    ],
  },
];

export const ShopTheLook: React.FC = () => {
  const { addToCart } = useCart();
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(LOOKS[0].hotspots[0]);
  const [addedHotspotId, setAddedHotspotId] = useState<string | null>(null);

  const currentLook = LOOKS[activeLookIndex];

  const handleAddToCart = (spot: Hotspot, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const all = api.getCachedProducts();
    const product = all.find((p) => p.slug === spot.slug || p.name.includes(spot.name.slice(0, 15)));
    if (product) {
      addToCart(product);
    } else {
      addToCart({
        id: spot.id,
        name: spot.name,
        slug: spot.slug,
        base_price: spot.price,
        stock: 10,
        sku: 'LOOK-1',
        is_active: true,
        is_featured: true,
        is_bestseller: false,
        category_id: 'cat-1',
        rating: 4.9,
        review_count: 120,
        description: 'Curated studio look item.',
        images: [{ id: '1', product_id: spot.id, image_url: spot.image, display_order: 1, is_primary: true }],
      });
    }
    setAddedHotspotId(spot.id);
    setTimeout(() => setAddedHotspotId(null), 1200);
  };

  return (
    <section className="py-6 sm:py-10">
      <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-10 border border-zinc-800 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/40 rounded-full blur-3xl pointer-events-none" />

        {/* Header row */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Interactive Editorial Lookbook</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Shop The Curated Space
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Tap the glowing pins to inspect materials, prices, and add directly to your bag.
            </p>
          </div>

          {/* Look Switcher Pills */}
          <div className="flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 self-start md:self-auto">
            {LOOKS.map((look, idx) => (
              <button
                key={look.id}
                type="button"
                onClick={() => {
                  setActiveLookIndex(idx);
                  setActiveHotspot(look.hotspots[0]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLookIndex === idx
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {look.id === 'workspace' ? '01. Executive Desk' : '02. Audio Lounge'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interactive Stage */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left / Center: Interactive Room Photo with Hotspot Pins */}
          <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-zinc-900">
            <img
              src={currentLook.image}
              alt={currentLook.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            {/* Glowing Hotspot Pins */}
            {currentLook.hotspots.map((spot) => {
              const isSelected = activeHotspot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(spot)}
                    aria-label={`Inspect ${spot.name}`}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-white text-zinc-950 scale-125 shadow-xl ring-4 ring-white/30'
                        : 'bg-zinc-950/80 backdrop-blur-md text-white hover:scale-110 border border-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isSelected ? 'check' : 'add'}
                    </span>

                    {/* Radar Pulse ring */}
                    {!isSelected && (
                      <span className="absolute inset-0 rounded-full bg-white/40 animate-ping pointer-events-none" />
                    )}
                  </button>
                </div>
              );
            })}

            {/* Floating Bottom Info Pill */}
            <div className="absolute bottom-4 left-4 bg-zinc-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-800 text-[11px] text-zinc-300 font-medium">
              💡 Click any (+) pin to inspect and buy
            </div>
          </div>

          {/* Right Column: Selected Item Detail Card */}
          <div className="lg:col-span-4">
            {activeHotspot ? (
              <div className="bg-zinc-900/90 rounded-2xl p-6 border border-zinc-800 flex flex-col justify-between h-full backdrop-blur-md shadow-xl animate-fade-in">
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 mb-4">
                    <img
                      src={activeHotspot.image}
                      alt={activeHotspot.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                      {activeHotspot.category}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                    Featured in {currentLook.title}
                  </span>

                  <h3 className="text-base font-extrabold text-white leading-snug">
                    {activeHotspot.name}
                  </h3>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-black text-white tabular-nums">
                      {formatCurrency(activeHotspot.price)}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Free Same-Day Delivery
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(activeHotspot, e)}
                    className={`w-full py-3 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                      addedHotspotId === activeHotspot.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-zinc-950 hover:bg-zinc-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {addedHotspotId === activeHotspot.id ? 'check' : 'shopping_bag'}
                    </span>
                    <span>
                      {addedHotspotId === activeHotspot.id ? 'Added to Bag' : 'Add to Bag'}
                    </span>
                  </button>

                  <Link
                    to={`/products/${activeHotspot.slug}`}
                    className="w-full py-2.5 rounded-full border border-zinc-700 text-center text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                  >
                    View Full Specifications →
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
