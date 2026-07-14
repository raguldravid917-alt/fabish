import React, { useContext, useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, ArrowRight, ArrowLeft, CreditCard, Landmark,
  Truck, Heart, Eye, Star, X,
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import { getLocalImageUrl } from '../utils/imageMapper';
import { orderService } from '../api/orderService';
import { addressService } from '../api/addressService';
import { useToast } from '../context/ToastContext';
import { productService } from '../api/productService';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const formatINR = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}.00`;

const Cart = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCheckoutMode = searchParams.get('checkout') === 'true';

  const { showToast } = useToast();
  const { user } = useContext(AuthContext);
  const {
    cartItems, updateQty, removeFromCart, clearCart, addToCart, itemsPrice,
    shippingPrice, totalPrice, appliedCoupon, discountAmount,
    couponError, couponLoading, applyCoupon, removeCoupon,
  } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when quick view opens
  useEffect(() => {
    if (quickViewProduct) setQuantity(1);
  }, [quickViewProduct]);

  // Fetch suggested products to keep the page interactive
  useEffect(() => {
    let isMounted = true;
    const fetchSuggested = async () => {
      try {
        const res = await productService.getAll({ limit: 4 });
        if (isMounted && res.success) setSuggestedProducts(res.data || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };
    fetchSuggested();
    return () => { isMounted = false; };
  }, []);

  // Checkout Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [addressType, setAddressType] = useState('Home');
  const [paymentMethod, setPaymentMethod] = useState('Card');

  // Address Book Integration States
  const [saveAddress, setSaveAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [redeemChecked, setRedeemChecked] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  // Status state
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [error, setError] = useState('');

  const applyAddressToForm = (addr) => {
    setFullName(addr.fullName || user?.name || '');
    setPhone(addr.phone || user?.phone || '');
    setAddress(addr.addressLine1 || '');
    setAddressLine2(addr.addressLine2 || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPostalCode(addr.postalCode || '');
    setCountry(addr.country || 'India');
    setAddressType(addr.addressType || 'Home');
  };

  // Fetch saved addresses if logged in and in checkout mode
  useEffect(() => {
    let isMounted = true;
    const fetchCheckoutAddresses = async () => {
      if (!user || !isCheckoutMode) return;
      try {
        const res = await addressService.getAddresses();
        if (!isMounted || !res.success || !res.data) return;

        const addrs = res.data;
        setSavedAddresses(addrs);

        const defaultAddr = addrs.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          applyAddressToForm(defaultAddr);
        } else if (addrs.length > 0) {
          setSelectedAddressId(addrs[0]._id);
          applyAddressToForm(addrs[0]);
        } else {
          setSelectedAddressId('new');
        }
      } catch (err) {
        console.error('Failed to load checkout addresses:', err);
      }
    };

    fetchCheckoutAddresses();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isCheckoutMode]);

  const handleAddressSelectChange = (e) => {
    const addrId = e.target.value;
    setSelectedAddressId(addrId);

    if (addrId === 'new') {
      setFullName(user?.name || '');
      setPhone(user?.phone || '');
      setAddress('');
      setAddressLine2('');
      setLandmark('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('India');
      setAddressType('Home');
    } else {
      const selected = savedAddresses.find((a) => a._id === addrId);
      if (selected) applyAddressToForm(selected);
    }
  };

  // Coupon UI states
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCouponClick = async () => {
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput.trim());
    if (res.success) {
      showToast(res.message, 'success');
      setCouponInput('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const loadScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const baseOrderVal = itemsPrice + shippingPrice - discountAmount;
  const maxPointsToRedeem = user ? Math.min(user.rewardPoints || 0, Math.floor(baseOrderVal * 2)) : 0;
  const pointsDiscount = redeemChecked ? Math.min(pointsToRedeem, maxPointsToRedeem) / 10 : 0;
  const finalTotalPrice = Math.max(0, baseOrderVal - pointsDiscount);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/account/login?redirect=/cart?checkout=true');
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter recipient full name.');
      return;
    }

    if (!phone.trim() || !phone.trim().match(/^\+?[0-9\s-]{10,15}$/)) {
      setError('Please enter a valid 10-to-15 digit phone number.');
      return;
    }

    if (!address.trim()) {
      setError('Please fill out the shipping address field.');
      return;
    }

    if (!city.trim()) {
      setError('Please fill out the city field.');
      return;
    }

    if (!state.trim()) {
      setError('Please select or enter the state.');
      return;
    }

    if (!postalCode.trim() || !postalCode.trim().match(/^[a-zA-Z0-9\s-]{3,10}$/)) {
      setError('Please enter a valid PIN / Postal code (3-10 characters).');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          title: item.title,
          qty: item.qty,
          image: item.images?.[0]?.secure_url || item.images?.[0] || '',
          price: item.price,
          product: item._id,
        })),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          addressLine1: address.trim(),
          addressLine2: addressLine2.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          addressType,
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice: finalTotalPrice,
        redeemedPoints: redeemChecked ? pointsToRedeem : undefined,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        saveAddress,
      };

      if (paymentMethod === 'Card') {
        const scriptLoaded = await loadScript();
        if (!scriptLoaded) {
          setError('Failed to load Razorpay payment gateway. Please check your internet connection.');
          setSubmitting(false);
          return;
        }

        const rzpRes = await orderService.createRazorpayOrder(orderData);
        if (!rzpRes.success) {
          setError(rzpRes.message || 'Failed to initialize payment session.');
          setSubmitting(false);
          return;
        }

        const { razorpayOrderId, amount, currency, key } = rzpRes.data;

        const options = {
          key,
          amount,
          currency,
          name: 'Fabish',
          description: 'Secure Store Checkout',
          image: 'https://fabish-theme.myshopify.com/cdn/shop/files/Favicon.svg?crop=center&height=32&v=1710938085&width=32',
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              setSubmitting(true);
              const verifyRes = await orderService.verifyPayment({
                razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderData,
              });

              if (verifyRes.success) {
                setOrderCreated(verifyRes.data);
                clearCart();
              } else {
                setError(verifyRes.message || 'Payment verification failed.');
              }
            } catch (err) {
              console.error('Payment verification error:', err);
              setError('Failed to verify payment signature on the server.');
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#729855',
          },
          modal: {
            ondismiss: () => {
              setError('Payment cancelled.');
              setSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          setError(response.error?.description || 'Payment execution failed.');
          setSubmitting(false);
        });
        rzp.open();
      } else {
        // COD Route
        const res = await orderService.create(orderData);
        if (res.success) {
          setOrderCreated(res.data);
          clearCart();
        } else {
          setError(res.message || 'Failed to place Cash on Delivery order.');
        }
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.message || 'An unexpected connection error occurred.');
      setSubmitting(false);
    }
  };

  const handleAddSuggestedToCart = (product) => {
    if (!product || product.stock === 0) return;
    addToCart(product, 1);
    showToast(`Added ${product.title} to cart!`, 'success');
  };

  const handleToggleWishlist = (product) => {
    if (!user) {
      navigate('/account/login?redirect=/cart');
      return;
    }
    const wasWishlisted = isInWishlist(product._id);
    toggleWishlist(product);
    showToast(
      wasWishlisted ? `Removed ${product.title} from wishlist` : `Added ${product.title} to wishlist!`,
      'success'
    );
  };

  // If order was successfully completed
  if (orderCreated) {
    return (
      <div className="bg-[#f7f6f0] py-20 min-h-screen font-body flex items-center justify-center">
        <div className="bg-white border border-brand-border p-8 md:p-12 max-w-xl text-center shadow-lg">
          <div className="inline-flex p-4 bg-green-100 text-brand-green rounded-full mb-6">
            <Truck className="w-10 h-10" />
          </div>
          <h1 className="serif-title text-3xl text-brand-charcoal mb-4">Order Placed Successfully!</h1>
          <p className="text-brand-muted text-base leading-relaxed mb-6">
            Thank you for shopping with Fabish! Your order has been registered successfully.
            We will process and ship your items shortly.
          </p>

          <div className="bg-brand-bg-cream p-4 mb-8 text-left border border-brand-border font-heading text-xs font-semibold uppercase tracking-wider space-y-2 select-text">
            <div><span className="text-brand-muted">Order Number:</span> {orderCreated.orderNumber}</div>
            <div><span className="text-brand-muted">Total Price:</span> {formatINR(orderCreated.totalPrice)}</div>
            <div>
              <span className="text-brand-muted">Payment status:</span> {orderCreated.paymentStatus}{' '}
              {orderCreated.paidAt ? `(${new Date(orderCreated.paidAt).toLocaleDateString()})` : ''}
            </div>
            <div>
              <span className="text-brand-muted">Ship to:</span> {orderCreated.shippingAddress?.address}, {orderCreated.shippingAddress?.city}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {orderCreated.trackingNumber && (
              <Link to={`/orders/track?number=${orderCreated.trackingNumber}`} className="bg-[#2f3e10] hover:bg-black text-white px-6 py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all inline-block">
                Track Order
              </Link>
            )}
            <Link to="/account/profile?tab=orders" className="bg-[#729855] hover:bg-[#5a7d41] text-white px-6 py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all inline-block">
              View My Orders
            </Link>
            <Link to="/collections/all" className="bg-brand-charcoal hover:bg-brand-button-hover text-white px-6 py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all inline-block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f6f0] font-body text-base">
      {/* Main Content Wrapper */}
      <div className="pt-12 pb-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <h1 className="serif-title text-3xl md:text-4xl text-brand-charcoal border-b border-brand-border pb-6 mb-10 uppercase tracking-wide">
            {isCheckoutMode ? 'Secure Checkout' : 'Your Shopping Cart'}
          </h1>

          {cartItems.length === 0 ? (
            <div className="bg-white border border-brand-border py-20 px-6 text-center max-w-xl mx-auto shadow-md">
              <ShoppingBag className="w-16 h-16 text-brand-border mb-6 mx-auto" />
              <h2 className="serif-title text-xl text-brand-charcoal mb-4">Your Shopping Cart is Empty</h2>
              <p className="text-brand-muted mb-8">Add organic moisturizers or creams from our catalog to get started.</p>
              <Link to="/collections/all" className="bg-brand-charcoal text-white hover:bg-brand-button-hover px-8 py-3.5 font-heading font-bold text-xs uppercase tracking-widest transition-all inline-block">
                Shop Collections
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              <div className="flex-1 min-w-0 lg:self-start">
                {!isCheckoutMode ? (
                  <div className="bg-white border border-brand-border p-6 md:p-8 space-y-6">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex flex-col sm:flex-row gap-6 border-b border-brand-border pb-6 last:border-0 last:pb-0">
                        <img src={getLocalImageUrl(item.images?.[0])} alt={item.title} className="w-24 h-28 object-cover bg-brand-gray-light self-center sm:self-start" />
                        <div className="flex-grow flex flex-col">
                          <div className="flex justify-between items-start mb-2 text-left">
                            <div>
                              <h3 className="font-heading font-bold text-base text-brand-charcoal leading-snug hover:text-brand-green">
                                <Link to={`/products/${item.slug}`}>{item.title}</Link>
                              </h3>
                              {item.category && (typeof item.category === 'object' ? item.category.name : (!/^[0-9a-fA-F]{24}$/.test(item.category) ? item.category : null)) && (
                                <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-muted mt-1 block">
                                  {typeof item.category === 'object' ? item.category.name : item.category}
                                </span>
                              )}
                            </div>
                            <button type="button" onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 p-2 -mr-2 bg-transparent border-none cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-auto gap-4 pt-2">
                            <div className="flex items-center border border-brand-border font-bold h-9 sm:h-11 bg-white">
                              <button type="button" onClick={() => updateQty(item._id, item.qty - 1)} className="h-full px-2.5 sm:px-4 text-brand-muted hover:text-brand-charcoal flex items-center justify-center cursor-pointer border-none bg-transparent">-</button>
                              <span className="px-3 text-xs font-bold text-brand-charcoal">{item.qty}</span>
                              <button type="button" onClick={() => updateQty(item._id, item.qty + 1)} className="h-full px-2.5 sm:px-4 text-brand-muted hover:text-brand-charcoal flex items-center justify-center cursor-pointer border-none bg-transparent">+</button>
                            </div>
                            <div className="flex flex-col items-end text-right">
                              <span className="text-[10px] sm:text-xs text-brand-muted font-heading whitespace-nowrap">{formatINR(item.price)} each</span>
                              <span className="font-heading font-semibold text-sm sm:text-base whitespace-nowrap ml-2">{formatINR(item.price * item.qty)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Checkout Form View */
                  <div className="bg-white border border-brand-border p-6 md:p-8">
                    <h2 className="serif-title text-xl text-brand-charcoal border-b border-brand-border pb-4 mb-6">Shipping Information</h2>

                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-xs font-semibold mb-6 text-center">
                        {error}
                      </div>
                    )}

                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                      {/* Saved Address Selection Dropdown */}
                      {savedAddresses.length > 0 && (
                        <div className="bg-[#eae8d8]/30 border border-brand-border p-4 mb-4 space-y-2">
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
                            Select from Saved Addresses
                          </label>
                          <select
                            value={selectedAddressId}
                            onChange={handleAddressSelectChange}
                            className="w-full border border-brand-border px-3 py-2.5 font-body text-sm text-[#222] bg-white focus:outline-none focus:border-brand-green rounded-none"
                          >
                            {savedAddresses.map((addr) => (
                              <option key={addr._id} value={addr._id}>
                                [{addr.addressType || 'Home'}] {addr.fullName} — {addr.addressLine1}, {addr.city} {addr.isDefault ? '(Default)' : ''}
                              </option>
                            ))}
                            <option value="new">+ Ship to a new address</option>
                          </select>
                        </div>
                      )}

                      {/* Shipping Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Recipient Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Jane Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                          />
                        </div>
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Contact Phone Number</label>
                          <input
                            type="text"
                            required
                            placeholder="9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Address Line 1</label>
                        <input
                          type="text"
                          required
                          placeholder="123 Leafy Lane, Flat/House No"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Address Line 2 (optional)</label>
                          <input
                            type="text"
                            placeholder="Apartment, Colony, Area"
                            value={addressLine2}
                            onChange={(e) => setAddressLine2(e.target.value)}
                            className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                          />
                        </div>
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Landmark (optional)</label>
                          <input
                            type="text"
                            placeholder="Near Rose Pharmacy"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">City</label>
                          <input
                            type="text"
                            required
                            placeholder="Chennai"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                          />
                        </div>
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">State</label>
                          <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none bg-white"
                          >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">PIN Code</label>
                          <input
                            type="text"
                            required
                            placeholder="600001"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                          />
                        </div>
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Country</label>
                          <input
                            type="text"
                            required
                            placeholder="India"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pb-2">
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Address Slot Type</label>
                          <select
                            value={addressType}
                            onChange={(e) => setAddressType(e.target.value)}
                            className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none bg-white"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="pb-3 select-none">
                          <label className="flex items-center gap-2 cursor-pointer font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                            <input
                              type="checkbox"
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="border-brand-border text-brand-green focus:ring-brand-green w-4 h-4 rounded-none"
                            />
                            <span>Save Address to Address Book</span>
                          </label>
                        </div>
                      </div>

                      {/* Payment choice */}
                      <div className="pt-4 border-t border-brand-border">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal mb-4">Payment Method</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('Card')}
                            className={`flex items-center justify-center gap-2 py-4 border font-heading font-bold text-xs uppercase tracking-wider select-none transition-all ${paymentMethod === 'Card'
                              ? 'border-brand-charcoal bg-brand-charcoal text-white'
                              : 'border-brand-border text-brand-muted hover:border-brand-charcoal'
                              }`}
                          >
                            <CreditCard className="w-4 h-4" /> Online Payment (Razorpay)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('COD')}
                            className={`flex items-center justify-center gap-2 py-4 border font-heading font-bold text-xs uppercase tracking-wider select-none transition-all ${paymentMethod === 'COD'
                              ? 'border-brand-charcoal bg-brand-charcoal text-white'
                              : 'border-brand-border text-brand-muted hover:border-brand-charcoal'
                              }`}
                          >
                            <Landmark className="w-4 h-4" /> Cash on Delivery
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => navigate('/cart')}
                          className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white px-6 py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to Cart
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-grow bg-brand-charcoal text-white hover:bg-brand-button-hover py-4 font-heading font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          {submitting ? 'Processing...' : 'Pay and Place Order'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Right side: Summary Column */}
              <div className="bg-white border border-brand-border p-6 md:p-8 space-y-6 lg:sticky lg:top-[110px] w-full lg:w-[380px] lg:flex-shrink-0 lg:self-start">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-brand-charcoal border-b border-brand-border pb-4">Order Summary</h3>

                <div className="space-y-4 text-sm font-semibold text-brand-muted font-heading">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-brand-charcoal">{formatINR(itemsPrice)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#729855] select-text">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>- {formatINR(discountAmount)}</span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-[#729855]">
                      <span>Points Discount ({pointsToRedeem} pts)</span>
                      <span>- {formatINR(pointsDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-brand-charcoal">
                      {shippingPrice === 0 ? 'FREE' : formatINR(shippingPrice)}
                    </span>
                  </div>
                  <hr className="border-brand-border" />
                  <div className="flex justify-between text-base font-bold text-brand-charcoal">
                    <span>Total Amount</span>
                    <span className="text-lg">{formatINR(finalTotalPrice)}</span>
                  </div>
                </div>

                {/* Coupon Input */}
                <div className="border-t border-brand-border pt-4 space-y-3">
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted block">Promo Code</label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5 text-xs text-brand-green font-semibold rounded-none select-none">
                      <span>
                        {appliedCoupon.code} (
                        {appliedCoupon.discountType === 'Percentage'
                          ? `${appliedCoupon.discountPercentage}% OFF`
                          : appliedCoupon.discountType === 'FreeShipping'
                            ? 'FREE SHIPPING'
                            : `Rs. ${appliedCoupon.discountValue} OFF`}
                        )
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700 font-bold ml-2 text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer"
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER PROMO CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-grow border border-brand-border px-3 py-2 font-mono font-bold text-xs focus:outline-none focus:border-brand-green rounded-none uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCouponClick}
                        disabled={couponLoading || !couponInput.trim()}
                        className="bg-brand-charcoal hover:bg-brand-button-hover text-white text-[10px] font-heading font-bold uppercase tracking-widest px-4 py-2 disabled:opacity-50 transition-all rounded-none cursor-pointer"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <span className="text-red-500 text-[10px] block mt-1 font-semibold leading-normal">{couponError}</span>
                  )}
                </div>

                {isCheckoutMode && user && user.rewardPoints > 0 && (
                  <div className="border-t border-brand-border pt-4 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-brand-charcoal">
                      <input
                        type="checkbox"
                        checked={redeemChecked}
                        onChange={(e) => {
                          setRedeemChecked(e.target.checked);
                          setPointsToRedeem(e.target.checked ? maxPointsToRedeem : 0);
                        }}
                        className="border-brand-border text-brand-green focus:ring-brand-green rounded-none w-4 h-4"
                      />
                      <span>Redeem Reward Points</span>
                    </label>

                    {redeemChecked && (
                      <div className="space-y-2 animate-fade-in text-left">
                        <div className="text-xs text-brand-muted font-heading">
                          Available: <span className="font-bold text-brand-charcoal">{user.rewardPoints} points</span> (₹{(user.rewardPoints / 10).toFixed(0)})
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            max={maxPointsToRedeem}
                            placeholder="Points to redeem"
                            value={pointsToRedeem || ''}
                            onChange={(e) => {
                              const val = Math.min(maxPointsToRedeem, Math.max(0, parseInt(e.target.value, 10) || 0));
                              setPointsToRedeem(val);
                            }}
                            className="flex-grow border border-brand-border px-3 py-2 font-mono font-bold text-xs focus:outline-none focus:border-brand-green rounded-none bg-white"
                          />
                        </div>
                        <span className="text-[10px] text-brand-muted block mt-1 font-semibold leading-normal">
                          Max redeemable: {maxPointsToRedeem} points (₹{(maxPointsToRedeem / 10).toFixed(0)})
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {!isCheckoutMode ? (
                  <Link
                    to="/cart?checkout=true"
                    className="w-full text-center bg-brand-charcoal text-white hover:bg-brand-button-hover py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 block"
                  >
                    Proceed To Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : user ? (
                  <div className="bg-green-50 border border-green-200 p-4 text-xs font-heading font-semibold text-brand-green uppercase tracking-wider text-center leading-relaxed">
                    Secured SSL Checkout active. Enter shipping coordinates on the form.
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 p-4 text-center">
                    <p className="font-heading text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-3 leading-relaxed">
                      Please sign in to place order.
                    </p>
                    <Link
                      to="/account/login?redirect=/cart?checkout=true"
                      className="w-full text-center bg-brand-charcoal text-white hover:bg-brand-button-hover py-3 font-heading font-bold text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                    >
                      Sign In <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Products */}
      {!isCheckoutMode && suggestedProducts.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-16">
          <h2 className="serif-title text-2xl text-brand-charcoal border-b border-brand-border pb-4 mb-8 uppercase tracking-wide">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {suggestedProducts.map((prod) => (
              <div key={prod._id} className="group relative">
                <div className="relative overflow-hidden bg-brand-gray-light aspect-[3/4]">
                  <Link to={`/products/${prod.slug}`} className="block w-full h-full">
                    <img src={getLocalImageUrl(prod.images?.[0])} alt={prod.title} className="w-full h-full object-cover" />
                  </Link>

                  <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); handleToggleWishlist(prod); }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${isInWishlist(prod._id) ? 'bg-brand-charcoal text-white' : 'bg-white text-black hover:bg-black hover:text-white'
                        }`}
                      aria-label={isInWishlist(prod._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(prod._id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setQuickViewProduct(prod); }}
                      className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-colors text-black"
                      aria-label="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); handleAddSuggestedToCart(prod); }}
                      className="w-full py-3 bg-[#2f3e10] hover:bg-black text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-colors shadow-lg border-none cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                <div className="pt-4 pb-2 text-left">
                  <Link to={`/products/${prod.slug}`} className="block">
                    <h4
                      className="font-heading text-[13px] sm:text-sm font-bold text-brand-charcoal line-clamp-1 transition-colors hover:text-brand-green"
                    >
                      {prod.title}
                    </h4>
                  </Link>
                  <p className="mt-1.5 text-[13px] sm:text-sm font-semibold text-brand-muted">
                    {formatINR(prod.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Checkout Bar for Mobile (Cart View Only) */}
      {!isCheckoutMode && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-brand-border shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-3.5 px-6 z-40 flex items-center justify-between lg:hidden select-none">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-brand-muted uppercase tracking-wider font-heading font-bold">Total Amount</span>
            <span className="font-sans text-base font-bold text-brand-charcoal">{formatINR(totalPrice)}</span>
          </div>
          <Link
            to="/cart?checkout=true"
            className="bg-brand-charcoal hover:bg-brand-button-hover text-white h-11 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 no-underline"
          >
            Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Sticky Bottom Pay Bar for Mobile (Checkout View Only) */}
      {isCheckoutMode && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-brand-border shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-3.5 px-6 z-40 flex items-center justify-between lg:hidden select-none">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-brand-muted uppercase tracking-wider font-heading font-bold">Order Total</span>
            <span className="font-sans text-base font-bold text-brand-charcoal">{formatINR(totalPrice)}</span>
          </div>
          {user ? (
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="bg-[#2f3e10] hover:bg-black text-white h-11 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          ) : (
            <Link
              to="/account/login?redirect=/cart?checkout=true"
              className="bg-brand-charcoal hover:bg-brand-button-hover text-white h-11 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 no-underline"
            >
              Sign In
            </Link>
          )}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default" onClick={() => setQuickViewProduct(null)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl animate-fade-in-up z-10">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center text-brand-charcoal hover:text-brand-green bg-white/90 rounded-full shadow-md z-20 cursor-pointer border-none"
              title="Close Quick View"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full md:w-1/2 bg-brand-gray-light flex items-center justify-center p-6 md:p-12 relative group">
              <img src={getLocalImageUrl(quickViewProduct.images?.[0])} alt={quickViewProduct.title} className="max-h-[280px] md:max-h-[350px] w-auto object-contain" />
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-white text-left">
              <div className="mb-4 text-[10px] font-heading font-bold uppercase tracking-widest text-brand-muted">
                {typeof quickViewProduct.category === 'object' ? quickViewProduct.category?.name : quickViewProduct.category}
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-medium text-brand-charcoal mb-3">{quickViewProduct.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(quickViewProduct.ratings || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-xs text-brand-muted">({quickViewProduct.reviewsCount || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl font-semibold text-brand-charcoal">{formatINR(quickViewProduct.price)}</span>
                {quickViewProduct.comparePrice > quickViewProduct.price && (
                  <span className="text-sm line-through text-brand-muted">{formatINR(quickViewProduct.comparePrice)}</span>
                )}
              </div>
              <p className="text-sm text-brand-muted leading-relaxed mb-6 line-clamp-3 md:line-clamp-4">{quickViewProduct.description}</p>
              {quickViewProduct.stock > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 h-12">
                    <div className="flex items-center border border-brand-border h-full bg-white">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-full px-4 text-sm bg-transparent border-none hover:bg-gray-100 cursor-pointer font-bold flex items-center justify-center">-</button>
                      <span className="w-12 text-center text-sm font-bold text-brand-charcoal flex items-center justify-center h-full border-x border-brand-border">{quantity}</span>
                      <button type="button" onClick={() => setQuantity((q) => Math.min(quickViewProduct.stock, q + 1))} className="h-full px-4 text-sm bg-transparent border-none hover:bg-gray-100 cursor-pointer font-bold flex items-center justify-center">+</button>
                    </div>
                    <span className="text-xs text-brand-green font-semibold">In Stock ({quickViewProduct.stock} left)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(quickViewProduct, quantity);
                      setQuickViewProduct(null);
                      showToast(`Added ${quickViewProduct.title} to cart!`, 'success');
                    }}
                    className="w-full bg-[#2f3e10] hover:bg-[#729855] text-white py-4 px-6 font-heading text-xs font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer border-none h-12 flex items-center justify-center"
                  >
                    Add to Cart
                  </button>
                </div>
              ) : (
                <button disabled type="button" className="w-full bg-gray-300 text-gray-500 py-4 px-6 font-heading text-xs font-bold tracking-[0.2em] uppercase cursor-not-allowed border-none h-12">
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;