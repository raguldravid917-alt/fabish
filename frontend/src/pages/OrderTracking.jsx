import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Truck, MapPin, Calendar, ClipboardList, CheckCircle2, Circle, AlertCircle, ArrowLeft } from 'lucide-react';
import { orderService } from '../api/orderService';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const ORDER_STAGES = [
  { label: 'Order Placed', desc: 'Your order was successfully registered.' },
  { label: 'Payment Confirmed', desc: 'Payment was received and verified.' },
  { label: 'Processing', desc: 'Your order is being prepared and packed.' },
  { label: 'Packed', desc: 'Your items have been safely packed.' },
  { label: 'Shipped', desc: 'Your package is in transit with the courier.' },
  { label: 'Out For Delivery', desc: 'Your package is out for delivery today.' },
  { label: 'Delivered', desc: 'Package has been delivered to the recipient.' }
];

const OrderTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  
  const queryNumber = searchParams.get('number') || searchParams.get('orderId') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (numberOrId) => {
    if (!numberOrId?.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await orderService.getTracking(numberOrId.trim());
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.message || 'Tracking information not found. Check your order/tracking number.');
        showToast(res.message || 'Tracking number not found', 'error');
      }
    } catch (err) {
      setError('Failed to load tracking data. Please try again.');
      showToast('Error loading tracking data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryNumber) {
      fetchTracking(queryNumber);
      setSearchQuery(queryNumber);
    } else {
      setOrder(null);
      setError('');
    }
  }, [queryNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      showToast('Please enter an order or tracking number', 'warning');
      return;
    }
    setSearchParams({ number: searchQuery.trim() });
  };

  const getEventForStage = (stageLabel, paymentMethod) => {
    if (!order || !order.trackingHistory) return null;
    
    // Normalize Payment Confirmed/COD Confirmed based on payment method
    if (stageLabel === 'Payment Confirmed' && paymentMethod === 'COD') {
      return order.trackingHistory.find(h => h.status === 'COD Confirmed' || h.status === 'Payment Confirmed');
    }
    
    return order.trackingHistory.find(h => h.status === stageLabel);
  };

  const isCancelled = order?.orderStatus === 'Cancelled';

  return (
    <div className="bg-[#f7f6f0] min-h-screen py-12 px-4 md:px-8 font-body select-text text-left">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb / Back Link */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#729855] hover:text-[#2f3e10] no-underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-10">
          <span className="block text-xs font-bold text-[#729855] tracking-[0.2em] uppercase mb-2">
            Delivery Status Lookup
          </span>
          <h1 className="serif-title text-4xl text-black font-normal uppercase tracking-wide">
            Track Your Order
          </h1>
          <p className="text-xs text-brand-muted mt-2 max-w-md mx-auto">
            Enter your unique Tracking Number or Order Number below to view live shipment updates.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white border border-brand-border p-6 md:p-8 shadow-sm mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. TRK-...) or Order ID (e.g. FAB-...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f4f7f8] border border-transparent focus:border-[#729855] focus:bg-white px-5 py-4 pl-12 text-sm text-[#333] outline-none transition-all placeholder:text-gray-400 font-medium"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2f3e10] hover:bg-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors shrink-0 border-none cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Searching...' : 'Track Shipment'}
            </button>
          </form>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="py-20 flex justify-center">
            <Loader />
          </div>
        )}

        {/* Error Banner */}
        {error && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 p-6 shadow-sm text-center flex flex-col items-center gap-3"
          >
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h3 className="font-heading font-semibold text-base uppercase tracking-wider">No Shipment Found</h3>
            <p className="text-xs text-gray-600 max-w-md">{error}</p>
          </motion.div>
        )}

        {/* Tracking Details Render */}
        {order && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: ID / Status */}
              <div className="bg-white border border-brand-border p-6 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-[#eae8d8]/50 text-[#2f3e10]">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Order Details</span>
                  <h3 className="font-heading text-sm font-bold text-black uppercase leading-tight">#{order.orderNumber}</h3>
                  <p className="text-[11px] text-brand-muted mt-1">Status: <strong className="text-[#729855]">{order.orderStatus}</strong></p>
                </div>
              </div>

              {/* Card 2: Tracking ID / Courier */}
              <div className="bg-white border border-brand-border p-6 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-[#eae8d8]/50 text-[#2f3e10]">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Shipment Method</span>
                  <h3 className="font-heading text-sm font-bold text-black uppercase leading-tight">{order.trackingNumber || 'Awaiting ID'}</h3>
                  <p className="text-[11px] text-brand-muted mt-1">Courier: <strong>{order.courierName}</strong></p>
                </div>
              </div>

              {/* Card 3: Estimated Delivery */}
              <div className="bg-white border border-brand-border p-6 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-[#eae8d8]/50 text-[#2f3e10]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Estimated Delivery</span>
                  <h3 className="font-heading text-sm font-bold text-black uppercase leading-tight">
                    {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    }) : 'TBD'}
                  </h3>
                  <p className="text-[11px] text-brand-muted mt-1">Delivery Time: <strong>9 AM - 6 PM</strong></p>
                </div>
              </div>
            </div>

            {/* Shipment Tracking Timeline */}
            <div className="bg-white border border-brand-border p-6 md:p-10 shadow-sm">
              <h2 className="font-heading text-base font-bold uppercase tracking-widest text-[#2f3e10] border-b border-[#eae8d8] pb-4 mb-8">
                Shipment History
              </h2>

              {isCancelled ? (
                <div className="bg-red-50 border border-red-200 text-red-800 p-6 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h3 className="font-heading font-semibold text-sm uppercase tracking-wider">Shipment Cancelled</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      This order has been cancelled and will not be shipped. If you have been charged, a refund will be processed to your original payment method.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative pl-6 md:pl-8">
                  {/* Vertical Track Line */}
                  <div className="absolute left-[13px] md:left-[17px] top-2 bottom-2 w-0.5 bg-[#eae8d8]"></div>

                  <div className="space-y-10">
                    {ORDER_STAGES.map((stage, idx) => {
                      const event = getEventForStage(stage.label, order.paymentMethod);
                      const isCompleted = !!event;
                      
                      const isLatest = isCompleted && (!ORDER_STAGES[idx + 1] || !getEventForStage(ORDER_STAGES[idx + 1].label, order.paymentMethod));

                      return (
                        <div key={idx} className="relative flex gap-6 md:gap-8 items-start">
                          <div className="relative z-10 shrink-0 mt-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className={`w-7 h-7 bg-white rounded-full ${
                                isLatest ? 'text-[#729855]' : 'text-gray-400'
                              }`} />
                            ) : (
                              <Circle className="w-7 h-7 bg-white text-gray-300 rounded-full" />
                            )}
                          </div>

                          <div className="flex-grow">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                              <h3 className={`font-heading text-sm font-bold uppercase tracking-wider ${
                                isLatest ? 'text-[#729855]' : (isCompleted ? 'text-black' : 'text-gray-400')
                              }`}>
                                {stage.label === 'Payment Confirmed' && order.paymentMethod === 'COD' 
                                  ? 'COD Confirmed' 
                                  : stage.label}
                              </h3>
                              {isCompleted && event.timestamp && (
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                                  {new Date(event.timestamp).toLocaleString('en-IN', {
                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-1 ${isCompleted ? 'text-brand-muted' : 'text-gray-400'}`}>
                              {isCompleted && event.details ? event.details : stage.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Address Summary */}
            <div className="bg-white border border-brand-border p-6 shadow-sm">
              <h2 className="font-heading text-base font-bold uppercase tracking-widest text-[#2f3e10] border-b border-[#eae8d8] pb-4 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping Destination
              </h2>
              <div className="text-xs text-brand-muted leading-relaxed">
                <p className="font-bold text-black text-sm mb-1">{order.customerDetails?.name}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} — {order.shippingAddress?.postalCode}</p>
                <p>{order.shippingAddress?.country || 'India'}</p>
                {order.customerDetails?.phone && <p className="mt-2 font-medium">Contact: {order.customerDetails.phone}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
