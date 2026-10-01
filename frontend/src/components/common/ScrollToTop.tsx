import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop guarantees that whenever route path or search query changes,
 * the window is immediately and reliably scrolled back to the very top (header).
 *
 * It prevents the browser from preserving the previous page's bottom scroll offset,
 * which commonly happens in React Router single-page apps.
 */
export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    // 1. Disable browser's automatic scroll restoration on SPA navigation
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. If an anchor hash exists (e.g. /#faq), scroll smoothly to that target
    if (hash) {
      const targetId = hash.replace('#', '');
      const scrollTarget = () => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!scrollTarget()) {
        const hashTimer = setTimeout(scrollTarget, 120);
        return () => clearTimeout(hashTimer);
      }
      return;
    }

    // 3. Immediately scroll to the top of the viewport
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 4. Double-check after render frame to catch any layout shift from async image/data rendering
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 60);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [pathname, search, hash]);

  return null;
};
