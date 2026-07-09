import React, { useState, useEffect } from 'react';
import Loader from '../../components/ui/Loader';
import { Plus, Trash2, Tag, Calendar, Percent } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminCoupons = () => {
  useDocumentTitle('Admin - Coupons');
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      if (res.success) {
        setCoupons(res.data || []);
      } else {
        setError(res.message || 'Failed to load coupons');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.success) {
        showToast('Coupon code deleted successfully!', 'success');
        fetchCoupons();
      } else {
        showToast(res.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim() || !discountPercentage || !expiryDate) {
      showToast('Please fill in all coupon parameters', 'error');
      return;
    }

    setIsSubmitLoading(true);
    try {
      const res = await api.post('/coupons', {
        code: code.trim().toUpperCase(),
        discountPercentage: Number(discountPercentage),
        expiryDate: new Date(expiryDate).toISOString()
      });
      setIsSubmitLoading(false);

      if (res.success) {
        showToast('Coupon generated successfully!', 'success');
        setCode('');
        setDiscountPercentage('');
        setExpiryDate('');
        fetchCoupons();
      } else {
        setError(res.message || 'Failed to create coupon');
      }
    } catch (err) {
      setIsSubmitLoading(false);
      setError('Connection failed. Code may already exist.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 select-none animate-fade-in">
      
      {/* List Panel */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-base font-bold text-black uppercase tracking-wider">Active Promotional Coupons</h3>
        {loading ? (
          <Loader />
        ) : (
          <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
                <tr>
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae8d8]/40">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#729855]">{c.code}</td>
                    <td className="p-4 font-semibold text-black">{c.discountPercentage}% OFF</td>
                    <td className="p-4 text-gray-500 font-mono">{new Date(c.expiryDate).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center italic text-gray-400">No active promotional codes in the system.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation form */}
      <div>
        <div className="bg-[#F9F9EB] border border-[#eae8d8] p-6 shadow-sm">
          <h3 className="font-heading font-bold text-xs text-black uppercase tracking-widest mb-4 border-b border-[#eae8d8] pb-2 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-[#729855]" /> Create Coupon
          </h3>

          {error && <ErrorAlert type="error" message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Promo Code</label>
              <input
                type="text"
                required
                placeholder="SAVE40"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full border border-[#eae8d8] bg-white px-3 py-2 font-mono font-bold text-sm text-black focus:outline-none focus:border-[#729855] rounded-none uppercase"
              />
            </div>

            <div>
              <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Discount (%)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  placeholder="20"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="w-full border border-[#eae8d8] bg-white pl-3 pr-8 py-2 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none font-sans"
                />
                <Percent className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Expiry Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border border-[#eae8d8] bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitLoading}
              className="w-full bg-[#2f3e10] text-white hover:bg-black py-3 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
            >
              {isSubmitLoading ? <Loader size="small" /> : (
                <>Generate Code <Plus className="w-3.5 h-3.5" /></>
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default AdminCoupons;
