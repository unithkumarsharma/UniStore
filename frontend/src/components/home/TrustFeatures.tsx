import React from 'react';

const FEATURES = [
  {
    icon: 'diamond',
    title: 'Top 1% Curation',
    description: 'Every product is hand-evaluated for industrial build quality, ergonomics, and timeless aesthetic.',
    highlight: 'Rigorous 24-point audit',
  },
  {
    icon: 'local_shipping',
    title: 'Express Insured Delivery',
    description: 'Complimentary shipping across India on orders over ₹999. Same-day dispatch with live doorstep tracking.',
    highlight: 'Zero transit risk guarantee',
  },
  {
    icon: 'verified_user',
    title: '1-Year UniStore Shield',
    description: 'Every electronic and lifestyle object comes backed with our official 1-year replacement warranty.',
    highlight: 'No-questions-asked swap',
  },
  {
    icon: 'support_agent',
    title: 'VIP Concierge Desk',
    description: 'Connect directly with our curation specialists on WhatsApp or call in under 3 minutes for setup assistance.',
    highlight: 'Real humans, 7 days a week',
  },
];

export const TrustFeatures: React.FC = () => {
  return (
    <section className="py-6 sm:py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200/90 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[15px] text-amber-500">verified</span>
            <span>The UniStore Standard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Why Design Enthusiasts Choose Us
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-2 leading-relaxed">
            We don't stock thousands of low-grade products. We curate only exceptional items that elevate your daily space and workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-50/60 border border-zinc-200/70 hover:border-zinc-300 hover:bg-white hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-1.5">{item.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-200/60 flex items-center gap-1.5 text-[11px] font-bold text-zinc-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{item.highlight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
