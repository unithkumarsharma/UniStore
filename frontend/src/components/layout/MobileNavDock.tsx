import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { hapticFeedback } from '../../utils/haptics';

export const MobileNavDock: React.FC = () => {
  const { totalItemCount, setIsCartOpen } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden flex justify-around items-center px-3 pt-2.5 pb-2 safe-bottom bg-white/90 backdrop-blur-xl border-t border-zinc-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
      {/* Tab 1: Discover */}
      <NavLink
        to="/"
        end
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center relative active:scale-90 transition-transform duration-150 py-0.5 px-3 rounded-xl ${
            isActive
              ? 'text-zinc-950 font-bold after:w-1 after:h-1 after:bg-zinc-950 after:rounded-full after:mt-0.5'
              : 'text-zinc-400 hover:text-zinc-700 transition-colors'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">explore</span>
        <span className="text-[10px] font-semibold tracking-tight mt-0.5">Discover</span>
      </NavLink>

      {/* Tab 2: Categories / Shop */}
      <NavLink
        to="/shop"
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center relative active:scale-90 transition-transform duration-150 py-0.5 px-3 rounded-xl ${
            isActive
              ? 'text-zinc-950 font-bold after:w-1 after:h-1 after:bg-zinc-950 after:rounded-full after:mt-0.5'
              : 'text-zinc-400 hover:text-zinc-700 transition-colors'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">grid_view</span>
        <span className="text-[10px] font-semibold tracking-tight mt-0.5">Shop</span>
      </NavLink>

      {/* Tab 3: Wishlist */}
      <NavLink
        to="/wishlist"
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center relative active:scale-90 transition-transform duration-150 py-0.5 px-3 rounded-xl ${
            isActive
              ? 'text-zinc-950 font-bold after:w-1 after:h-1 after:bg-zinc-950 after:rounded-full after:mt-0.5'
              : 'text-zinc-400 hover:text-zinc-700 transition-colors'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">favorite</span>
        <span className="text-[10px] font-semibold tracking-tight mt-0.5">Wishlist</span>
      </NavLink>

      {/* Tab 4: Cart Drawer Trigger */}
      <button
        type="button"
        onClick={() => {
          hapticFeedback.light();
          setIsCartOpen(true);
        }}
        className="relative flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors active:scale-90 py-0.5 px-3"
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          {totalItemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-zinc-950 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums shadow-xs">
              {totalItemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-tight mt-0.5">Bag</span>
      </button>

      {/* Tab 5: Account */}
      <NavLink
        to="/account"
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center relative active:scale-90 transition-transform duration-150 py-0.5 px-3 rounded-xl ${
            isActive
              ? 'text-zinc-950 font-bold after:w-1 after:h-1 after:bg-zinc-950 after:rounded-full after:mt-0.5'
              : 'text-zinc-400 hover:text-zinc-700 transition-colors'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">person</span>
        <span className="text-[10px] font-semibold tracking-tight mt-0.5">Account</span>
      </NavLink>
    </nav>
  );
};
