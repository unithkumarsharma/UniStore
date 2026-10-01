import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { api } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const OrderConfirmationPage: React.FC = () => {
  useDocumentTitle('Order Confirmed');
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<any>(location.state?.order || null);
  const [loading, setLoading] = useState<boolean>(!location.state?.order && !!orderId);

  useEffect(() => {
    if (order || !orderId) return;
    let isMounted = true;
    api.getOrders().then((res) => {
      if (!isMounted) return;
      const found = (res.orders || []).find(
        (o: any) => o.order_number === orderId || o.id === orderId
      );
      if (found) {
        setOrder(found);
      }
    }).catch((err) => {
      console.warn('Could not restore order on reload:', err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [orderId, order]);

  const displayOrderId = orderId || order?.order_number || 'UNI-839210';

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs text-zinc-500 font-medium">Retrieving verified order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 py-8 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Luxury Card */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
          
          {/* Animated / Celebratory Checkmark Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <span className="material-symbols-outlined text-[36px] sm:text-[42px]">
              check_circle
            </span>
          </div>

          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
            Payment Confirmed • Order Placed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 mt-1 mb-2 tracking-tight">
            Thank you for choosing UniStore
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
            Your order has been registered in our automated fulfillment system. A detailed invoice has been dispatched to your email.
          </p>

          {/* Quick Metrics Bar */}
          <div className="bg-zinc-50 rounded-2xl p-4 sm:p-5 border border-zinc-200/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-6 text-left">
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Order Identifier</span>
              <span className="font-extrabold text-sm text-zinc-950 font-mono">{displayOrderId}</span>
            </div>
            <div className="border-l border-zinc-200 pl-4">
              <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Payment Status</span>
              {order?.razorpay_payment_id || order?.payment_method === 'RAZORPAY' ? (
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Paid (Razorpay)</span>
                </span>
              ) : (
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">pending</span>
                  <span>COD (Pending)</span>
                </span>
              )}
            </div>
            <div className="border-l border-zinc-200 pl-4">
              <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Courier Carrier</span>
              <span className="font-bold text-zinc-900">Bluedart Priority Air</span>
            </div>
            <div className="border-l border-zinc-200 pl-4">
              <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Est. Delivery</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Within 48 Hours</span>
              </span>
            </div>
          </div>

          {/* Official Razorpay Reference Banner */}
          {order?.razorpay_payment_id && (
            <div className="mb-8 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Official Banking Reference ID</span>
                  <span className="text-xs font-mono font-bold text-zinc-900">{order.razorpay_payment_id}</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                Verified by Razorpay Standard Gateway
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              to={`/orders/${displayOrderId}/track`}
              className="w-full sm:w-auto py-3 px-6 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">location_searching</span>
              <span>Track Live Delivery</span>
            </Link>
            <button
              onClick={handlePrint}
              type="button"
              className="w-full sm:w-auto py-3 px-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Receipt</span>
            </button>
            <Link
              to="/shop"
              className="w-full sm:w-auto py-3 px-6 rounded-full border border-zinc-200 text-zinc-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-50 transition-colors"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Order Summary & Destination Details if passed */}
          {order && (
            <div className="text-left border-t border-zinc-100 pt-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 mb-3">Purchased Items</h3>
                  {(order.items || []).map((item: any) => {
                    const itemImg = item.product?.images?.[0]?.image_url || item.image_url;
                    const itemName = item.product?.name || item.product_name || 'UniStore Item';
                    return (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {itemImg && (
                            <img
                              src={itemImg}
                              alt={itemName}
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-100 border border-zinc-200/60"
                            />
                          )}
                          <div>
                            <span className="font-semibold text-zinc-900 block line-clamp-1">{itemName}</span>
                            <span className="text-zinc-500 text-[11px]">Quantity: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-zinc-950 tabular-nums">{formatCurrency(item.total)}</span>
                      </div>
                    );
                  })}
              </div>

              {/* Financial Recap */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/70 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold text-zinc-900">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-zinc-900">
                    {order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-zinc-950 pt-2 border-t border-zinc-200/60">
                  <span>Total Paid ({order.payment_method})</span>
                  <span className="tabular-nums text-zinc-950">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>

              {/* Shipping Destination Recap */}
              {order.shipping_address && (
                <div className="text-xs text-zinc-600 bg-white border border-zinc-200/70 rounded-2xl p-4">
                  <span className="font-bold text-zinc-950 block mb-1 text-xs">Delivering to:</span>
                  <p className="font-semibold text-zinc-900">{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.postal_code}</p>
                  <p className="text-zinc-500 mt-1">Phone: {order.shipping_address.phone}</p>
                </div>
              )}
            </div>
          )}

          {/* Need Assistance Strip */}
          <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-zinc-700">support_agent</span>
              <span>Questions regarding this order?</span>
            </span>
            <a href="mailto:support@unistore.com" className="font-bold text-zinc-950 hover:underline">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
