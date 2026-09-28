import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Slide {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  image: string;
  badgeTitle: string;
  badgeSub: string;
  specs: { label: string; value: string }[];
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: 'Spring / Summer 2026 Edition',
    tagColor: 'bg-emerald-400',
    title: 'Crafted for Modern Rituals.',
    subtitle: 'Aura Studio Acoustic Collection',
    description: 'Studio-grade planar drivers and 42dB hybrid noise-cancelling encased in bead-blasted anodized aluminum.',
    ctaText: 'Explore Audio Gear',
    ctaLink: '/shop?category=tech-audio',
    secondaryCtaText: 'Shop All New',
    secondaryCtaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80',
    badgeTitle: 'Aura Sound Pro',
    badgeSub: 'Planar Magnetic • 40H Playtime',
    specs: [
      { label: 'Rating', value: '4.92 ★' },
      { label: 'Acoustics', value: 'Hi-Res Lossless' },
      { label: 'Metros Dispatch', value: 'Same-Day' },
    ],
  },
  {
    id: 2,
    tag: 'Architectural Workspace',
    tagColor: 'bg-amber-400',
    title: 'The Ergonomic Living Setup.',
    subtitle: 'Sculpt Walnut & Carbon Series',
    description: 'Designed in collaboration with industrial ergonomists. Active lumbar cradles and hand-finished American walnut.',
    ctaText: 'View Workspace Craft',
    ctaLink: '/shop?category=home-living',
    secondaryCtaText: 'Desk Accessories',
    secondaryCtaLink: '/shop?category=desk-setup',
    image: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=1200&q=80',
    badgeTitle: 'Lumbar Sculpt Chair',
    badgeSub: 'Cold-Cure Foam • Synchro-Tilt',
    specs: [
      { label: 'Warranty', value: '5-Year Shield' },
      { label: 'Wood Origin', value: 'FSC Walnut' },
      { label: 'Weight Limit', value: '150 kg' },
    ],
  },
  {
    id: 3,
    tag: 'Everyday Tactile Carry',
    tagColor: 'bg-blue-400',
    title: 'Objects Built to Endure.',
    subtitle: 'Aero Titanium Vacuum Vessels',
    description: 'Double-walled aerospace grade stainless steel. Keeps liquids ice cold for 24 hours or steaming hot for 14 hours.',
    ctaText: 'Shop Daily Carry',
    ctaLink: '/shop?category=travel-gear',
    secondaryCtaText: 'See All Items',
    secondaryCtaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&q=80',
    badgeTitle: 'Thermal Vessel 750ml',
    badgeSub: '18/8 Pro Steel • Leakproof',
    specs: [
      { label: 'Thermal Retention', value: '24h Cold / 14h Hot' },
      { label: 'Materials', value: 'BPA & Toxin Free' },
      { label: 'Finish', value: 'Ceramic Powder' },
    ],
  },
];

export const HeroSection: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[activeSlide];

  return (
    <section
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white border border-zinc-800 p-6 sm:p-12 shadow-2xl transition-all">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-zinc-800/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-zinc-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Tag pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/80 shadow-xs mb-4">
                <span className={`w-2 h-2 rounded-full ${slide.tagColor} animate-ping`} />
                <span className="text-zinc-200 text-[11px] font-extrabold uppercase tracking-widest">
                  {slide.tag}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] transition-all">
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p className="text-amber-400/90 text-xs sm:text-sm font-bold uppercase tracking-wider mt-2.5">
                {slide.subtitle}
              </p>

              {/* Description */}
              <p className="text-zinc-400 text-xs sm:text-base mt-3 max-w-lg leading-relaxed font-normal">
                {slide.description}
              </p>

              {/* Dynamic Specs Bar */}
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 pt-5 border-t border-zinc-800 text-xs">
                {slide.specs.map((sp, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className="h-6 w-px bg-zinc-800" />}
                    <div>
                      <div className="text-base sm:text-lg font-black text-white">{sp.value}</div>
                      <div className="text-[11px] text-zinc-500">{sp.label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={slide.ctaLink}
                className="py-3.5 px-8 rounded-full bg-white text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all shadow-md group"
              >
                <span>{slide.ctaText}</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <Link
                to={slide.secondaryCtaLink}
                className="py-3.5 px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>{slide.secondaryCtaText}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Showcase Image with Interactive Overlays */}
          <div className="lg:col-span-5 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] relative bg-zinc-900 border border-zinc-800 shadow-xl group">
            <img
              key={slide.image}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out animate-fade-in"
              src={slide.image}
              alt={slide.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/20 to-transparent" />

            {/* Floating Top Badge */}
            <div className="absolute top-4 left-4 bg-zinc-950/90 backdrop-blur-md text-white border border-zinc-700 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold">
              <span className="material-symbols-outlined text-amber-400 text-[16px]">verified</span>
              <span>Curator's Spotlight</span>
            </div>

            {/* Floating Soundwave Equalizer Animation (for Audio slide) */}
            {slide.id === 1 && (
              <div className="absolute top-4 right-4 bg-zinc-950/90 backdrop-blur-md text-white border border-zinc-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-emerald-400 h-2 animate-pulse" />
                  <span className="w-0.5 bg-emerald-400 h-3 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 bg-emerald-400 h-1.5 animate-pulse" style={{ animationDelay: '300ms' }} />
                  <span className="w-0.5 bg-emerald-400 h-2.5 animate-pulse" style={{ animationDelay: '450ms' }} />
                </div>
                <span className="text-[10px] font-bold text-zinc-300">Lossless Audio</span>
              </div>
            )}

            {/* Floating Bottom Card */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div>
                <span className="text-white font-bold text-sm drop-shadow-md block">
                  {slide.badgeTitle}
                </span>
                <span className="text-zinc-400 text-xs">{slide.badgeSub}</span>
              </div>
              <Link
                to={slide.ctaLink}
                className="bg-white text-zinc-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md hover:bg-zinc-200 transition-colors"
              >
                Inspect →
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Switcher Controls (Bottom Bar) */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {SLIDES.map((s, idx) => {
              const isActive = activeSlide === idx;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`text-left transition-all ${
                    isActive ? 'opacity-100' : 'opacity-40 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-zinc-400">0{idx + 1}</span>
                    <span className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[150px]">
                      {s.badgeTitle}
                    </span>
                  </div>
                  {/* Progress line */}
                  <div className="w-24 sm:w-36 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-white transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
              aria-label="Previous Slide"
              className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % SLIDES.length)}
              aria-label="Next Slide"
              className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
