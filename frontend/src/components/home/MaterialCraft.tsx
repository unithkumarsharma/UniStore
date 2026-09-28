import React, { useState } from 'react';

const MATERIALS = [
  {
    id: 'aluminum',
    name: 'Aerospace-Grade 6063 Aluminum',
    tagline: 'Precision CNC-Milled from Monolithic Billets',
    description: 'Each chassis is diamond-cut with micron tolerances, bead-blasted with 120-mesh ceramic spheres, and electrically anodized to resist sweat, scratches, and daily oxidation.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
    specs: [
      { label: 'Surface Finish', value: 'Bead-Blasted Satin' },
      { label: 'Tensile Strength', value: '241 MPa' },
      { label: 'Recyclability', value: '100% Infinite' },
    ],
  },
  {
    id: 'walnut',
    name: 'Sustainable American Black Walnut',
    tagline: 'FSC-Certified Hardwood from Responsible Ateliers',
    description: 'Sustainably harvested from certified temperate forests. Grain-matched by master joiners, sanded through 4 progressive grits, and sealed with natural organic tung oil.',
    image: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&q=80',
    specs: [
      { label: 'Grain Density', value: '640 kg/m³' },
      { label: 'Sealing Coat', value: 'Organic Tung Oil' },
      { label: 'Aesthetic Ageing', value: 'Develops Deep Patina' },
    ],
  },
  {
    id: 'steel',
    name: 'Electropolished 18/8 Stainless Steel',
    tagline: 'Vacuum-Insulated Thermal Barrier Technology',
    description: 'Double-walled construction engineered with a copper-plated core layer to eliminate radiant heat transfer. Keeps hydration ice-cold for 24 hours with zero metallic aftertaste.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    specs: [
      { label: 'Thermal Retention', value: '24h Cold / 14h Hot' },
      { label: 'Chemical Safety', value: 'Zero BPA / Phthalates' },
      { label: 'Interior Wall', value: 'Electropolished 304' },
    ],
  },
];

export const MaterialCraft: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const current = MATERIALS[activeTab];

  return (
    <section className="py-6 sm:py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[15px] text-zinc-900">precision_manufacturing</span>
              <span>Tactile Engineering</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Materials Built to Outlast
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1">
              We never use hollow plastics or peelable faux laminates. Every texture is honest, substantial, and durable.
            </p>
          </div>

          {/* Material Switcher Tabs */}
          <div className="flex flex-wrap gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 self-start md:self-auto">
            {MATERIALS.map((mat, idx) => (
              <button
                key={mat.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === idx
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {mat.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-zinc-50/80 rounded-2xl p-6 sm:p-8 border border-zinc-200/80">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                {current.tagline}
              </span>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-3">
                {current.name}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal mb-6">
                {current.description}
              </p>

              {/* Technical specs cards */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-200">
                {current.specs.map((sp, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
                    <div className="text-xs sm:text-sm font-black text-zinc-900 leading-tight">
                      {sp.value}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 uppercase font-semibold">
                      {sp.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-[16/10] border border-zinc-200 shadow-md">
            <img
              src={current.image}
              alt={current.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80';
              }}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
