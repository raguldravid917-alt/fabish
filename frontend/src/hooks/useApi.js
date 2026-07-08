/**
 * Generic data-fetching hook.
 * Provides { data, loading, error, refetch } for any async operation.
 *
 * @param {Function} fetchFn - Async function that returns { success, data, message }
 * @param {Array} deps - Dependency array for auto-refetch
 * @param {object} options
 * @param {boolean} [options.immediate=true] - Whether to fetch on mount
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export const useApi = (fetchFn, deps = [], { immediate = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    const result = await fetchFn(...args);

    // Prevent state update on unmounted component
    if (!mountedRef.current) return result;

    if (result.success) {
      setData(result.data);
    } else {
      setError(result.message);
    }

    setLoading(false);
    return result;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) {
      execute();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [execute, immediate]);

  const refetch = useCallback((...args) => execute(...args), [execute]);

  return { data, loading, error, refetch, setData };
};
