import React, { useState } from 'react';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import GSTInvoice from '../invoice/GSTInvoice';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const AccountOrders = ({ orders = [], isLoading = false, onTrackOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Filter orders by search & status
  const filteredOrders = orders.filter((order) => {
    const orderId = (order._id || order.id || '').toLowerCase();
    const matchesSearch = !searchTerm || orderId.includes(searchTerm.toLowerCase());

    const currentStatus = order.orderStatus || (order.isDelivered ? 'Delivered' : 'Processing');

    let matchesStatus = true;
    if (statusFilter === 'PROCESSING') matchesStatus = currentStatus.toLowerCase().includes('process') || currentStatus.toLowerCase().includes('placed');
    else if (statusFilter === 'SHIPPED') matchesStatus = currentStatus.toLowerCase().includes('ship');
    else if (statusFilter === 'DELIVERED') matchesStatus = currentStatus.toLowerCase().includes('deliver');
    else if (statusFilter === 'CANCELLED') matchesStatus = currentStatus.toLowerCase().includes('cancel');

    return matchesSearch && matchesStatus;
  });

  const handleBuyAgain = async (orderItems) => {
    if (!orderItems || orderItems.length === 0) return;
    let addedCount = 0;
    for (const item of orderItems) {
      if (item.product || item._id || item.productId) {
        const prodPayload = typeof item.product === 'object' ? item.product : { _id: item.product || item._id, title: item.name, price: item.price, images: [item.image] };
        await addToCart(prodPayload, item.quantity || 1);
        addedCount += 1;
      }
    }
    showToast(`Added ${addedCount} item(s) back to your bag!`, 'success');
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Invoice Modal Overlay */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedOrderForInvoice(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF9F5] border border-[#E8E6D9] flex items-center justify-center text-[#1C2415] hover:bg-[#3A4D23] hover:text-white transition-all cursor-pointer"
            >
              &times;
            </button>
            <GSTInvoice order={selectedOrderForInvoice} onClose={() => setSelectedOrderForInvoice(null)} />
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-[#1C2415]">
            My Orders ({orders.length})
          </h2>
          <p className="text-xs text-gray-500 font-body">Track, reorder, or download GST invoices for your purchases</p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#E8E6D9] rounded-full text-xs font-body text-[#1C2415] outline-none focus:border-[#729855]"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#FAF9F5] p-1 rounded-full border border-[#E8E6D9]">
            {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-[10px] font-heading font-bold uppercase transition-all cursor-pointer border-none ${
                  statusFilter === st
                    ? 'bg-[#729855] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-[#3A4D23]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-8 h-8 text-[#729855] animate-spin mx-auto mb-2" />
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-widest">
            Loading Your Orders...
          </span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E6D9] p-8">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-[#1C2415] mb-1">
            No Orders Found
          </h3>
          <p className="text-xs text-gray-500 font-body max-w-sm mx-auto mb-6">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No orders match your search criteria. Try clearing the filter.'
              : 'You haven’t placed any orders yet. Discover our organic collection!'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/collections/all')}
            className="px-6 py-3 rounded-full bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-widest transition-all shadow-xs border-none cursor-pointer"
          >
            Explore Skincare Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const orderId = order._id || order.id || '';
            const shortId = orderId ? orderId.substring(orderId.length - 8).toUpperCase() : 'ORDER';
            const isExpanded = expandedOrderId === orderId;
            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'N/A';

            const status = order.orderStatus || (order.isDelivered ? 'Delivered' : 'Processing');
            const isDelivered = status === 'Delivered' || order.isDelivered;
            const isCancelled = status === 'Cancelled';
            const totalPrice = order.totalPrice || order.grandTotal || order.amount || 0;

            return (
              <div
                key={orderId}
                className="bg-white border border-[#E8E6D9] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#729855] transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E6D9]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-extrabold text-base text-[#1C2415]">
                        Order #{shortId}
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-heading font-extrabold uppercase border ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-body">
                      Placed on {formattedDate} &bull; Payment: {order.paymentMethod || 'COD'} ({order.isPaid ? 'Paid' : 'Pending'})
                    </p>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="font-heading font-extrabold text-lg text-[#1C2415]">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : orderId)}
                      className="p-1.5 rounded-full bg-[#FAF9F5] border border-[#E8E6D9] text-[#1C2415] hover:text-[#729855] transition-all cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Status Timeline */}
                {!isCancelled && (
                  <div className="bg-[#FAF9F5] border border-[#E8E6D9] rounded-2xl p-4">
                    <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-gray-400 block mb-3">
                      Dispatch Progress
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {[
                        { label: 'Placed', done: true },
                        { label: 'Processing', done: status !== 'Placed' },
                        { label: 'Shipped', done: status === 'Shipped' || isDelivered },
                        { label: 'Delivered', done: isDelivered },
                      ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1 z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            step.done ? 'bg-[#729855] text-white shadow-2xs' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {step.done ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[10px] font-heading font-bold ${step.done ? 'text-[#1C2415]' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items Preview */}
                <div className="space-y-3 pt-2">
                  {(order.orderItems || order.items || []).map((item, idx) => {
                    const title = item.name || item.title || item.product?.title || 'Organic Botanical Item';
                    const price = item.price || item.product?.price || 0;
                    const img = item.image || item.product?.image || '/assets/14.jpg';

                    return (
                      <div key={idx} className="flex items-center gap-3 py-1">
                        <img
                          src={img}
                          alt={title}
                          className="w-12 h-12 rounded-xl object-cover border border-[#E8E6D9] bg-[#FAF9F5]"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-medium text-xs text-[#1C2415] truncate">
                            {title}
                          </h4>
                          <span className="text-[11px] text-gray-500 font-body">
                            Qty: {item.quantity || item.qty || 1} &bull; ₹{price.toLocaleString('en-IN')} each
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions Footer Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8E6D9]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="h-9 px-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E6D9] hover:border-[#729855] text-[#1C2415] hover:text-[#729855] text-xs font-heading font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      GST Invoice
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => onTrackOrder ? onTrackOrder(orderId) : navigate('/orders/track')}
                      className="h-9 px-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E6D9] hover:border-[#729855] text-[#1C2415] hover:text-[#729855] text-xs font-heading font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Track Package
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuyAgain(order.orderItems || order.items)}
                    className="h-9 px-4 rounded-xl bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold flex items-center gap-1.5 transition-all shadow-xs border-none cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Buy Again
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AccountOrders;
