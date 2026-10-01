import React from 'react';
import { usePlatform } from '../../store/PlatformContext';
import { hapticFeedback } from '../../utils/haptics';

export const UniPaySheet: React.FC = () => {
  const { isUniPayOpen, setIsUniPayOpen, setIsLensOpen } = usePlatform();

  if (!isUniPayOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
      <div className="fixed inset-0" onClick={() => setIsUniPayOpen(false)} />

      <div className="relative bg-white w-full max-w-lg rounded-t-3xl p-6 z-10 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto -mt-1 mb-2" />

        <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              ₹
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-950">UniPay</h3>
              <p className="text-[11px] text-zinc-500">Fast 1-Click Payments & Rewards</p>
            </div>
          </div>
          <button
            onClick={() => setIsUniPayOpen(false)}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Available Wallet Balance
            </span>
            <div className="text-2xl font-black mt-1">₹1,500.00</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>KYC Verified • Ready for 1-Tap Checkout</span>
            </span>
          </div>
          <button
            onClick={() => {
              hapticFeedback.light();
              alert('Add Money via UPI / Netbanking');
            }}
            className="px-4 py-2 bg-white text-zinc-950 rounded-xl text-xs font-bold hover:bg-zinc-100 transition active:scale-95 shadow-xs"
          >
            + Add Money
          </button>
        </div>

        {/* 4 Quick Action Tiles (Like Amazon Pay) */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            onClick={() => {
              setIsUniPayOpen(false);
              setIsLensOpen(true);
            }}
            className="p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px] text-emerald-600 mb-1">
              qr_code_scanner
            </span>
            <span className="text-[11px] font-bold text-zinc-900">Scan QR</span>
          </button>
          <button
            onClick={() => {
              hapticFeedback.light();
              alert('Send Money via UPI');
            }}
            className="p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px] text-blue-600 mb-1">
              send_to_mobile
            </span>
            <span className="text-[11px] font-bold text-zinc-900">Send UPI</span>
          </button>
          <button
            onClick={() => {
              hapticFeedback.light();
              alert('Mobile Recharge & Bills');
            }}
            className="p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px] text-purple-600 mb-1">
              receipt_long
            </span>
            <span className="text-[11px] font-bold text-zinc-900">Pay Bills</span>
          </button>
          <button
            onClick={() => {
              hapticFeedback.light();
              alert('Rewards & Scratch Cards');
            }}
            className="p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px] text-amber-600 mb-1">
              redeem
            </span>
            <span className="text-[11px] font-bold text-zinc-900">Rewards</span>
          </button>
        </div>

        {/* Scratch Card / Offer Banner */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-bold">
              ★
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 block">
                Flat ₹150 Cashback Unlocked
              </span>
              <span className="text-[10px] text-zinc-500">
                On shopping above ₹1,999 with UniPay
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-1 rounded-lg border border-amber-300">
            AUTO-APPLY
          </span>
        </div>
      </div>
    </div>
  );
};
