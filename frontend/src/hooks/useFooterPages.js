import { useState, useEffect, useCallback } from 'react';
import { footerPageService } from '../api/footerPageService';

/**
 * useFooterPages — fetches all public footer pages for the storefront footer.
 * Includes in-module client-side TTL cache (5 minutes).
 */
const CACHE_KEY = '__footer_pages__';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let _cache = null;
let _cacheTimestamp = 0;

export const useFooterPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchPages = useCallback(async () => {
    // Serve from client-side cache if still fresh
    if (_cache && Date.now() - _cacheTimestamp < CACHE_TTL) {
      setPages(_cache);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await footerPageService.getPublicPages();
      if (res.success && Array.isArray(res.data)) {
        _cache = res.data;
        _cacheTimestamp = Date.now();
        setPages(res.data);
      } else {
        setError(res.message || 'Failed to load footer pages');
        setPages([]);
      }
    } catch (err) {
      setError('Connection error. Footer links unavailable.');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const retry = () => setRetryCount((c) => c + 1);

  return { pages, loading, error, retry };
};
