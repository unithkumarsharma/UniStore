import { Capacitor } from '@capacitor/core';
import type { Product, Category, User } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/mockProducts';

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  if (typeof window !== 'undefined') {
    if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return envUrl.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
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
   * Fetch all products with SWR caching
   */
  async getProducts(params?: { category?: string; search?: string; sort?: string; max_price?: number }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.max_price) query.append('max_price', params.max_price.toString());

    const isDefaultCatalog = !params?.category && !params?.search && !params?.sort && !params?.max_price;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const prods = data.products || [];
        if (prods.length > 0) {
          if (isDefaultCatalog) {
            setLocalCache('catalog_products', prods);
          }
          return prods;
        }
      }
    } catch {
      // Backend offline or unreachable, fall back to rich catalog
    }

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
    if (params?.sort) {
      if (params.sort === 'price_asc') {
        list = [...list].sort((a, b) => a.base_price - b.base_price);
      } else if (params.sort === 'price_desc') {
        list = [...list].sort((a, b) => b.base_price - a.base_price);
      } else if (params.sort === 'rating') {
        list = [...list].sort((a, b) => b.rating - a.rating);
      } else if (params.sort === 'bestseller') {
        list = [...list].sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
      }
    }
    return list;
  },

  /**
   * Fetch product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/products/${slug}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.product) return data.product;
      }
    } catch {
      // Fallback
    }

    const list = getLocalCache<Product[]>('catalog_products') || INITIAL_PRODUCTS;
    return list.find((p) => p.slug === slug || p.id === slug);
  },

  /**
   * Fetch categories with SWR caching
   */
  async getCategories(): Promise<Category[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
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
    } catch {
      // Fallback
    }

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

