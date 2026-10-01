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
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string | undefined>(() => {
    return localStorage.getItem('unistore_coupon') || undefined;
  });
  const [discountPercent, setDiscountPercent] = useState<number>(() => {
    return couponCode ? 10 : 0;
  });

  useEffect(() => {
    try {
      localStorage.setItem('unistore_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
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
    setDiscountPercent(0);
    localStorage.removeItem('unistore_cart');
    localStorage.removeItem('unistore_coupon');
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME10' || cleanCode === 'UNISTORE10') {
      setCouponCode(cleanCode);
      setDiscountPercent(10);
      localStorage.setItem('unistore_coupon', cleanCode);
      return { success: true, message: 'Coupon applied! 10% discount added.' };
    }
    if (cleanCode === 'FESTIVE20') {
      setCouponCode(cleanCode);
      setDiscountPercent(20);
      localStorage.setItem('unistore_coupon', cleanCode);
      return { success: true, message: 'Coupon applied! 20% festive discount added.' };
    }
    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  const removeCoupon = () => {
    setCouponCode(undefined);
    setDiscountPercent(0);
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
