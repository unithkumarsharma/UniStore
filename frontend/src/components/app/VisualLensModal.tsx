import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../store/PlatformContext';
import { hapticFeedback } from '../../utils/haptics';

export const VisualLensModal: React.FC = () => {
  const { isLensOpen, setIsLensOpen } = usePlatform();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);

  if (!isLensOpen) return null;

  const handleSimulateScan = (query: string) => {
    hapticFeedback.medium();
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setIsLensOpen(false);
      hapticFeedback.success();
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0" onClick={() => setIsLensOpen(false)} />

      <div className="relative bg-zinc-900 text-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 z-10 shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[22px]">photo_camera</span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              UniStore Lens & Barcode
            </span>
          </div>
          <button
            onClick={() => setIsLensOpen(false)}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="relative aspect-4/3 rounded-2xl bg-zinc-950 border border-zinc-700/60 overflow-hidden flex flex-col items-center justify-center">
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-sm" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-sm" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-sm" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-sm" />

          {/* Laser scanning line */}
          {scanning ? (
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#fbbf24] animate-pulse" />
          ) : (
            <div className="text-center space-y-2 px-6">
              <span className="material-symbols-outlined text-[42px] text-zinc-600">
                qr_code_scanner
              </span>
              <p className="text-xs text-zinc-400">
                Point camera at any barcode, QR tag, or product image
              </p>
            </div>
          )}
        </div>

        {/* Quick Lens Demos */}
        <div>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
            Simulate Visual Match:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSimulateScan('Acoustic Elite Headphones')}
              className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left border border-zinc-700 text-xs transition"
            >
              <span className="font-bold block text-white">🎧 Audio Barcode</span>
              <span className="text-[10px] text-zinc-400">Match 85183000</span>
            </button>
            <button
              onClick={() => handleSimulateScan('Ergonomic Mesh Chair')}
              className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left border border-zinc-700 text-xs transition"
            >
              <span className="font-bold block text-white">🪑 Furniture Tag</span>
              <span className="text-[10px] text-zinc-400">Match 94031090</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
