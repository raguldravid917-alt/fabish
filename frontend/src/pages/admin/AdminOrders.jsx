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
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { orderService } from '../../api/orderService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import AdminPageHeader from '../../components/ui/AdminPageHeader';
import { formatPrice } from '../../utils/formatPrice';

const ITEMS_PER_PAGE = 10;

const AdminOrders = ({ orders = [], onRefresh }) => {
  useDocumentTitle('Admin - Orders');
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');

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

      <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <table className="w-full text-left border-collapse text-xs">
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
                <td className="p-4 font-mono font-bold text-brand-green">
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
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="7" className="p-12 text-center italic text-gray-400">
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
    </div>
  );
};

export default AdminOrders;
