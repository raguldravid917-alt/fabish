import React, { useMemo } from 'react';
import { TrendingUp, Award, BarChart3, AlertCircle } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminAnalytics = ({ products = [], orders = [] }) => {
  useDocumentTitle('Admin - Analytics');
  const analytics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => o.isPaid ? sum + o.totalPrice : sum, 0);
    const averageOrder = orders.length ? totalRevenue / orders.length : 0;
    
    // Sort products by ratings
    const highlyRated = [...products].sort((a,b) => b.ratings - a.ratings).slice(0, 4);

    return {
      totalRevenue,
      averageOrder,
      highlyRated
    };
  }, [products, orders]);

  return (
    <div className="space-y-6 text-left select-none animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-black uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#729855]" /> Business Analytics Hub
        </h3>
        <p className="text-xs text-gray-400 mt-1">Real-time performance trackers, product margins and customer averages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#eae8d8] p-6 shadow-sm">
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400 block">Average Order Value</span>
          <h3 className="text-2xl font-bold text-black mt-2">{formatPrice(analytics.averageOrder)}</h3>
          <p className="text-[11px] text-gray-500 mt-2">Calculated over {orders.length} total orders</p>
        </div>

        <div className="bg-white border border-[#eae8d8] p-6 shadow-sm">
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400 block">Top Performer item</span>
          <h3 className="text-sm font-bold text-black mt-2 uppercase tracking-wide truncate">{analytics.highlyRated[0]?.title || 'N/A'}</h3>
          <p className="text-[11px] text-[#729855] font-semibold mt-2">Rating: {analytics.highlyRated[0]?.ratings?.toFixed(1) || '0.0'} ★</p>
        </div>

        <div className="bg-white border border-[#eae8d8] p-6 shadow-sm">
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400 block">Stripe Transaction fee</span>
          <h3 className="text-2xl font-bold text-black mt-2">{formatPrice(analytics.totalRevenue * 0.029)}</h3>
          <p className="text-[11px] text-gray-500 mt-2">Based on standard 2.9% default gateway fee</p>
        </div>
      </div>

      {/* Highly Rated Catalog table */}
      <div className="bg-white border border-[#eae8d8] p-6 shadow-sm">
        <h4 className="font-heading font-bold text-xs text-black uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#729855]" /> Top Rated Catalog Items
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae8d8]/40">
              {analytics.highlyRated.map(p => (
                <tr key={p._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                  <td className="p-4 font-semibold text-black">{p.title}</td>
                  <td className="p-4 capitalize text-gray-500">{typeof p.category === 'object' ? p.category?.name : (p.category || 'Uncategorized')}</td>
                  <td className="p-4 font-bold text-yellow-500">{p.ratings.toFixed(1)} ★</td>
                  <td className="p-4 font-semibold text-black">{formatPrice(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
