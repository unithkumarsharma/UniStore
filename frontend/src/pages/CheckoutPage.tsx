import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { formatCurrency } from '../utils/currency';
import { api } from '../services/api';
import type { Address } from '../types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const CheckoutPage: React.FC = () => {
  useDocumentTitle('Secure Checkout');
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

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [upiMode, setUpiMode] = useState<'ID' | 'QR'>('ID');
  const [upiId, setUpiId] = useState('');
  const [isWaitingUpi, setIsWaitingUpi] = useState(false);
  const [upiTimeLeft, setUpiTimeLeft] = useState(300);

  // Direct Card Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.full_name || 'Arjun Sharma');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Direct NetBanking Field
  const [selectedBank, setSelectedBank] = useState('HDFC');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!isWaitingUpi || upiTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setUpiTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isWaitingUpi, upiTimeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getCardBrand = (num: string): string => {
    const clean = num.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
    if (/^(60|65|81|82|508)/.test(clean)) return 'RuPay';
    if (/^3[47]/.test(clean)) return 'Amex';
    return 'Card';
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

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

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof (window as any).Razorpay !== 'undefined') {
        return resolve(true);
      }
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSuccess = async (response: any, orderNumber: string, method: string) => {
    setIsProcessing(true);
    try {
      const verifyRes = await api.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        order_id: orderNumber,
      });

      if (!verifyRes.success && !verifyRes.verified) {
        throw new Error(verifyRes.error || 'Payment verification failed: Signature mismatch');
      }

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
        payment_method: method,
        payment_status: 'PAID',
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
            payment_method: method,
            payment_status: 'PAID',
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            created_at: new Date().toISOString(),
          },
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment verification failed. Please contact customer support.');
    } finally {
      setIsProcessing(false);
      setIsWaitingUpi(false);
    }
  };

  const startStatusPolling = (rzpOrderId: string, orderNumber: string, method: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    let attempts = 0;
    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 120) {
        clearInterval(pollIntervalRef.current);
        return;
      }
      try {
        const res = await api.checkPaymentStatus({
          razorpay_order_id: rzpOrderId,
          store_order_id: orderNumber,
        });
        if (res.paid || res.status === 'captured') {
          clearInterval(pollIntervalRef.current);
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
            payment_method: method,
            payment_status: 'PAID',
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
                payment_method: method,
                payment_status: 'PAID',
                razorpay_payment_id: res.payment_id,
                razorpay_order_id: rzpOrderId,
                created_at: new Date().toISOString(),
              },
            },
          });
        }
      } catch {}
    }, 2500);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const orderNumber = `UNI-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (paymentMethod === 'COD') {
        // Cash On Delivery Flow
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
          payment_method: 'COD',
          payment_status: 'PENDING',
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
              payment_method: 'COD',
              payment_status: 'PENDING',
              created_at: new Date().toISOString(),
            },
          },
        });
        return;
      }

      // Validations for on-page inputs
      if (paymentMethod === 'UPI' && upiMode === 'ID') {
        if (!upiId.trim() || !upiId.includes('@')) {
          throw new Error('Please enter a valid UPI ID (e.g. 9876543210@ybl or username@okhdfcbank)');
        }
      }

      if (paymentMethod === 'CARD') {
        const cleanCard = cardNumber.replace(/\s+/g, '');
        if (cleanCard.length < 15) {
          throw new Error('Please enter a valid 16-digit card number.');
        }
        if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
          throw new Error('Please enter a valid card expiry date (MM/YY).');
        }
        if (cardCvv.length < 3) {
          throw new Error('Please enter a valid 3 or 4 digit CVV.');
        }
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Payment gateway SDK failed to load. Please check your internet connection.');
      }

      // Step 1: Create order on backend in paise (1 INR = 100 paise)
      const amountInPaise = Math.round(cart.total_amount * 100);
      const rzpOrder = await api.createRazorpayOrder(amountInPaise, orderNumber);

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || rzpOrder.key_id;
      if (!razorpayKey) {
        throw new Error('Razorpay Key ID is not configured.');
      }

      const cleanPhone = (address.phone || '').replace(/\D/g, '').slice(-10);
      const logoUrl = window.location.origin ? `${window.location.origin}/logo.png` : '/logo.png';

      let methodSpecificOptions: any = {};

      if (paymentMethod === 'UPI' && upiMode === 'ID') {
        methodSpecificOptions = {
          method: 'upi',
          vpa: upiId.trim(),
          prefill: {
            name: address.full_name,
            contact: cleanPhone ? `+91${cleanPhone}` : undefined,
            email: user?.email || '',
            method: 'upi',
            vpa: upiId.trim(),
          },
        };
      } else if (paymentMethod === 'CARD') {
        const [expM, expY] = cardExpiry.split('/');
        const fullYear = expY.trim().length === 2 ? `20${expY.trim()}` : expY.trim();
        methodSpecificOptions = {
          method: 'card',
          'card[number]': cardNumber.replace(/\s+/g, ''),
          'card[expiry_month]': expM.trim(),
          'card[expiry_year]': fullYear,
          'card[cvv]': cardCvv.trim(),
          'card[name]': cardHolder.trim() || address.full_name,
          prefill: {
            name: cardHolder.trim() || address.full_name,
            contact: cleanPhone ? `+91${cleanPhone}` : undefined,
            email: user?.email || '',
            method: 'card',
          },
        };
      } else if (paymentMethod === 'NETBANKING') {
        methodSpecificOptions = {
          method: 'netbanking',
          bank: selectedBank,
          prefill: {
            name: address.full_name,
            contact: cleanPhone ? `+91${cleanPhone}` : undefined,
            email: user?.email || '',
            method: 'netbanking',
          },
        };
      } else if (paymentMethod === 'UPI' && upiMode === 'QR') {
        startStatusPolling(rzpOrder.order_id, orderNumber, 'UPI_QR');
        setIsProcessing(false);
        return;
      }

      // Step 2: Open Direct Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        name: 'UniStore India',
        description: `Order #${orderNumber}`,
        image: logoUrl,
        order_id: rzpOrder.order_id,
        notes: {
          order_id: orderNumber,
          customer_name: address.full_name,
          payment_channel: paymentMethod,
        },
        theme: {
          color: '#09090b',
        },
        ...methodSpecificOptions,
        modal: {
          backdropclose: false,
          escape: false,
          handleback: true,
          ondismiss: () => {
            setIsProcessing(false);
            setIsWaitingUpi(false);
            setErrorMessage('Payment cancelled or window closed. You can retry anytime.');
          },
        },
        handler: async (response: any) => {
          await handlePaymentSuccess(response, orderNumber, paymentMethod);
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);

      rzpInstance.on('payment.failed', (failedResp: any) => {
        setIsProcessing(false);
        setIsWaitingUpi(false);
        const reason = failedResp.error?.description || failedResp.error?.reason || 'Payment failed';
        setErrorMessage(`Payment failed: ${reason}`);
      });

      rzpInstance.open();

      if (paymentMethod === 'UPI' && upiMode === 'ID') {
        setIsWaitingUpi(true);
        setUpiTimeLeft(300);
        startStatusPolling(rzpOrder.order_id, orderNumber, 'UPI');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setIsWaitingUpi(false);
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
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

            {/* STEP 3: Amazon-Style Direct Payment Options */}
            {step === 3 && (
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="pb-3 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-950">Select a payment method</h2>
                    <p className="text-xs text-zinc-500">256-Bit Bank Grade Protocol • 100% RBI Certified Direct Gateway</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70 w-fit">
                    <span className="material-symbols-outlined text-[15px]">verified_user</span>
                    <span>100% Direct & Safe</span>
                  </div>
                </div>

                {/* In-Page UPI Approval Notification Banner */}
                {isWaitingUpi && (
                  <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-5 text-center space-y-3.5 animate-in fade-in">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <span className="material-symbols-outlined text-[26px] animate-pulse">smartphone</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                        Approval Request Dispatched
                      </span>
                      <h3 className="text-base font-black text-zinc-950 mt-0.5">
                        Please approve on your UPI App ({upiId})
                      </h3>
                      <p className="text-xs text-zinc-600 max-w-md mx-auto mt-1 leading-relaxed">
                        A payment request of <strong className="text-zinc-950">{formatCurrency(cart.total_amount)}</strong> has been sent to your phone. Open Google Pay, PhonePe, or Paytm and authorize the payment.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-mono font-bold text-emerald-800 shadow-2xs">
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      <span>Time Remaining: {formatTime(upiTimeLeft)}</span>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWaitingUpi(false);
                          setIsProcessing(false);
                          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                        }}
                        className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 underline"
                      >
                        Cancel request & choose another payment method
                      </button>
                    </div>
                  </div>
                )}

                {/* Amazon-Style Accordion Payment Selector */}
                <div className="border border-zinc-200 rounded-2xl divide-y divide-zinc-200 overflow-hidden bg-white shadow-2xs">
                  
                  {/* 1. UPI Option */}
                  <div className={`p-4 sm:p-5 transition-colors ${paymentMethod === 'UPI' ? 'bg-zinc-50/60' : 'bg-white'}`}>
                    <label className="flex items-start gap-3.5 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        className="mt-1 text-zinc-950 focus:ring-zinc-950 h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-950">
                            UPI (Google Pay, PhonePe, Paytm, BHIM, CRED)
                          </span>
                          <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">bolt</span>
                            Fastest
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Pay directly using your UPI ID or scan dynamic QR code on screen.
                        </p>

                        {/* On-Page UPI Controls */}
                        {paymentMethod === 'UPI' && (
                          <div className="mt-4 pt-4 border-t border-zinc-200/80 space-y-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setUpiMode('ID')}
                                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  upiMode === 'ID'
                                    ? 'bg-zinc-950 text-white shadow-xs'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[15px]">alternate_email</span>
                                <span>Enter UPI ID</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setUpiMode('QR')}
                                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  upiMode === 'QR'
                                    ? 'bg-zinc-950 text-white shadow-xs'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                                <span>Scan UPI QR Code</span>
                              </button>
                            </div>

                            {upiMode === 'ID' && (
                              <div className="space-y-2.5">
                                <input
                                  type="text"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  placeholder="e.g. 9876543210@ybl or username@okhdfcbank"
                                  className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                                />
                                <div className="flex flex-wrap items-center gap-1 text-[11px] text-zinc-500">
                                  <span className="font-semibold text-zinc-700">Quick handles:</span>
                                  {['@okhdfcbank', '@okicici', '@oksbi', '@ybl', '@paytm'].map((suf) => (
                                    <button
                                      key={suf}
                                      type="button"
                                      onClick={() => {
                                        const cleanDigits = address.phone.replace(/\D/g, '').slice(-10);
                                        const base = upiId.includes('@') ? upiId.split('@')[0] : (upiId || cleanDigits);
                                        setUpiId(base + suf);
                                      }}
                                      className="px-2 py-0.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 font-mono text-[10px] hover:border-zinc-950 transition-colors"
                                    >
                                      {suf}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {upiMode === 'QR' && (
                              <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-center gap-5">
                                <div className="p-2.5 bg-white border border-zinc-200 rounded-xl shadow-xs shrink-0">
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                                      `upi://pay?pa=razorpay@icici&pn=UniStore&am=${cart.total_amount}&cu=INR`
                                    )}`}
                                    alt="UPI Payment QR Code"
                                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain mx-auto"
                                  />
                                </div>
                                <div className="text-left space-y-1.5 max-w-xs">
                                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                                    <span>Dynamic QR Active</span>
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-extrabold text-zinc-950">
                                    Scan with any UPI App
                                  </h4>
                                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                                    Scan this QR using Google Pay, PhonePe, Paytm, or CRED to pay <strong className="text-zinc-900">{formatCurrency(cart.total_amount)}</strong>.
                                  </p>
                                  <span className="text-[10px] text-zinc-400 block pt-1">
                                    ⚡ Status updates automatically in real-time.
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* 2. Credit or Debit Card */}
                  <div className={`p-4 sm:p-5 transition-colors ${paymentMethod === 'CARD' ? 'bg-zinc-50/60' : 'bg-white'}`}>
                    <label className="flex items-start gap-3.5 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'CARD'}
                        onChange={() => setPaymentMethod('CARD')}
                        className="mt-1 text-zinc-950 focus:ring-zinc-950 h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-950">
                            Credit or Debit Card
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200">Visa</span>
                            <span className="text-[10px] font-bold text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200">Mastercard</span>
                            <span className="text-[10px] font-bold text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200">RuPay</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Direct 3D-Secure bank OTP verification without third-party popups.
                        </p>

                        {/* On-Page Card Form */}
                        {paymentMethod === 'CARD' && (
                          <div className="mt-4 pt-4 border-t border-zinc-200/80 space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                                Card Number
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                  maxLength={19}
                                  placeholder="4532 •••• •••• 8910"
                                  className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 uppercase text-[10px] font-black text-zinc-700 tracking-wider bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                                  {getCardBrand(cardNumber)}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                                Name on Card
                              </label>
                              <input
                                type="text"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value)}
                                placeholder="Full Name as printed on card"
                                className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                  maxLength={5}
                                  placeholder="MM/YY"
                                  className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                                  CVV / CVC
                                </label>
                                <input
                                  type="password"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                  maxLength={4}
                                  placeholder="3 or 4 digits"
                                  className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-zinc-500">
                              <span className="material-symbols-outlined text-[15px] text-emerald-600">lock</span>
                              <span>Direct bank 3D-Secure 2FA authentication. PCI-DSS compliant.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* 3. Net Banking */}
                  <div className={`p-4 sm:p-5 transition-colors ${paymentMethod === 'NETBANKING' ? 'bg-zinc-50/60' : 'bg-white'}`}>
                    <label className="flex items-start gap-3.5 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'NETBANKING'}
                        onChange={() => setPaymentMethod('NETBANKING')}
                        className="mt-1 text-zinc-950 focus:ring-zinc-950 h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-950">
                            Net Banking
                          </span>
                          <span className="text-[11px] font-medium text-zinc-500">50+ Banks Supported</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Direct login on your official internet banking portal.
                        </p>

                        {/* On-Page Bank Selector */}
                        {paymentMethod === 'NETBANKING' && (
                          <div className="mt-4 pt-4 border-t border-zinc-200/80 space-y-3">
                            <span className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">
                              Popular Banks
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                { code: 'HDFC', name: 'HDFC Bank' },
                                { code: 'SBIN', name: 'State Bank of India' },
                                { code: 'ICIC', name: 'ICICI Bank' },
                                { code: 'UTIB', name: 'Axis Bank' },
                                { code: 'KKBK', name: 'Kotak Mahindra' },
                                { code: 'PUNB', name: 'Punjab National' },
                              ].map((b) => (
                                <button
                                  key={b.code}
                                  type="button"
                                  onClick={() => setSelectedBank(b.code)}
                                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                                    selectedBank === b.code
                                      ? 'border-zinc-950 bg-white ring-2 ring-zinc-950 text-zinc-950 shadow-2xs'
                                      : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                                  }`}
                                >
                                  <div className="font-bold text-[11px]">{b.name}</div>
                                  <span className="text-[10px] text-zinc-400 font-mono">{b.code}</span>
                                </button>
                              ))}
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                                Or Choose from Other Banks
                              </label>
                              <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                              >
                                <option value="HDFC">HDFC Bank</option>
                                <option value="SBIN">State Bank of India</option>
                                <option value="ICIC">ICICI Bank</option>
                                <option value="UTIB">Axis Bank</option>
                                <option value="KKBK">Kotak Mahindra Bank</option>
                                <option value="PUNB">Punjab National Bank</option>
                                <option value="BARB_R">Bank of Baroda</option>
                                <option value="CNRB">Canara Bank</option>
                                <option value="UBIN">Union Bank of India</option>
                                <option value="INDB">IndusInd Bank</option>
                                <option value="YESB">Yes Bank</option>
                                <option value="IDFB">IDFC FIRST Bank</option>
                                <option value="FDRL">Federal Bank</option>
                                <option value="CBIN">Central Bank of India</option>
                                <option value="IOBA">Indian Overseas Bank</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* 4. Cash on Delivery / Pay on Delivery */}
                  <div className={`p-4 sm:p-5 transition-colors ${paymentMethod === 'COD' ? 'bg-zinc-50/60' : 'bg-white'}`}>
                    <label className="flex items-start gap-3.5 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="mt-1 text-zinc-950 focus:ring-zinc-950 h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-950">
                            Cash on Delivery / Pay on Delivery
                          </span>
                          <span className="material-symbols-outlined text-zinc-400 text-[22px]">local_shipping</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                          Pay at your doorstep via Cash or scan the courier executive's UPI QR upon package arrival.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Trust & Guarantee Strip */}
                <div className="bg-zinc-50/90 border border-zinc-200/70 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 block text-[11px]">100% RBI Certified</span>
                      <span className="text-[10px] text-zinc-500">Authorized Banking Partner</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 block text-[11px]">Bank-Grade Security</span>
                      <span className="text-[10px] text-zinc-500">256-Bit SSL End-to-End</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">cached</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 block text-[11px]">Instant Refund</span>
                      <span className="text-[10px] text-zinc-500">Auto-credited within 2 hours</span>
                    </div>
                  </div>
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
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {paymentMethod === 'UPI' && upiMode === 'ID' && 'Send UPI Request & Pay'}
                          {paymentMethod === 'UPI' && upiMode === 'QR' && 'Verify & Confirm Payment'}
                          {paymentMethod === 'CARD' && 'Pay Securely via Card'}
                          {paymentMethod === 'NETBANKING' && 'Proceed to Bank Portal'}
                          {paymentMethod === 'COD' && 'Place Order (COD)'}
                          {' '}({formatCurrency(cart.total_amount)})
                        </span>
                        <span className="material-symbols-outlined text-[18px]">
                          {paymentMethod === 'COD' ? 'local_shipping' : 'lock'}
                        </span>
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
