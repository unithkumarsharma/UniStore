import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../store/ToastContext';
import { formatCurrency } from '../utils/currency';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import logoImg from '../assets/logo.png';

interface SupplierOrder {
  id: string;
  order_number: string;
  customer_name: string;
  destination_city: string;
  items_summary: string;
  total_amount: number;
  status: 'PENDING_PACKING' | 'READY_FOR_PICKUP' | 'IN_TRANSIT' | 'DELIVERED';
  created_at: string;
  awb_number: string;
}

interface SupplierProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  is_active: boolean;
  image_url: string;
}

const INITIAL_SUPPLIERS = [
  {
    id: 'sup-1',
    name: 'Nordic Lifestyle Suppliers Ltd.',
    code: 'SUP-NDIC',
    city: 'Mumbai Hub (BKC)',
    contact_email: 'fulfillment@nordiclifestyle.test',
    phone: '+91 22 2490 1200',
    sla_hours: 24,
    rating: 4.9,
  },
  {
    id: 'sup-2',
    name: 'Acoustic Craft Audio Labs',
    code: 'SUP-ACST',
    city: 'Bengaluru Facility (Indiranagar)',
    contact_email: 'orders@acousticcraft.test',
    phone: '+91 80 4120 9000',
    sla_hours: 12,
    rating: 4.95,
  },
  {
    id: 'sup-3',
    name: 'Komorebi Minimalist Living',
    code: 'SUP-KMRB',
    city: 'Delhi NCR Studio (Gurugram)',
    contact_email: 'partner@komorebi.test',
    phone: '+91 11 2680 4000',
    sla_hours: 18,
    rating: 4.88,
  },
];

