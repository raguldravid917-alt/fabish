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
      // Backend now consistently returns { success: true, data: [...] }
      // axios interceptor normalizes this to { success, data, message }
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      } else if (Array.isArray(res.data)) {
        // Fallback: data is an array even if success flag is absent
        setCategories(res.data);
      } else {
        // Handle transient errors (e.g., status 429, 500, or network down)
        if (res.status === 429 || res.status >= 500 || !res.success) {
          console.warn('Temporary API failure when fetching categories:', res.message || res);
          // Keep existing categories instead of clearing them out
        } else {
          console.warn('Unexpected categories response shape:', res);
          setCategories([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Keep existing categories in case of error
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
