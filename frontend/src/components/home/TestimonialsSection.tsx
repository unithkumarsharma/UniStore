import React from 'react';

const REVIEWS = [
  {
    id: 1,
    name: 'Rohan Mehra',
    role: 'Principal Architect',
    location: 'Bengaluru',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    purchased: 'Lumbar Ergonomic Sculpt Desk Chair',
    quote: 'The unboxing experience was immaculate—zero styrofoam, custom magnetic latches, and the walnut texture feels so rich. Truly international standard design delivered right to my studio.',
    date: '3 days ago',
  },
  {
    id: 2,
    name: 'Ananya Sharma',
    role: 'Creative Director',
    location: 'Mumbai',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
    purchased: 'Aura Wireless Studio Headphones',
    quote: 'Ordered at 11 AM and had it delivered to Bandra before 6 PM the same evening. The active noise cancellation and anodized aluminum feel leagues ahead of anything else at this price point.',
    date: '1 week ago',
  },
  {
    id: 3,
    name: 'Vikramaditya Sengupta',
    role: 'Staff Systems Engineer',
    location: 'Gurugram',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    purchased: 'Aero Titanium Vacuum Insulated Flask',
    quote: 'UniStore is the only eCommerce destination in India that feels like an art gallery with actual reliable customer support. Needed an invoice for company reimbursement and support sent it in 2 minutes.',
    date: '2 weeks ago',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[15px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span>Real Customer Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Loved by 25,000+ Digital Natives
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">
            Read verified experiences from creators, architects, and founders who trust UniStore daily.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-zinc-200/80 shadow-2xs self-start sm:self-auto">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            ))}
          </div>
          <span className="text-xs font-black text-zinc-900">4.92 / 5.0</span>
          <span className="text-[11px] text-zinc-400">from 25,480+ orders</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/90 shadow-xs flex flex-col justify-between hover:shadow-card-hover hover:border-zinc-300 transition-all duration-300"
          >
            <div>
              {/* Star Rating & Verified Pill */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex text-amber-400">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>Verified Buyer</span>
                </span>
              </div>

              {/* Quote */}
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-normal">
                "{review.quote}"
              </p>

              {/* Product Tag */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="material-symbols-outlined text-[14px] text-zinc-400">shopping_bag</span>
                <span className="truncate font-medium">{review.purchased}</span>
              </div>
            </div>

            {/* Author Profile */}
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 leading-tight">{review.name}</h4>
                  <p className="text-[11px] text-zinc-400">
                    {review.role} • {review.location}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">{review.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
