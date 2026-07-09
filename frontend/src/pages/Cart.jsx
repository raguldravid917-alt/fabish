import React, { useContext, useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, CreditCard, Landmark, Truck } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { getLocalImageUrl } from '../utils/imageMapper';
import { orderService } from '../api/orderService';

const Cart = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCheckoutMode = searchParams.get('checkout') === 'true';

  const { user, token } = useContext(AuthContext);
  const { cartItems, updateQty, removeFromCart, clearCart, itemsPrice, shippingPrice, totalPrice } = useContext(CartContext);

  // Checkout Form State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  // Card mock state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Status state
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [error, setError] = useState('');

  const loadScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/account/login?redirect=/cart?checkout=true');
      return;
    }

    if (!address.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      setError('Please fill out all shipping address fields.');
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
          address,
          city,
          postalCode,
          country,
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
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
          handler: async function (response) {
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
            ondismiss: function () {
              setError('Payment cancelled.');
              setSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setError(response.error.description || 'Payment execution failed.');
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
      setError(err.message || 'An unexpected connection error occurred.');
      setSubmitting(false);
    }
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
            <div><span className="text-brand-muted">Total Price:</span> Rs. {orderCreated.totalPrice.toLocaleString('en-IN')}.00</div>
            <div><span className="text-brand-muted">Payment status:</span> {orderCreated.paymentStatus} {orderCreated.paidAt ? `(${new Date(orderCreated.paidAt).toLocaleDateString()})` : ''}</div>
            <div><span className="text-brand-muted">Ship to:</span> {orderCreated.shippingAddress?.address}, {orderCreated.shippingAddress?.city}</div>
          </div>

          <div className="flex gap-4 justify-center">
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
    <div className="bg-[#f7f6f0] pt-12 pb-28 lg:pb-12 min-h-screen font-body text-base">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left side: Cart List or Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {!isCheckoutMode ? (
                /* Cart Items List View */
                <div className="bg-white border border-brand-border p-6 md:p-8 space-y-6">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex flex-col sm:flex-row gap-6 border-b border-brand-border pb-6 last:border-0 last:pb-0">
                      <img src={getLocalImageUrl(item.images?.[0])} alt={item.title} className="w-24 h-28 object-cover bg-brand-gray-light self-center sm:self-start" />
                      
                      <div className="flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-heading font-bold text-base text-brand-charcoal leading-snug hover:text-brand-green">
                              <Link to={`/products/${item.slug}`}>{item.title}</Link>
                            </h3>
                            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-muted mt-1 block">{typeof item.category === 'object' ? item.category?.name : item.category}</span>
                          </div>
                          <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 p-2 -mr-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between mt-auto gap-4">
                          <div className="flex items-center border border-brand-border font-bold h-11 bg-white">
                            <button onClick={() => updateQty(item._id, item.qty - 1)} className="h-full px-4 text-brand-muted hover:text-brand-charcoal flex items-center justify-center cursor-pointer border-none bg-transparent">-</button>
                            <span className="px-4 text-sm text-brand-charcoal">{item.qty}</span>
                            <button onClick={() => updateQty(item._id, item.qty + 1)} className="h-full px-4 text-brand-muted hover:text-brand-charcoal flex items-center justify-center cursor-pointer border-none bg-transparent">+</button>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-brand-muted font-heading">Rs. {item.price.toLocaleString('en-IN')}.00 each</span>
                            <span className="font-heading font-semibold text-base">Rs. {(item.price * item.qty).toLocaleString('en-IN')}.00</span>
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
                    
                    {/* Shipping Fields */}
                    <div>
                      <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Address</label>
                      <input
                        type="text"
                        required
                        placeholder="123 Leafy Lane"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">City</label>
                        <input
                          type="text"
                          required
                          placeholder="New York"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                        />
                      </div>
                      <div>
                        <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Postal Code</label>
                        <input
                          type="text"
                          required
                          placeholder="10001"
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
                          placeholder="United States"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                        />
                      </div>
                    </div>

                    {/* Payment choice */}
                    <div className="pt-4 border-t border-brand-border">
                      <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal mb-4">Payment Method</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('Card')}
                          className={`flex items-center justify-center gap-2 py-4 border font-heading font-bold text-xs uppercase tracking-wider select-none transition-all ${
                            paymentMethod === 'Card'
                              ? 'border-brand-charcoal bg-brand-charcoal text-white'
                              : 'border-brand-border text-brand-muted hover:border-brand-charcoal'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" /> Credit/Debit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('COD')}
                          className={`flex items-center justify-center gap-2 py-4 border font-heading font-bold text-xs uppercase tracking-wider select-none transition-all ${
                            paymentMethod === 'COD'
                              ? 'border-brand-charcoal bg-brand-charcoal text-white'
                              : 'border-brand-border text-brand-muted hover:border-brand-charcoal'
                          }`}
                        >
                          <Landmark className="w-4 h-4" /> Cash on Delivery
                        </button>
                      </div>
                    </div>

                    {/* Card fields if Card chosen */}
                    {paymentMethod === 'Card' && (
                      <div className="p-4 bg-brand-bg-cream border border-brand-border space-y-4">
                        <div>
                          <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Card Number (Mock)</label>
                          <input
                            type="text"
                            required
                            placeholder="4111 2222 3333 4444"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full border border-brand-border bg-white px-4 py-3 font-body text-base focus:outline-none rounded-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Expiration</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full border border-brand-border bg-white px-4 py-3 font-body text-base focus:outline-none rounded-none"
                            />
                          </div>
                          <div>
                            <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">CVV</label>
                            <input
                              type="password"
                              required
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full border border-brand-border bg-white px-4 py-3 font-body text-base focus:outline-none rounded-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

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
                        {submitting ? <Loader size="small" /> : 'Pay and Place Order'}
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>

            {/* Right side: Summary Column */}
            <div>
              <div className="bg-white border border-brand-border p-6 md:p-8 space-y-6 sticky top-28">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-brand-charcoal border-b border-brand-border pb-4">Order Summary</h3>
                
                <div className="space-y-4 text-sm font-semibold text-brand-muted font-heading">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-brand-charcoal">Rs. {itemsPrice.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-brand-charcoal">
                      {shippingPrice === 0 ? 'FREE' : `Rs. ${shippingPrice.toLocaleString('en-IN')}.00`}
                    </span>
                  </div>
                  <hr className="border-brand-border" />
                  <div className="flex justify-between text-base font-bold text-brand-charcoal">
                    <span>Total Amount</span>
                    <span className="text-lg">Rs. {totalPrice.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                {!isCheckoutMode ? (
                  <Link
                    to="/cart?checkout=true"
                    className="w-full text-center bg-brand-charcoal text-white hover:bg-brand-button-hover py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 block"
                  >
                    Proceed To Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  user ? (
                    <div className="bg-green-50 border border-green-200 p-4 text-xs font-heading font-semibold text-brand-green uppercase tracking-wider text-center leading-relaxed">
                      Secured SSL Checkout active. Enter shipping coordinates on the form.
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 p-4 text-center">
                      <p className="font-heading text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-3 leading-relaxed">Please sign in to place order.</p>
                      <Link to="/account/login?redirect=/cart?checkout=true" className="bg-brand-charcoal text-white px-6 py-2.5 font-heading font-bold text-xs uppercase tracking-widest inline-block transition-all">
                        Sign In
                      </Link>
                    </div>
                  )
                )}

                <div className="text-center font-heading text-[10px] text-brand-muted uppercase tracking-wider leading-relaxed pt-2">
                  <span className="block font-bold mb-1">Free Delivery Threshold:</span>
                  Spend Rs. 2,000 or more to skip shipping costs!
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Sticky Bottom Checkout Bar for Mobile (Cart View Only) */}
      {!isCheckoutMode && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-brand-border shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-3.5 px-6 z-40 flex items-center justify-between lg:hidden select-none">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-brand-muted uppercase tracking-wider font-heading font-bold">Total Amount</span>
            <span className="font-sans text-base font-bold text-brand-charcoal">Rs. {totalPrice.toLocaleString('en-IN')}.00</span>
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
            <span className="font-sans text-base font-bold text-brand-charcoal">Rs. {totalPrice.toLocaleString('en-IN')}.00</span>
          </div>
          {user ? (
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="bg-[#2f3e10] hover:bg-black text-white h-11 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
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
    </div>
  );
};

export default Cart;
