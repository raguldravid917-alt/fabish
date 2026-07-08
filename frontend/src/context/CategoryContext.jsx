import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { categoryService } from '../api/categoryService';

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      // Handle direct array, data wrapper, or success wrapper formats
      if (Array.isArray(res)) {
        setCategories(res);
      } else if (res && Array.isArray(res.data)) {
        setCategories(res.data);
      } else if (res && res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  return (
    <CategoryContext.Provider value={{ categories, loading, refreshCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
