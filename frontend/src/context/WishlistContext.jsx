import React, { createContext } from 'react';
import { useWishlist } from '../hooks/useWishlist';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const value = useWishlist();
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};