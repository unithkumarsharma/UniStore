import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../store/ToastContext';
import { formatCurrency } from '../utils/currency';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import logoImg from '../assets/logo.png';

interface DeliveryRun {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  pickup_hub: string;
  pickup_address: string;
  package_summary: string;
  delivery_fee: number;
  tip: number;
  expected_otp: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
}

export const RiderAppPage: React.FC = () => {
  useDocumentTitle('UniStore Fleet Partner — Courier Rider App');
  const { toast } = useToast();

  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'earnings' | 'history'>('active');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [todayDeliveriesCount, setTodayDeliveriesCount] = useState(8);
  const [todayEarnings, setTodayEarnings] = useState(1480);

  // Active delivery task (persisted simulation)
  const [activeRun, setActiveRun] = useState<DeliveryRun>({
    id: 'run-9021',
    order_number: 'UNI-839210',
    customer_name: 'Arjun Sharma',
    customer_phone: '+91 98765 43210',
    delivery_address: 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai — 400050',
    pickup_hub: 'Nordic Lifestyle Hub (BKC)',
    pickup_address: 'G Block, BKC, Bandra East, Mumbai — 400051',
    package_summary: 'Acoustic Pro Wireless ANC Headphones (Fragile Sealed Box)',
    delivery_fee: 70,
    tip: 30,
    expected_otp: '4892',
    status: 'PICKED_UP',
  });

  const handleToggleDuty = () => {
    setIsOnline((prev) => {
      const next = !prev;
      if (next) {
        toast.success('Duty Active', 'You are now online and receiving priority delivery assignments.');
      } else {
        toast.info('Duty Paused', 'You are offline. No new orders will be routed to your vehicle.');
      }
      return next;
    });
  };

  const handleConfirmPickup = () => {
    setActiveRun((prev) => ({ ...prev, status: 'OUT_FOR_DELIVERY' }));
    toast.success('Package Picked Up', 'QC barcode verified. Navigate to customer destination.');
  };

  const handleVerifyOtpAndDeliver = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== activeRun.expected_otp) {
      toast.error('Incorrect OTP', 'Customer OTP must match the 4-digit code (Hint: 4892).');
      return;
    }

    setActiveRun((prev) => ({ ...prev, status: 'DELIVERED' }));
    setTodayDeliveriesCount((prev) => prev + 1);
    setTodayEarnings((prev) => prev + activeRun.delivery_fee + activeRun.tip);
    toast.success(
      'Delivery Complete! 🎉',
      `Order ${activeRun.order_number} verified. +₹${activeRun.delivery_fee + activeRun.tip} credited to your wallet.`
    );
  };

  const handleNavigateMaps = (address: string) => {
    toast.info('Google Maps Launched', `Routing live GPS turn-by-turn navigation to: ${address}`);
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  const handleCallCustomer = (phone: string) => {
    toast.info('Calling Customer', `Dialing masked virtual contact: ${phone}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500 selection:text-zinc-950 pb-20">
      {/* Top Rider App Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-1.5">
            <img src={logoImg} alt="UniStore" className="h-6 w-auto object-contain" />
          </Link>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
            FLEET RIDER APP
          </span>
        </div>

        {/* Online / Offline Switch */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleDuty}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isOnline
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-zinc-950 animate-ping' : 'bg-zinc-500'}`} />
            <span>{isOnline ? 'ON DUTY' : 'OFFLINE'}</span>
          </button>

          <Link
            to="/supplier"
            className="hidden sm:inline-flex text-[11px] font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Vendor Portal
          </Link>
        </div>
      </header>

      {/* Main Content Area (Mobile Viewport Optimized) */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Rider Profile & Daily Earnings Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-zinc-950 text-base shadow-md">
                VS
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white">Vikramaditya S.</span>
                  <span className="material-symbols-outlined text-[15px] text-amber-400">verified</span>
                </div>
                <div className="text-[11px] text-zinc-400">Ather 450X EV • MH 02 EK 9821</div>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold mt-0.5">
                  <span>★ 4.95 Rating</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-emerald-400">Diamond Fleet Rider</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">
                Today's Pay
              </span>
              <div className="text-xl font-black text-emerald-400 tabular-nums">
                {formatCurrency(todayEarnings)}
              </div>
              <span className="text-[10px] text-zinc-400 font-semibold">
                {todayDeliveriesCount} trips completed
              </span>
            </div>
          </div>

          {/* Incentive Progress Bar */}
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Daily Milestone: 10 Deliveries</span>
              <span className="text-emerald-400 font-bold">2 more for +₹300 Bonus</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (todayDeliveriesCount / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-zinc-100 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Order
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-zinc-100 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pay Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-zinc-100 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        {/* TAB 1: ACTIVE DELIVERY TASK */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeRun.status === 'DELIVERED' ? (
              /* All Deliveries Completed State */
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mx-auto">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h3 className="text-lg font-bold text-white">All Orders Completed!</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Outstanding job, Vikramaditya! You completed order {activeRun.order_number}. Stay online for next pickup assignments.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRun({
                        ...activeRun,
                        status: 'ASSIGNED',
                        order_number: `UNI-${Math.floor(800000 + Math.random() * 90000)}`,
                      });
                      toast.info('New Order Dispatched', 'Incoming order assigned from Acoustic Labs Hub.');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Simulate Next Order Assignment
                  </button>
                </div>
              </div>
            ) : (
              /* Active Delivery Task Card */
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-5">
                {/* Header: Order & Payout Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
                      Active Order ID
                    </span>
                    <span className="font-mono text-base font-black text-white">
                      {activeRun.order_number}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-semibold block">Payout For Trip</span>
                    <span className="text-base font-black text-emerald-400 tabular-nums">
                      +₹{activeRun.delivery_fee + activeRun.tip}
                    </span>
                  </div>
                </div>

                {/* Step 1: Pickup from Supplier Warehouse */}
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black">
                        1
                      </span>
                      <span>PICKUP FROM WAREHOUSE</span>
                    </div>
                    {activeRun.status !== 'ASSIGNED' ? (
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                        ✓ Picked Up
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-800">
                        Pending Pickup
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white">{activeRun.pickup_hub}</div>
                    <div className="text-[11px] text-zinc-400">{activeRun.pickup_address}</div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleNavigateMaps(activeRun.pickup_address)}
                      className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">directions</span>
                      <span>Navigate to Hub</span>
                    </button>
                    {activeRun.status === 'ASSIGNED' && (
                      <button
                        type="button"
                        onClick={handleConfirmPickup}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                        <span>Confirm Pickup</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Step 2: Doorstep Delivery to Customer */}
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
                        2
                      </span>
                      <span>DOORSTEP DROP-OFF</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-purple-400 bg-purple-950 px-2 py-0.5 rounded-md border border-purple-800">
                      OTP Protected
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white">{activeRun.customer_name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{activeRun.delivery_address}</div>
                    <div className="text-[10px] text-zinc-500 mt-1 font-mono">📦 {activeRun.package_summary}</div>
                  </div>

                  {/* Call Customer & Maps Navigation */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCallCustomer(activeRun.customer_phone)}
                      className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-emerald-400">call</span>
                      <span>Call Customer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigateMaps(activeRun.delivery_address)}
                      className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-blue-400">near_me</span>
                      <span>Live GPS Map</span>
                    </button>
                  </div>

                  {/* Customer Handover OTP Input */}
                  <form onSubmit={handleVerifyOtpAndDeliver} className="pt-2 border-t border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <label className="font-bold text-zinc-300">Enter Customer Delivery OTP</label>
                      <span className="text-[10px] text-zinc-500">(Test code: 4892)</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="••••"
                        className="w-32 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-black text-emerald-400 tracking-widest outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Complete Delivery</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EARNINGS BREAKDOWN */}
        {activeTab === 'earnings' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Today's Payout Ledger</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Base Trip Deliveries (8 orders × ₹70)</span>
                <span className="font-black text-white">₹560.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Peak Rain / High-Demand Surge</span>
                <span className="font-black text-emerald-400">+₹480.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Direct Customer In-App Tips</span>
                <span className="font-black text-emerald-400">+₹440.00</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-black">
                <span className="text-white">Total Daily Balance:</span>
                <span className="text-emerald-400 tabular-nums">{formatCurrency(todayEarnings)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast.success('UPI Transfer Initiated', `₹${todayEarnings}.00 sent to Google Pay UPI ID.`)}
              className="w-full mt-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Instant Daily Cashout via UPI
            </button>
          </div>
        )}

        {/* TAB 3: COMPLETED RUNS HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Recent Completed Deliveries
            </h3>
            <div className="divide-y divide-zinc-800 text-xs">
              {[
                { id: 'UNI-839208', cust: 'Pooja Hegde', loc: 'Juhu Tara Rd', fee: 105, time: '2:15 PM' },
                { id: 'UNI-839205', cust: 'Farhan Akhtar', loc: 'Pali Hill, Bandra', fee: 110, time: '1:30 PM' },
                { id: 'UNI-839201', cust: 'Rohan Mehra', loc: 'Khar West', fee: 95, time: '12:45 PM' },
                { id: 'UNI-839194', cust: 'Simran Sethi', loc: 'Santacruz West', fee: 85, time: '11:50 AM' },
              ].map((run) => (
                <div key={run.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{run.id} • {run.cust}</div>
                    <div className="text-[11px] text-zinc-500">{run.loc} • Delivered at {run.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">+₹{run.fee}</div>
                    <span className="text-[10px] text-zinc-500">OTP Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
