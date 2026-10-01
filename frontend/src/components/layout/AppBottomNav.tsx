import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useWishlist } from '../../store/WishlistContext';
import { hapticFeedback } from '../../utils/haptics';

export const AppBottomNav: React.FC = () => {
  const { totalItemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pt-2.5 pb-2 safe-bottom bg-white/95 backdrop-blur-xl border-t border-zinc-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] select-none">
      {/* 1. Discover */}
      <NavLink
        to="/"
        end
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-0.5 px-3 rounded-xl transition-transform active:scale-90 ${
            isActive
              ? 'text-zinc-950 font-bold after:w-1 after:h-1 after:bg-zinc-950 after:rounded-full after:mt-1'
              : 'text-zinc-400 hover:text-zinc-700'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">explore</span>
        <span className="text-[10px] tracking-tight mt-0.5 font-semibold">Discover</span>
      </NavLink>

      {/* 2. Shop / Catalog */}
      <NavLink
        to="/shop"
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-0.5 px-3 rounded-xl transition-transform active:scale-90 ${
            isActive
              ? 'text-zinc-950 font-bold after:w-1 after:h-1 after:bg-zinc-950 after:rounded-full after:mt-1'
              : 'text-zinc-400 hover:text-zinc-700'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">grid_view</span>
        <span className="text-[10px] tracking-tight mt-0.5 font-semibold">Shop</span>
      </NavLink>

      {/* 3. Wishlist */}
      <NavLink
        to="/wishlist"
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-0.5 px-3 rounded-xl transition-transform active:scale-90 relative ${
            isActive
              ? 'text-zinc-950 font-bold after:w-1 after:h-1 after:bg-zinc-950 after:rounded-full after:mt-1'
              : 'text-zinc-400 hover:text-zinc-700'
          }`
        }
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[22px]">favorite</span>
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-zinc-950 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
              {wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 font-semibold">Wishlist</span>
      </NavLink>

      {/* 4. Bag Trigger */}
      <button
        type="button"
        onClick={() => {
          hapticFeedback.light();
          setIsCartOpen(true);
        }}
        className="flex flex-col items-center justify-center py-0.5 px-3 rounded-xl text-zinc-400 hover:text-zinc-700 transition-transform active:scale-90"
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          {totalItemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-zinc-950 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
              {totalItemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 font-semibold">Bag</span>
      </button>

      {/* 5. Account */}
      <NavLink
        to="/account"
        onClick={() => hapticFeedback.light()}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-0.5 px-3 rounded-xl transition-transform active:scale-90 ${
            isActive
              ? 'text-zinc-950 font-bold after:w-1 after:h-1 after:bg-zinc-950 after:rounded-full after:mt-1'
              : 'text-zinc-400 hover:text-zinc-700'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">person</span>
        <span className="text-[10px] tracking-tight mt-0.5 font-semibold">Account</span>
      </NavLink>
    </nav>
  );
};
