import { useEffect } from 'react';
import { subscribeToOrders, subscribeToProducts, subscribeToCategories } from '../services/supabase';

interface RealtimeSyncOptions {
  onOrderChange?: (payload: any) => void;
  onProductChange?: (payload: any) => void;
  onCategoryChange?: (payload: any) => void;
}

/**
 * React hook to listen to realtime database updates from Supabase.
 */
export function useRealtimeSync(options: RealtimeSyncOptions) {
  useEffect(() => {
    const channels: any[] = [];

    if (options.onOrderChange) {
      channels.push(subscribeToOrders(options.onOrderChange));
    }

    if (options.onProductChange) {
      channels.push(subscribeToProducts(options.onProductChange));
    }

    if (options.onCategoryChange) {
      channels.push(subscribeToCategories(options.onCategoryChange));
    }

    return () => {
      channels.forEach((channel) => channel.unsubscribe());
    };
  }, [options.onOrderChange, options.onProductChange, options.onCategoryChange]);
}
