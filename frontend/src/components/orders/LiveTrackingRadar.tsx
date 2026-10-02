import React, { useState } from 'react';
import { useToast } from '../../store/ToastContext';

export type DeliveryPhase = 'TRANSIT' | 'OUT_FOR_DELIVERY' | 'NEARBY' | 'DELIVERED';

interface LiveTrackingRadarProps {
  orderNumber: string;
  carrierName: string;
  estimatedDelivery: string;
  phase: DeliveryPhase;
  onPhaseChange?: (newPhase: DeliveryPhase) => void;
}

export const LiveTrackingRadar: React.FC<LiveTrackingRadarProps> = ({
  orderNumber,
  carrierName,
  estimatedDelivery,
  phase,
  onPhaseChange,
}) => {
  const { toast } = useToast();
  const [copiedOtp, setCopiedOtp] = useState(false);
  const deliveryOtp = '4892';

  // Position on the route: 25% for transit, 60% for out for delivery, 88% for nearby, 100% for delivered
  const progressPercent =
    phase === 'TRANSIT' ? 25 : phase === 'OUT_FOR_DELIVERY' ? 62 : phase === 'NEARBY' ? 88 : 100;

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(deliveryOtp);
    setCopiedOtp(true);
    toast.success('Delivery OTP Copied', `Code ${deliveryOtp} copied to clipboard`);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleContactDriver = (type: 'call' | 'whatsapp') => {
    if (type === 'call') {
      toast.info('Calling Courier Partner', 'Connecting with Vikramaditya (+91 98201 54321)...');
    } else {
      toast.success('Live Location Shared', 'Opening encrypted WhatsApp courier channel...');
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Radar Scanline Accent */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block leading-tight">
              Live GPS Telemetry • {orderNumber}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              ETA: {estimatedDelivery} • 19.0596° N, 72.8295° E
            </span>
          </div>
        </div>

        {/* Phase Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            {phase === 'TRANSIT' && 'Air Transit'}
            {phase === 'OUT_FOR_DELIVERY' && 'Out for Doorstep Delivery'}
            {phase === 'NEARBY' && 'Courier < 500m Away'}
            {phase === 'DELIVERED' && 'Delivered & Handed Over'}
          </span>
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="relative h-48 sm:h-56 w-full bg-zinc-900/90 overflow-hidden select-none">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Simulated Road Map Overlay Lines */}
        <svg className="absolute inset-0 w-full h-full stroke-zinc-800" strokeWidth="2">
          <line x1="0" y1="120" x2="100%" y2="120" strokeDasharray="4 4" />
          <line x1="20%" y1="0" x2="20%" y2="100%" strokeDasharray="4 4" />
          <line x1="80%" y1="0" x2="80%" y2="100%" strokeDasharray="4 4" />
        </svg>

        {/* Glowing Dynamic Route Path */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 240" preserveAspectRatio="none">
          {/* Inactive Path */}
          <path
            d="M 60 120 Q 250 40, 500 120 T 940 120"
            fill="none"
            stroke="#27272a"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Active Glowing Path */}
          <path
            d="M 60 120 Q 250 40, 500 120 T 940 120"
            fill="none"
            stroke="#10b981"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="1000"
            strokeDashoffset={1000 - (progressPercent / 100) * 1000}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Start Pin: Fulfillment Hub */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-lg">
            <span className="material-symbols-outlined text-[18px]">warehouse</span>
          </div>
          <span className="text-[10px] font-bold text-zinc-400 mt-1 bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800">
            Mumbai Hub
          </span>
        </div>

        {/* Middle Pin: Sorting Facility */}
        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center hidden sm:flex">
          <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400">
            <span className="material-symbols-outlined text-[15px]">local_shipping</span>
          </div>
          <span className="text-[9px] font-semibold text-zinc-500 mt-1">Bandra Sorting Hub</span>
        </div>

        {/* Moving Delivery Courier Icon */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out flex flex-col items-center z-10"
          style={{ left: `calc(${progressPercent}% - 24px)` }}
        >
          {/* Pulsing ring */}
          <div className="relative">
            <div className="absolute -inset-2 bg-emerald-500/30 rounded-full animate-ping" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.7)] border-2 border-white">
              <span className="material-symbols-outlined text-[24px]">electric_moped</span>
            </div>
          </div>
          <div className="mt-1 bg-emerald-950 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-700 shadow-md whitespace-nowrap">
            {phase === 'DELIVERED' ? 'Arrived!' : '32 km/h • On Route'}
          </div>
        </div>

        {/* End Pin: Customer Doorstep */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
            phase === 'DELIVERED'
              ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
              : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
          }`}>
            <span className="material-symbols-outlined text-[18px]">home</span>
          </div>
          <span className="text-[10px] font-bold text-zinc-300 mt-1 bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800">
            Your Doorstep
          </span>
        </div>
      </div>

      {/* Driver Information & Fast OTP Handover Card */}
      <div className="p-5 bg-zinc-950 border-t border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Driver Profile */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-base shadow-md">
              VS
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white">Vikramaditya S.</span>
              <span className="material-symbols-outlined text-[16px] text-amber-400">verified</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Courier Specialist • Ather 450X (EV Fleet)
            </p>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium mt-1">
              <span className="text-amber-400 font-bold">★ 4.95 (1,420 orders)</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{carrierName}</span>
            </div>
          </div>
        </div>

        {/* OTP & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Secure Handover OTP */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-3.5 py-2">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block leading-none">
                Delivery OTP
              </span>
              <span className="text-base font-black text-emerald-400 font-mono tracking-widest leading-tight">
                {deliveryOtp}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyOtp}
              className="ml-3 text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            >
              {copiedOtp ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Quick Contact Buttons */}
          <button
            type="button"
            onClick={() => handleContactDriver('call')}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white transition-all active:scale-95 cursor-pointer"
            title="Call Delivery Executive"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </button>

          <button
            type="button"
            onClick={() => handleContactDriver('whatsapp')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">chat</span>
            <span>WhatsApp Updates</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulation Milestone Toggles (for test demonstration) */}
      {onPhaseChange && (
        <div className="px-5 py-2.5 bg-zinc-900/40 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
            Telemetry Simulator:
          </span>
          <div className="flex items-center gap-1">
            {(['TRANSIT', 'OUT_FOR_DELIVERY', 'NEARBY', 'DELIVERED'] as DeliveryPhase[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPhaseChange(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  phase === p
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
              >
                {p === 'TRANSIT' && 'In Transit'}
                {p === 'OUT_FOR_DELIVERY' && 'Out for Delivery'}
                {p === 'NEARBY' && 'Nearby'}
                {p === 'DELIVERED' && 'Delivered'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
