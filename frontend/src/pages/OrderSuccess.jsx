import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Package, Truck, Clock, ShieldCheck, MapPin,
  Copy, ExternalLink, Printer, ShoppingBag, ArrowRight, AlertTriangle,
  RefreshCw, MessageSquare, ArrowLeft, Eye
} from 'lucide-react';
import { orderService } from '../api/orderService';
import { productService } from '../api/productService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import Loader from '../components/ui/Loader';
import { getLocalImageUrl } from '../utils/imageMapper';

const formatINR = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}.00`;

// Mask phone number for privacy: e.g. +91 ******1234
const maskPhone = (phoneStr) => {
  if (!phoneStr) return 'N/A';
  const str = String(phoneStr).trim();
  if (str.length <= 4) return str;
  return str.slice(0, 3) + '******' + str.slice(-4);
};

// Mask email for privacy: e.g. j***e@gmail.com
const maskEmail = (emailStr) => {
  if (!emailStr || !emailStr.includes('@')) return emailStr || 'N/A';
  const [name, domain] = emailStr.split('@');
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
};

const OrderSuccess = ({ initialOrder = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Fetch Order by ID if not passed via props or on refresh
  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      const orderId = id || initialOrder?._id;
      if (!orderId) {
        setLoading(false);
        setError('No order specified.');
        return;
      }

      setLoading(true);
      setError('');
      setUnauthorized(false);

      try {
        const res = await orderService.getOrderById(orderId);
        if (!isMounted) return;

        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          if (res.status === 403 || res.message?.toLowerCase().includes('authorized')) {
            setUnauthorized(true);
          } else {
            setError(res.message || 'Order not found.');
          }
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.status === 403 || err.message?.toLowerCase().includes('authorized')) {
          setUnauthorized(true);
        } else {
          setError(err.message || 'Failed to fetch order details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();

    return () => { isMounted = false; };
  }, [id, initialOrder]);

  // Fetch product recommendations based on purchased order items
  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        const res = await productService.getAll({ limit: 8 });
        if (isMounted && res.success && res.data) {
          const purchasedIds = new Set(
            (order?.orderItems || []).map((item) => (item.product?._id || item.product).toString())
          );
          // Exclude already purchased items and out of stock items
          const filtered = res.data.filter(
            (p) => !purchasedIds.has((p._id || p.id).toString()) && p.stock !== 0
          );
          setRecommendations(filtered.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching order recommendations:', err);
      } finally {
        if (isMounted) setLoadingRecs(false);
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, [order]);

  // Copy Order ID handler
  const handleCopyOrderId = (orderNum) => {
    if (!orderNum) return;
    navigator.clipboard.writeText(orderNum).then(() => {
      showToast(`Order ID ${orderNum} copied to clipboard!`, 'success');
    });
  };

  // Print Invoice Handler
  const handlePrintInvoice = () => {
    window.print();
  };

  // Calculate Order Progress Step (1 to 5)
  const getOrderStep = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'delivered') return 5;
    if (s === 'out for delivery') return 4;
    if (s === 'shipped') return 3;
    if (s === 'packed' || s === 'processing') return 2;
    return 1; // Default: Order Confirmed / Pending
  };

  // Format date range for delivery
  const getDeliveryEstDate = (orderDate, estDate) => {
    if (estDate) {
      return new Date(estDate).toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      });
    }
    const base = orderDate ? new Date(orderDate) : new Date();
    const minEst = new Date(base.valueOf() + 3 * 24 * 60 * 60 * 1000);
    const maxEst = new Date(base.valueOf() + 5 * 24 * 60 * 60 * 1000);
    return `${minEst.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – ${maxEst.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Loading Skeleton View
  if (loading) {
    return (
      <div className="bg-[#f7f6f0] min-h-screen py-16 px-4 sm:px-6 lg:px-8 select-none font-body">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white border border-[#E8E6D9] p-8 sm:p-12 text-center rounded-3xl space-y-4">
            <Loader size="medium" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#729855]">
              Fetching your order confirmation details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized Access View
  if (unauthorized) {
    return (
      <div className="bg-[#f7f6f0] min-h-screen py-16 px-4 sm:px-6 lg:px-8 select-none font-body flex items-center justify-center">
        <div className="bg-white border border-red-200 p-8 sm:p-12 max-w-lg text-center rounded-3xl shadow-sm space-y-5">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#1C2415]">Access Restricted</h1>
          <p className="text-xs text-gray-600 leading-relaxed">
            You do not have permission to view this order. Customer accounts can only access their own order receipts.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/account/profile?tab=orders"
              className="px-6 py-3 bg-[#3A4D23] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-wider rounded-xl transition-all no-underline"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-heading font-bold uppercase tracking-wider rounded-xl transition-all no-underline"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error / Order Not Found View
  if (error || !order) {
    return (
      <div className="bg-[#f7f6f0] min-h-screen py-16 px-4 sm:px-6 lg:px-8 select-none font-body flex items-center justify-center">
        <div className="bg-white border border-[#E8E6D9] p-8 sm:p-12 max-w-lg text-center rounded-3xl shadow-sm space-y-5">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#1C2415]">Order Not Found</h1>
          <p className="text-xs text-gray-600 leading-relaxed">
            {error || 'We could not locate the requested order details in the Fabish database.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#729855] hover:bg-[#3A4D23] text-white text-xs font-heading font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
            <Link
              to="/collections/all"
              className="px-6 py-3 bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-wider rounded-xl transition-all no-underline flex items-center justify-center"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getOrderStep(order.orderStatus);
  const isPaid = order.paymentStatus === 'Paid' || order.isPaid;
  const orderDateFormatted = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-[#f7f6f0] min-h-screen py-10 sm:py-16 select-none font-body">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* 1. TOP SUCCESS BANNER */}
        <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm text-center relative overflow-hidden">
          {/* Subtle Decorative Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Success Checkmark Badge */}
          <div className="inline-flex p-4 sm:p-5 bg-emerald-50 text-[#729855] rounded-full mb-6 border border-emerald-100 shadow-sm animate-bounce-subtle">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.8]" />
          </div>

          <span className="block text-[11px] font-heading font-bold text-[#729855] tracking-[0.25em] uppercase mb-2">
            CONGRATULATIONS
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl text-[#1C2415] uppercase tracking-tight mb-3">
            Order Placed Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed mb-8">
            Thank you for shopping with Fabish organic care! Your order has been registered in our system and is currently being prepared for dispatch.
          </p>

          {/* ORDER KEY METRICS BAR */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F9F8F3] border border-[#E8E6D9] rounded-2xl p-4 sm:p-6 text-left max-w-4xl mx-auto">
            <div>
              <span className="block text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mb-1">
                Order Number
              </span>
              <div className="flex items-center gap-1.5 font-heading font-bold text-xs sm:text-sm text-[#1C2415]">
                <span className="truncate">{order.orderNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopyOrderId(order.orderNumber)}
                  className="text-gray-400 hover:text-[#729855] transition-colors p-1 bg-transparent border-none cursor-pointer"
                  title="Copy Order ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mb-1">
                Order Date
              </span>
              <span className="font-heading font-semibold text-xs sm:text-sm text-[#1C2415]">
                {orderDateFormatted}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mb-1">
                Payment Status
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider ${
                isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isPaid ? '✓ Paid' : order.paymentStatus || 'Pending'}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mb-1">
                Est. Delivery
              </span>
              <span className="font-heading font-semibold text-xs sm:text-sm text-[#729855]">
                {getDeliveryEstDate(order.createdAt, order.estimatedDelivery)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. ORDER PROGRESS TRACKER */}
        <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#1C2415] mb-6 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#729855]" />
            Order Progress Tracker
          </h2>

          <div className="relative">
            {/* Connecting Progress Line (Desktop) */}
            <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-1 bg-gray-200 z-0">
              <div 
                className="h-full bg-[#729855] transition-all duration-700" 
                style={{ width: `${Math.min(100, Math.max(0, (currentStep - 1) * 33.33))}%` }}
              />
            </div>

            {/* Stepper Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0 relative z-10">
              {[
                { title: 'Order Confirmed', sub: 'Received & Verified', step: 1 },
                { title: 'Processing', sub: 'Packing Formulations', step: 2 },
                { title: 'Shipped', sub: 'On the Way', step: 3 },
                { title: 'Delivered', sub: 'Arrived at Address', step: 4 },
              ].map((item) => {
                const isActive = currentStep >= item.step;
                const isCurrent = currentStep === item.step;

                return (
                  <div key={item.step} className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-xs transition-all ${
                      isActive 
                        ? 'bg-[#729855] text-white shadow-md' 
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    } ${isCurrent ? 'ring-4 ring-[#729855]/20 scale-110' : ''}`}>
                      {isActive ? '✓' : item.step}
                    </div>

                    <div>
                      <h4 className={`font-heading text-xs font-bold uppercase tracking-wider ${
                        isActive ? 'text-[#1C2415]' : 'text-gray-400'
                      }`}>
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. MAIN DETAILS GRID: ORDER ITEMS + SUMMARY & SHIPPING */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: ORDER ITEMS SNAPSHOT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#1C2415] mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <span>Items Purchased ({order.orderItems?.length || 0})</span>
                <span className="text-xs text-gray-400 font-normal">Persisted Snapshot</span>
              </h2>

              <div className="divide-y divide-gray-100">
                {order.orderItems?.map((item, idx) => {
                  const itemImg = getLocalImageUrl(item.image);
                  const prodSlug = item.product?.slug || item.product;
                  const itemSubtotal = (item.price || 0) * (item.qty || 1);

                  return (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4">
                        <Link to={`/products/${prodSlug}`} className="shrink-0 group">
                          <img
                            src={itemImg}
                            alt={item.title}
                            className="w-16 h-20 sm:w-20 sm:h-24 object-cover bg-[#F7F6F0] rounded-xl border border-[#E8E6D9] group-hover:opacity-90 transition-opacity"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200'; }}
                          />
                        </Link>

                        <div>
                          <h3 className="font-heading font-semibold text-xs sm:text-sm text-[#1C2415] hover:text-[#729855] transition-colors leading-snug">
                            <Link to={`/products/${prodSlug}`}>{item.title}</Link>
                          </h3>
                          {item.sku && (
                            <span className="text-[10px] text-gray-400 font-heading block mt-0.5">
                              SKU: {item.sku}
                            </span>
                          )}
                          <div className="text-xs text-gray-500 mt-1 font-heading">
                            <span>{formatINR(item.price)}</span>
                            <span className="mx-2 text-gray-300">×</span>
                            <span className="font-bold text-[#1C2415]">Qty {item.qty}</span>
                          </div>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="self-end sm:self-center text-right font-heading">
                        <span className="block text-[10px] text-gray-400 uppercase tracking-widest">Item Total</span>
                        <span className="text-sm font-bold text-[#1C2415]">{formatINR(itemSubtotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTION BUTTONS BAR */}
            <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-sm flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {order.trackingNumber && (
                  <Link
                    to={`/orders/track?number=${order.trackingNumber}`}
                    className="px-5 py-3 bg-[#3A4D23] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-wider rounded-xl transition-all no-underline shadow-xs flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Order</span>
                  </Link>
                )}
                <Link
                  to="/account/profile?tab=orders"
                  className="px-5 py-3 bg-[#729855] hover:bg-[#3A4D23] text-white text-xs font-heading font-bold uppercase tracking-wider rounded-xl transition-all no-underline shadow-xs flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>View My Orders</span>
                </Link>
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-heading font-bold uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
              </div>

              <Link
                to="/collections/all"
                className="px-5 py-3 border border-[#E8E6D9] hover:bg-gray-50 text-[#1C2415] text-xs font-heading font-bold uppercase tracking-wider rounded-xl transition-all no-underline flex items-center gap-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY & SHIPPING INFO */}
          <div className="space-y-6">

            {/* ORDER FINANCIAL SUMMARY */}
            <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#1C2415] border-b border-gray-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs font-heading">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#1C2415]">{formatINR(order.itemsPrice)}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>
                      Discount {order.couponCode ? `(${order.couponCode})` : ''}
                    </span>
                    <span>-{formatINR(order.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping Charge</span>
                  <span className="font-bold text-[#1C2415]">
                    {order.shippingPrice === 0 ? 'FREE' : formatINR(order.shippingPrice)}
                  </span>
                </div>

                {/* GST Details if present */}
                {order.gstDetails && order.gstDetails.totalGst > 0 && (
                  <div className="flex justify-between text-gray-500 text-[11px] pt-1 border-t border-dashed border-gray-200">
                    <span>GST (Incl. {order.gstDetails.gstRate || 18}%)</span>
                    <span>{formatINR(order.gstDetails.totalGst)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-[#1C2415] pt-3 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span className="text-base text-[#3A4D23]">{formatINR(order.totalPrice)}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-gray-500 bg-[#F9F8F3] p-3 rounded-xl border border-[#E8E6D9] space-y-1">
                <div><strong className="text-gray-700">Payment Method:</strong> {order.paymentMethod || 'Card'}</div>
                <div><strong className="text-gray-700">Payment Status:</strong> {order.paymentStatus || 'Pending'}</div>
              </div>
            </div>

            {/* SHIPPING & RECIPIENT INFORMATION */}
            <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#1C2415] border-b border-gray-100 pb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#729855]" />
                Shipping Destination
              </h3>

              <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
                <div>
                  <strong className="text-[#1C2415] block font-heading text-sm">
                    {order.customerDetails?.name || user?.name || 'Customer'}
                  </strong>
                  <span className="text-gray-500 block">
                    Phone: {maskPhone(order.customerDetails?.phone || user?.phone)}
                  </span>
                  <span className="text-gray-500 block">
                    Email: {maskEmail(order.customerDetails?.email || user?.email)}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="font-medium text-[#1C2415]">
                    {order.shippingAddress?.address}
                  </p>
                  <p>
                    {order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} – {order.shippingAddress?.postalCode}
                  </p>
                  <p className="font-bold text-[#729855] uppercase tracking-wider text-[10px] mt-1 font-heading">
                    {order.shippingAddress?.country || 'India'}
                  </p>
                </div>
              </div>
            </div>

            {/* HELP & SUPPORT BANNER */}
            <div className="bg-emerald-50/60 border border-[#729855]/30 rounded-3xl p-6 text-xs text-[#2f3e10] space-y-2">
              <h4 className="font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 text-sm">
                <MessageSquare className="w-4 h-4" />
                Need Assistance?
              </h4>
              <p className="leading-relaxed text-gray-600">
                If you have any questions regarding order modifications or delivery timeline, our support specialists are available 24/7.
              </p>
              <Link
                to="/pages/support"
                className="inline-block pt-1 font-heading font-bold text-[#729855] hover:text-[#1C2415] uppercase tracking-wider text-[11px] underline no-underline"
              >
                Contact Support Team →
              </Link>
            </div>

          </div>

        </div>

        {/* 4. RECOMMENDATIONS SECTION: YOU MAY ALSO LIKE */}
        {recommendations.length > 0 && (
          <div className="pt-10 border-t border-[#E8E6D9] space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-[10px] font-heading font-bold text-[#729855] uppercase tracking-[0.25em] block mb-1">
                COMPLEMENTARY ORGANIC CARE
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1C2415] uppercase tracking-tight">
                You May Also Like
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onQuickView={(p) => navigate(`/products/${p.slug}`)}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderSuccess;
