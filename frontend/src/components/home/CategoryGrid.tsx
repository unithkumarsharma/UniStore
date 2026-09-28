import React from 'react';
import { Link } from 'react-router-dom';
import type { Category, Product } from '../../types';

interface CategoryGridProps {
  categories: Category[];
  products: Product[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, products }) => {
  // Enhanced editorial descriptions & curated imagery
  const categoryMeta: Record<string, { tag: string; desc: string; img: string }> = {
    'tech-audio': {
      tag: 'Acoustics & Precision',
      desc: 'Planar magnetic drivers, ANC gear, and mechanical keyboards',
      img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
    },
    'home-living': {
      tag: 'Ergonomic Interiors',
      desc: 'Architectural seating, solid walnut furniture, and ambient lamps',
      img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    },
    'desk-setup': {
      tag: 'Workspace Studio',
      desc: 'Anodized aluminum risers, felt desk pads, and cable architecture',
      img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    },
    'travel-gear': {
      tag: 'Everyday Carry',
      desc: 'Vacuum titanium bottles, Cordura organizers, and tactical vessels',
      img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    },
    'coffee-kitchen': {
      tag: 'Brewing Rituals',
      desc: 'Precision gooseneck kettles, double-wall borosilicate glass, and manual grinders',
      img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    },
  };

  return (
    <section className="py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
            <span>Curated Environments</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Shop by Curated Space
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">
            Organized around daily rituals, workspaces, and personal soundstages.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-900 hover:text-zinc-600 group self-start sm:self-auto"
        >
          <span>View All 5 Collections</span>
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>

      {/* Editorial Grid: 1 Large Hero Card + 4 Complementary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {categories.map((cat, idx) => {
          const count = products.filter(
            (p) => p.category_id === cat.id || p.category_slug === cat.slug
          ).length;
          const displayCount = count > 0 ? count : (cat.item_count || 1);
          const meta = categoryMeta[cat.slug] || {
            tag: 'Design Object',
            desc: cat.description || 'Curated essentials for modern living',
            img: cat.image_url,
          };

          // Make first item 7 cols, second 5 cols, others 4 cols each
          const spanClass = idx === 0 
            ? 'md:col-span-7 aspect-[16/10]' 
            : idx === 1 
            ? 'md:col-span-5 aspect-[16/10]' 
            : 'md:col-span-4 aspect-[4/3]';

          return (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className={`group relative rounded-3xl overflow-hidden border border-zinc-200/90 shadow-xs hover:shadow-card-hover hover:border-zinc-400 transition-all duration-500 flex flex-col justify-end p-6 sm:p-7 ${spanClass}`}
            >
              {/* Image with zoom on hover */}
              <img
                src={meta.img}
                alt={cat.name}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80';
                }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Deep Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent transition-opacity duration-300 group-hover:from-zinc-950/95" />

              {/* Top Meta Tag */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-zinc-300 bg-zinc-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-700/60">
                  {meta.tag}
                </span>
                <span className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                  {displayCount} {displayCount === 1 ? 'Object' : 'Objects'}
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="relative z-10 text-white">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug group-hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>{cat.name}</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white group-hover:text-zinc-950 flex items-center justify-center transition-all group-hover:translate-x-1">
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-1 opacity-90 font-normal">
                  {meta.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
