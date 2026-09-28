import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Cross-platform haptic feedback utilities.
 * Executes native haptics on iOS & Android devices, with graceful web vibration fallback.
 */
export const hapticFeedback = {
  /**
   * Subtle tap feedback for navigation, tab changes, and toggles
   */
  async light(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // Fallback silently if unsupported
    }
  },

  /**
   * Distinct feedback for meaningful actions like 'Add to Cart' or 'Wishlist'
   */
  async medium(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch {
      // Fallback silently if unsupported
    }
  },

  /**
   * Celebratory success feedback for order placement and payment completion
   */
  async success(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 60, 30]);
      }
    } catch {
      // Fallback silently if unsupported
    }
  },

  /**
   * Warning or error feedback
   */
  async error(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: NotificationType.Error });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
      }
    } catch {
      // Fallback silently if unsupported
    }
  },
};
