import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AddressModal, type UserAddress } from '../components/account/AddressModal';

interface UserOrder {
  id: string;
  order_number?: string;
  created_at?: string;
  total_amount: number;
  status: string;
  items?: Array<{
    product_title?: string;
    product_id?: string;
    quantity?: number;
    price?: number;
    image_url?: string;
  }>;
}

export const AccountPage: React.FC = () => {
  useDocumentTitle('My Account');
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'perks'>('orders');

  const { toast } = useToast();
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [addresses, setAddresses] = useState<UserAddress[]>(() => {
    const saved = localStorage.getItem('unistore_user_addresses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'addr-1',
        name: user?.full_name || 'Arjun Sharma',
        phone: user?.phone || '+91 98765 43210',
        line1: 'Flat 402, Sea Breeze Apartments, Hill Road',
        line2: 'Near Nature Basket, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        tag: 'Home',
        isDefault: true,
      },
    ];
  });
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const handleSaveAddress = (newAddr: UserAddress) => {
    let updated: UserAddress[];
    if (addresses.some((a) => a.id === newAddr.id)) {
      updated = addresses.map((a) => {
        if (a.id === newAddr.id) return newAddr;
        if (newAddr.isDefault) return { ...a, isDefault: false };
        return a;
      });
      toast.success('Address Updated', 'Your delivery details have been saved.');
    } else {
      updated = [
        ...addresses.map((a) => (newAddr.isDefault ? { ...a, isDefault: false } : a)),
        newAddr,
      ];
      toast.success('Address Added', 'New delivery destination saved to your account.');
    }
    setAddresses(updated);
    localStorage.setItem('unistore_user_addresses', JSON.stringify(updated));
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('unistore_user_addresses', JSON.stringify(updated));
    toast.info('Address Removed', 'The destination was removed from your address book.');
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem('unistore_user_addresses', JSON.stringify(updated));
    toast.success('Default Updated', 'Primary shipping address has been updated.');
  };

  useEffect(() => {
    if (user?.full_name) setName(user.full_name);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await api.getOrders(user?.id);
        if (res && Array.isArray(res.orders)) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (user?.id) {
      fetchUserOrders();
    }
  }, [user?.id]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: name, phone });
    setSaveSuccess(true);
    toast.success('Profile Updated', 'Your account details have been saved.');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50/50 py-12 sm:py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-zinc-950 text-white flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="material-symbols-outlined text-[32px]">account_circle</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight mb-2">
            Welcome to UniStore
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-8 max-w-sm mx-auto">
            Sign in to check live order dispatches, manage saved delivery addresses, and enjoy verified member guarantees.
          </p>
          <div className="space-y-3">
            <Link
              to="/login?redirect=/account"
              className="w-full py-3.5 px-6 rounded-2xl bg-zinc-950 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Sign In / Create Account</span>
            </Link>
            <Link
              to="/orders/track"
              className="w-full py-3.5 px-6 rounded-2xl bg-white border border-zinc-200 text-zinc-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-zinc-50 active:scale-95 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              <span>Track an Order with AWB</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Luxury Banner */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-sm flex-shrink-0">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-950">
                  {user?.full_name || 'UniStore Member'}
                </h1>
                <span className="material-symbols-outlined text-[18px] text-emerald-600" title="Verified Member">
                  verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">{user?.email || 'Authenticated Member'}</p>
              
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                  UniStore Black Tier
                </span>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 transition-colors"
                  >
                    Admin Console →
                  </Link>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 gap-2 sm:gap-6 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-zinc-950 text-zinc-950'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">package_2</span>
            <span>My Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'border-zinc-950 text-zinc-950'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span>Saved Addresses</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-zinc-950 text-zinc-950'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Profile & Security</span>
          </button>
          <button
            onClick={() => setActiveTab('perks')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'perks'
                ? 'border-zinc-950 text-zinc-950'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">diamond</span>
            <span>Member Benefits</span>
          </button>
        </div>

        {/* TAB 1: My Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {isLoadingOrders ? (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-[32px] text-zinc-400 animate-spin mb-2">
                  progress_activity
                </span>
                <p className="text-xs text-zinc-500">Retrieving order history...</p>
              </div>
            ) : orders.length > 0 ? (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-zinc-300"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-extrabold text-sm text-zinc-950">
                        {ord.order_number || ord.id}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500">
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : ord.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 font-medium">
                      {ord.items && ord.items.length > 0
                        ? ord.items.map((i) => i.product_title || 'Item').join(', ')
                        : 'Curated Essentials Order'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Amount</div>
                      <span className="text-base font-extrabold text-zinc-950 tabular-nums">
                        {formatCurrency(ord.total_amount)}
                      </span>
                    </div>
                    <Link
                      to={`/orders/${ord.order_number || ord.id}/track`}
                      className="px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[15px]">location_searching</span>
                      <span>Track</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-10 sm:p-14 text-center max-w-md mx-auto my-6 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-4 border border-zinc-200/60">
                  <span className="material-symbols-outlined text-[32px]">shopping_bag</span>
                </div>
                <h3 className="text-base font-bold text-zinc-950 mb-1">No orders yet</h3>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                  Discover our curated line of premium workspace electronics, audiophile gear, and modern living objects.
                </p>
                <Link
                  to="/shop"
                  className="px-6 py-3 rounded-full bg-zinc-950 text-white text-xs font-bold shadow-sm hover:bg-zinc-800 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  <span>Explore Shop</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-xs space-y-4 relative flex flex-col justify-between hover:border-zinc-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-zinc-950">{addr.name}</span>
                      <span className="text-[10px] font-extrabold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full border border-zinc-200 uppercase">
                        {addr.tag}
                      </span>
                    </div>
                    {addr.isDefault ? (
                      <span className="text-[10px] font-black bg-zinc-950 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                        DEFAULT
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-[10px] font-bold text-zinc-500 hover:text-zinc-950 transition underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-zinc-600 space-y-1 leading-relaxed">
                    <p className="font-semibold text-zinc-900">{addr.phone}</p>
                    <p>{addr.line1}</p>
                    {addr.line2 && <p className="text-zinc-500">{addr.line2}</p>}
                    <p className="font-medium text-zinc-900">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Serviceable Area</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(addr);
                        setIsAddressModalOpen(true);
                      }}
                      className="text-xs font-bold text-zinc-950 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Edit</span>
                    </button>
                    {addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Address Card */}
            <div
              onClick={() => {
                setEditingAddress(null);
                setIsAddressModalOpen(true);
              }}
              className="border-2 border-dashed border-zinc-200 hover:border-zinc-950 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-zinc-50/50 hover:bg-white group min-h-[190px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-700 flex items-center justify-center mb-3 transition-colors shadow-2xs">
                <span className="material-symbols-outlined text-[24px]">add</span>
              </div>
              <h4 className="text-xs font-extrabold text-zinc-900 group-hover:text-zinc-950">Add New Destination</h4>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                Save an office, home, or secondary delivery address for 1-click checkout.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <form onSubmit={handleUpdateProfile} className="md:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-zinc-950 mb-1">Personal Details</h3>
              <p className="text-xs text-zinc-500 mb-4">
                Update your contact credentials used for order delivery and billing receipts.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">Email address cannot be changed directly</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Phone Number (SMS updates)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-full bg-zinc-950 text-white text-xs font-bold shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
                >
                  Save Profile Changes
                </button>
                {saveSuccess && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Updated successfully!
                  </span>
                )}
              </div>
            </form>

            <div className="md:col-span-5 space-y-4">
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-2">Account Security</h4>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  Your credentials and payment data are protected with 256-bit encryption and multi-factor phone OTP authentication.
                </p>
                <Link
                  to="/login?mode=forgot"
                  className="text-xs font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1"
                >
                  <span>Reset Account Password</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </Link>
              </div>

              <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>UniStore Concierge</span>
                </div>
                <h4 className="text-sm font-bold mt-1">Need dedicated priority support?</h4>
                <p className="text-xs text-zinc-400 mt-1 mb-4 leading-relaxed">
                  Our private client advisory desk is available 7 days a week for sizing, custom finishes, and delivery routing.
                </p>
                <a
                  href="mailto:concierge@unistore.com"
                  className="inline-block px-4 py-2 rounded-full bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors"
                >
                  Contact Concierge
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Member Benefits */}
        {activeTab === 'perks' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <h4 className="text-sm font-bold text-zinc-950">Express Priority Dispatch</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Every order placed before 3:00 PM IST is packed and dispatched same-day with Bluedart air transit.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <h4 className="text-sm font-bold text-zinc-950">Guaranteed Authenticity</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Direct source procurement with manufacturer serialized warranty papers enclosed in every package.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <span className="material-symbols-outlined text-[20px]">restart_alt</span>
              </div>
              <h4 className="text-sm font-bold text-zinc-950">7-Day Zero-Question Returns</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                If the piece doesn't fit your aesthetic or workspace, schedule an instant doorstep pickup with zero fees.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Address Management Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />
    </div>
  );
};
