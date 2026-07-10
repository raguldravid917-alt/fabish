import React, { useState, useEffect } from 'react';
import Loader from '../../components/ui/Loader';
import { Plus, Trash2, Tag, Calendar, Percent, Edit } from 'lucide-react';
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
  const [editingId, setEditingId] = useState(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [maxDiscountCap, setMaxDiscountCap] = useState('');
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

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('Percentage');
    setDiscountValue('');
    setDiscountPercentage('');
    setExpiryDate('');
    setMinimumOrderAmount('');
    setUsageLimit('');
    setMaxDiscountCap('');
    setError('');
  };

  const handleEditClick = (coupon) => {
    setEditingId(coupon._id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType || 'Percentage');
    setDiscountValue(String(coupon.discountValue || ''));
    setDiscountPercentage(String(coupon.discountPercentage || ''));
    setExpiryDate(coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '');
    setMinimumOrderAmount(String(coupon.minimumOrderAmount || ''));
    setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : '');
    setMaxDiscountCap(coupon.maxDiscountCap ? String(coupon.maxDiscountCap) : '');
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const res = await api.put(`/coupons/${coupon._id}`, {
        isActive: !coupon.isActive
      });
      if (res.success) {
        showToast('Coupon status updated successfully!', 'success');
        fetchCoupons();
      } else {
        showToast(res.message || 'Status toggle failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
  };

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

    if (!code.trim() || !expiryDate) {
      showToast('Please fill in all required parameters', 'error');
      return;
    }

    setIsSubmitLoading(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: discountType === 'FreeShipping' ? 0 : Number(discountValue || discountPercentage || 0),
        discountPercentage: discountType === 'FreeShipping' ? 0 : Number(discountPercentage || discountValue || 0),
        expiryDate: new Date(expiryDate).toISOString(),
        minimumOrderAmount: Number(minimumOrderAmount) || 0,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        maxDiscountCap: maxDiscountCap ? Number(maxDiscountCap) : null,
      };
      
      const res = editingId
        ? await api.put(`/coupons/${editingId}`, payload)
        : await api.post('/coupons', payload);
      
      setIsSubmitLoading(false);

      if (res.success) {
        showToast(editingId ? 'Coupon updated successfully!' : 'Coupon generated successfully!', 'success');
        resetForm();
        fetchCoupons();
      } else {
        setError(res.message || 'Action failed');
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
                  <th className="p-4">Details</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae8d8]/40">
                {coupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();
                  const isLimitReached = c.usageLimit !== null && c.usageLimit !== undefined && c.usedCount >= c.usageLimit;
                  const displayDiscount = (() => {
                    if (c.discountType === 'Percentage') return `${c.discountPercentage || c.discountValue}% OFF`;
                    if (c.discountType === 'Fixed') return `Rs. ${c.discountValue} OFF`;
                    if (c.discountType === 'FreeShipping') return `FREE SHIPPING`;
                    return `${c.discountPercentage || c.discountValue}% OFF`;
                  })();

                  return (
                    <tr key={c._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#729855]">{c.code}</td>
                      <td className="p-4 font-semibold text-black">
                        {displayDiscount}
                        {c.discountType === 'Percentage' && c.maxDiscountCap && (
                          <div className="text-[10px] text-gray-500 font-normal">Cap: Rs. {c.maxDiscountCap}</div>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 space-y-0.5 select-text">
                        {c.minimumOrderAmount > 0 && (
                          <div>Min order: Rs. {c.minimumOrderAmount}</div>
                        )}
                        {c.usageLimit !== null && c.usageLimit !== undefined ? (
                          <div>Used: {c.usedCount} / {c.usageLimit}</div>
                        ) : (
                          <div>Used: {c.usedCount}</div>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 font-mono select-text">
                        {new Date(c.expiryDate).toLocaleDateString()}
                        {isExpired && <span className="text-red-500 text-[10px] block font-bold uppercase mt-0.5">Expired</span>}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          className={`px-2 py-1 text-[9px] font-heading font-bold uppercase tracking-wider border rounded-none cursor-pointer transition-all ${
                            c.isActive && !isExpired && !isLimitReached
                              ? 'bg-green-50 text-[#729855] border-green-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                              : 'bg-red-50 text-red-500 border-red-200 hover:bg-green-50 hover:text-[#729855] hover:border-green-200'
                          }`}
                        >
                          {c.isActive && !isExpired && !isLimitReached ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(c)}
                            className="p-2 border border-[#eae8d8] text-black hover:bg-black hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"
                            aria-label={`Edit coupon ${c.code}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="p-2 border border-red-200 text-red-500 hover:bg-red-50 hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"
                            aria-label={`Delete coupon ${c.code}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center italic text-gray-400">No active promotional codes in the system.</td>
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
          <h3 className="font-heading font-bold text-xs text-black uppercase tracking-widest mb-4 border-b border-[#eae8d8] pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#729855]" /> {editingId ? 'Edit Coupon' : 'Create Coupon'}
            </span>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 hover:text-black font-heading text-[10px] font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer"
              >
                Cancel
              </button>
            )}
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
              <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value);
                  if (e.target.value === 'FreeShipping') {
                    setDiscountPercentage('');
                    setDiscountValue('');
                    setMaxDiscountCap('');
                  }
                }}
                className="w-full border border-[#eae8d8] bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none font-sans"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (Rs)</option>
                <option value="FreeShipping">Free Shipping</option>
              </select>
            </div>
 
            {discountType === 'Percentage' && (
              <>
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
                      onChange={(e) => {
                        setDiscountPercentage(e.target.value);
                        setDiscountValue(e.target.value);
                      }}
                      className="w-full border border-[#eae8d8] bg-white pl-3 pr-8 py-2 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none font-sans"
                    />
                    <Percent className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>
 
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Max Discount Cap (Rs) - Optional</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={maxDiscountCap}
                    onChange={(e) => setMaxDiscountCap(e.target.value)}
                    className="w-full border border-[#eae8d8] bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none font-sans"
                  />
                </div>
              </>
            )}
 
            {discountType === 'Fixed' && (
              <div>
                <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Discount Value (Rs)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="150"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value);
                    setDiscountPercentage(e.target.value);
                  }}
                  className="w-full border border-[#eae8d8] bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none font-sans"
                />
              </div>
            )}
 
            <div>
              <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Min Purchase Amount (Rs)</label>
              <input
                type="number"
                min="0"
                placeholder="500"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(e.target.value)}
                className="w-full border border-[#eae8d8] bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none font-sans"
              />
            </div>
 
            <div>
              <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Usage Limit (Total) - Optional</label>
              <input
                type="number"
                min="1"
                placeholder="100"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full border border-[#eae8d8] bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none font-sans"
              />
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
                editingId ? <>Save Changes <Plus className="w-3.5 h-3.5" /></> : <>Generate Code <Plus className="w-3.5 h-3.5" /></>
              )}
            </button>
          </form>
        </div>
      </div>
 
    </div>
  );
};

export default AdminCoupons;
