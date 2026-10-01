import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

type TabKey = 'about' | 'terms' | 'privacy' | 'shipping' | 'sustainability';

const tabTitles: Record<TabKey, string> = {
  about: 'About UniStore & Craft',
  terms: 'Terms of Service',
  privacy: 'Privacy & Security Policy',
  shipping: 'Dispatch & Returns Policy',
  sustainability: 'Sustainability & Environmental Impact',
};

export const InfoPage: React.FC = () => {
  const location = useLocation();

  const getInitialTab = (): TabKey => {
    const p = location.pathname.toLowerCase();
    if (p.includes('term')) return 'terms';
    if (p.includes('privacy') || p.includes('cookie')) return 'privacy';
    if (p.includes('ship') || p.includes('return')) return 'shipping';
    if (p.includes('sustain') || p.includes('career') || p.includes('press')) return 'sustainability';
    return 'about';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);
  useDocumentTitle(tabTitles[activeTab] || 'Information & Policies');

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-zinc-50/60 py-8 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Header */}
        <div className="mb-6 flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <Link to="/" className="hover:text-zinc-950 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-900 font-bold capitalize">Information & Policies</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-10 shadow-xs mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider mb-4 border border-zinc-200/60">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
            <span>UniStore Official Documentation</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight mb-3">
            Clarity, Craft & Commitment
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 leading-relaxed max-w-2xl">
            Everything you need to know about our standards, terms, data security, and white-glove consumer guarantees.
          </p>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar pb-1 border-b border-zinc-100">
            {[
              { key: 'about', label: 'About & Philosophy', icon: 'auto_awesome' },
              { key: 'terms', label: 'Terms of Service', icon: 'gavel' },
              { key: 'privacy', label: 'Privacy & Security', icon: 'shield' },
              { key: 'shipping', label: 'Dispatch & Returns', icon: 'local_shipping' },
              { key: 'sustainability', label: 'Sustainability', icon: 'eco' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                  activeTab === tab.key
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-950'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: About & Story */}
        {activeTab === 'about' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 mb-3">The UniStore Mission</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                UniStore was established with a single, unapologetic conviction: daily tools and lifestyle objects should be built to endure. We curate high-utility essentials across personal audio, ergonomic workspaces, architectural decor, and travel hardware. Every single object featured in our catalog is rigorously stress-tested for tactile quality and longevity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                <span className="material-symbols-outlined text-zinc-900 text-[24px] mb-2">verified_user</span>
                <h3 className="text-sm font-bold text-zinc-950 mb-1">100% Authorized Distribution</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Direct brand partnerships guarantee genuine serials, intact factory warranties, and authentic materials.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                <span className="material-symbols-outlined text-zinc-900 text-[24px] mb-2">bolt</span>
                <h3 className="text-sm font-bold text-zinc-950 mb-1">Metro Same-Day Dispatch</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Strategically located fulfillment centers ensure orders placed before 2:00 PM leave our hubs the exact same day.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Terms of Service */}
        {activeTab === 'terms' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-sm text-zinc-600 leading-relaxed animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 mb-2">Terms of Service</h2>
              <p className="text-xs text-zinc-400">Last updated: October 2026</p>
            </div>
            <p>
              By accessing UniStore or placing an order through our digital storefronts, native applications, or mobile web platforms, you agree to be bound by these Terms of Service.
            </p>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">1. Orders & Pricing</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                All prices listed are in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST 18%). We reserve the right to cancel orders arising from typographical or technical pricing anomalies, with full immediate refunds issued to the source payment method.
              </p>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">2. Payment & Cryptographic Security</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                All online transactions via UPI, Credit/Debit cards, and Net Banking are processed through our PCI-DSS compliant partner Razorpay. UniStore never stores full card numbers, CVVs, or bank credentials.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Privacy & Security */}
        {activeTab === 'privacy' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-sm text-zinc-600 leading-relaxed animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 mb-2">Privacy & Data Governance</h2>
              <p className="text-xs text-zinc-400">Strict Zero-Brokerage Privacy Policy</p>
            </div>
            <p>
              We value your privacy as fiercely as our own. We never sell, lease, or monetize your personal shopping habits, phone numbers, or addresses with third-party data brokers.
            </p>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
              <span className="material-symbols-outlined text-emerald-700 text-[20px] mt-0.5">lock</span>
              <div className="text-xs">
                <span className="font-bold text-emerald-900 block mb-0.5">Cloud-Encrypted Persistence</span>
                <p className="text-emerald-700 leading-relaxed">
                  Your profile data and shipping addresses are protected using industry-standard TLS encryption at rest and in transit via Supabase Cloud PostgreSQL.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Dispatch & Returns */}
        {activeTab === 'shipping' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 mb-2">Express Dispatch & 7-Day Returns</h2>
              <p className="text-xs text-zinc-400">Doorstep reverse pickups across 19,000+ PIN codes</p>
            </div>
            <div className="space-y-4 text-xs text-zinc-500 leading-relaxed">
              <p>
                <strong>Complimentary Delivery:</strong> Orders exceeding ₹999 qualify for Free Express Shipping. A nominal ₹99 fee applies to smaller baskets.
              </p>
              <p>
                <strong>7-Day Returns:</strong> If you are not satisfied with your purchase, initiate a return from your Account or Order Tracking portal. Our verified courier associate will arrive with a pre-labeled satchel for reverse pickup.
              </p>
              <p>
                <strong>Instant Refund:</strong> Once the sealed return passes automated inspection at our regional depot, your refund is credited within 24 to 48 hours to your source account or UPI VPA.
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Sustainability */}
        {activeTab === 'sustainability' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 mb-2">Conscious Material Standards</h2>
              <p className="text-xs text-zinc-400">100% Recyclable corrugated packaging & plastic-free fulfillment</p>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every parcel shipped from our facilities uses soy-based inks, water-activated reinforced kraft paper tape, and molded pulp cushions. We audit our manufacturer partners to ensure ethical factory wages and reduced carbon logistics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
