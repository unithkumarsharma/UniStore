import React from 'react';
import { Link } from 'react-router-dom';

const GALLERY_ITEMS = [
  {
    id: 1,
    creator: '@alex.minimalist',
    role: 'Product Lead, Bengaluru',
    product: 'Lumbar Sculpt Chair & Walnut Desk',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    likes: '1,420',
  },
  {
    id: 2,
    creator: '@tanya_creates',
    role: 'Music Producer, Mumbai',
    product: 'Aura Studio Wireless Headphones',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
    likes: '2,190',
  },
  {
    id: 3,
    creator: '@karan.arch',
    role: 'Interior Architect, Delhi',
    product: 'Nordic Ceramic Mug & Pour Over',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    likes: '890',
  },
  {
    id: 4,
    creator: '@studio_dev',
    role: 'Founder, Hyderabad',
    product: 'Aero Titanium Vessel 750ml',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    likes: '1,750',
  },
];

export const CommunityGallery: React.FC = () => {
  return (
    <section className="py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[15px] text-pink-600">photo_camera</span>
            <span>#UniStoreSetup</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Styled in the Wild
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">
            Real spaces designed by our community of architects, engineers, and creatives across India.
          </p>
        </div>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-900 hover:text-zinc-600 group self-start sm:self-auto"
        >
          <span>Share Your Setup #UniStoreSetup</span>
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
            open_in_new
          </span>
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-100 border border-zinc-200 shadow-2xs hover:shadow-card-hover transition-all duration-300"
          >
            <img
              src={item.image}
              alt={item.creator}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between" />

            {/* Bottom creator info appearing on hover */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end">
              <div className="flex items-center justify-between text-xs font-bold mb-1 drop-shadow-md">
                <span>{item.creator}</span>
                <span className="flex items-center gap-1 text-[11px] opacity-90">
                  <span className="material-symbols-outlined text-[13px] text-pink-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                  {item.likes}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 line-clamp-1 drop-shadow-sm">
                {item.product}
              </p>
              <div className="mt-2.5 pt-2 border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to="/shop"
                  className="w-full py-1.5 px-3 rounded-lg bg-white/95 text-zinc-950 text-[11px] font-bold text-center block hover:bg-white shadow-xs"
                >
                  Shop This Setup
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
