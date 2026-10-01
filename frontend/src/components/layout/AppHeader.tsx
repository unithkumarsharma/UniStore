import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../store/PlatformContext';
import { hapticFeedback } from '../../utils/haptics';

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const {
    deliveryLocation,
    setIsLocationSheetOpen,
    setIsVoiceSearchOpen,
    setIsLensOpen,
    isNative,
    toggleAppMode,
  } = usePlatform();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      hapticFeedback.light();
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-zinc-950 text-white shadow-md select-none safe-top">
      {/* Top Search & Actions Row */}
      <div className="px-3 pt-2.5 pb-2 flex items-center gap-2.5">
        {/* Search Input Container (Amazon App Pill) */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex items-center bg-white text-zinc-900 rounded-xl px-2.5 py-1.5 shadow-inner focus-within:ring-2 focus-within:ring-amber-400 transition"
        >
          <span className="material-symbols-outlined text-[19px] text-zinc-400 mr-2 shrink-0">
            search
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search UniStore..."
            className="flex-1 bg-transparent text-xs font-medium placeholder:text-zinc-400 border-none outline-none focus:ring-0 p-0"
          />

          {/* Amazon Lens (Camera Icon) */}
          <button
            type="button"
            onClick={() => {
              hapticFeedback.light();
              setIsLensOpen(true);
            }}
            className="p-1 text-zinc-400 hover:text-zinc-800 transition rounded-md"
            title="Scan with UniStore Lens"
            aria-label="Scan with Camera Lens"
          >
            <span className="material-symbols-outlined text-[19px]">photo_camera</span>
          </button>

          {/* Voice Search (Mic Icon) */}
          <button
            type="button"
            onClick={() => {
              hapticFeedback.light();
              setIsVoiceSearchOpen(true);
            }}
            className="p-1 text-zinc-400 hover:text-zinc-800 transition rounded-md"
            title="Search by Voice"
            aria-label="Search by Voice"
          >
            <span className="material-symbols-outlined text-[19px]">mic</span>
          </button>
        </form>

        {/* Notifications Icon with Unread Badge */}
        <button
          type="button"
          onClick={() => {
            hapticFeedback.light();
            navigate('/account');
          }}
          className="relative w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-95 shrink-0"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
        </button>

        {/* Web Mode Toggle (Only visible when testing on desktop web browser) */}
        {!isNative && (
          <button
            type="button"
            onClick={toggleAppMode}
            className="hidden sm:flex px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold items-center gap-1 border border-zinc-700"
            title="Switch to Web View"
          >
            <span className="material-symbols-outlined text-[14px]">desktop_windows</span>
            <span>Web Mode</span>
          </button>
        )}
      </div>

      {/* Iconic Amazon Delivery Location Bar */}
      <div
        onClick={() => {
          hapticFeedback.light();
          setIsLocationSheetOpen(true);
        }}
        className="bg-zinc-900/90 border-t border-zinc-800/80 px-3.5 py-1.5 flex items-center justify-between text-xs cursor-pointer hover:bg-zinc-900 transition"
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="material-symbols-outlined text-[16px] text-amber-400 shrink-0">
            location_on
          </span>
          <span className="text-[11px] text-zinc-300 truncate">
            Deliver to <strong className="text-white font-bold">{deliveryLocation.name}</strong> — {deliveryLocation.city} {deliveryLocation.pincode}
          </span>
        </div>
        <span className="material-symbols-outlined text-[14px] text-zinc-400 shrink-0">
          expand_more
        </span>
      </div>
    </header>
  );
};
