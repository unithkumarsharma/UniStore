import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ANNOUNCEMENTS = [
  {
    icon: 'local_shipping',
    highlight: 'Complimentary Express Delivery',
    text: 'on all orders above ₹999 across India',
  },
  {
    icon: 'bolt',
    highlight: 'Same-Day Dispatch',
    text: 'for orders placed before 2:00 PM',
  },
  {
    icon: 'verified_user',
    highlight: '1-Year UniStore Shield',
    text: 'comprehensive replacement warranty',
  },
  {
    icon: 'cached',
    highlight: '7-Day Hassle-Free Returns',
    text: 'with instant reverse doorstep pickup',
  },
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[currentIndex];

  return (
    <div className="bg-zinc-950 text-zinc-300 text-[11px] sm:text-xs py-2 px-4 border-b border-zinc-800/80 transition-all select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Micro Guarantee Pill */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
            Editorial Curation
          </span>
        </div>

        {/* Center: Dynamic Auto-Cycling Trust USP */}
        <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
          <span className="material-symbols-outlined text-amber-400 text-[15px] sm:text-[16px] animate-fade-in flex-shrink-0">
            {current.icon}
          </span>
          <p className="truncate">
            <strong className="text-white font-bold tracking-tight mr-1.5">{current.highlight}</strong>
            <span className="text-zinc-400 font-medium hidden sm:inline">{current.text}</span>
          </p>
        </div>

        {/* Right Side: Quick Links */}
        <div className="hidden md:flex items-center gap-4 text-[11px] text-zinc-400">
          <Link to="/orders/track" className="hover:text-white transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">track_changes</span>
            <span>Track Order</span>
          </Link>
          <span className="text-zinc-700">|</span>
          <a
            href="https://wa.me/919999999999?text=Hi%20UniStore%2C%20I%20have%20a%20question"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[14px] text-emerald-400">chat</span>
            <span>WhatsApp Concierge</span>
          </a>
          <span className="text-zinc-700">|</span>
          <span className="font-semibold text-zinc-300">🇮🇳 INR (₹)</span>
        </div>
      </div>
    </div>
  );
};
