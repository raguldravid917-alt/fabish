import React, { useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, ArrowLeft, Send, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { getLocalImageUrl } from '../utils/imageMapper';
import { productService } from '../api/productService';
import { reviewService } from '../api/reviewService';

const ProductDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery and Detail options
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('50 ml');

  // Magnifier zoom states
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center' });
  const [isZoomed, setIsZoomed] = useState(false);

  // Specifications tabs
  const [activeTab, setActiveTab] = useState('description');

  // Sticky bottom Add to Cart bar
  const [showStickyBar, setShowStickyBar] = useState(false);

  // New review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState('');
  const [reviewSubmitError, setReviewSubmitError] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const pRes = await productService.getBySlug(slug);
        if (!pRes.success || !pRes.data) {
          throw new Error('Product not found');
        }
        const pData = pRes.data;
        setProduct(pData);
        setMainImage(pData.images?.[0] || 'https://via.placeholder.com/500x625');
        setQuantity(1);

        const rRes = await reviewService.getByProduct(pData._id);
        if (rRes.success) {
          setReviews(rRes.data || []);
        }

        const catFilter = typeof pData.category === 'object' ? pData.category?._id : pData.category;
        const relRes = await productService.getAll({ category: catFilter, limit: 5 });
        if (relRes.success) {
          setRelatedProducts(relRes.data?.filter(p => p._id !== pData._id).slice(0, 4) || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitError('');
    setReviewSubmitSuccess('');

    if (!comment.trim()) {
      setReviewSubmitError('Please enter a review comment');
      return;
    }

    try {
      const res = await reviewService.create({ rating, comment, product: product._id });

      if (res.success) {
        setReviewSubmitSuccess('Thank you! Your review has been added.');
        showToast('Review submitted successfully!', 'success');
        setComment('');
        
        const rRes = await reviewService.getByProduct(product._id);
        if (rRes.success) {
          setReviews(rRes.data || []);
        }
        
        const pRes = await productService.getBySlug(slug);
        if (pRes.success) {
          setProduct(pRes.data);
        }
      } else {
        setReviewSubmitError(res.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewSubmitError('Connection failed. Please try again.');
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`${quantity}x ${product.title} added to cart`, 'success');
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center bg-[#f7f6f0] min-h-screen flex flex-col items-center justify-center px-6">
        <h2 className="serif-title text-2xl text-[#111] mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-8 font-body">The product you are looking for might have been removed or doesn't exist.</p>
        <Link to="/collections/all" className="bg-black hover:bg-[#729855] text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors duration-300">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const isSoldOut = product.stock === 0;

  return (
    <div className="bg-[#ffffff] pt-[50px] pb-[80px] min-h-screen font-body select-none">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Breadcrumbs */}
        <div className="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mb-8">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/collections/${typeof product.category === 'object' ? product.category?.slug : product.category}`} className="hover:text-black transition-colors">
            {typeof product.category === 'object' ? product.category?.name : product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{product.title}</span>
        </div>

        {/* Product Layout - 2-Column Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 mb-20 items-start">
          
          {/* Left Column: Media Gallery */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-[90px] space-y-4">
            <div 
              className="w-full aspect-[6/7] overflow-hidden select-none bg-[#f6f5ea] cursor-zoom-in relative"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => {
                setIsZoomed(false);
                setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' });
              }}
            >
              <img 
                src={getLocalImageUrl(mainImage)} 
                alt={product.title} 
                className="w-full h-full object-cover transition-transform duration-100 ease-out mix-blend-darken" 
                style={isZoomed ? zoomStyle : {}}
              />
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-24 bg-[#f6f5ea] border overflow-hidden transition-all select-none p-0 cursor-pointer ${
                      mainImage === img ? 'border-black ring-1 ring-black' : 'border-transparent hover:border-black'
                    }`}
                  >
                    <img src={getLocalImageUrl(img)} alt={`${product.title} thumb ${idx}`} className="w-full h-full object-cover mix-blend-darken" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0 flex flex-col">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#729855] mb-2 block">
              {typeof product.category === 'object' ? product.category?.name : product.category}
            </span>
            
            <h1 className="font-heading text-[32px] md:text-[38px] font-medium leading-[1.2] text-black mb-[15px] tracking-tight">
              {product.title}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-1.5 mb-6 select-none">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-500 font-heading font-bold uppercase tracking-widest ml-1">
                {product.ratings.toFixed(1)} / ({reviews.length} Reviews)
              </span>
            </div>

            {/* Price */}
            <div className="font-sans text-lg text-black mt-2 mb-6 border-b border-[#eae8d8] pb-6 flex items-baseline gap-3">
              {product.comparePrice > product.price && (
                <span className="text-gray-400 line-through text-base">
                  Rs. {product.comparePrice.toLocaleString('en-IN')}.00
                </span>
              )}
              <span className="font-semibold text-xl">
                Rs. {product.price.toLocaleString('en-IN')}.00 INR
              </span>
            </div>

            {/* Short Description */}
            <p className="font-body text-base leading-relaxed text-[#333] mb-6">
              {product.description}
            </p>

            {/* Variant Selector */}
            <div className="space-y-6 mb-8 select-none border-t border-[#eae8d8] pt-6">
              <div>
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black mb-3">
                  Volume Options
                </h4>
                <div className="flex gap-3 text-xs font-heading font-bold uppercase tracking-wider">
                  {['50 ml', '100 ml'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 font-body text-sm cursor-pointer border transition-all ${
                        selectedSize === size 
                          ? 'border-black bg-black text-white' 
                          : 'border-[#eae8d8] bg-[#fcfcfa] text-black hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Actions Wrapper */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6">
                {!isSoldOut && (
                  <div className="flex items-center border border-[#eae8d8] h-11 select-none bg-[#fcfcfa] w-full sm:w-32 justify-between flex-shrink-0">
                    <button 
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                      className="w-10 h-full flex items-center justify-center font-semibold text-lg border-none bg-transparent cursor-pointer hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-sans text-sm font-semibold">
                      {quantity}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} 
                      className="w-10 h-full flex items-center justify-center font-semibold text-lg border-none bg-transparent cursor-pointer hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Add to Cart / Wishlist buttons */}
                <div className="flex gap-3 flex-grow items-center">
                  {isSoldOut ? (
                    <button
                      disabled
                      className="flex-grow h-11 flex items-center justify-center bg-gray-300 text-gray-500 text-[11px] font-bold tracking-[0.2em] uppercase border-none cursor-not-allowed"
                    >
                      Sold Out
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="flex-grow h-11 flex items-center justify-center bg-[#2f3e10] hover:bg-black text-white font-heading text-[11px] font-bold tracking-[0.2em] uppercase border-none cursor-pointer transition-colors duration-300"
                    >
                      Add to Cart
                    </button>
                  )}
                  
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`w-12 h-11 flex items-center justify-center border transition-all cursor-pointer flex-shrink-0 ${
                      isWishlisted 
                        ? 'bg-black border-black text-white' 
                        : 'bg-[#fcfcfa] border-[#eae8d8] text-black hover:border-black'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className="w-[18px] h-[18px]" fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>

            {/* Shipping & Return info */}
            <div className="text-[13px] text-gray-500 mt-2 pb-6 border-b border-[#eae8d8] flex items-center gap-2">
              <span className="font-semibold text-black">Delivery Details:</span>
              <span>Free Shipping on all orders over Rs. 1,000. Under 2-5 business days.</span>
            </div>

            {/* Specs & Description Tabs */}
            <div className="mt-8">
              <div className="flex border-b border-[#eae8d8] gap-6 text-xs font-heading font-bold uppercase tracking-widest select-none overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
                <button 
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'description' ? 'border-[#729855] text-black' : 'border-transparent text-gray-400 hover:text-black'
                  }`}
                >
                  Description
                </button>
                <button 
                  onClick={() => setActiveTab('specifications')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'specifications' ? 'border-[#729855] text-black' : 'border-transparent text-gray-400 hover:text-black'
                  }`}
                >
                  Specifications
                </button>
                <button 
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'shipping' ? 'border-[#729855] text-black' : 'border-transparent text-gray-400 hover:text-black'
                  }`}
                >
                  Shipping & Returns
                </button>
              </div>

              <div className="py-6 text-sm text-[#444] leading-relaxed">
                {activeTab === 'description' && (
                  <p>{product.description}</p>
                )}
                {activeTab === 'specifications' && (
                  <div className="space-y-2.5">
                    <p><span className="font-semibold text-black">Product Category:</span> {typeof product.category === 'object' ? product.category?.name : product.category}</p>
                    <p><span className="font-semibold text-black">Availability Status:</span> {product.stock > 0 ? `In Stock (${product.stock} items left)` : 'Out of Stock'}</p>
                    <p><span className="font-semibold text-black">Tags:</span> {product.tags && product.tags.join(', ')}</p>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-2">
                    <p>✓ Paraben-Free, Sulfate-Free, 100% Organic ingredients.</p>
                    <p>✓ Shipped in sustainable, biodegradable outer casing boxes.</p>
                    <p>✓ 15-day return option if seals remain unbroken.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <section className="bg-white border-t border-[#eae8d8] pt-12 pb-8 mb-20">
          <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-8">Customer Reviews ({reviews.length})</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-6 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No reviews yet for this product. Be the first to leave one!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-[#eae8d8] pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-heading font-bold text-xs text-black uppercase tracking-wider">{rev.user?.name || rev.name || 'Verified Customer'}</h4>
                      <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3 select-none">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[#333] text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Submit review form */}
            <div>
              {user ? (
                <div className="bg-[#F9F9EB] border border-[#eae8d8] p-6">
                  <h3 className="font-heading font-bold text-xs text-black uppercase tracking-widest mb-4 border-b border-[#eae8d8] pb-2">Write A Review</h3>
                  
                  {reviewSubmitSuccess && (
                    <div className="bg-green-50 border border-[#729855] text-[#2f3e10] px-4 py-3 text-xs font-semibold mb-4 text-center">
                      {reviewSubmitSuccess}
                    </div>
                  )}
                  {reviewSubmitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-semibold mb-4 text-center">
                      {reviewSubmitError}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Rating</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full border border-[#eae8d8] bg-white px-3 py-2 font-heading font-semibold text-xs uppercase tracking-wider focus:outline-none rounded-none cursor-pointer"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Good</option>
                        <option value={2}>2 Stars - Fair</option>
                        <option value={1}>1 Star - Poor</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Comment</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Write your product experience here..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border border-[#eae8d8] px-4 py-3 font-body text-sm text-black focus:outline-none focus:border-[#729855] bg-white rounded-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#2f3e10] text-white hover:bg-black py-3 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                    >
                      Submit Review <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-[#F9F9EB] border border-[#eae8d8] p-6 text-center">
                  <p className="font-heading text-xs text-gray-500 mb-4 uppercase tracking-wider leading-relaxed">Please sign in to write customer reviews.</p>
                  <Link to="/account/login" className="bg-black text-white px-6 py-2.5 font-heading font-bold text-xs uppercase tracking-widest inline-block transition-all no-underline">
                    Sign In
                  </Link>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-[#eae8d8] pt-12">
            <div className="border-b border-[#eae8d8] pb-4 mb-8">
              <span className="text-xs font-heading font-bold tracking-widest text-[#729855] uppercase block">Recommended Products</span>
              <h2 className="serif-title text-2xl text-black uppercase">Related Collection Items</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Sticky Bottom Add to Cart Bar */}
      <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-[#eae8d8] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-3 px-4 md:px-12 z-[1000] transition-all duration-300 transform flex items-center justify-between ${
        showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="hidden sm:flex items-center gap-4">
          <img src={getLocalImageUrl(mainImage)} alt={product.title} className="w-10 h-12 object-cover bg-[#f6f5ea] mix-blend-darken" />
          <div className="text-left">
            <h4 className="font-heading font-bold text-sm text-black truncate max-w-xs leading-snug">{product.title}</h4>
            <span className="text-xs text-[#729855] font-bold">Rs. {product.price.toLocaleString('en-IN')}.00</span>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          {!isSoldOut && (
            <div className="flex items-center border border-[#eae8d8] h-10 select-none bg-[#fcfcfa]">
              <button 
                type="button" 
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                className="px-3 hover:bg-gray-100 h-full flex items-center justify-center font-bold border-none bg-transparent cursor-pointer"
              >-</button>
              <span className="px-4 text-xs font-bold text-black">{quantity}</span>
              <button 
                type="button" 
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} 
                className="px-3 hover:bg-gray-100 h-full flex items-center justify-center font-bold border-none bg-transparent cursor-pointer"
              >+</button>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`h-10 px-6 sm:px-8 flex-grow sm:flex-grow-0 flex items-center justify-center text-white font-heading font-bold text-xs uppercase tracking-widest transition-all border-none cursor-pointer ${
              isSoldOut ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#2f3e10] hover:bg-black'
            }`}
          >
            {isSoldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
