import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, ProductVariant, CartItem, Cart } from '../types';
import { hapticFeedback } from '../utils/haptics';

interface CartContextType {
  cart: Cart;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('unistore_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => item && item.id && item.product && typeof item.price === 'number');
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string | undefined>(() => {
    return localStorage.getItem('unistore_coupon') || undefined;
  });
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>(() => {
    const saved = localStorage.getItem('unistore_coupon');
    return saved === 'FLAT500' ? 'FIXED' : 'PERCENTAGE';
  });
  const [discountValue, setDiscountValue] = useState<number>(() => {
    const saved = localStorage.getItem('unistore_coupon');
    if (saved === 'FLAT500') return 500;
    if (saved === 'FESTIVE20') return 20;
    if (saved === 'WELCOME10' || saved === 'UNISTORE10') return 10;
    return 0;
  });

  useEffect(() => {
    try {
      localStorage.setItem('unistore_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountType === 'FIXED'
    ? Math.min(discountValue, subtotal)
    : Math.round(subtotal * (discountValue / 100));
  const shippingFee = subtotal === 0 || (subtotal - discountAmount) >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  // Listed prices are inclusive of 18% GST (Indian retail standard)
  const taxAmount = Math.round((subtotal - discountAmount) * (0.18 / 1.18));
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const cart: Cart = {
    items,
    subtotal,
    discount_amount: discountAmount,
    coupon_code: couponCode,
    shipping_fee: shippingFee,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
  };

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    hapticFeedback.medium();
    setItems((prevItems) => {
      const price = variant ? variant.price : product.base_price;
      const itemId = variant ? `${product.id}-${variant.id}` : product.id;
      
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          total: (next[existingIndex].quantity + quantity) * price,
        };
        return next;
      }

      const newItem: CartItem = {
        id: itemId,
        product_id: product.id,
        variant_id: variant?.id,
        product,
        variant,
        quantity,
        price,
        total: price * quantity,
      };
      return [...prevItems, newItem];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    hapticFeedback.light();
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity, total: item.price * quantity }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    hapticFeedback.light();
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(undefined);
    setDiscountType('PERCENTAGE');
    setDiscountValue(0);
    localStorage.removeItem('unistore_cart');
    localStorage.removeItem('unistore_coupon');
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME10' || cleanCode === 'UNISTORE10') {
      if (subtotal < 999) {
        return { success: false, message: 'Minimum order value of ₹999 required for this coupon.' };
      }
      setCouponCode(cleanCode);
      setDiscountType('PERCENTAGE');
      setDiscountValue(10);
      localStorage.setItem('unistore_coupon', cleanCode);
      return { success: true, message: 'Coupon applied! 10% discount added.' };
    }
    if (cleanCode === 'FESTIVE20') {
      if (subtotal < 1999) {
        return { success: false, message: 'Minimum order value of ₹1,999 required for FESTIVE20.' };
      }
      setCouponCode(cleanCode);
      setDiscountType('PERCENTAGE');
      setDiscountValue(20);
      localStorage.setItem('unistore_coupon', cleanCode);
      return { success: true, message: 'Coupon applied! 20% festive discount added.' };
    }
    if (cleanCode === 'FLAT500') {
      if (subtotal < 2999) {
        return { success: false, message: 'Minimum order value of ₹2,999 required for FLAT500.' };
      }
      setCouponCode(cleanCode);
      setDiscountType('FIXED');
      setDiscountValue(500);
      localStorage.setItem('unistore_coupon', cleanCode);
      return { success: true, message: 'Coupon applied! Flat ₹500 discount added.' };
    }
    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  const removeCoupon = () => {
    setCouponCode(undefined);
    setDiscountType('PERCENTAGE');
    setDiscountValue(0);
    localStorage.removeItem('unistore_coupon');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
