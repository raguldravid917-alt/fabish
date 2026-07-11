import React, { createContext, useState, useEffect, useRef } from 'react';
import { api } from '../api/client'; // Imports your custom Axios api instance

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevToken = useRef(localStorage.getItem('token'));

  // Utility to map backend DB items to the flat structure expected by the existing UI views
  const mapBackendCartToFrontend = (backendCart) => {
    if (!backendCart || !backendCart.items) return [];
    return backendCart.items
      .map((item) => {
        if (!item.product) return null;
        return {
          ...item.product,
          qty: item.quantity,
        };
      })
      .filter(Boolean);
  };

  // Safe fetch helper that respects authorization tokens
  const fetchCart = async () => {
    let token = localStorage.getItem('token');
    if (token === 'undefined' || token === 'null') {
      token = null;
    }
    if (!token) {
      // Guest Mode: Load safe, isolated local guest items
      const localData = localStorage.getItem('guest_cartItems');
      setCartItems(localData ? JSON.parse(localData) : []);
      return;
    }

    setLoading(true);
    try {
      const result = await api.get('/cart'); // Uses your axios utility with auto-attached token and baseUrl
      if (result.success && result.data) {
        setCartItems(mapBackendCartToFrontend(result.data));
      }
    } catch (error) {
      console.error('Error fetching secure user cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Monitors the authentication status securely to trigger data loads and clear state on logout
  useEffect(() => {
    fetchCart();

    const handleStorageChange = () => {
      fetchCart();
    };

    window.addEventListener('storage', handleStorageChange);

    // Dynamic session change monitor
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== prevToken.current) {
        prevToken.current = currentToken;
        fetchCart();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const addToCart = async (product, qty = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Guest mode update
      setCartItems((prevItems) => {
        const existItem = prevItems.find((x) => x._id === product._id);
        const newQty = existItem
          ? Math.min(existItem.qty + qty, product.stock)
          : Math.min(qty, product.stock);
        const updated = existItem
          ? prevItems.map((x) => (x._id === product._id ? { ...x, qty: newQty } : x))
          : [...prevItems, { ...product, qty: newQty }];
        localStorage.setItem('guest_cartItems', JSON.stringify(updated));
        return updated;
      });
      return true;
    }

    try {
      const existItem = cartItems.find((x) => x._id === product._id);
      const currentQty = existItem ? existItem.qty : 0;
      const newQty = Math.min(currentQty + qty, product.stock);

      const result = await api.put('/cart', { productId: product._id, quantity: newQty });
      if (result.success && result.data) {
        setCartItems(mapBackendCartToFrontend(result.data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to database cart:', error);
      return false;
    }
  };

  const removeFromCart = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems((prevItems) => {
        const updated = prevItems.filter((x) => x._id !== id);
        localStorage.setItem('guest_cartItems', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const result = await api.delete(`/cart/${id}`);
      if (result.success && result.data) {
        setCartItems(mapBackendCartToFrontend(result.data));
      }
    } catch (error) {
      console.error('Error removing item from database cart:', error);
    }
  };

  const updateQty = async (id, qty) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems((prevItems) => {
        const updated = prevItems.map((x) =>
          x._id === id ? { ...x, qty: Math.max(1, Math.min(qty, x.stock)) } : x
        );
        localStorage.setItem('guest_cartItems', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const result = await api.put('/cart', { productId: id, quantity: qty });
      if (result.success && result.data) {
        setCartItems(mapBackendCartToFrontend(result.data));
      }
    } catch (error) {
      console.error('Error updating cart quantity in database:', error);
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems([]);
      localStorage.removeItem('guest_cartItems');
      return;
    }

    try {
      const result = await api.delete('/cart');
      if (result.success) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing database cart:', error);
    }
  };

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Dynamic coupon validation effect: checks coupon status & minimumOrderAmount whenever cart items or subtotal changes
  useEffect(() => {
    const savedCode = localStorage.getItem('appliedCouponCode');
    if (savedCode && cartItems.length > 0) {
      const currentItemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
      const validateAndApply = async () => {
        try {
          const res = await api.post('/coupons/apply', { code: savedCode, cartTotal: currentItemsPrice });
          if (res.success && res.data) {
            setAppliedCoupon(res.data);
          } else {
            // Remove coupon silently if subtotal falls below minimumOrderAmount or coupon is disabled
            setAppliedCoupon(null);
            localStorage.removeItem('appliedCouponCode');
          }
        } catch (err) {
          setAppliedCoupon(null);
          localStorage.removeItem('appliedCouponCode');
        }
      };
      validateAndApply();
    } else if (!savedCode || cartItems.length === 0) {
      setAppliedCoupon(null);
    }
  }, [cartItems]);

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      setCouponError('Please enter a coupon code.');
      return { success: false, message: 'Please enter a coupon code.' };
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const currentItemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
      const res = await api.post('/coupons/apply', { code: code.trim().toUpperCase(), cartTotal: currentItemsPrice });
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        localStorage.setItem('appliedCouponCode', res.data.code);
        setCouponLoading(false);
        return { success: true, message: 'Coupon applied successfully!', coupon: res.data };
      } else {
        const msg = res.message || 'Invalid coupon code.';
        setCouponError(msg);
        setCouponLoading(false);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.message || 'Failed to apply coupon.';
      setCouponError(msg);
      setCouponLoading(false);
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    localStorage.removeItem('appliedCouponCode');
  };

  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const discountAmount = (() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'Percentage') {
      const pctVal = appliedCoupon.discountPercentage !== undefined ? appliedCoupon.discountPercentage : appliedCoupon.discountValue;
      let pctDiscount = itemsPrice * ((pctVal || 0) / 100);
      if (appliedCoupon.maxDiscountCap) {
        pctDiscount = Math.min(pctDiscount, appliedCoupon.maxDiscountCap);
      }
      return pctDiscount;
    }
    if (appliedCoupon.discountType === 'Fixed') {
      return Math.min(appliedCoupon.discountValue || 0, itemsPrice);
    }
    return 0;
  })();

  const shippingPrice = (() => {
    if (itemsPrice === 0) return 0;
    if (appliedCoupon && appliedCoupon.discountType === 'FreeShipping') return 0;
    return itemsPrice > 2000 ? 0 : 150;
  })();

  const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        itemsCount,
        itemsPrice,
        shippingPrice,
        totalPrice,
        loading,
        appliedCoupon,
        discountAmount,
        couponError,
        couponLoading,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};