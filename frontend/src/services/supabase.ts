import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rjeotwckxytlzuofyvck.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZW90d2NreHl0bHp1b2Z5dmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzEzODQsImV4cCI6MjEwNTc0NzM4NH0.jkAtYCFjJJwztWLA7gNguNWABZ1FlKN6S_FYzm5MX48';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Subscribe to realtime changes on the 'orders' table in Supabase.
 */
export function subscribeToOrders(onOrderChange: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('realtime:orders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        onOrderChange(payload);
      }
    )
    .subscribe();
}

/**
 * Subscribe to realtime changes on the 'products' table in Supabase.
 */
export function subscribeToProducts(onProductChange: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('realtime:products')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      (payload) => {
        onProductChange(payload);
      }
    )
    .subscribe();
}

/**
 * Subscribe to realtime changes on the 'categories' table in Supabase.
 */
export function subscribeToCategories(onCategoryChange: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('realtime:categories')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      (payload) => {
        onCategoryChange(payload);
      }
    )
    .subscribe();
}
