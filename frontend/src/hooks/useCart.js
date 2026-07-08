/**
 * Convenience hook for accessing CartContext.
 * Replaces `useContext(CartContext)` throughout the app.
 *
 * @returns {{ cartItems, addToCart, removeFromCart, updateQty, clearCart, itemsPrice, shippingPrice, totalPrice }}
 */
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
