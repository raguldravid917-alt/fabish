import React, { createContext } from 'react';
import { useCategories } from '../hooks/useCategories';

export const CategoryContext = createContext();

export { useCategories };

export const CategoryProvider = ({ children }) => {
  const value = useCategories();
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};
