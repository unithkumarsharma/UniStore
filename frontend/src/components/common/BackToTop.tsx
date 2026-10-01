import React, { useState, useEffect } from 'react';
import { hapticFeedback } from '../../utils/haptics';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down more than 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    hapticFeedback.light();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-8 right-4 md:right-8 z-40 p-2.5 sm:p-3 rounded-full bg-zinc-950/90 text-white shadow-xl backdrop-blur-md border border-zinc-700/50 hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all duration-200 animate-in fade-in zoom-in-75 flex items-center justify-center group"
    >
      <span className="material-symbols-outlined text-[20px] sm:text-[22px] transition-transform group-hover:-translate-y-0.5">
        arrow_upward
      </span>
    </button>
  );
};
