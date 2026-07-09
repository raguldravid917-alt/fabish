import React, { useContext, useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  Settings, 
  CheckCircle2, 
  Truck, 
  FileText, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  ChevronRight,
  Package,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { orderService } from '../api/orderService';
import { getLocalImageUrl } from '../utils/imageMapper';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useContext(AuthContext);
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  // API State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);

  // Profile Settings Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingSettings, setSubmittingSettings] = useState(false);

  // Address Form State
  const [addresses, setAddresses] = useState(user?.addresses || []);

  useEffect(() => {
    if (!user) {
      navigate('/account/login?redirect=/account/profile');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await orderService.getMyOrders();
        if (res.success) {
          setOrders(res.data || []);
        } else {
          showToast(res.message || 'Failed to load orders', 'error');
        }
      } catch (err) {
        showToast('Connection to server failed', 'error');
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, showToast]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setSubmittingSettings(true);
    try {
      const res = await updateProfile(name, email, password || undefined);
      if (res.success) {
        showToast('Profile updated successfully!', 'success');
        setPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message || 'Profile update failed', 'error');
      }
    } catch (err) {
      showToast('Server update failed', 'error');
    } finally {
      setSubmittingSettings(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Define tracking timeline stages helper
  const getTimelineStages = (order) => {
    const isPaid = order.paymentStatus === 'Paid' || order.isPaid;
    const isCOD = order.paymentMethod === 'COD';
    const status = order.orderStatus;

    return [
      { label: 'Order Placed', desc: 'Your order was registered.', done: true, key: 'Placed' },
      { 
        label: 'Payment Verified', 
        desc: isPaid ? 'Payment received successfully.' : (isCOD ? 'COD order confirmed.' : 'Awaiting payment verification.'), 
        done: isPaid || isCOD, 
        key: 'Paid' 
      },
      { 
        label: 'Confirmed', 
        desc: 'Seller accepted your order.', 
        done: ['Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'].includes(status), 
        key: 'Confirmed' 
      },
      { 
        label: 'Packed', 
        desc: 'Items are packaged and ready.', 
        done: ['Packed', 'Shipped', 'Out For Delivery', 'Delivered'].includes(status), 
        key: 'Packed' 
      },
      { 
        label: 'Shipped', 
        desc: 'In transit to distribution hub.', 
        done: ['Shipped', 'Out For Delivery', 'Delivered'].includes(status), 
        key: 'Shipped' 
      },
      { 
        label: 'Out For Delivery', 
        desc: 'Courier is delivering today.', 
        done: ['Out For Delivery', 'Delivered'].includes(status), 
        key: 'Out For Delivery' 
      },
      { 
        label: 'Delivered', 
        desc: 'Successfully received.', 
        done: status === 'Delivered', 
        key: 'Delivered' 
      }
    ];
  };

  if (!user) return null;

  return (
    <div className="bg-[#f7f6f0] min-h-screen py-12 font-body text-brand-charcoal select-none">
      
      {/* Dynamic Printing Style overrides for Invoices */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          header, footer, nav, button, .no-print, .toast-container {
            display: none !important;
          }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border pb-6 mb-10 gap-4 no-print">
          <div>
            <h1 className="serif-title text-3xl md:text-4xl uppercase tracking-wide">My Account</h1>
            <p className="text-brand-muted text-xs font-semibold tracking-wider font-heading uppercase mt-1">
              Welcome back, {user.name}
            </p>
          </div>
          <button 
            onClick={logout}
            className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white px-6 py-2.5 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Invoice View Overlay/Modal */}
        {viewInvoice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto select-text">
            <div className="bg-white w-full max-w-3xl border border-brand-border p-6 md:p-10 shadow-2xl relative print-area my-8">
              
              {/* Close Button */}
              <button 
                onClick={() => setViewInvoice(null)}
                className="absolute top-4 right-4 text-brand-muted hover:text-brand-charcoal font-bold no-print border-none bg-transparent cursor-pointer text-sm font-heading"
              >
                ✕ Close
              </button>

              {/* Invoice Layout */}
              <div className="space-y-8 select-text">
                <div className="flex justify-between items-start border-b border-brand-border pb-6">
                  <div>
                    <h2 className="serif-title text-3xl text-brand-charcoal leading-none">FABISH</h2>
                    <p className="text-[10px] text-brand-muted font-heading uppercase tracking-widest mt-1">Premium Organic Skincare</p>
                  </div>
                  <div className="text-right font-heading text-xs font-semibold text-brand-muted uppercase space-y-1">
                    <div className="text-brand-charcoal font-bold text-sm">INVOICE</div>
                    <div>Order Ref: #{viewInvoice.orderNumber}</div>
                    <div>Date: {new Date(viewInvoice.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold">
                  <div>
                    <h4 className="font-heading uppercase tracking-wider text-brand-muted mb-2 text-[10px]">Billed To:</h4>
                    <div className="text-brand-charcoal text-sm font-bold mb-1">{viewInvoice.customerDetails?.name || viewInvoice.user?.name}</div>
                    <div className="text-brand-muted font-normal leading-relaxed">
                      {viewInvoice.customerDetails?.email}<br />
                      {viewInvoice.customerDetails?.phone && `Phone: ${viewInvoice.customerDetails.phone}`}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-heading uppercase tracking-wider text-brand-muted mb-2 text-[10px]">Shipped To:</h4>
                    <div className="text-brand-charcoal leading-relaxed font-normal">
                      {viewInvoice.shippingAddress.address}<br />
                      {viewInvoice.shippingAddress.city}, {viewInvoice.shippingAddress.postalCode}<br />
                      {viewInvoice.shippingAddress.country}
                    </div>
                  </div>
                </div>

                {/* Products Table - Responsive scroll wrapper */}
                <div className="overflow-x-auto w-full border-b border-brand-border/40 pb-2">
                  <table className="w-full text-left border-collapse text-xs min-w-[450px]">
                    <thead>
                      <tr className="border-b border-brand-border font-heading font-bold text-[10px] uppercase tracking-wider text-brand-muted">
                        <th className="pb-3">Item Description</th>
                        <th className="pb-3 text-center">Qty</th>
                        <th className="pb-3 text-right">Price</th>
                        <th className="pb-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/40 font-semibold text-brand-charcoal">
                      {viewInvoice.orderItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-brand-bg-cream/20">
                          <td className="py-4 font-body">{item.title}</td>
                          <td className="py-4 text-center font-mono">{item.qty}</td>
                          <td className="py-4 text-right font-mono">Rs. {item.price.toLocaleString('en-IN')}.00</td>
                          <td className="py-4 text-right font-mono">Rs. {(item.price * item.qty).toLocaleString('en-IN')}.00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary */}
                <div className="flex justify-end pt-4 border-t border-brand-border">
                  <div className="w-64 font-heading text-xs font-semibold text-brand-muted space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-brand-charcoal font-mono font-bold">Rs. {viewInvoice.itemsPrice.toLocaleString('en-IN')}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span className="text-brand-charcoal font-mono font-bold">
                        {viewInvoice.shippingPrice === 0 ? 'FREE' : `Rs. ${viewInvoice.shippingPrice.toLocaleString('en-IN')}.00`}
                      </span>
                    </div>
                    <hr className="border-brand-border" />
                    <div className="flex justify-between text-brand-charcoal font-bold text-sm">
                      <span>Total Amount</span>
                      <span className="font-mono text-base text-[#729855]">Rs. {viewInvoice.totalPrice.toLocaleString('en-IN')}.00</span>
                    </div>
                  </div>
                </div>

                {/* Transaction details */}
                <div className="bg-brand-bg-cream p-4 border border-brand-border text-[10px] font-heading font-bold uppercase tracking-wider space-y-1.5 leading-relaxed text-brand-muted">
                  <div><span className="text-brand-charcoal">Payment Method:</span> {viewInvoice.paymentMethod}</div>
                  <div><span className="text-brand-charcoal">Payment Status:</span> {viewInvoice.paymentStatus}</div>
                  {viewInvoice.razorpayPaymentId && (
                    <div><span className="text-brand-charcoal">Razorpay Payment ID:</span> {viewInvoice.razorpayPaymentId}</div>
                  )}
                  {viewInvoice.razorpayOrderId && (
                    <div><span className="text-brand-charcoal">Razorpay Order ID:</span> {viewInvoice.razorpayOrderId}</div>
                  )}
                </div>

                {/* Action panel inside Invoice */}
                <div className="flex justify-end gap-4 no-print border-t border-brand-border pt-6 mt-6">
                  <button 
                    onClick={handlePrintInvoice}
                    className="bg-[#729855] hover:bg-[#5a7d41] text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer rounded-none border-none"
                  >
                    <Printer className="w-4 h-4" /> Print / Save PDF
                  </button>
                  <button 
                    onClick={() => setViewInvoice(null)}
                    className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer rounded-none bg-transparent"
                  >
                    Close Invoice
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex border-b border-brand-border mb-10 overflow-x-auto no-scrollbar no-print">
          <button 
            onClick={() => { setSearchParams({ tab: 'orders' }); setSelectedOrder(null); }}
            className={`py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 ${
              activeTab === 'orders' ? 'border-brand-charcoal text-brand-charcoal' : 'border-transparent text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> My Orders
          </button>
          <button 
            onClick={() => setSearchParams({ tab: 'addresses' })}
            className={`py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 ${
              activeTab === 'addresses' ? 'border-brand-charcoal text-brand-charcoal' : 'border-transparent text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            <MapPin className="w-4 h-4" /> Addresses
          </button>
          <button 
            onClick={() => setSearchParams({ tab: 'settings' })}
            className={`py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 ${
              activeTab === 'settings' ? 'border-brand-charcoal text-brand-charcoal' : 'border-transparent text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>

        {/* Content Panels */}
        <div className="no-print">
          
          {/* TABS 1: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              {selectedOrder ? (
                /* Detailed Order View with Tracking Timeline */
                <div className="bg-white border border-brand-border p-6 md:p-8 space-y-8 select-text">
                  
                  {/* Back to List */}
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="inline-flex items-center gap-2 border border-brand-charcoal hover:bg-brand-charcoal hover:text-white px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                  </button>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border pb-4 gap-4">
                    <div>
                      <h2 className="serif-title text-2xl text-brand-charcoal leading-snug">Order Number: #{selectedOrder.orderNumber}</h2>
                      <p className="text-brand-muted text-xs font-semibold font-heading uppercase mt-1">Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => setViewInvoice(selectedOrder)}
                      className="bg-brand-charcoal text-white hover:bg-brand-button-hover px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none"
                    >
                      View & Print Invoice
                    </button>
                  </div>

                  {/* Order tracking timeline */}
                  <div className="p-6 bg-brand-bg-cream/45 border border-brand-border">
                    <h3 className="font-heading text-xs font-bold uppercase tracking-widest mb-6 text-brand-charcoal flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#729855]" /> Delivery Tracking
                    </h3>
                    
                    {selectedOrder.orderStatus === 'Cancelled' ? (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 font-semibold text-xs font-heading uppercase tracking-wider text-center">
                        This order has been Cancelled and stock returned.
                      </div>
                    ) : (
                      <div className="relative pl-6 md:pl-0">
                        {/* Vertical line on small screens, horizontal on medium+ */}
                        <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-brand-border md:hidden"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 relative">
                          {/* Horizontal line for medium+ screens */}
                          <div className="absolute left-6 right-6 top-[15px] h-0.5 bg-brand-border hidden md:block z-0"></div>

                          {getTimelineStages(selectedOrder).map((stage, idx) => (
                            <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center relative z-10 gap-4 md:gap-2">
                              {/* Dot */}
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 font-bold font-mono text-[10px] shrink-0 ${
                                stage.done 
                                  ? 'bg-[#729855] border-[#729855] text-white' 
                                  : 'bg-white border-brand-border text-brand-muted'
                              }`}>
                                {stage.done ? '✓' : idx + 1}
                              </div>
                              {/* Label Content */}
                              <div>
                                <h4 className={`font-heading text-[10px] font-bold uppercase tracking-wider leading-snug ${stage.done ? 'text-brand-charcoal' : 'text-brand-muted'}`}>
                                  {stage.label}
                                </h4>
                                <p className="text-[10px] text-brand-muted leading-tight mt-1 max-w-[120px] mx-auto hidden md:block font-medium">
                                  {stage.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left & center: Items list */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal border-b border-brand-border pb-2">Ordered Items</h3>
                      <div className="divide-y divide-brand-border/40">
                        {selectedOrder.orderItems.map((item, idx) => (
                          <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                            <img 
                              src={getLocalImageUrl(item.image)} 
                              alt={item.title} 
                              className="w-16 h-20 object-cover bg-brand-bg-cream border border-brand-border shrink-0" 
                            />
                            <div className="flex-grow flex flex-col justify-between">
                              <div>
                                <h4 className="font-heading font-bold text-sm text-brand-charcoal leading-snug">{item.title}</h4>
                                <span className="text-[10px] font-mono text-brand-muted mt-1 block">Qty: {item.qty}</span>
                              </div>
                              <span className="font-heading font-semibold text-xs text-brand-charcoal">Rs. {item.price.toLocaleString('en-IN')}.00 each</span>
                            </div>
                            <div className="text-right self-center font-heading font-bold text-sm">
                              Rs. {(item.price * item.qty).toLocaleString('en-IN')}.00
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right side: Shipping/summary info */}
                    <div className="bg-brand-bg-cream/40 border border-brand-border p-6 space-y-6 self-start">
                      <div>
                        <h4 className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2">Shipping Coordinate</h4>
                        <p className="text-xs font-semibold leading-relaxed">
                          {selectedOrder.customerDetails?.name || selectedOrder.user?.name}<br />
                          {selectedOrder.shippingAddress.address}<br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br />
                          {selectedOrder.shippingAddress.country}
                        </p>
                      </div>

                      <hr className="border-brand-border" />

                      <div>
                        <h4 className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-3">Invoice Details</h4>
                        <div className="space-y-2 text-xs font-semibold text-brand-muted font-heading">
                          <div className="flex justify-between">
                            <span>Items Subtotal</span>
                            <span className="text-brand-charcoal">Rs. {selectedOrder.itemsPrice.toLocaleString('en-IN')}.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping Fee</span>
                            <span className="text-brand-charcoal">
                              {selectedOrder.shippingPrice === 0 ? 'FREE' : `Rs. ${selectedOrder.shippingPrice.toLocaleString('en-IN')}.00`}
                            </span>
                          </div>
                          <hr className="border-brand-border" />
                          <div className="flex justify-between text-brand-charcoal font-bold">
                            <span>Total Price</span>
                            <span className="text-sm text-[#729855]">Rs. {selectedOrder.totalPrice.toLocaleString('en-IN')}.00</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                /* Orders List View */
                <div className="bg-white border border-brand-border p-6 md:p-8">
                  {loadingOrders ? (
                    <Loader />
                  ) : orders.length === 0 ? (
                    <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                      <ClipboardList className="w-12 h-12 text-brand-border mx-auto" />
                      <h3 className="serif-title text-lg text-brand-charcoal">No Orders Found</h3>
                      <p className="text-brand-muted text-xs leading-relaxed">You haven't placed any orders yet. Visit our product listing and complete checkout to get started!</p>
                      <Link to="/collections/all" className="bg-brand-charcoal text-white hover:bg-brand-button-hover px-6 py-2.5 font-heading font-bold text-xs uppercase tracking-widest transition-all inline-block">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div>
                      {/* Desktop Table View */}
                      <table className="hidden md:table w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-brand-border font-heading font-bold text-[10px] uppercase tracking-wider text-brand-muted">
                            <th className="pb-3">Order Number</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Items</th>
                            <th className="pb-3 text-right">Total</th>
                            <th className="pb-3 text-center">Payment</th>
                            <th className="pb-3 text-center">Status</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40 font-semibold text-brand-charcoal">
                          {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-brand-bg-cream/20">
                              <td className="py-4 font-mono font-bold text-brand-green">{order.orderNumber}</td>
                              <td className="py-4 text-brand-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="py-4 max-w-[200px] truncate text-brand-muted">
                                {order.orderItems.map(item => `${item.title} (${item.qty})`).join(', ')}
                              </td>
                              <td className="py-4 text-right font-mono">Rs. {order.totalPrice.toLocaleString('en-IN')}.00</td>
                              <td className="py-4 text-center">
                                <span className={`inline-block px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider ${
                                  order.paymentStatus === 'Paid' 
                                    ? 'bg-green-100 text-brand-green' 
                                    : (order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                              <td className="py-4 text-center">
                                <span className={`inline-block px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider ${
                                  order.orderStatus === 'Cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : (order.orderStatus === 'Delivered' ? 'bg-green-100 text-brand-green' : 'bg-blue-100 text-blue-700')
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </td>
                              <td className="py-4 text-right space-x-2">
                                <button 
                                  onClick={() => setSelectedOrder(order)}
                                  className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white px-3 py-1.5 font-heading font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer bg-transparent"
                                >
                                  Track
                                </button>
                                <button 
                                  onClick={() => setViewInvoice(order)}
                                  className="bg-brand-charcoal text-white hover:bg-brand-button-hover px-3 py-1.5 font-heading font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer border-none"
                                >
                                  Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Mobile Cards View */}
                      <div className="md:hidden grid grid-cols-1 gap-4">
                        {orders.map((order) => (
                          <div key={order._id} className="bg-brand-bg-cream/25 border border-brand-border p-4 space-y-4">
                            <div className="flex justify-between items-center border-b border-brand-border pb-2">
                              <span className="font-mono font-bold text-brand-green">#{order.orderNumber}</span>
                              <span className="text-[11px] text-brand-muted">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-muted">Items</p>
                              <p className="text-xs text-brand-charcoal font-medium line-clamp-2">
                                {order.orderItems.map(item => `${item.title} (${item.qty})`).join(', ')}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-muted">Payment</p>
                                <span className={`inline-block px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider mt-1 ${
                                  order.paymentStatus === 'Paid' 
                                    ? 'bg-green-100 text-brand-green' 
                                    : (order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                              <div>
                                <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-muted">Status</p>
                                <span className={`inline-block px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider mt-1 ${
                                  order.orderStatus === 'Cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : (order.orderStatus === 'Delivered' ? 'bg-green-100 text-brand-green' : 'bg-blue-100 text-blue-700')
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-brand-border/40 gap-2">
                              <span className="font-mono font-bold text-sm">Rs. {order.totalPrice.toLocaleString('en-IN')}.00</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setSelectedOrder(order)}
                                  className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white px-3 py-1.5 font-heading font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer bg-white"
                                >
                                  Track
                                </button>
                                <button 
                                  onClick={() => setViewInvoice(order)}
                                  className="bg-brand-charcoal text-white hover:bg-brand-button-hover px-3 py-1.5 font-heading font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer border-none"
                                >
                                  Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TABS 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white border border-brand-border p-6 md:p-8 space-y-6">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal border-b border-brand-border pb-3">Your Saved Shipping Address</h3>
              
              {addresses.length === 0 ? (
                <div className="py-10 text-center max-w-sm mx-auto space-y-2">
                  <MapPin className="w-10 h-10 text-brand-border mx-auto" />
                  <p className="text-brand-muted text-xs leading-relaxed">No default coordinates stored. Add your delivery address during check out and it will automatically sync here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr, idx) => (
                    <div key={idx} className={`p-4 border ${addr.isDefault ? 'border-[#729855] bg-brand-bg-cream/20' : 'border-brand-border'} font-semibold text-xs leading-relaxed space-y-2`}>
                      <div className="flex justify-between items-center">
                        <span className="font-heading uppercase tracking-wider text-brand-muted text-[10px]">Address Slot {idx + 1}</span>
                        {addr.isDefault && (
                          <span className="font-heading text-[8px] font-bold uppercase tracking-widest bg-[#729855] text-white px-2 py-0.5">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-brand-charcoal">
                        {addr.addressLine1}<br />
                        {addr.addressLine2 && `${addr.addressLine2}\n`}
                        {addr.city}, {addr.state && `${addr.state}, `}{addr.postalCode}<br />
                        {addr.country}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TABS 3: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-brand-border p-6 md:p-8">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal border-b border-brand-border pb-3 mb-6">Profile Settings</h3>
              
              <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-6">
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                  />
                </div>

                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-border/40">
                  <div>
                    <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">New Password (optional)</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingSettings}
                  className="bg-brand-charcoal hover:bg-brand-button-hover text-white px-8 py-3.5 font-heading font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  {submittingSettings ? <Loader size="small" /> : 'Save Settings'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Profile;