export const SupplierPortalPage: React.FC = () => {
  useDocumentTitle('UniStore Vendor & Supplier Merchant Center');
  const { toast } = useToast();

  const [activeSupplierId, setActiveSupplierId] = useState('sup-1');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'payouts'>('orders');
  const [showAddSkuModal, setShowAddSkuModal] = useState(false);
  const [showShippingLabel, setShowShippingLabel] = useState<SupplierOrder | null>(null);

  // Supplier Products state (persisted in localStorage)
  const [products, setProducts] = useState<SupplierProduct[]>(() => {
    try {
      const stored = localStorage.getItem('unistore_supplier_products');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'sp-1',
        name: 'Acoustic Pro Wireless ANC Headphones',
        category: 'Tech & Audio',
        price: 4999,
        stock: 35,
        sku: 'UNI-AUD-01',
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      },
      {
        id: 'sp-2',
        name: 'Ergonomic Mesh Task Chair',
        category: 'Desk Setup',
        price: 14999,
        stock: 12,
        sku: 'UNI-CHR-04',
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1580481077195-c9a444a7f34c?w=800&q=80',
      },
      {
        id: 'sp-3',
        name: 'Ceramic Pour-Over Coffee Dripper',
        category: 'Coffee & Kitchen',
        price: 1899,
        stock: 48,
        sku: 'UNI-COF-09',
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      },
      {
        id: 'sp-4',
        name: 'Sculpted Walnut Desk Mat (Extended)',
        category: 'Desk Setup',
        price: 2499,
        stock: 22,
        sku: 'UNI-DSK-15',
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      },
    ];
  });

  // Supplier Orders state (persisted in localStorage)
  const [orders, setOrders] = useState<SupplierOrder[]>(() => {
    try {
      const stored = localStorage.getItem('unistore_supplier_orders');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'ord-101',
        order_number: 'UNI-839210',
        customer_name: 'Arjun Sharma',
        destination_city: 'Mumbai, MH',
        items_summary: '1x Acoustic Pro Wireless ANC Headphones',
        total_amount: 4999,
        status: 'READY_FOR_PICKUP',
        created_at: 'Today, 10:30 AM',
        awb_number: '83920194821',
      },
      {
        id: 'ord-102',
        order_number: 'UNI-839211',
        customer_name: 'Priya Iyer',
        destination_city: 'Bengaluru, KA',
        items_summary: '1x Ergonomic Mesh Task Chair',
        total_amount: 14999,
        status: 'PENDING_PACKING',
        created_at: 'Today, 11:15 AM',
        awb_number: '83920194822',
      },
      {
        id: 'ord-103',
        order_number: 'UNI-839209',
        customer_name: 'Karan Mehta',
        destination_city: 'Delhi, DL',
        items_summary: '2x Ceramic Pour-Over Coffee Dripper',
        total_amount: 3798,
        status: 'IN_TRANSIT',
        created_at: 'Yesterday',
        awb_number: '83920194819',
      },
      {
        id: 'ord-104',
        order_number: 'UNI-839198',
        customer_name: 'Ananya Roy',
        destination_city: 'Kolkata, WB',
        items_summary: '1x Sculpted Walnut Desk Mat',
        total_amount: 2499,
        status: 'DELIVERED',
        created_at: '2 days ago',
        awb_number: '83920194801',
      },
    ];
  });

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Tech & Audio');
  const [newPrice, setNewPrice] = useState(2999);
  const [newStock, setNewStock] = useState(25);
  const [newSku, setNewSku] = useState('UNI-NEW-01');

  useEffect(() => {
    localStorage.setItem('unistore_supplier_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('unistore_supplier_orders', JSON.stringify(orders));
  }, [orders]);

  const activeSupplier = INITIAL_SUPPLIERS.find((s) => s.id === activeSupplierId) || INITIAL_SUPPLIERS[0];

  // Handler: Pack order
  const handlePackOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'READY_FOR_PICKUP' } : o))
    );
    toast.success('Package Packed & QC Sealed', 'Order marked ready for delivery partner pickup.');
  };

  // Handler: Dispatch / Handover to Rider
  const handleHandoverToRider = (order: SupplierOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: 'IN_TRANSIT' } : o))
    );
    toast.cart(
      {
        name: order.order_number,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        price: order.total_amount,
      },
      {
        label: 'Track Courier',
        onClick: () => (window.location.href = `/orders/${order.order_number}/track`),
      }
    );
    toast.success('Handed Over to Courier', `Package assigned to Bluedart Air Courier (AWB: ${order.awb_number})`);
  };

  // Handler: Add new SKU
  const handleAddNewSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Title Required', 'Please enter a valid product title');
      return;
    }
    const newProduct: SupplierProduct = {
      id: `sp-${Date.now()}`,
      name: newTitle.trim(),
      category: newCategory,
      price: Number(newPrice),
      stock: Number(newStock),
      sku: newSku.toUpperCase().trim() || `UNI-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    };
    setProducts([newProduct, ...products]);
    setShowAddSkuModal(false);
    setNewTitle('');
    toast.success('SKU Published', `${newProduct.name} is now live in catalog inventory.`);
  };

  // Handler: Request payout withdrawal
  const handleRequestPayout = () => {
    toast.success('Settlement Requested', '₹48,200.00 will be credited to HDFC Bank (A/C: ****4091) within 2 business hours.');
  };

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingPackCount = orders.filter((o) => o.status === 'PENDING_PACKING').length;
  const readyPickupCount = orders.filter((o) => o.status === 'READY_FOR_PICKUP').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500 selection:text-zinc-950 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoImg} alt="UniStore" className="h-7 w-auto object-contain" />
          </Link>
          <div className="h-5 w-px bg-zinc-800 hidden sm:block" />
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800/70 text-emerald-400 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Supplier Merchant Hub</span>
          </div>
        </div>

        {/* Switch Supplier Facility Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs">
            <span className="material-symbols-outlined text-[16px] text-zinc-400 mr-2">warehouse</span>
            <select
              value={activeSupplierId}
              onChange={(e) => {
                setActiveSupplierId(e.target.value);
                toast.info('Facility Switched', `Active inventory switched to selected supplier.`);
              }}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              {INITIAL_SUPPLIERS.map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/rider"
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all border border-zinc-700/60"
          >
            <span className="material-symbols-outlined text-[15px]">electric_moped</span>
            <span>Rider App</span>
          </Link>

          <Link
            to="/"
            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition-all shadow-sm"
          >
            Storefront
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Merchant Facility Hero Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 uppercase tracking-widest mb-1.5">
              <span>{activeSupplier.code}</span>
              <span>•</span>
              <span>Fulfillment SLA: {activeSupplier.sla_hours} Hours</span>
              <span>•</span>
              <span className="text-amber-400">★ {activeSupplier.rating}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeSupplier.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Fulfillment hub located at <span className="text-zinc-200 font-semibold">{activeSupplier.city}</span>. Direct API dispatch pipeline enabled with automated Bluedart Air logistics.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 min-w-[130px]">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                Total Revenue
              </span>
              <div className="text-lg font-black text-white tabular-nums">
                {formatCurrency(totalRevenue)}
              </div>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 min-w-[130px]">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                Settlement Due
              </span>
              <div className="text-lg font-black text-emerald-400 tabular-nums">
                ₹48,200
              </div>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 min-w-[110px]">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                Needs Packing
              </span>
              <div className="text-lg font-black text-amber-400 tabular-nums">
                {pendingPackCount}
              </div>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 min-w-[110px]">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                Ready for Rider
              </span>
              <div className="text-lg font-black text-blue-400 tabular-nums">
                {readyPickupCount}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>Orders to Fulfill ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              <span>Catalog SKUs ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'payouts'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>Settlement Payouts</span>
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={() => setShowAddSkuModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add New SKU</span>
            </button>
          )}
        </div>

        {/* TAB 1: ORDERS TO FULFILL */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => {
                const isPending = order.status === 'PENDING_PACKING';
                const isReady = order.status === 'READY_FOR_PICKUP';
                const isTransit = order.status === 'IN_TRANSIT';
                const isDelivered = order.status === 'DELIVERED';

                return (
                  <div
                    key={order.id}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
                            Order ID
                          </span>
                          <span className="font-mono text-base font-black text-white">
                            {order.order_number}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                            isPending
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : isReady
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                              : isTransit
                              ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {isPending && 'Packing Required'}
                          {isReady && 'Ready for Pickup'}
                          {isTransit && 'Handed Over to Courier'}
                          {isDelivered && 'Delivered to Customer'}
                        </span>
                      </div>

                      <div className="mt-3.5 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Customer:</span>
                          <span className="text-zinc-200 font-semibold">{order.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Destination:</span>
                          <span className="text-zinc-200 font-semibold">{order.destination_city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Item:</span>
                          <span className="text-white font-bold truncate max-w-[220px]">
                            {order.items_summary}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">AWB Track:</span>
                          <span className="font-mono text-emerald-400 font-bold">{order.awb_number}</span>
                        </div>
                        <div className="flex justify-between pt-1 text-sm font-bold">
                          <span className="text-zinc-400">Order Amount:</span>
                          <span className="text-white tabular-nums">{formatCurrency(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setShowShippingLabel(order)}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">print</span>
                        <span>Shipping Label</span>
                      </button>

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handlePackOrder(order.id)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">inventory</span>
                          <span>Mark as Packed</span>
                        </button>
                      )}

                      {isReady && (
                        <button
                          type="button"
                          onClick={() => handleHandoverToRider(order)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">electric_moped</span>
                          <span>Handover to Courier</span>
                        </button>
                      )}

                      {(isTransit || isDelivered) && (
                        <Link
                          to={`/orders/${order.order_number}/track`}
                          className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">radar</span>
                          <span>Live Telemetry</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CATALOG SKUs INVENTORY */}
        {activeTab === 'products' && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-400">
                <thead className="bg-zinc-950/80 text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="p-4">Product Info</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">SKU Code</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4">Unit Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover bg-zinc-800 border border-zinc-700"
                        />
                        <div>
                          <div className="font-bold text-white text-xs">{item.name}</div>
                          <div className="text-[10px] text-zinc-500">ID: {item.id}</div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-zinc-300">{item.category}</td>
                      <td className="p-4 font-mono font-bold text-emerald-400">{item.sku}</td>
                      <td className="p-4 font-bold text-white tabular-nums">
                        {item.stock > 0 ? (
                          <span className="text-emerald-400">{item.stock} in stock</span>
                        ) : (
                          <span className="text-red-400">Out of Stock</span>
                        )}
                      </td>
                      <td className="p-4 font-black text-white tabular-nums">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => {
                            setProducts((prev) =>
                              prev.map((p) => (p.id === item.id ? { ...p, is_active: !p.is_active } : p))
                            );
                            toast.info(
                              item.is_active ? 'SKU Deactivated' : 'SKU Activated',
                              `${item.name} listing status updated.`
                            );
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            item.is_active
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = prompt('Enter new stock quantity:', String(item.stock));
                            if (newQty !== null && !isNaN(Number(newQty))) {
                              setProducts((prev) =>
                                prev.map((p) =>
                                  p.id === item.id ? { ...p, stock: Number(newQty) } : p
                                )
                              );
                              toast.success('Stock Updated', `Inventory updated for ${item.name}`);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Edit Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SETTLEMENT PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                  Available for Instant Settlement
                </span>
                <div className="text-2xl font-black text-emerald-400 tabular-nums">
                  ₹48,200.00
                </div>
                <button
                  type="button"
                  onClick={handleRequestPayout}
                  className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Withdraw to Bank Account
                </button>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                  Linked Payout Account
                </span>
                <div className="text-base font-bold text-white">HDFC Bank Limited</div>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">A/C: **** **** 4091</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">IFSC: HDFC0001824</div>
                <span className="mt-3 inline-block text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                  ✓ Verified for Auto-Sweep
                </span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                  Last Settlement
                </span>
                <div className="text-xl font-bold text-zinc-200">₹1,12,450.00</div>
                <div className="text-xs text-zinc-400 mt-1">Processed on Sep 28, 2026</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1">UTR: HDFC202609281982</div>
              </div>
            </div>

            {/* Payout Logs Table */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Past Settlement History</h3>
              <div className="divide-y divide-zinc-800 text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Batch Settlement #SET-90182</div>
                    <div className="text-zinc-500 text-[11px]">UTR: HDFC202609281982 • HDFC Bank</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white tabular-nums">₹1,12,450.00</div>
                    <span className="text-emerald-400 text-[10px] font-bold">✓ Successfully Settled</span>
                  </div>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Batch Settlement #SET-89410</div>
                    <div className="text-zinc-500 text-[11px]">UTR: HDFC202609210941 • HDFC Bank</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white tabular-nums">₹89,200.00</div>
                    <span className="text-emerald-400 text-[10px] font-bold">✓ Successfully Settled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add New SKU Modal */}
      {showAddSkuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Publish New Supplier SKU</h3>
              <button
                type="button"
                onClick={() => setShowAddSkuModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewSku} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sculpted Key Tray Walnut"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tech & Audio">Tech & Audio</option>
                    <option value="Desk Setup">Desk Setup</option>
                    <option value="Coffee & Kitchen">Coffee & Kitchen</option>
                    <option value="Home & Living">Home & Living</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="UNI-WLT-01"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Warehouse Stock</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkuModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-zinc-950 shadow-md"
                >
                  Publish SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Shipping Label Modal */}
      {showShippingLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white text-zinc-950 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-zinc-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-950">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                <span className="font-black text-lg">BLUEDART AIR EXPEDITED</span>
              </div>
              <button
                type="button"
                onClick={() => setShowShippingLabel(null)}
                className="text-zinc-500 hover:text-zinc-950 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulated Barcode */}
            <div className="text-center py-2 bg-zinc-50 border border-zinc-200 rounded-xl">
              <div className="font-mono text-2xl tracking-[0.25em] font-black">
                ||||| | |||| |||||| | |||||
              </div>
              <div className="font-mono text-xs font-bold text-zinc-600 mt-1">
                AWB: {showShippingLabel.awb_number}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-extrabold text-[10px] text-zinc-400 uppercase tracking-wider block">
                  Shipper / Origin:
                </span>
                <div className="font-bold text-zinc-900 mt-0.5">{activeSupplier.name}</div>
                <div className="text-zinc-600 text-[11px]">{activeSupplier.city}</div>
                <div className="text-zinc-500 text-[10px]">Ph: {activeSupplier.phone}</div>
              </div>
              <div>
                <span className="font-extrabold text-[10px] text-zinc-400 uppercase tracking-wider block">
                  Deliver To / Consignee:
                </span>
                <div className="font-bold text-zinc-900 mt-0.5">{showShippingLabel.customer_name}</div>
                <div className="text-zinc-600 text-[11px]">{showShippingLabel.destination_city}</div>
                <div className="text-emerald-700 font-bold text-[10px]">Verified Doorstep OTP Required</div>
              </div>
            </div>

            <div className="p-3 bg-zinc-100 rounded-xl text-xs flex justify-between items-center">
              <div>
                <span className="font-bold block">Package Contents:</span>
                <span className="text-zinc-600">{showShippingLabel.items_summary}</span>
              </div>
              <div className="text-right font-black text-sm">
                {formatCurrency(showShippingLabel.total_amount)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success('Thermal Label Sent', 'Sent to Zebra ZT411 thermal warehouse printer.');
                  setShowShippingLabel(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold shadow-md hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Thermal Barcode</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
