import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { formatCurrency } from '../utils/currency';
import { api } from '../services/api';
import type { Address } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  const [address, setAddress] = useState<Address>({
    id: 'addr-1',
    full_name: user?.full_name || 'Arjun Sharma',
    phone: user?.phone || '+91 98765 43210',
    address_line1: 'Flat 402, Sea Breeze Apts, Bandra West',
    address_line2: 'Near Hill Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400050',
    country: 'India',
    is_default: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-4 border border-zinc-200/60">
            <span className="material-symbols-outlined text-[32px]">shopping_bag</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-950 mb-1">Your bag is empty</h2>
          <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
            Please curate your selection before proceeding to secure checkout.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 text-white font-bold text-xs shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <span>Browse Catalog</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res.message);
    if (res.success) setCouponInput('');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const orderNumber = `UNI-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (paymentMethod === 'RAZORPAY') {
        const rzpOrder = await api.createRazorpayOrder(cart.total_amount, orderNumber);
        const verifyRes = await api.verifyPayment({
          razorpay_order_id: rzpOrder.razorpay_order_id,
          razorpay_payment_id: `pay_auth_${Date.now()}`,
          razorpay_signature: 'auth_sig_verified',
          order_id: orderNumber,
        });

        if (!verifyRes.verified) {
          throw new Error('Payment verification rejected by backend signature check');
        }
      }

      // Persist order in Supabase Cloud & Firestore backup
      await api.createOrder({
        id: orderNumber,
        order_number: orderNumber,
        items: cart.items.map((it) => ({
          product_id: it.product_id,
          variant_id: it.variant_id || null,
          product_name: it.product.name,
          price: it.price,
          quantity: it.quantity,
          total: it.total,
          image_url: it.product.images[0]?.image_url,
        })),
        subtotal: cart.subtotal,
        discount_amount: cart.discount_amount,
        shipping_fee: cart.shipping_fee,
        tax_amount: cart.tax_amount,
        total_amount: cart.total_amount,
        shipping_address: address,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'RAZORPAY' ? 'PAID' : 'PENDING',
      });

      clearCart();
      navigate(`/orders/${orderNumber}/confirmation`, {
        state: {
          order: {
            id: orderNumber,
            order_number: orderNumber,
            items: cart.items,
            subtotal: cart.subtotal,
            discount_amount: cart.discount_amount,
            shipping_fee: cart.shipping_fee,
            tax_amount: cart.tax_amount,
            total_amount: cart.total_amount,
            shipping_address: address,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'RAZORPAY' ? 'PAID' : 'PENDING',
            created_at: new Date().toISOString(),
          },
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Sticky / Expandable Order Summary Header */}
        <div className="lg:hidden mb-6 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-950"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              <span>{showMobileSummary ? 'Hide Order Summary' : 'Show Order Summary'}</span>
              <span className="material-symbols-outlined text-[16px] text-zinc-400">
                {showMobileSummary ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            <span className="text-sm font-extrabold text-zinc-950 tabular-nums">
              {formatCurrency(cart.total_amount)}
            </span>
          </div>

          {showMobileSummary && (
            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.product.images[0]?.image_url}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-100 flex-shrink-0 border border-zinc-200/60"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-zinc-900 truncate">{item.product.name}</p>
                    <p className="text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 tabular-nums">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-600 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatCurrency(cart.subtotal)}</span>
                </div>
                {cart.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatCurrency(cart.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{cart.shipping_fee === 0 ? 'FREE' : formatCurrency(cart.shipping_fee)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step Tracker */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="flex items-center justify-between relative px-4">
            <div className="absolute left-8 right-8 top-4 h-0.5 bg-zinc-200 -z-0" />
            <div
              className="absolute left-8 top-4 h-0.5 bg-zinc-950 -z-0 transition-all duration-300"
              style={{
                width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
              }}
            />

            {/* Step 1 */}
            <button
              onClick={() => setStep(1)}
              className={`flex flex-col items-center gap-1.5 relative z-10 ${
                step >= 1 ? 'text-zinc-950' : 'text-zinc-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= 1 ? 'bg-zinc-950 text-white shadow-sm' : 'bg-zinc-200 text-zinc-500'
                }`}
              >
                1
              </div>
              <span className="text-[11px] font-bold tracking-tight">Delivery</span>
            </button>

            {/* Step 2 */}
            <button
              onClick={() => setStep(2)}
              className={`flex flex-col items-center gap-1.5 relative z-10 ${
                step >= 2 ? 'text-zinc-950' : 'text-zinc-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= 2 ? 'bg-zinc-950 text-white shadow-sm' : 'bg-zinc-200 text-zinc-500'
                }`}
              >
                2
              </div>
              <span className="text-[11px] font-bold tracking-tight">Review</span>
            </button>

            {/* Step 3 */}
            <button
              onClick={() => setStep(3)}
              className={`flex flex-col items-center gap-1.5 relative z-10 ${
                step >= 3 ? 'text-zinc-950' : 'text-zinc-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= 3 ? 'bg-zinc-950 text-white shadow-sm' : 'bg-zinc-200 text-zinc-500'
                }`}
              >
                3
              </div>
              <span className="text-[11px] font-bold tracking-tight">Payment</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Grid: Form on Left (7 cols), Sticky Summary on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Area */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* STEP 1: Shipping Address */}
            {step === 1 && (
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-950">Shipping Destination</h2>
                    <p className="text-xs text-zinc-500">Enter where we should deliver your curated package.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Step 1 of 3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={address.full_name}
                      onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Mobile Phone (Delivery OTP)</label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address.address_line1}
                    onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
                    placeholder="House / Flat No., Apartment, Landmark, Street"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">City</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">State</label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={address.postal_code}
                      onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-3 px-7 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
                  >
                    <span>Review Order</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Review Items */}
            {step === 2 && (
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-950">Review Curated Items</h2>
                    <p className="text-xs text-zinc-500">Verify your items and delivery destination before paying.</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-zinc-950 hover:underline"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Delivery Snapshot */}
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/70 text-xs text-zinc-600 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-zinc-700 text-[20px] mt-0.5">location_on</span>
                    <div>
                      <div className="font-bold text-zinc-950">{address.full_name} ({address.phone})</div>
                      <div className="mt-0.5 text-zinc-500">
                        {address.address_line1}, {address.city}, {address.state} — {address.postal_code}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-zinc-100">
                  {cart.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center gap-3 sm:gap-4">
                      <img
                        src={item.product.images[0]?.image_url}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover bg-zinc-100 flex-shrink-0 border border-zinc-200/60"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-950 truncate">{item.product.name}</h4>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-zinc-950 tabular-nums">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-2.5 px-5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="py-3 px-7 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
                  >
                    <span>Proceed to Payment</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Options */}
            {step === 3 && (
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="pb-3 border-b border-zinc-100">
                  <h2 className="text-base sm:text-lg font-bold text-zinc-950">Select Payment Method</h2>
                  <p className="text-xs text-zinc-500">All transactions are encrypted with 256-bit bank-grade protocol.</p>
                </div>

                <div className="space-y-3">
                  {/* Razorpay Option */}
                  <label
                    className={`flex items-start justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-zinc-950 bg-zinc-50/80 shadow-xs'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'RAZORPAY'}
                        onChange={() => setPaymentMethod('RAZORPAY')}
                        className="mt-1 text-zinc-950 focus:ring-zinc-950"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-zinc-950 flex flex-wrap items-center gap-2">
                          <span>Instant Digital Payment (Razorpay)</span>
                          <span className="text-[10px] bg-zinc-950 text-white font-bold px-2 py-0.5 rounded-full">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          Instant confirmation via UPI (Google Pay, PhonePe, Paytm, CRED), Credit/Debit Cards, NetBanking, or EMIs.
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-zinc-800 text-[24px]">verified_user</span>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    className={`flex items-start justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-zinc-950 bg-zinc-50/80 shadow-xs'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="mt-1 text-zinc-950 focus:ring-zinc-950"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-zinc-950">Cash on Delivery (Doorstep QR / Cash)</div>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          Pay directly to courier via Cash or UPI QR scan upon receiving package.
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-zinc-400 text-[24px]">local_shipping</span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-2.5 px-5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handlePlaceOrder}
                    className="py-3.5 px-8 rounded-full bg-zinc-950 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:bg-zinc-800 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        <span>Confirming Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Order ({formatCurrency(cart.total_amount)})</span>
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Area (Desktop) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-7 shadow-sm sticky top-24 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-950">Order Summary</h3>
                <span className="text-xs text-zinc-400">{cart.items.length} items</span>
              </div>

              {/* Coupon Input Form */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (e.g. WELCOME10)"
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs uppercase text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Apply
                  </button>
                </form>
                {couponFeedback && (
                  <p className="text-[11px] text-zinc-600 mt-1 font-medium">{couponFeedback}</p>
                )}
                {cart.coupon_code && (
                  <div className="mt-2 flex items-center justify-between bg-zinc-50 rounded-lg px-2.5 py-1 text-xs">
                    <span className="text-emerald-700 font-bold text-[11px]">Applied: {cart.coupon_code}</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-zinc-400 hover:text-zinc-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Pricing Line Items */}
              <div className="space-y-2.5 text-xs text-zinc-500 border-t border-b border-zinc-100 py-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 font-semibold tabular-nums">{formatCurrency(cart.subtotal)}</span>
                </div>
                {cart.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span className="tabular-nums">-{formatCurrency(cart.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-zinc-900 font-semibold tabular-nums">
                    {cart.shipping_fee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatCurrency(cart.shipping_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Estimated GST (18% included)</span>
                  <span className="tabular-nums">{formatCurrency(cart.tax_amount)}</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-base font-extrabold text-zinc-950">Grand Total</span>
                  <p className="text-[10px] text-zinc-400">Inclusive of all local duties & express logistics</p>
                </div>
                <span className="text-xl font-black text-zinc-950 tabular-nums">
                  {formatCurrency(cart.total_amount)}
                </span>
              </div>

              {/* Trust Strip */}
              <div className="pt-4 border-t border-zinc-100 space-y-2 text-[11px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
                  <span>256-Bit SSL Encrypted Banking Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">published_with_changes</span>
                  <span>7-Day Zero Questions Return Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>100% Genuine Serialized Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
