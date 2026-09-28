import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

const SOCIAL_LINKS = [
  { name: 'Instagram', icon: 'photo_camera', url: '#' },
  { name: 'Twitter', icon: 'tag', url: '#' },
  { name: 'YouTube', icon: 'play_circle', url: '#' },
  { name: 'Pinterest', icon: 'push_pin', url: '#' },
];

const PAYMENT_METHODS = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Amex', 'NetBanking'];

export const Footer: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <footer className="bg-zinc-950 text-white mt-16 relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-zinc-800/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-zinc-700/20 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Newsletter Strip ──────────────────────────────────────────── */}
      <div className="border-b border-zinc-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/60 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 border border-zinc-700/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Stay in the Loop
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1.5">
                Get Early Access & Exclusive Drops
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Join 12,000+ design-obsessed people who receive our weekly curation of design objects, lifestyle gear, and exclusive launches.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              {subscribed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-5 rounded-2xl text-sm font-semibold flex items-center gap-3">
                  <span className="material-symbols-outlined text-[24px]">celebration</span>
                  <div>
                    <p className="font-bold">You're in!</p>
                    <p className="text-xs text-emerald-400/80 font-normal mt-0.5">Welcome to our design community. Check your inbox for a special welcome gift.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-5 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/10 transition-all"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3.5 rounded-full bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <span>Subscribe</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium pl-2">
                    No spam ever. Unsubscribe with 1-click anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Content ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-5">
              <img src={logoImg} alt="UniStore Logo" className="h-10 w-auto object-contain brightness-0 invert opacity-90" />
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">
              Curated everyday essentials for modern living. Designed for digital natives seeking quality and effortless utility.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  className="w-9 h-9 rounded-full bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 hover:border-zinc-600 transition-all hover:scale-110 active:scale-90"
                >
                  <span className="material-symbols-outlined text-[18px]">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.15em] mb-4">Collections</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Tech & Audio', slug: 'tech-audio' },
                { name: 'Home & Living', slug: 'home-living' },
                { name: 'Coffee & Kitchen', slug: 'coffee-kitchen' },
                { name: 'Desk Setup', slug: 'desk-setup' },
                { name: 'Travel Gear', slug: 'travel-gear' },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="text-sm text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-1.5 group"
                  >
                    <span className="w-0 h-px bg-white group-hover:w-3 transition-all duration-300" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.15em] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'About UniStore', to: '/about' },
                { name: 'Our Story', to: '/story' },
                { name: 'Careers', to: '/careers' },
                { name: 'Press & Media', to: '/press' },
                { name: 'Sustainability', to: '/sustainability' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-1.5 group"
                  >
                    <span className="w-0 h-px bg-white group-hover:w-3 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.15em] mb-4">Help & Support</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Track Shipment', to: '/orders/track', icon: 'local_shipping' },
                { name: 'Returns & Exchanges', to: '/account/orders', icon: 'autorenew' },
                { name: 'FAQs', to: '/#faq', icon: 'help' },
                { name: 'Terms of Service', to: '/terms', icon: 'description' },
                { name: 'Privacy Policy', to: '/privacy', icon: 'lock' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-1.5 group"
                  >
                    <span className="w-0 h-px bg-white group-hover:w-3 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.15em] mb-4">Get in Touch</h4>
            <div className="space-y-3">
              <a
                href="mailto:support@unistore.com"
                className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-white transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                </span>
                support@unistore.com
              </a>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-emerald-400 transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">chat</span>
                </span>
                WhatsApp Concierge
              </a>
              <div className="flex items-center gap-2.5 text-sm text-zinc-400">
                <span className="w-8 h-8 rounded-full bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                </span>
                Mon–Sat, 10am–7pm IST
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment Methods & Trust ─────────────────────────────────── */}
        <div className="border-t border-zinc-800/60 pt-6 pb-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Secure Payments</span>
              <div className="flex items-center gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <span
                    key={method}
                    className="px-2.5 py-1 rounded-md bg-zinc-800/60 border border-zinc-700/40 text-[10px] font-bold text-zinc-400"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-500">lock</span>
                SSL Encrypted
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-blue-400">verified_user</span>
                PCI Compliant
              </span>
              <span className="text-zinc-700">•</span>
              <span>🇮🇳 Made for India</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Copyright ─────────────────────────────────────────── */}
        <div className="border-t border-zinc-800/40 mt-4 pt-6 pb-12 md:pb-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-500 font-medium">
            © {new Date().getFullYear()} UniStore. All rights reserved. Crafted with editorial precision.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link to="/cookies" className="hover:text-zinc-300 transition-colors">Cookies</Link>
            <Link to="/sitemap" className="hover:text-zinc-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
