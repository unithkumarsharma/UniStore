import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [inputOrderId, setInputOrderId] = useState(orderId || 'UNI-839210');
  const [currentTrackingId, setCurrentTrackingId] = useState(orderId || 'UNI-839210');
  const [copied, setCopied] = useState(false);

  const steps = [
    { title: 'Order Verified & Authorized', desc: 'Payment verified and inventory allocated', time: 'Yesterday, 10:30 AM', completed: true, current: false },
    { title: 'Serialized QC Assessment & Sealed', desc: 'Product inspected by UniStore White-Glove standards', time: 'Yesterday, 02:15 PM', completed: true, current: false },
    { title: 'Dispatched via Bluedart Air Hub', desc: 'Handed over to carrier for overnight air transit', time: 'Today, 08:40 AM', completed: true, current: false },
    { title: 'In Transit — Out for Doorstep Delivery', desc: 'Assigned to courier executive with secure delivery OTP', time: 'Today, 11:20 AM', completed: true, current: true },
    { title: 'Delivered & Handed Over', desc: 'Package receipt signed by recipient', time: 'Estimated by 4:00 PM Today', completed: false, current: false },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOrderId.trim()) {
      setCurrentTrackingId(inputOrderId.trim().toUpperCase());
    }
  };

  const handleCopyAWB = () => {
    navigator.clipboard.writeText('83920194821');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            <span>Real-Time Telemetry</span>
            <span>•</span>
            <span>Doorstep Courier Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Track Shipment
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Live status of your order from our fulfillment warehouse to your doorstep.
          </p>
        </div>

        {/* Order Lookup Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex bg-white border border-zinc-200 rounded-2xl p-1.5 shadow-xs focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/10 transition-all">
            <span className="material-symbols-outlined text-zinc-400 text-[20px] self-center ml-3 mr-2">
              search
            </span>
            <input
              type="text"
              value={inputOrderId}
              onChange={(e) => setInputOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. UNI-839210)"
              className="flex-1 bg-transparent border-0 p-2 text-xs text-zinc-900 font-semibold uppercase placeholder:normal-case placeholder:text-zinc-400 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs shadow-xs hover:bg-zinc-800 active:scale-95 transition-all"
            >
              Track Order
            </button>
          </div>
        </form>

        {/* Shipment Details Box */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-7">
          {/* Header Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-100 gap-4">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Order Number</span>
              <div className="text-lg font-black text-zinc-950 font-mono">{currentTrackingId}</div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs">
                <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Carrier & AWB</span>
                <span className="font-bold text-zinc-900">Bluedart Air • 83920194821</span>
              </div>
              <button
                type="button"
                onClick={handleCopyAWB}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-semibold transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy AWB'}
              </button>
            </div>
          </div>

          {/* Delivery ETA Highlight Card */}
          <div className="bg-zinc-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Active Delivery In Progress</span>
              </div>
              <h3 className="text-lg font-bold">Estimated Delivery: Today by 4:00 PM</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Delivery OTP will be sent via SMS when executive reaches location.</p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-block px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-200 text-xs font-semibold">
                On Schedule
              </span>
            </div>
          </div>

          {/* Step-by-step Timeline */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-6">Courier Milestone Timeline</h4>
            <div className="space-y-7 relative pl-7 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-zinc-200">
              {steps.map((st, i) => (
                <div key={i} className="relative">
                  {/* Node indicator */}
                  <div
                    className={`absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      st.current
                        ? 'bg-zinc-950 text-white ring-4 ring-zinc-900/15 shadow-sm'
                        : st.completed
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                    }`}
                  >
                    {st.completed && !st.current ? '✓' : st.current ? '•' : i + 1}
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          st.current
                            ? 'text-zinc-950'
                            : st.completed
                            ? 'text-zinc-800'
                            : 'text-zinc-400'
                        }`}
                      >
                        {st.title}
                      </h4>
                      <span className="text-[11px] text-zinc-400 font-medium">{st.time}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Executive Box */}
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs">
                RV
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Delivery Executive</span>
                <div className="text-xs font-bold text-zinc-900">Rajesh V. (Bluedart Verified Associate)</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:+919876543210"
                className="px-3.5 py-1.5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">call</span>
                <span>Contact Rider</span>
              </a>
            </div>
          </div>

          {/* Need Support Help */}
          <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-zinc-700 text-[18px]">support_agent</span>
              <span>Need help or address re-routing?</span>
            </div>
            <a href="mailto:support@unistore.com" className="font-bold text-zinc-950 hover:underline">
              Contact 24/7 Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
