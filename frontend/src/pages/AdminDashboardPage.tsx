import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { api } from '../services/api';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { formatCurrency } from '../utils/currency';
import type { Product, Category } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory' | 'suppliers'>('overview');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    gross_sales: 0,
    order_count: 0,
    average_order_value: 0,
    low_stock_count: 0,
    total_products: 0,
    total_customers: 0,
  });
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(2499);
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdStock, setNewProdStock] = useState(20);
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{ configured: boolean; cloud_name?: string | null } | null>(null);

  useEffect(() => {
    api.getCloudinaryStatus().then(setCloudinaryStatus).catch(() => {});
  }, []);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const res = await api.uploadImage(file);
      setNewProdImageUrl(res.secure_url || res.url);
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProductsList(prods);
      setCategoriesList(cats);
      if (cats.length > 0 && !newProdCategory) {
        setNewProdCategory(cats[0].id);
      }

      // Fetch live orders via unified api
      const oData = await api.getOrders();
      setOrdersList(oData.orders || []);

      // Fetch metrics if token present
      const token = localStorage.getItem('unistore_token');
      if (token) {
        const m = await api.getAdminMetrics(token);
        setMetrics(m);
      }
    } catch (err) {
      console.error('Failed to load admin data from Supabase:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  // Realtime Supabase Sync
  useRealtimeSync({
    onOrderChange: () => loadDashboardData(),
    onProductChange: () => loadDashboardData(),
  });

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">Admin Access Required</h2>
        <p className="text-xs text-secondary mb-6">
          You must be logged in as an ADMIN or STAFF role to access the management portal.
        </p>
        <Link
          to="/login"
          className="inline-block py-2.5 px-6 rounded-full bg-primary-container text-white text-xs font-bold"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    const cat = categoriesList.find((c) => c.id === newProdCategory) || categoriesList[0];
    const token = localStorage.getItem('unistore_token');

    try {
      if (token) {
        await api.createAdminProduct(
          {
            name: newProdName,
            base_price: Number(newProdPrice),
            compare_at_price: Math.round(Number(newProdPrice) * 1.25),
            category_id: cat ? cat.id : undefined,
            stock: Number(newProdStock),
            images: [
              {
                image_url: newProdImageUrl.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
                is_primary: true,
                display_order: 1,
              },
            ],
          },
          token
        );
        await loadDashboardData();
        setShowAddProductModal(false);
        setNewProdName('');
        setNewProdImageUrl('');
        alert('Product added to catalog successfully!');
      } else {
        alert('Admin authorization token required.');
      }
    } catch (err: any) {
      alert(`Failed to add product: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('unistore_token');
    try {
      if (token) {
        await api.updateOrderStatus(orderId, newStatus, token);
      }
      setOrdersList((prev) =>
        prev.map((o) => (o.id === orderId || o.order_number === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      console.error('Failed to update status on Supabase:', err);
    }
  };

  const toggleProductActive = async (prodId: string) => {
    const token = localStorage.getItem('unistore_token');
    try {
      if (token) {
        await api.toggleProductStatus(prodId, token);
      }
      setProductsList((prev) =>
        prev.map((p) => (p.id === prodId ? { ...p, is_active: !p.is_active } : p))
      );
    } catch (err: any) {
      console.error('Failed to toggle status on Supabase:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-container mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[24px]">admin_panel_settings</span>
            <h1 className="text-2xl font-bold text-on-surface">UniStore Management Console</h1>
          </div>
          <p className="text-xs text-secondary mt-0.5">
            Logged in as <span className="font-bold text-on-surface">{user?.email}</span> ({user?.role})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-full border border-surface-container-high text-xs font-semibold hover:bg-surface-container transition-colors"
          >
            View Live Store
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-4 py-2 rounded-full bg-error-container text-error text-xs font-bold hover:brightness-95 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-container gap-4 sm:gap-8 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-primary-container text-primary-container'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          Analytics & Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'products'
              ? 'border-primary-container text-primary-container'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          Products ({productsList.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'orders'
              ? 'border-primary-container text-primary-container'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          Orders ({ordersList.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'inventory'
              ? 'border-primary-container text-primary-container'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          Inventory Alerts
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'suppliers'
              ? 'border-primary-container text-primary-container'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          Suppliers / Dropshipping
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 card-shadow">
              <span className="text-xs text-secondary font-medium">Total Gross Sales</span>
              <div className="text-2xl font-extrabold text-on-surface mt-1 tabular-nums">
                {formatCurrency(metrics.gross_sales)}
              </div>
              <span className="text-[11px] text-green-700 font-bold mt-1 inline-block">Realtime Synced</span>
            </div>

            <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 card-shadow">
              <span className="text-xs text-secondary font-medium">Total Orders</span>
              <div className="text-2xl font-extrabold text-on-surface mt-1 tabular-nums">
                {metrics.order_count}
              </div>
              <span className="text-[11px] text-primary-container font-bold mt-1 inline-block">{ordersList.length} loaded</span>
            </div>

            <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 card-shadow">
              <span className="text-xs text-secondary font-medium">Average Order Value</span>
              <div className="text-2xl font-extrabold text-on-surface mt-1 tabular-nums">
                {formatCurrency(metrics.average_order_value)}
              </div>
              <span className="text-[11px] text-secondary mt-1 inline-block">Healthy margin index</span>
            </div>

            <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 card-shadow">
              <span className="text-xs text-secondary font-medium">Active Catalog Items</span>
              <div className="text-2xl font-extrabold text-on-surface mt-1 tabular-nums">
                {metrics.total_products || productsList.length}
              </div>
              <span className="text-[11px] text-brand-gold font-bold mt-1 inline-block">{categoriesList.length} categories live</span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-6 card-shadow">
            <h3 className="text-base font-bold text-on-surface mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-container text-secondary">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {ordersList.map((ord) => (
                    <tr key={ord.id || ord.order_number}>
                      <td className="py-3 font-bold text-on-surface">{ord.id || ord.order_number}</td>
                      <td className="py-3 text-secondary">{ord.customer || ord.shipping_address?.full_name || 'Customer'}</td>
                      <td className="py-3 text-secondary truncate max-w-xs">
                        {Array.isArray(ord.items)
                          ? ord.items.map((i: any) => `${i.product_name || i.name} (x${i.quantity})`).join(', ')
                          : (ord.items || 'Standard Item')}
                      </td>
                      <td className="py-3 font-bold text-on-surface tabular-nums">{formatCurrency(ord.total || ord.total_amount || 0)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            ord.status === 'DELIVERED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-primary-fixed text-primary-container'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface">Product Catalog Management</h2>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="py-2.5 px-5 rounded-full bg-primary-container text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:brightness-105 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl overflow-hidden card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface border-b border-surface-container text-secondary">
                  <tr>
                    <th className="p-4 font-semibold">Product</th>
                    <th className="p-4 font-semibold">SKU</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Stock</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {productsList.map((p) => (
                    <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.images[0]?.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-surface-container-low"
                        />
                        <span className="font-semibold text-on-surface truncate max-w-xs">{p.name}</span>
                      </td>
                      <td className="p-4 text-secondary font-mono">{p.sku}</td>
                      <td className="p-4 text-secondary">{p.category_name}</td>
                      <td className="p-4 font-bold text-on-surface tabular-nums">{formatCurrency(p.base_price)}</td>
                      <td className="p-4">
                        <span
                          className={`font-bold tabular-nums ${
                            p.stock < 15 ? 'text-error font-extrabold' : 'text-on-surface'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.is_active ? 'bg-green-100 text-green-800' : 'bg-surface-container text-secondary'
                          }`}
                        >
                          {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleProductActive(p.id)}
                          className="text-xs font-semibold text-primary-container hover:underline"
                        >
                          {p.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-on-surface">Order Processing & Fulfillment</h2>
          <div className="space-y-4">
            {ordersList.map((ord) => (
              <div
                key={ord.id || ord.order_number}
                className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-sm text-on-surface">{ord.id || ord.order_number}</span>
                    <span className="text-xs text-secondary">• {ord.date || (ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Live')}</span>
                    <span className="text-xs font-semibold text-primary-container">{ord.customer || ord.shipping_address?.full_name || 'Customer'}</span>
                  </div>
                  <div className="text-xs text-secondary">
                    {Array.isArray(ord.items)
                      ? ord.items.map((i: any) => `${i.product_name || i.name} (x${i.quantity})`).join(', ')
                      : (ord.items || 'Standard Item')}
                  </div>
                  <div className="text-xs font-bold text-on-surface mt-1 tabular-nums">
                    Total: {formatCurrency(ord.total || ord.total_amount || 0)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateOrderStatus(ord.id || ord.order_number, e.target.value)}
                    className="bg-surface border border-surface-container rounded-xl px-3 py-1.5 text-xs font-bold text-on-surface cursor-pointer"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY ALERTS */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-on-surface">Low Stock & Inventory Monitoring</h2>
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-6 card-shadow space-y-4">
            {productsList
              .filter((p) => p.stock < 25)
              .map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-surface-container">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images[0]?.image_url}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">{p.name}</h4>
                      <span className="text-[11px] text-secondary font-mono">{p.sku}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-error bg-error-container/40 px-2 py-0.5 rounded-full">
                      Only {p.stock} remaining
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUPPLIERS / DROPSHIPPING ARCHITECTURE */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface">Supplier & Dropshipping Architecture</h2>
            <span className="text-xs bg-primary-fixed text-primary-container px-2.5 py-0.5 rounded-full font-bold">
              FULFILLMENT NETWORK
            </span>
          </div>
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-6 card-shadow space-y-4 text-xs text-secondary">
            <p>
              UniStore fulfillment operations integrate directly with partner facilities for automated dispatch and inventory synchronization. Each catalog SKU maps to verified suppliers with SLA tracking.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface border border-surface-container space-y-2">
                <div className="font-bold text-on-surface">Nordic Lifestyle Suppliers Ltd.</div>
                <div className="text-[11px]">Primary partner for ceramic drippers & glassware. AWB direct API dispatch.</div>
                <div className="text-[10px] text-primary-container font-semibold">Fulfillment SLA: 24h</div>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-surface-container space-y-2">
                <div className="font-bold text-on-surface">Acoustic Craft Audio Partners</div>
                <div className="text-[11px]">Direct planar headphone manufacturing and domestic warehousing.</div>
                <div className="text-[10px] text-primary-container font-semibold">Fulfillment SLA: Same Day</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-6 max-w-md w-full card-shadow shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface">Add New Product</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-secondary hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sculpted Walnut Key Tray"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-surface border border-surface-container rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-surface border border-surface-container rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-surface border border-surface-container rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full bg-surface border border-surface-container rounded-xl px-3 py-2 text-xs font-medium"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cloudinary Media Uploader */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-secondary">
                    Product Image
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cloudinaryStatus?.configured
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : 'bg-amber-500/10 text-amber-700'
                  }`}>
                    {cloudinaryStatus?.configured ? `☁️ Cloudinary Active (${cloudinaryStatus.cloud_name || 'Connected'})` : '⚠️ Cloudinary Pending'}
                  </span>
                </div>

                {newProdImageUrl ? (
                  <div className="relative rounded-xl border border-surface-container overflow-hidden bg-surface-container-low p-2 flex items-center gap-3">
                    <img
                      src={newProdImageUrl}
                      alt="Uploaded preview"
                      className="w-14 h-14 rounded-lg object-cover bg-surface-container flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Uploaded to Cloudinary
                      </div>
                      <div className="text-[10px] text-secondary truncate">{newProdImageUrl}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewProdImageUrl('')}
                      className="p-1 text-secondary hover:text-error rounded-lg"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-surface-container-high rounded-xl p-3.5 text-center bg-surface-container-low/50 hover:bg-surface-container-low transition-colors">
                    <input
                      type="file"
                      id="product-image-upload"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1"
                    >
                      <span className={`material-symbols-outlined text-[24px] text-primary-container ${isUploading ? 'animate-spin' : ''}`}>
                        {isUploading ? 'progress_activity' : 'cloud_upload'}
                      </span>
                      <span className="text-xs font-semibold text-on-surface">
                        {isUploading ? 'Uploading to Cloudinary...' : 'Upload Product Photo to Cloudinary'}
                      </span>
                      <span className="text-[10px] text-secondary">Supports JPG, PNG, WEBP, AVIF</span>
                    </label>
                  </div>
                )}

                {uploadError && (
                  <p className="text-[11px] text-error mt-1 bg-error-container/20 p-2 rounded-lg">{uploadError}</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-full border border-surface-container-high text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary-container text-white text-xs font-bold shadow-xs hover:brightness-105"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
