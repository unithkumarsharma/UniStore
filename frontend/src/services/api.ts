import { Capacitor } from '@capacitor/core';
import type { Product, Category, User } from '../types';
import { supabase } from './supabase';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/mockCatalog';

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  if (typeof window !== 'undefined') {
    if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (!window.location.hostname.includes('vercel.app')) {
        return envUrl.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
      }
    }
    if (Capacitor.isNativePlatform()) {
      if (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return 'http://192.168.1.4:5001/api';
      }
    }
  }
  return envUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Memory Cache for instant zero-latency responses
const MEM_CACHE: Record<string, any> = {};

function getLocalCache<T>(key: string): T | null {
  if (MEM_CACHE[key]) return MEM_CACHE[key];
  try {
    const raw = localStorage.getItem(`unistore_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      MEM_CACHE[key] = parsed;
      return parsed;
    }
  } catch {}
  return null;
}

function setLocalCache(key: string, data: any) {
  MEM_CACHE[key] = data;
  try {
    localStorage.setItem(`unistore_${key}`, JSON.stringify(data));
  } catch {}
}

export const api = {
  /**
   * Synchronous cached products for immediate 0ms UI render
   */
  getCachedProducts(): Product[] {
    const cached = getLocalCache<Product[]>('catalog_products');
    if (cached && cached.length > 0) return cached;
    return INITIAL_PRODUCTS;
  },

  /**
   * Synchronous cached categories for immediate 0ms UI render
   */
  getCachedCategories(): Category[] {
    const cached = getLocalCache<Category[]>('catalog_categories');
    if (cached && cached.length > 0) return cached;
    return INITIAL_CATEGORIES;
  },

  /**
   * Fetch all products with SWR caching, Supabase Cloud query & initial catalog guarantees
   */
  async getProducts(params?: { category?: string; search?: string; sort?: string; max_price?: number }): Promise<Product[]> {
    const isDefaultCatalog = !params?.category && !params?.search && !params?.sort && !params?.max_price;

    // 1. Try local/configured REST API if not on a pure Vercel client domain
    const isLocalApi = !API_BASE_URL.includes('vercel.app');
    if (isLocalApi) {
      try {
        const query = new URLSearchParams();
        if (params?.category) query.append('category', params.category);
        if (params?.search) query.append('search', params.search);
        if (params?.sort) query.append('sort', params.sort);
        if (params?.max_price) query.append('max_price', params.max_price.toString());

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const prods = data.products || [];
          if (prods.length > 0) {
            if (isDefaultCatalog) setLocalCache('catalog_products', prods);
            return prods;
          }
        }
      } catch {
        // Fall through to direct Supabase Cloud query
      }
    }

    // 2. Query Supabase Cloud directly
    try {
      let query = supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*), category:categories(name, slug)')
        .eq('is_active', true);

      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`);
      }
      if (params?.max_price) {
        query = query.lte('base_price', params.max_price);
      }
      if (params?.sort === 'price_asc') {
        query = query.order('base_price', { ascending: true });
      } else if (params?.sort === 'price_desc') {
        query = query.order('base_price', { ascending: false });
      } else if (params?.sort === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: sbProds, error: sbError } = await query;
      if (!sbError && sbProds && sbProds.length > 0) {
        let formatted: Product[] = sbProds.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          category_id: p.category_id,
          category_name: p.category?.name || '',
          category_slug: p.category?.slug || '',
          base_price: Number(p.base_price),
          compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : undefined,
          sku: p.sku,
          stock: p.stock,
          is_active: p.is_active,
          is_featured: p.is_featured,
          is_bestseller: p.is_bestseller,
          rating: Number(p.rating),
          review_count: p.review_count,
          badge: p.badge,
          images: (p.images || []).sort((a: any, b: any) => a.display_order - b.display_order),
          variants: p.variants || [],
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));

        if (params?.category) {
          formatted = formatted.filter((p) => p.category_slug === params.category || p.category_id === params.category);
        }

        if (isDefaultCatalog && formatted.length > 0) {
          setLocalCache('catalog_products', formatted);
        }
        return formatted;
      }
    } catch {
      // Fall through to initial fallback
    }

    // 3. Fallback to cached or rich initial products
    let list = getLocalCache<Product[]>('catalog_products') || INITIAL_PRODUCTS;
    if (params?.category) {
      list = list.filter((p) => p.category_slug === params.category || p.category_id === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (params?.max_price) {
      list = list.filter((p) => p.base_price <= params.max_price!);
    }
    if (params?.sort === 'price_asc') {
      list = [...list].sort((a, b) => a.base_price - b.base_price);
    } else if (params?.sort === 'price_desc') {
      list = [...list].sort((a, b) => b.base_price - a.base_price);
    } else if (params?.sort === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  },

  /**
   * Fetch product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    // 1. Check cached catalog
    const cachedProds = getLocalCache<Product[]>('catalog_products') || INITIAL_PRODUCTS;
    const found = cachedProds.find((p) => p.slug === slug);
    if (found) return found;

    // 2. Try REST API if local
    const isLocalApi = !API_BASE_URL.includes('vercel.app');
    if (isLocalApi) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/products/${slug}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          return data.product;
        }
      } catch {}
    }

    // 3. Try Supabase direct query
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*), category:categories(name, slug)')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          category_id: data.category_id,
          category_name: data.category?.name || '',
          category_slug: data.category?.slug || '',
          base_price: Number(data.base_price),
          compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : undefined,
          sku: data.sku,
          stock: data.stock,
          is_active: data.is_active,
          is_featured: data.is_featured,
          is_bestseller: data.is_bestseller,
          rating: Number(data.rating),
          review_count: data.review_count,
          badge: data.badge,
          images: (data.images || []).sort((a: any, b: any) => a.display_order - b.display_order),
          variants: data.variants || [],
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch {}

    return INITIAL_PRODUCTS.find((p) => p.slug === slug);
  },

  /**
   * Fetch categories with SWR caching & Supabase Cloud fallback
   */
  async getCategories(): Promise<Category[]> {
    // 1. Try REST API if local
    const isLocalApi = !API_BASE_URL.includes('vercel.app');
    if (isLocalApi) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/categories`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const cats = data.categories || [];
          if (cats.length > 0) {
            setLocalCache('catalog_categories', cats);
            return cats;
          }
        }
      } catch {}
    }

    // 2. Query Supabase directly
    try {
      const { data: sbCats, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && sbCats && sbCats.length > 0) {
        setLocalCache('catalog_categories', sbCats);
        return sbCats;
      }
    } catch {}

    return getLocalCache<Category[]>('catalog_categories') || INITIAL_CATEGORIES;
  },

  /**
   * Auth: User Login via Supabase backend
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  /**
   * Auth: User Registration via Supabase backend
   */
  async register(email: string, fullName: string, password: string, phone?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: fullName, password, phone }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  /**
   * Auth: Reset Password via Supabase backend
   */
  async resetPassword(params: { email?: string; phone?: string; new_password: string }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Password reset failed' }));
      throw new Error(err.error || 'Password reset failed');
    }
    return res.json();
  },

  /**
   * Auth: Get Current User Profile
   */
  async getMe(token: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to get user profile');
    }
    const data = await res.json();
    return data.user;
  },

  /**
   * Auth: Firebase Login & Supabase Sync
   */
  async firebaseLogin(params: { idToken: string; email?: string; fullName?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/firebase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_token: params.idToken,
        email: params.email,
        full_name: params.fullName,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Firebase authentication sync failed' }));
      throw new Error(err.error || 'Firebase authentication sync failed');
    }
    return res.json();
  },

  /**
   * Create Razorpay order on backend
   */
  async createRazorpayOrder(amount: number, orderId?: string) {
    const res = await fetch(`${API_BASE_URL}/payments/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, order_id: orderId }),
    });
    if (!res.ok) throw new Error('Failed to create Razorpay order');
    return res.json();
  },

  /**
   * Verify Razorpay payment signature
   */
  async verifyPayment(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/payments/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to verify payment');
    return res.json();
  },

  /**
   * Fetch orders for user
   */
  async getOrders(userId?: string) {
    const url = userId ? `${API_BASE_URL}/orders?user_id=${encodeURIComponent(userId)}` : `${API_BASE_URL}/orders`;
    const res = await fetch(url);
    if (!res.ok) return { orders: [] };
    return res.json();
  },

  /**
   * Create Order in live database
   */
  async createOrder(orderData: any) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create order' }));
      throw new Error(err.error || 'Failed to create order');
    }
    return res.json();
  },

  /**
   * Track order from live database
   */
  async trackOrder(orderId: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/track`);
    if (!res.ok) return null;
    return res.json();
  },

  /**
   * Fetch Admin Metrics from live database
   */
  async getAdminMetrics(token: string) {
    const res = await fetch(`${API_BASE_URL}/admin/metrics`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch admin metrics');
    return res.json();
  },

  /**
   * Admin: Add new product to catalog
   */
  async createAdminProduct(productData: any, token: string) {
    const res = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create product' }));
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  /**
   * Admin: Toggle product active status
   */
  async toggleProductStatus(productId: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to toggle product status');
    return res.json();
  },

  /**
   * Admin: Update order status
   */
  async updateOrderStatus(orderId: string, status: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  /**
   * Media: Upload image to Cloudinary via backend
   */
  async uploadImage(file: File, folder = 'unistore/products') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || err.message || 'Image upload failed');
    }
    return res.json() as Promise<{
      url: string;
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
    }>;
  },

  /**
   * Media: Check Cloudinary connection status
   */
  async getCloudinaryStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/upload/status`);
      if (!res.ok) return { configured: false, status: 'error' };
      return res.json() as Promise<{
        configured: boolean;
        cloud_name: string | null;
        service: string;
        status: string;
      }>;
    } catch {
      return { configured: false, status: 'unreachable' };
    }
  },
};

