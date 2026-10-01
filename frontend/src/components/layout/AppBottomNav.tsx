import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { usePlatform } from '../../store/PlatformContext';
import { hapticFeedback } from '../../utils/haptics';

export const AppBottomNav: React.FC = () => {
  const { totalItemCount, setIsCartOpen } = useCart();
  const { setIsUniPayOpen } = usePlatform();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-1 pt-2 pb-2 safe-bottom bg-white/95 backdrop-blur-xl border-t border-zinc-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] select-none">
      {/* Tab 1: Home */}
      <NavLink
        to="/"
        end
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            isActive ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-700'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">home</span>
        <span className="text-[10px] tracking-tight mt-0.5 font-bold">Home</span>
      </NavLink>

      {/* Tab 2: Shop / Categories */}
      <NavLink
        to="/shop"
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            isActive ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-700'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">grid_view</span>
        <span className="text-[10px] tracking-tight mt-0.5 font-bold">Categories</span>
      </NavLink>

      {/* Tab 3: UniPay (Amazon Pay clone button) */}
      <button
        type="button"
        onClick={() => {
          hapticFeedback.medium();
          setIsUniPayOpen(true);
        }}
        className="flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 text-zinc-600 hover:text-zinc-950"
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[22px] text-emerald-600">
            account_balance_wallet
          </span>
          <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 font-bold text-emerald-700">UniPay</span>
      </button>

      {/* Tab 4: You (Amazon You tab) */}
      <NavLink
        to="/you"
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            isActive ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-700'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">person</span>
        <span className="text-[10px] tracking-tight mt-0.5 font-bold">You</span>
      </NavLink>

      {/* Tab 5: Cart with live badge counter */}
      <button
        type="button"
        onClick={() => {
          hapticFeedback.light();
          setIsCartOpen(true);
        }}
        className="flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 text-zinc-400 hover:text-zinc-700"
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
          {totalItemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-amber-500 text-zinc-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center tabular-nums shadow-xs">
              {totalItemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 font-bold">Cart</span>
      </button>
    </nav>
  );
};
