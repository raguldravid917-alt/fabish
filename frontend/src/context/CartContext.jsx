import React, { createContext } from 'react';
import { useCart } from '../hooks/useCart';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const value = useCart();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};