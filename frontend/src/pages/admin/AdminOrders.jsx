/**
 * AdminOrders — Orders table with deliver action + page header.
 *
 * IMPROVEMENTS (Phase 6+7):
 * - Added AdminPageHeader with title, subtitle, and order count badge
 * - Order ID now shows truncated #ID format (not full MongoDB _id)
 * - Added delivery date display when delivered
 * - Status badge shows proper delivery/payment state
 * - Added order status column with color-coded labels
 */
import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';
import { orderService } from '../../api/orderService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import AdminPageHeader from '../../components/ui/AdminPageHeader';
import { formatPrice } from '../../utils/formatPrice';
import GSTInvoice from '../../components/invoice/GSTInvoice';

const ITEMS_PER_PAGE = 10;

const AdminOrders = ({ orders = [], onRefresh }) => {
  useDocumentTitle('Admin - Orders');
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

  const handleStatusUpdate = async (id, status) => {
    const result = await orderService.updateStatus(id, status);
    if (result.success) {
      showToast(`Order status updated to ${status}!`, 'success');
      onRefresh?.();
    } else {
      showToast(result.message || 'Could not update order status', 'error');
    }
  };

  // Filter
  const filtered = orders.filter(o => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'delivered') return o.orderStatus === 'Delivered' || o.isDelivered;
    if (filterStatus === 'pending') return o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled' && !o.isDelivered;
    if (filterStatus === 'unpaid') return o.paymentStatus !== 'Paid' && !o.isPaid;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 select-none">
      {/* GST Invoice Modal */}
      {invoiceOrder && (
        <GSTInvoice order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
      <AdminPageHeader
        title="Orders"
        subtitle={`${orders.length} total orders — ${orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled' && !o.isDelivered).length} pending delivery`}
        action={
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-[#eae8d8] text-xs font-semibold text-black bg-white focus:outline-none rounded-none cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
            <option value="unpaid">Unpaid</option>
          </select>
        }
      />

      <div className="bg-[#f7f6f0] md:bg-white md:border md:border-[#eae8d8] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        {/* Mobile Card Grid View */}
        <div className="md:hidden space-y-4">
          {paginated.map((order) => {
            const customerName = order.customerDetails?.name || order.shippingAddress?.name || order.user?.name || 'Guest';
            const customerEmail = order.customerDetails?.email || order.user?.email;
            return (
              <div key={order._id} className="bg-white border border-[#eae8d8] p-5 flex flex-col gap-4 text-xs shadow-xs text-left">
                <div className="flex items-center justify-between">
                  <span 
                    onClick={() => setSelectedOrderDetail(order)}
                    className="font-mono font-bold text-brand-green text-sm cursor-pointer hover:underline"
                  >
                    {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                  </span>
                  <span className="text-gray-400 font-mono">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="border-t border-[#eae8d8]/50 pt-3 space-y-2">
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[9px] block">Customer</span>
                    <span className="text-black font-semibold">{customerName}</span>
                    {customerEmail && <span className="text-gray-400 font-normal block text-[10px]">{customerEmail}</span>}
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[9px] block">Products</span>
                    <p className="text-gray-600 font-medium leading-relaxed font-semibold">
                      {order.orderItems?.map((item) => `${item.title} (x${item.qty})`).join(', ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[9px] block">Address</span>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      {order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}` : 'No Address'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-b border-[#eae8d8]/50 py-3 text-center text-gray-600 font-semibold select-none">
                  <div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Amount</div>
                    <span className="text-black font-bold font-heading text-sm">{formatPrice(order.totalPrice)}</span>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Payment</div>
                    <Badge variant={(order.paymentStatus === 'Paid' || order.isPaid) ? 'success' : (order.paymentStatus === 'Failed' ? 'danger' : 'warning')}>
                      {order.paymentStatus || (order.isPaid ? 'Paid' : 'Unpaid')}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Status</div>
                    <Badge variant={order.orderStatus === 'Delivered' ? 'success' : (order.orderStatus === 'Cancelled' ? 'danger' : 'warning')}>
                      {order.orderStatus || (order.isDelivered ? 'Delivered' : 'Pending')}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1 select-none">
                  <label className="text-[9px] text-gray-400 font-bold uppercase">Update Order Status</label>
                  <select
                    value={order.orderStatus || (order.isDelivered ? 'Delivered' : 'Pending')}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#eae8d8] text-xs font-semibold text-black bg-white focus:outline-none rounded-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out For Delivery">Out For Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={() => setSelectedOrderDetail(order)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-black text-black hover:bg-black hover:text-white text-[10px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none bg-transparent"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-[#729855] text-[#729855] hover:bg-[#729855] hover:text-white text-[10px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none bg-transparent"
                    >
                      <FileText className="w-3.5 h-3.5" /> GST Invoice
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {paginated.length === 0 && (
            <div className="bg-white border border-[#eae8d8] p-8 text-center italic text-gray-400">No orders match the current filter.</div>
          )}
        </div>

        {/* Desktop Table View */}
        <table className="w-full text-left border-collapse text-xs hidden md:table">
          <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
            <tr>
              <th className="p-4">Order Number</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Products</th>
              <th className="p-4">Shipping Address</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-center">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae8d8]/40">
            {paginated.map((order) => (
              <tr key={order._id} className="hover:bg-[#eae8d8]/20 transition-colors text-xs font-semibold">
                <td 
                  onClick={() => setSelectedOrderDetail(order)}
                  className="p-4 font-mono font-bold text-brand-green cursor-pointer hover:underline"
                >
                  {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                </td>
                <td className="p-4 text-black font-semibold">
                  {order.customerDetails?.name || order.shippingAddress?.name || order.user?.name || 'Guest'}
                  <div className="text-[10px] text-gray-400 font-normal">{order.customerDetails?.email || order.user?.email}</div>
                </td>
                <td className="p-4 max-w-[200px] truncate text-gray-500 font-medium">
                  {order.orderItems?.map((item) => `${item.title} (x${item.qty})`).join(', ')}
                </td>
                <td className="p-4 max-w-[200px] truncate text-gray-500 font-medium">
                  {order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}` : 'No Address'}
                </td>
                <td className="p-4 font-heading font-bold text-sm text-black">
                  {formatPrice(order.totalPrice)}
                </td>
                <td className="p-4 select-none">
                  <Badge variant={(order.paymentStatus === 'Paid' || order.isPaid) ? 'success' : (order.paymentStatus === 'Failed' ? 'danger' : 'warning')}>
                    {order.paymentStatus || (order.isPaid ? 'Paid' : 'Unpaid')}
                  </Badge>
                </td>
                <td className="p-4 select-none">
                  <Badge variant={order.orderStatus === 'Delivered' ? 'success' : (order.orderStatus === 'Cancelled' ? 'danger' : 'warning')}>
                    {order.orderStatus || (order.isDelivered ? 'Delivered' : 'Pending')}
                  </Badge>
                </td>
                <td className="p-4 text-gray-400 font-mono">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">
                  <div className="flex flex-col gap-1.5 items-center">
                    <select
                      value={order.orderStatus || (order.isDelivered ? 'Delivered' : 'Pending')}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="px-2 py-1 border border-[#eae8d8] text-xs font-semibold text-black bg-white focus:outline-none rounded-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="flex items-center gap-1 px-2 py-1 border border-[#729855] text-[#729855] hover:bg-[#729855] hover:text-white text-[9px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none bg-transparent w-full justify-center"
                    >
                      <FileText className="w-3 h-3" /> Invoice
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="9" className="p-12 text-center italic text-gray-400">
                  No orders match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white border border-[#eae8d8] p-4 text-xs font-semibold text-black">
          <span className="text-gray-500">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center border border-[#eae8d8] bg-[#fcfcfa] hover:border-black cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-[#eae8d8] bg-[#fcfcfa] hover:border-black cursor-pointer disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Selected Order Detail Drawer */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end font-sans text-xs select-none">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col p-6 overflow-y-auto border-l border-[#eae8d8] animate-in slide-in-from-right text-left">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#eae8d8] pb-4 mb-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-black uppercase tracking-wider">
                  Order Details
                </h2>
                <p className="text-gray-400 font-mono text-[10px] mt-0.5">
                  ID: {selectedOrderDetail._id}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrderDetail(null)}
                className="w-8 h-8 flex items-center justify-center border border-[#eae8d8] hover:border-black text-gray-500 hover:text-black cursor-pointer bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 flex-grow">
              {/* Order Numbers & Badges */}
              <div className="bg-[#f7f6f0] p-4 border border-[#eae8d8] flex justify-between items-center">
                <div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Order Number</div>
                  <div className="font-mono font-bold text-sm text-brand-green mt-0.5">
                    {selectedOrderDetail.orderNumber || `#${selectedOrderDetail._id.slice(-8).toUpperCase()}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={(selectedOrderDetail.paymentStatus === 'Paid' || selectedOrderDetail.isPaid) ? 'success' : (selectedOrderDetail.paymentStatus === 'Failed' ? 'danger' : 'warning')}>
                    {selectedOrderDetail.paymentStatus || (selectedOrderDetail.isPaid ? 'Paid' : 'Unpaid')}
                  </Badge>
                  <Badge variant={selectedOrderDetail.orderStatus === 'Delivered' ? 'success' : (selectedOrderDetail.orderStatus === 'Cancelled' ? 'danger' : 'warning')}>
                    {selectedOrderDetail.orderStatus || (selectedOrderDetail.isDelivered ? 'Delivered' : 'Pending')}
                  </Badge>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-[#eae8d8] pb-1 mb-2">
                  Customer Information
                </h3>
                <div className="space-y-1 text-xs">
                  <div><span className="font-semibold text-gray-600">Name:</span> <span className="text-black font-semibold">{selectedOrderDetail.customerDetails?.name || selectedOrderDetail.shippingAddress?.name || selectedOrderDetail.user?.name || 'Guest'}</span></div>
                  <div><span className="font-semibold text-gray-600">Email:</span> <span className="text-black">{selectedOrderDetail.customerDetails?.email || selectedOrderDetail.user?.email || 'N/A'}</span></div>
                  <div><span className="font-semibold text-gray-600">Phone:</span> <span className="text-black">{selectedOrderDetail.customerDetails?.phone || 'N/A'}</span></div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-[#eae8d8] pb-1 mb-2">
                    Shipping Address
                  </h3>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    <p className="font-bold text-black mb-0.5">{selectedOrderDetail.shippingAddress?.name || selectedOrderDetail.customerDetails?.name}</p>
                    <p className="m-0">{selectedOrderDetail.shippingAddress?.address}</p>
                    <p className="m-0">{selectedOrderDetail.shippingAddress?.city}{selectedOrderDetail.shippingAddress?.state ? `, ${selectedOrderDetail.shippingAddress.state}` : ''} — {selectedOrderDetail.shippingAddress?.postalCode}</p>
                    <p className="m-0">{selectedOrderDetail.shippingAddress?.country || 'India'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-[#eae8d8] pb-1 mb-2">
                    Billing Address
                  </h3>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    <p className="font-bold text-black mb-0.5">{selectedOrderDetail.shippingAddress?.name || selectedOrderDetail.customerDetails?.name}</p>
                    <p className="m-0">{selectedOrderDetail.shippingAddress?.address}</p>
                    <p className="m-0">{selectedOrderDetail.shippingAddress?.city}{selectedOrderDetail.shippingAddress?.state ? `, ${selectedOrderDetail.shippingAddress.state}` : ''} — {selectedOrderDetail.shippingAddress?.postalCode}</p>
                    <p className="m-0">{selectedOrderDetail.shippingAddress?.country || 'India'}</p>
                    <p className="text-[10px] text-gray-400 mt-1 italic">(Same as Shipping Address)</p>
                  </div>
                </div>
              </div>

              {/* Products list */}
              <div>
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-[#eae8d8] pb-1 mb-3">
                  Ordered Products
                </h3>
                <div className="space-y-3">
                  {(selectedOrderDetail.orderItems || []).map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start border-b border-[#eae8d8]/50 pb-3">
                      {item.image && (
                        <img 
                          src={item.image.startsWith('http') ? item.image : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${item.image}`}
                          alt={item.title} 
                          className="w-12 h-12 object-cover border border-[#eae8d8] shrink-0" 
                        />
                      )}
                      <div className="flex-grow min-w-0">
                        <div className="font-semibold text-black text-xs truncate">{item.title}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {item.sku || 'N/A'}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Qty: {item.qty} × {formatPrice(item.price)}</div>
                      </div>
                      <div className="font-bold text-black font-mono text-xs">
                        {formatPrice(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-[#eae8d8] pb-1 mb-2">
                  Payment & Invoice
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="font-semibold text-gray-600">Method:</span> <span className="text-black font-semibold">{selectedOrderDetail.paymentMethod}</span></div>
                  <div><span className="font-semibold text-gray-600">Status:</span> <span className="text-black">{selectedOrderDetail.paymentStatus}</span></div>
                  <div className="col-span-2 truncate"><span className="font-semibold text-gray-600">Transaction ID:</span> <span className="text-black font-mono text-[11px]">{selectedOrderDetail.paymentResult?.id || 'N/A'}</span></div>
                  <div className="col-span-2 flex items-center gap-2 mt-2">
                    <span className="font-semibold text-gray-600">Invoice:</span> 
                    <span className="font-bold text-brand-green font-mono">{selectedOrderDetail.invoiceNumber || 'Awaiting'}</span>
                    <button 
                      onClick={() => {
                        setInvoiceOrder(selectedOrderDetail);
                      }}
                      className="px-2 py-0.5 border border-[#729855] text-[#729855] hover:bg-[#729855] hover:text-white text-[9px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer bg-transparent"
                    >
                      Open Invoice
                    </button>
                  </div>
                </div>
              </div>

              {/* Totals Summary */}
              <div>
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-[#eae8d8] pb-1 mb-2">
                  Financial Summary
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal (incl. GST)</span>
                    <span className="font-mono">{formatPrice(selectedOrderDetail.itemsPrice)}</span>
                  </div>
                  {selectedOrderDetail.discountAmount > 0 && (
                    <div className="flex justify-between text-[#15803d]">
                      <span>Discount {selectedOrderDetail.couponCode ? `(${selectedOrderDetail.couponCode})` : ''}</span>
                      <span className="font-mono">- {formatPrice(selectedOrderDetail.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>GST ({selectedOrderDetail.gstDetails?.gstRate || 18}%)</span>
                    <span className="font-mono">{formatPrice(selectedOrderDetail.gstDetails?.totalGst || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Charges</span>
                    <span className="font-mono">{selectedOrderDetail.shippingPrice === 0 ? 'FREE' : formatPrice(selectedOrderDetail.shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#eae8d8] pt-2 mt-1 font-bold text-black">
                    <span className="text-sm">GRAND TOTAL</span>
                    <span className="text-base text-brand-green font-mono">{formatPrice(selectedOrderDetail.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Shipment Timeline & Tracking */}
              <div>
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-[#eae8d8] pb-1 mb-3">
                  Shipment & Tracking
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div><span className="font-semibold text-gray-600">Courier Name:</span> <span className="text-black">{selectedOrderDetail.courierName || 'Fabish Express'}</span></div>
                  <div><span className="font-semibold text-gray-600">Tracking ID:</span> <span className="text-black font-mono">{selectedOrderDetail.trackingNumber || 'Awaiting'}</span></div>
                </div>
                
                {/* Timeline */}
                <div className="relative pl-4 ml-1.5 border-l border-[#eae8d8] space-y-4">
                  {(selectedOrderDetail.trackingHistory || []).map((history, hIdx) => (
                    <div key={hIdx} className="relative">
                      {/* Timeline node dot */}
                      <span className="absolute -left-[20.5px] top-1 w-3 h-3 rounded-full bg-[#729855] border-2 border-white"></span>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-black uppercase text-[10px] tracking-wide">{history.status}</span>
                        <span className="text-[9px] text-gray-400 font-mono">
                          {new Date(history.timestamp).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 m-0 leading-relaxed">{history.details}</p>
                    </div>
                  ))}
                  {(selectedOrderDetail.trackingHistory || []).length === 0 && (
                    <p className="text-gray-400 italic text-xs">No shipment tracking history recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Metadata Dates */}
              <div className="border-t border-[#eae8d8] pt-4 text-[10px] text-gray-400 font-mono space-y-1">
                <div>Created At: {new Date(selectedOrderDetail.createdAt).toLocaleString()}</div>
                <div>Updated At: {new Date(selectedOrderDetail.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
