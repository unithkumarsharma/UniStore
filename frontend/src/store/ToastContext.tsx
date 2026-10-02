import React, { createContext, useContext, useState, useCallback } from 'react';
import { hapticFeedback } from '../utils/haptics';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'cart';
  title: string;
  message?: string;
  image?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    cart: (product: { name: string; image?: string; price?: number }, action?: { label: string; onClick: () => void }) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = { ...item, id };

      if (item.type === 'success' || item.type === 'cart') {
        hapticFeedback.light();
      } else if (item.type === 'error') {
        hapticFeedback.error();
      }

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 concurrent toasts

      const dur = item.duration ?? (item.type === 'cart' ? 4500 : 3500);
      setTimeout(() => {
        removeToast(id);
      }, dur);

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
    cart: (
      product: { name: string; image?: string; price?: number },
      action?: { label: string; onClick: () => void }
    ) =>
      addToast({
        type: 'cart',
        title: 'Added to your bag',
        message: product.name,
        image: product.image,
        action,
      }),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ── Floating Luxury Toast Container ──────────────────────────────────────────
const ToastContainer: React.FC<{ toasts: ToastItem[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-0 left-0 md:left-auto md:right-6 z-[100] flex flex-col items-center md:items-end gap-2.5 px-4 pointer-events-none select-none max-w-sm mx-auto md:mx-0 w-full"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto w-full bg-zinc-950/95 text-white backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300 relative overflow-hidden group"
        >
          {/* Subtle Accent Glow */}
          <div
            className={`absolute top-0 left-0 bottom-0 w-1 ${
              t.type === 'success' || t.type === 'cart'
                ? 'bg-emerald-400'
                : t.type === 'error'
                ? 'bg-rose-500'
                : 'bg-blue-400'
            }`}
          />

          <div className="flex items-center gap-3 pl-1 min-w-0 flex-1">
            {/* Thumbnail or Type Icon */}
            {t.image ? (
              <img
                src={t.image}
                alt={t.message || 'Product'}
                className="w-10 h-10 rounded-xl object-cover bg-zinc-900 border border-zinc-800 shrink-0"
              />
            ) : (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  t.type === 'success' || t.type === 'cart'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : t.type === 'error'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {t.type === 'success' || t.type === 'cart'
                    ? 'check_circle'
                    : t.type === 'error'
                    ? 'error'
                    : 'info'}
                </span>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white tracking-tight leading-tight">
                {t.title}
              </h4>
              {t.message && (
                <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-medium">
                  {t.message}
                </p>
              )}
            </div>
          </div>

          {/* Action Button or Dismiss */}
          <div className="flex items-center gap-1.5 shrink-0">
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  onDismiss(t.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-extrabold hover:bg-zinc-100 active:scale-95 transition shadow-xs"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg transition"
              aria-label="Dismiss toast"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
