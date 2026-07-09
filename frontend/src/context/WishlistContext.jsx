import React, { createContext, useState, useEffect, useRef } from 'react';
import { api } from '../api/client'; // Imports your custom Axios api instance

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevToken = useRef(localStorage.getItem('token'));

  const fetchWishlist = async () => {
    let token = localStorage.getItem('token');
    if (token === 'undefined' || token === 'null') {
      token = null;
    }
    if (!token) {
      const localData = localStorage.getItem('guest_wishlistItems');
      setWishlistItems(localData ? JSON.parse(localData) : []);
      return;
    }

    setLoading(true);
    try {
      const result = await api.get('/wishlist');
      if (result.success && result.data) {
        setWishlistItems(result.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching secure user wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();

    const handleStorageChange = () => {
      fetchWishlist();
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== prevToken.current) {
        prevToken.current = currentToken;
        fetchWishlist();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const toggleWishlist = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setWishlistItems((prevItems) => {
        const isExist = prevItems.some((x) => x._id === product._id);
        const updated = isExist
          ? prevItems.filter((x) => x._id !== product._id)
          : [...prevItems, product];
        localStorage.setItem('guest_wishlistItems', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const result = await api.post('/wishlist/toggle', { productId: product._id });
      if (result.success && result.data) {
        setWishlistItems(result.data.products || []);
      }
    } catch (error) {
      console.error('Error toggling database wishlist:', error);
    }
  };

  const isInWishlist = (id) => {
    return wishlistItems.some((item) => item._id === id);
  };

  const clearWishlist = async () => {
    const token = localStorage.getItem('token');
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
      console.error('Error clearing database wishlist:', error);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};