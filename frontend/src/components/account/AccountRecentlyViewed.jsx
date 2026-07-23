import React from 'react';
import { Clock, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';
import { useRecentlyViewedQuery } from '../../hooks/queries/useRecentlyViewedQuery';
import { recentlyViewedService } from '../../api/recentlyViewedService';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';

const AccountRecentlyViewed = ({ products: propProducts, onQuickView, onClearHistory }) => {
  const { data: serverProducts = [], isLoading, isError, refetch } = useRecentlyViewedQuery();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Combine server data + local storage fallback, ensuring array safety
  let rawCandidates = [];
  if (Array.isArray(serverProducts) && serverProducts.length > 0) {
    rawCandidates = serverProducts;
  } else if (Array.isArray(propProducts) && propProducts.length > 0) {
    rawCandidates = propProducts;
  } else {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) rawCandidates = parsed;
      }
    } catch (e) {
      rawCandidates = [];
    }
  }

  // Strictly filter candidates so ONLY valid Product objects are rendered
  const validProducts = rawCandidates.filter(
    (item) => item && typeof item === 'object' && item._id && (item.title || item.name)
  );

  const handleClear = async () => {
    try {
      await recentlyViewedService.clearHistory();
    } catch (e) {
      console.warn('Backend clear history unavailable, clearing local storage.');
    }
    try {
      localStorage.removeItem('recentlyViewed');
    } catch (e) {}

    if (onClearHistory) onClearHistory();
    queryClient.invalidateQueries({ queryKey: ['recentlyViewed'] });
    showToast('Browsing history cleared!', 'success');
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Header & Clear Trigger */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-[#1C2415]">
            Recently Viewed Products ({validProducts.length})
          </h2>
          <p className="text-xs text-gray-500 font-body">Your recent browsing history across Fabish Organic Cosmetics</p>
        </div>

        {validProducts.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="h-9 px-4 rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-500 hover:text-white text-rose-600 text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Browsing History
          </button>
        )}
      </div>

      {/* Main Grid or Status State */}
      {isLoading ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E6D9]">
          <RefreshCw className="w-8 h-8 text-[#729855] animate-spin mx-auto mb-2" />
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-widest">
            Loading Browsing History...
          </span>
        </div>
      ) : isError && validProducts.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-3xl border border-[#E8E6D9] p-8 space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-heading font-bold text-base text-[#1C2415]">Unable to Load Browsing History</h3>
          <p className="text-xs text-gray-500 font-body max-w-sm mx-auto">
            We couldn't retrieve your recently viewed items right now.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 rounded-full bg-[#729855] text-white text-xs font-heading font-bold uppercase cursor-pointer border-none shadow-xs"
          >
            Try Again
          </button>
        </div>
      ) : validProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E6D9] p-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-[#1C2415] mb-1">
            No Recently Viewed Products
          </h3>
          <p className="text-xs text-gray-500 font-body max-w-sm mx-auto mb-6">
            You haven't viewed any products yet. Discover our organic skincare catalog!
          </p>
          <Link
            to="/collections/all"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-widest transition-all no-underline shadow-xs"
          >
            Explore Organic Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {validProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default AccountRecentlyViewed;
