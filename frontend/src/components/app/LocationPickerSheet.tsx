import React, { useState } from 'react';
import { usePlatform } from '../../store/PlatformContext';
import { hapticFeedback } from '../../utils/haptics';

export const LocationPickerSheet: React.FC = () => {
  const { isLocationSheetOpen, setIsLocationSheetOpen, deliveryLocation, setDeliveryLocation } =
    usePlatform();
  const [inputPincode, setInputPincode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLocationSheetOpen) return null;

  const savedAddresses = [
    {
      id: 'addr-1',
      name: 'Arjun Sharma',
      line: 'B-404, Prestige Heights, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      tag: 'Default',
    },
    {
      id: 'addr-2',
      name: 'Arjun (Office)',
      line: 'Floor 7, BKC Signature Tower, Bandra East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      tag: 'Work',
    },
  ];

  const handleSelectSaved = (addr: (typeof savedAddresses)[0]) => {
    hapticFeedback.light();
    setDeliveryLocation({
      name: addr.name.split(' ')[0],
      city: addr.city,
      pincode: addr.pincode,
    });
    setIsLocationSheetOpen(false);
  };

  const handleApplyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputPincode.replace(/\D/g, '');
    if (clean.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    let detectedCity = 'India';
    if (clean.startsWith('11')) detectedCity = 'Delhi NCR';
    else if (clean.startsWith('40')) detectedCity = 'Mumbai';
    else if (clean.startsWith('56')) detectedCity = 'Bengaluru';
    else if (clean.startsWith('50')) detectedCity = 'Hyderabad';
    else if (clean.startsWith('60')) detectedCity = 'Chennai';
    else if (clean.startsWith('70')) detectedCity = 'Kolkata';
    else if (clean.startsWith('41')) detectedCity = 'Pune';

    hapticFeedback.success();
    setDeliveryLocation({
      name: deliveryLocation.name || 'Arjun',
      city: detectedCity,
      pincode: clean,
    });
    setIsLocationSheetOpen(false);
  };

  const handleUseCurrentLocation = () => {
    hapticFeedback.light();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setDeliveryLocation({
            name: 'Current Location',
            city: 'Mumbai Metro',
            pincode: '400050',
          });
          setIsLocationSheetOpen(false);
        },
        () => {
          // Fallback
          setDeliveryLocation({
            name: 'Current Location',
            city: 'Mumbai Metro',
            pincode: '400050',
          });
          setIsLocationSheetOpen(false);
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
      <div className="fixed inset-0" onClick={() => setIsLocationSheetOpen(false)} />

      <div className="relative bg-white w-full max-w-lg rounded-t-3xl p-6 z-10 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto -mt-1 mb-2" />

        <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-extrabold text-zinc-950">Choose your location</h3>
            <p className="text-xs text-zinc-500">
              Delivery options and speeds may vary based on location
            </p>
          </div>
          <button
            onClick={() => setIsLocationSheetOpen(false)}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Saved Addresses list */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Saved Delivery Addresses
          </span>
          {savedAddresses.map((addr) => {
            const isSelected = deliveryLocation.pincode === addr.pincode;
            return (
              <button
                key={addr.id}
                onClick={() => handleSelectSaved(addr)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between transition ${
                  isSelected
                    ? 'border-zinc-950 bg-zinc-50/80 ring-1 ring-zinc-950'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">{addr.name}</span>
                    <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-700 text-[10px] font-semibold rounded">
                      {addr.tag}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">{addr.line}</p>
                  <p className="text-xs font-semibold text-zinc-900">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    isSelected ? 'border-zinc-950 bg-zinc-950' : 'border-zinc-300'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Enter Pincode Form */}
        <form onSubmit={handleApplyPincode} className="space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Or Enter an Indian Pincode
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={inputPincode}
              onChange={(e) => {
                setInputPincode(e.target.value.replace(/\D/g, ''));
                setErrorMsg('');
              }}
              placeholder="e.g. 400050"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono font-bold placeholder:font-sans focus:outline-none focus:border-zinc-950"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition active:scale-95"
            >
              Apply
            </button>
          </div>
          {errorMsg && <p className="text-[11px] text-rose-600 font-semibold">{errorMsg}</p>}
        </form>

        {/* Use Current Location Button */}
        <button
          onClick={handleUseCurrentLocation}
          type="button"
          className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] text-blue-600">my_location</span>
          <span>Use my current location</span>
        </button>
      </div>
    </div>
  );
};
