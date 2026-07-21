import { useState, useEffect, useCallback } from 'react';
import { footerPageService } from '../api/footerPageService';

/**
 * useFooterPage — fetches a single CMS footer page by slug.
 * Provides loading, error, 404, and inactive states.
 */
export const useFooterPage = (slug) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [inactive, setInactive] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchPage = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);
    setNotFound(false);
    setInactive(false);

    try {
      const res = await footerPageService.getPageBySlug(slug);

      if (res.success && res.data) {
        setPage(res.data);
      } else if (res.status === 404 || res.data?.code === 'NOT_FOUND') {
        setNotFound(true);
      } else if (res.status === 403 || res.data?.code === 'PAGE_INACTIVE') {
        setInactive(true);
        setPage(res.data || null);
      } else {
        // API returned success:false for other reasons
        if (res.status === 404) {
          setNotFound(true);
        } else if (res.status === 403) {
          setInactive(true);
        } else {
          setError(res.message || 'Failed to load page');
        }
      }
    } catch (err) {
      setError('Connection error. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  }, [slug, retryCount]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const retry = () => setRetryCount((c) => c + 1);

  return { page, loading, error, notFound, inactive, retry };
};
