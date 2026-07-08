import React, { useState, useEffect } from 'react';
import { Trash2, Star, Eye } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminReviews = () => {
  useDocumentTitle('Admin - Reviews');
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews');
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.success) {
        showToast('Review moderated and deleted successfully!', 'success');
        fetchReviews();
      } else {
        showToast(res.message || 'Moderation failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in text-left">
      <div>
        <h3 className="text-base font-bold text-black uppercase tracking-wider">Product Reviews & Moderation</h3>
        <p className="text-xs text-gray-400 mt-1">Review feedback posted by customers across the catalog</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm italic animate-pulse">Loading reviews ledger...</p>
      ) : (
        <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae8d8]/40">
              {reviews.map((rev) => (
                <tr key={rev._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                  <td className="p-4 font-semibold text-black">{rev.name || rev.user?.name || 'Verified Customer'}</td>
                  <td className="p-4 font-mono text-gray-500">{rev.product?.title || 'Catalog Product'}</td>
                  <td className="p-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-medium italic max-w-xs truncate">"{rev.comment}"</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(rev._id)}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center italic text-gray-400">No reviews found in moderation queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
