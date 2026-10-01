import React, { useState, useEffect } from 'react';

interface PincodeEstimatorProps {
  currentPrice: number;
}

export const PincodeEstimator: React.FC<PincodeEstimatorProps> = ({ currentPrice }) => {
  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem('unistore_pincode') || '400050';
  });
  const [checked, setChecked] = useState(true);
  const [locationName, setLocationName] = useState('Mumbai Metro');
  const [deliveryDays, setDeliveryDays] = useState(2);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

  // Countdown timer for same-day dispatch (resets daily at 2:00 PM)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(14, 0, 0, 0); // 2:00 PM dispatch cutoff
      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }
      const diffMs = cutoff.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pincode.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) return;

    localStorage.setItem('unistore_pincode', clean);
    setChecked(true);

    // City recognition from pincode prefix
    const prefix = clean.slice(0, 2);
    if (['40', '41', '42'].includes(prefix)) {
      setLocationName('Mumbai / Pune Region');
      setDeliveryDays(1);
    } else if (['11', '12', '20'].includes(prefix)) {
      setLocationName('Delhi-NCR Region');
      setDeliveryDays(2);
    } else if (['56', '57'].includes(prefix)) {
      setLocationName('Bengaluru Tech Corridor');
      setDeliveryDays(2);
    } else if (['50', '51'].includes(prefix)) {
      setLocationName('Hyderabad Urban');
      setDeliveryDays(2);
    } else if (['60', '61', '62'].includes(prefix)) {
      setLocationName('Chennai Metro');
      setDeliveryDays(3);
    } else if (['70', '71'].includes(prefix)) {
      setLocationName('Kolkata Metro');
      setDeliveryDays(3);
    } else {
      setLocationName('Domestic Express Area');
      setDeliveryDays(3);
    }
  };

  const getEstimatedDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-zinc-900">local_shipping</span>
          <span className="text-xs font-black text-zinc-900 tracking-tight">Delivery & Pincode Checker</span>
        </div>
        {deliveryDays <= 2 && (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Express Air Dispatch
          </span>
        )}
      </div>

      {/* Pincode Input Form */}
      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit Pincode"
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-900 tracking-wider focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
          />
          <span className="absolute right-3 top-2.5 text-[10px] font-bold text-zinc-400">IN</span>
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 active:scale-95 transition-all"
        >
          Check
        </button>
      </form>

      {/* Live Serviceability Outcome */}
      {checked && (
        <div className="space-y-2.5 pt-2 border-t border-zinc-100 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-ping" />
            <div>
              <p className="font-bold text-zinc-900">
                Delivering to {locationName} ({pincode}) by{' '}
                <span className="text-emerald-700 font-extrabold underline decoration-emerald-300">
                  {getEstimatedDate(deliveryDays)}
                </span>
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {currentPrice >= 999 ? '✓ Eligible for Free Priority Delivery' : 'Standard ₹99 shipping (Free over ₹999)'}
              </p>
            </div>
          </div>

          {/* Same Day Countdown Strip */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-amber-900">
              <span className="material-symbols-outlined text-[15px] text-amber-600">alarm</span>
              <span>Same-Day Dispatch Window</span>
            </span>
            <span className="font-mono font-black text-amber-950">
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>

          {/* COD & Quality Badges */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-600 font-semibold pt-1">
            <div className="flex items-center gap-1.5 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
              <span className="material-symbols-outlined text-[14px] text-emerald-600">payments</span>
              <span>Cash on Delivery Available</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
              <span className="material-symbols-outlined text-[14px] text-blue-600">swap_horizontal_circle</span>
              <span>7-Day Return / Exchange</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
