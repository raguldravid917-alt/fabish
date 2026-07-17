/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export const WishlistContext = createContext();


export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // Track which product IDs are currently being toggled (for per-item loading state)
  const [togglingIds, setTogglingIds] = useState(new Set());

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getToken = () => {
    const t = localStorage.getItem('token');
    return t && t !== 'undefined' && t !== 'null' ? t : null;
  };

  // ── Fetch wishlist ─────────────────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) {
      try {
        const localData = localStorage.getItem('guest_wishlistItems');
        setWishlistItems(localData ? JSON.parse(localData) : []);
      } catch {
        setWishlistItems([]);
      }
      return;
    }

    setLoading(true);
    try {
      const result = await api.get('/wishlist');
      if (result.success && result.data) {
        setWishlistItems(result.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Sync guest wishlist items into DB after login ──────────────────────────
  const syncGuestWishlistAfterLogin = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const localData = localStorage.getItem('guest_wishlistItems');
      if (!localData) return;
      const guestItems = JSON.parse(localData);
      if (!guestItems || guestItems.length === 0) return;

      // Merge each guest item into the DB wishlist via toggle (add only if not present)
      const dbResult = await api.get('/wishlist');
      const dbProducts = dbResult?.data?.products || [];
      const dbIds = new Set(dbProducts.map((p) => (p._id || p).toString()));

      for (const item of guestItems) {
        const itemId = (item._id || item).toString();
        if (!dbIds.has(itemId)) {
          await api.post('/wishlist/toggle', { productId: itemId });
        }
      }

      // Clear guest list after sync
      localStorage.removeItem('guest_wishlistItems');
      // Refresh from DB
      await fetchWishlist();
    } catch (error) {
      console.error('Error syncing guest wishlist after login:', error);
    }
  }, [fetchWishlist]);

  // ── Listen for auth change events (fired by AuthContext) ───────────────────
  useEffect(() => {
    // Initial wishlist load (called inside a callback to satisfy linting rules)
    const initWishlist = () => fetchWishlist();
    initWishlist();

    const handleAuthChange = (e) => {
      const { type } = e.detail || {};
      if (type === 'login') {
        // Sync guest items then fetch fresh DB wishlist
        syncGuestWishlistAfterLogin();
      } else {
        // Logout — load from localStorage (will be empty or new guest data)
        fetchWishlist();
      }
    };

    const handleStorageChange = (e) => {
      // Only react to token changes in other tabs
      if (e.key === 'token') {
        fetchWishlist();
      }
    };

    window.addEventListener('wishlist-auth-change', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('wishlist-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchWishlist, syncGuestWishlistAfterLogin]);

  // ── Toggle wishlist ────────────────────────────────────────────────────────
  const toggleWishlist = useCallback(async (product) => {
    const productId = product._id || product;
    const token = getToken();

    if (!token) {
      // Guest: toggle in localStorage
      setWishlistItems((prevItems) => {
        const isExist = prevItems.some((x) => (x._id || x).toString() === productId.toString());
        const updated = isExist
          ? prevItems.filter((x) => (x._id || x).toString() !== productId.toString())
          : [...prevItems, product];
        try {
          localStorage.setItem('guest_wishlistItems', JSON.stringify(updated));
        } catch (e) { /* eslint-disable-line no-unused-vars */ // localStorage write failed — ignore
        }
        return updated;
      });
      return;
    }

    // Mark as toggling
    setTogglingIds((prev) => new Set([...prev, productId.toString()]));
    try {
      const result = await api.post('/wishlist/toggle', { productId });
      if (result.success && result.data) {
        setWishlistItems(result.data.products || []);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId.toString());
        return next;
      });
    }
  }, []);

  // ── isInWishlist ───────────────────────────────────────────────────────────
  const isInWishlist = useCallback((id) => {
    if (!id) return false;
    const idStr = id.toString();
    return wishlistItems.some((x) => {
      if (!x) return false;
      if (typeof x === 'string') return x === idStr;
      const itemId = x._id || x;
      return itemId && itemId.toString() === idStr;
    });
  }, [wishlistItems]);

  // ── isToggling ─────────────────────────────────────────────────────────────
  const isToggling = useCallback((id) => {
    if (!id) return false;
    return togglingIds.has(id.toString());
  }, [togglingIds]);

  // ── removeFromWishlist ─────────────────────────────────────────────────────
  const removeFromWishlist = useCallback(async (productId) => {
    if (!productId) return false;
    const idStr = productId.toString();
    const token = getToken();

    if (!token) {
      setWishlistItems((prevItems) => {
        const updated = prevItems.filter((x) => {
          if (!x) return false;
          if (typeof x === 'string') return x !== idStr;
          const itemId = x._id || x;
          return itemId && itemId.toString() !== idStr;
        });
        try {
          localStorage.setItem('guest_wishlistItems', JSON.stringify(updated));
        } catch (e) { /* eslint-disable-line no-unused-vars */ // localStorage write failed — ignore
        }
        return updated;
      });
      return true;
    }

    const exists = wishlistItems.some((x) => {
      if (!x) return false;
      if (typeof x === 'string') return x === idStr;
      const itemId = x._id || x;
      return itemId && itemId.toString() === idStr;
    });

    if (!exists) return false;

    setTogglingIds((prev) => new Set([...prev, idStr]));
    try {
      const result = await api.post('/wishlist/toggle', { productId: idStr });
      if (result.success && result.data) {
        setWishlistItems(result.data.products || []);
      }
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(idStr);
        return next;
      });
    }
  }, [wishlistItems]);

  // ── clearWishlist ──────────────────────────────────────────────────────────
  const clearWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setWishlistItems([]);
      localStorage.removeItem('guest_wishlistItems');
      return;
    }

    try {
      const result = await api.delete('/wishlist');
      if (result.success) {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        isToggling,
        clearWishlist,
        syncGuestWishlistAfterLogin,
        fetchWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};