import React, { useState, useEffect, useCallback } from 'react';
import Loader from '../components/ui/Loader';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Heart, ShoppingBag, ArrowLeft, Send, Check, Shield, Truck,
  Sparkles, Smile, Award, HelpCircle, ChevronDown, ChevronUp,
  Info, Leaf, Zap, Clock, Tag, Package, RotateCcw, Lock,
  Droplets, Sun, Wind, ThumbsUp, CheckCircle, Copy, FlaskConical,
  Layers, Globe, Timer, AlarmClock, HandHeart, Beaker
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import FallbackContentSection from '../components/FallbackContentSection';
import { getLocalImageUrl } from '../utils/imageMapper';
import { productService } from '../api/productService';
import { reviewService } from '../api/reviewService';

// ─── Icon map for benefit / certification / trust-badge / whyLove icons ──────
const ICON_MAP = {
  Star, Heart, Shield, Truck, Sparkles, Smile, Award, Info, Leaf, Zap,
  Clock, Tag, Package, RotateCcw, Lock, Droplets, Sun, Wind, ThumbsUp,
  CheckCircle, FlaskConical, Layers, Globe, Timer, AlarmClock, HandHeart,
  Beaker, HelpCircle, ShoppingBag
};
const getIcon = (key, cls = 'w-5 h-5') => {
  const Ic = ICON_MAP[key] || Info;
  return <Ic className={cls} />;
};

// ─── Offer type badge colour ──────────────────────────────────────────────────
const OFFER_COLOURS = {
  coupon:  { bg: 'bg-[#f0faf0]', border: 'border-[#729855]', badge: 'bg-[#729855] text-white',  label: 'COUPON' },
  bundle:  { bg: 'bg-[#f5f0ff]', border: 'border-purple-400', badge: 'bg-purple-500 text-white', label: 'BUNDLE' },
  combo:   { bg: 'bg-[#fff8f0]', border: 'border-orange-400', badge: 'bg-orange-500 text-white', label: 'COMBO' },
  limited: { bg: 'bg-[#fff0f0]', border: 'border-red-400',    badge: 'bg-red-500 text-white',    label: 'LIMITED TIME' }
};

const ProductDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, isToggling } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery and Detail options
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');

  // Magnifier zoom states
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center' });
  const [isZoomed, setIsZoomed] = useState(false);

  // Sticky bottom Add to Cart bar
  const [showStickyBar, setShowStickyBar] = useState(false);

  // New review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState('');
  const [reviewSubmitError, setReviewSubmitError] = useState('');

  // Dynamic Product Content States
  const [dynamicContent, setDynamicContent] = useState(null);
  const [expandedFaqs, setExpandedFaqs] = useState([]);
  const [selectedFbt, setSelectedFbt] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  // Rating filter
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const pRes = await productService.getBySlug(slug);
        if (!pRes.success || !pRes.data) throw new Error('Product not found');
        const pData = pRes.data;
        setProduct(pData);
        setMainImage(pData.images?.[0]?.secure_url || pData.images?.[0] || 'https://via.placeholder.com/500x625');
        setQuantity(1);

        if (pData.variants && pData.variants.length > 0) {
          setSelectedVariant(pData.variants[0]);
          setSelectedSize(pData.variants[0].name);
        } else {
          setSelectedVariant(null);
          setSelectedSize('');
        }

        // ── Parallel data fetch for performance ────────────────────────────
        const [rRes, relRes, cRes] = await Promise.allSettled([
          reviewService.getByProduct(pData._id),
          productService.getRelated(pData._id, 8),
          productService.getContent(pData._id),
        ]);

        if (rRes.status === 'fulfilled' && rRes.value.success) {
          setReviews(rRes.value.data || []);
        }

        if (relRes.status === 'fulfilled' && relRes.value.success) {
          setRelatedProducts(relRes.value.data || []);
        }

        if (cRes.status === 'fulfilled' && cRes.value.success && cRes.value.data) {
          setDynamicContent(cRes.value.data);
          if (cRes.value.data.frequentlyBoughtTogether) {
            setSelectedFbt(cRes.value.data.frequentlyBoughtTogether.map(item => item.bundleProduct?._id || item.bundleProduct));
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [slug]);

  // Track recently viewed products — store max 8 unique IDs
  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem('recentlyViewed');
      let arr = stored ? JSON.parse(stored) : [];
      // Remove duplicate of current product then prepend
      arr = arr.filter(id => id !== product._id);
      arr.unshift(product._id);
      // Cap at 8 entries
      arr = arr.slice(0, 8);
      localStorage.setItem('recentlyViewed', JSON.stringify(arr));
    } catch (e) { /* eslint-disable-line no-unused-vars */ // localStorage error — ignore
    }
  }, [product]);

  // Fetch details for recently viewed products — show up to 8
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        if (!stored) return;
        const arr = JSON.parse(stored).filter(id => id !== product?._id);
        if (arr.length === 0) { setRecentlyViewedProducts([]); return; }
        // Fetch all (up to 8) in parallel
        const promises = arr.slice(0, 8).map(id => productService.getById(id));
        const results = await Promise.allSettled(promises);
        const resolved = results
          .filter(r => r.status === 'fulfilled' && r.value.success)
          .map(r => r.value.data);
        setRecentlyViewedProducts(resolved);
      } catch (e) { /* eslint-disable-line no-unused-vars */ // ignore storage errors
      }
    };
    if (product) fetchRecentlyViewed();
  }, [product]);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.8)' });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitError('');
    setReviewSubmitSuccess('');
    if (!comment.trim()) { setReviewSubmitError('Please enter a review comment'); return; }
    try {
      const res = await reviewService.create({ rating, comment, product: product._id });
      if (res.success) {
        setReviewSubmitSuccess('Thank you! Your review has been added.');
        showToast('Review submitted successfully!', 'success');
        setComment('');
        const rRes = await reviewService.getByProduct(product._id);
        if (rRes.success) setReviews(rRes.data || []);
        const pRes = await productService.getBySlug(slug);
        if (pRes.success) setProduct(pRes.data);
      } else {
        setReviewSubmitError(res.message || 'Failed to submit review');
      }
    } catch {
      setReviewSubmitError('Connection failed. Please try again.');
    }
  };

  const handleAddToCart = useCallback(() => {
    const productWithVariant = selectedVariant && typeof selectedVariant === 'object'
      ? { ...product, price: selectedVariant.price, stock: selectedVariant.stock, selectedSize: selectedSize || selectedVariant.name, sku: selectedVariant.sku || product.sku }
      : product;
    addToCart(productWithVariant, quantity);
    showToast(`${quantity}x ${product.title} (${selectedSize || 'Default'}) added to cart`, 'success');
  }, [selectedVariant, product, quantity, selectedSize, addToCart, showToast]);

  const handleCopyCode = useCallback((code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      showToast(`Coupon code "${code}" copied!`, 'success');
      setTimeout(() => setCopiedCode(''), 3000);
    });
  }, [showToast]);

  // ─── Section Renderers (memoized) ────────────────────────────────────────
  const renderDynamicSection = useCallback((sectionType) => {
    if (!dynamicContent) return null;


    switch (sectionType) {

      // ── Highlights ─────────────────────────────────────────────────────────
      case 'highlights': {
        if (!dynamicContent.highlights?.length) return null;
        return (
          <section key="highlights" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">Product Highlights</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#333] text-sm list-none p-0">
              {dynamicContent.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3 leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-[#729855] shrink-0 mt-0.5" />
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      }

      // ── Key Benefits ───────────────────────────────────────────────────────
      case 'benefits': {
        if (!dynamicContent.benefits?.length) return null;
        return (
          <section key="benefits" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">Key Benefits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dynamicContent.benefits.map((b, i) => (
                <div key={i} className="bg-[#fcfcfa] border border-[#eae8d8] p-5 hover:border-black transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#eae8d8]/40 p-2 text-[#729855] group-hover:bg-[#729855] group-hover:text-white transition-colors">
                      {getIcon(b.icon, 'w-5 h-5')}
                    </div>
                    <h4 className="font-heading font-bold text-xs text-black uppercase tracking-wider">{b.title}</h4>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </section>
        );
      }

      // ── Why You'll Love It ─────────────────────────────────────────────────
      case 'whyLoveIt': {
        if (!dynamicContent.whyLoveIt?.length) return null;
        return (
          <section key="whyLoveIt" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">Why You'll Love It</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dynamicContent.whyLoveIt.map((w, i) => (
                <div key={i} className="flex items-start gap-4 bg-[#fcfcfa] border border-[#eae8d8] p-5 hover:border-[#729855] transition-all">
                  <div className="text-[#729855] shrink-0 mt-0.5">{getIcon(w.icon, 'w-6 h-6')}</div>
                  <div>
                    <h4 className="font-heading font-bold text-xs text-black uppercase tracking-wider mb-1.5">{w.title}</h4>
                    {w.description && <p className="text-gray-500 text-xs leading-relaxed">{w.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      // ── Certifications ─────────────────────────────────────────────────────
      case 'certifications': {
        if (!dynamicContent.certifications?.length) return null;
        return (
          <section key="certifications" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">Certifications &amp; Standards</h2>
            <div className="flex flex-wrap gap-4">
              {dynamicContent.certifications.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-2 bg-[#fcfcfa] border border-[#eae8d8] px-6 py-5 hover:border-[#729855] transition-all text-center min-w-[110px] group">
                  <div className="text-[#729855] group-hover:scale-110 transition-transform">{getIcon(c.icon, 'w-8 h-8')}</div>
                  <span className="font-heading font-bold text-[10px] text-black uppercase tracking-wider leading-tight">{c.name}</span>
                  {c.description && <p className="text-[10px] text-gray-400 leading-snug">{c.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      }

      // ── Trust Badges ───────────────────────────────────────────────────────
      case 'trustBadges': {
        if (!dynamicContent.trustBadges?.length) return null;
        return (
          <section key="trustBadges" className="bg-[#f9f9eb] border border-[#eae8d8] py-5 px-6 mb-12">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {dynamicContent.trustBadges.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 text-[#2f3e10]">
                  <div className="text-[#729855]">{getIcon(b.icon, 'w-5 h-5')}</div>
                  <span className="font-heading font-bold text-[10px] uppercase tracking-wider">{b.title}</span>
                </div>
              ))}
            </div>
          </section>
        );
      }

      // ── Offers / Coupons / Bundles ─────────────────────────────────────────
      case 'offers': {
        const activeOffers = dynamicContent.offers?.filter(o => o.isActive);
        if (!activeOffers?.length) return null;
        return (
          <section key="offers" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">Special Offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeOffers.map((o, i) => {
                const colour = OFFER_COLOURS[o.type] || OFFER_COLOURS.coupon;
                const isExpired = o.validUntil && new Date(o.validUntil) < new Date();
                if (isExpired) return null;
                return (
                  <div key={i} className={`border ${colour.border} ${colour.bg} p-5 relative`}>
                    <span className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-heading font-bold tracking-widest ${colour.badge}`}>
                      {colour.label}
                    </span>
                    <h4 className="font-heading font-bold text-xs text-black uppercase tracking-wider mb-1.5 pr-20">{o.title}</h4>
                    {o.description && <p className="text-gray-500 text-xs leading-relaxed mb-3">{o.description}</p>}
                    {o.discountValue && (
                      <p className="text-[#729855] font-bold text-sm mb-2">{o.discountValue}</p>
                    )}
                    {o.code && (
                      <button
                        onClick={() => handleCopyCode(o.code)}
                        className="flex items-center gap-2 bg-white border border-dashed border-[#729855] px-3 py-1.5 text-xs font-mono font-bold text-[#2f3e10] hover:bg-[#f0faf0] transition-colors cursor-pointer"
                      >
                        <Tag className="w-3 h-3 text-[#729855]" />
                        {o.code}
                        {copiedCode === o.code
                          ? <Check className="w-3 h-3 text-[#729855]" />
                          : <Copy className="w-3 h-3 text-gray-400" />}
                      </button>
                    )}
                    {o.validUntil && (
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Valid until {new Date(o.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      }

      // ── Ingredients ────────────────────────────────────────────────────────
      case 'ingredients': {
        if (!dynamicContent.ingredients?.length) return null;
        return (
          <section key="ingredients" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">Ingredients / Materials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dynamicContent.ingredients.map((ing, i) => (
                <div key={i} className="bg-[#fcfcfa] border border-[#eae8d8] p-4 flex items-start gap-3">
                  <Beaker className="w-4 h-4 text-[#729855] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-bold text-xs text-black uppercase tracking-wider mb-1">{ing.name}</h4>
                    {ing.description && <p className="text-gray-500 text-xs leading-relaxed">{ing.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      // ── Care Instructions ──────────────────────────────────────────────────
      case 'careInstructions': {
        if (!dynamicContent.careInstructions?.length) return null;
        return (
          <section key="careInstructions" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">Care Instructions</h2>
            <ul className="space-y-2.5">
              {dynamicContent.careInstructions.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#333] leading-relaxed">
                  <HandHeart className="w-4 h-4 text-[#729855] shrink-0 mt-0.5" />
                  <span>{c.instruction}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      }

      // ── How To Use ─────────────────────────────────────────────────────────
      case 'usageSteps': {
        if (!dynamicContent.usageSteps?.length) return null;
        return (
          <section key="usageSteps" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">How To Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {dynamicContent.usageSteps.map((st, i) => (
                <div key={i} className="bg-[#fcfcfa] border border-[#eae8d8] p-5 relative">
                  <span className="absolute top-4 right-4 text-3xl font-serif text-[#eae8d8] font-bold select-none">0{i + 1}</span>
                  <h4 className="font-heading font-bold text-xs text-black uppercase tracking-wider mb-3 pr-8">{st.title || `Step 0${i + 1}`}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{st.instruction}</p>
                </div>
              ))}
            </div>
          </section>
        );
      }

      // ── Specifications ─────────────────────────────────────────────────────
      case 'specifications': {
        if (!dynamicContent.specifications?.length) return null;
        return (
          <section key="specifications" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">Product Specifications</h2>
            <div className="border border-[#eae8d8] divide-y divide-[#eae8d8]">
              {dynamicContent.specifications.map((s, i) => (
                <div key={i} className={`flex justify-between p-4 text-sm hover:bg-[#fcfcfa] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfa]/50'}`}>
                  <span className="font-semibold text-black uppercase text-xs tracking-wider font-heading">{s.key}</span>
                  <span className="text-gray-500 text-right max-w-[55%]">{s.value}</span>
                </div>
              ))}
            </div>
          </section>
        );
      }

      // ── FAQ ────────────────────────────────────────────────────────────────
      case 'faqs': {
        if (!dynamicContent.faqs?.length) return null;
        return (
          <section key="faqs" className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">Frequently Asked Questions</h2>
            <div className="space-y-2.5">
              {dynamicContent.faqs.map((f, i) => {
                const isExpanded = expandedFaqs.includes(i);
                return (
                  <div key={i} className="border border-[#eae8d8] bg-white">
                    <button
                      type="button"
                      onClick={() => setExpandedFaqs(prev => isExpanded ? prev.filter(idx => idx !== i) : [...prev, i])}
                      className="w-full flex items-center justify-between p-4 font-heading font-bold text-xs text-black uppercase tracking-wider text-left bg-transparent border-none cursor-pointer hover:bg-[#fcfcfa]"
                    >
                      <span className="flex items-center gap-2.5"><HelpCircle className="w-3.5 h-3.5 text-[#729855] shrink-0" />{f.question}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#729855] shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 text-sm text-gray-500 leading-relaxed border-t border-[#eae8d8]/40 bg-[#fcfcfa]/50">
                        {f.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      }

      // ── Text Section Cases ─────────────────────────────────────────────────
      case 'shipping':
      case 'returns':
      case 'warranty':
      case 'storage':
      case 'safety':
      case 'additional':
      case 'richDescription':
      case 'activeIngredients':
      case 'skinType':
      case 'suitableFor':
      case 'countryOfOrigin':
      case 'shelfLife':
      case 'care': {
        const section = dynamicContent.textSections?.find(ts => ts.sectionType === sectionType);
        if (!section || !section.content?.trim()) return null;
        const titleMap = {
          shipping:         'Shipping Information',
          returns:          'Return Policy',
          warranty:         'Warranty Details',
          storage:          'Storage Instructions',
          safety:           'Safety Guidelines',
          additional:       'Additional Information',
          richDescription:  'About This Product',
          activeIngredients:'Active Ingredients',
          skinType:         'Skin Type',
          suitableFor:      'Suitable For',
          countryOfOrigin:  'Country of Origin',
          shelfLife:        'Shelf Life & Expiry',
          care:             'Care Instructions'
        };
        const iconMap = {
          shipping: <Truck className="w-5 h-5 text-[#729855]" />,
          returns:  <RotateCcw className="w-5 h-5 text-[#729855]" />,
          warranty: <Shield className="w-5 h-5 text-[#729855]" />,
          storage:  <Package className="w-5 h-5 text-[#729855]" />,
          safety:   <Lock className="w-5 h-5 text-[#729855]" />,
          shelfLife: <Timer className="w-5 h-5 text-[#729855]" />,
          countryOfOrigin: <Globe className="w-5 h-5 text-[#729855]" />,
          skinType: <Droplets className="w-5 h-5 text-[#729855]" />,
          suitableFor: <ThumbsUp className="w-5 h-5 text-[#729855]" />,
          activeIngredients: <FlaskConical className="w-5 h-5 text-[#729855]" />,
          richDescription: <Layers className="w-5 h-5 text-[#729855]" />,
          care: <HandHeart className="w-5 h-5 text-[#729855]" />,
          additional: <Info className="w-5 h-5 text-[#729855]" />
        };
        return (
          <section key={sectionType} className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
            <div className="flex items-center gap-3 border-b border-[#eae8d8] pb-4 mb-6">
              {iconMap[sectionType]}
              <h2 className="serif-title text-2xl text-black font-medium">{titleMap[sectionType]}</h2>
            </div>
            <div
              className="text-sm text-gray-600 leading-relaxed font-body max-w-4xl prose prose-sm"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </section>

        );
      }

      default:
        return null;
    }
  }, [dynamicContent, expandedFaqs, copiedCode, handleCopyCode]);

  // ─── Early guards ─────────────────────────────────────────────────────────
  if (loading) return <Loader fullScreen />;

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

  // Review stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return { stars, count, percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0 };
  });
  const filteredReviews = selectedRatingFilter
    ? reviews.filter(r => r.rating === selectedRatingFilter)
    : reviews;

  // ─── Determine if there is any dynamic content to render ──────────────────
  const hasDynamicContent = dynamicContent &&
    (dynamicContent.configs?.some(c => c.isEnabled) ||
     dynamicContent.highlights?.length > 0 ||
     dynamicContent.benefits?.length > 0 ||
     dynamicContent.ingredients?.length > 0 ||
     dynamicContent.usageSteps?.length > 0 ||
     dynamicContent.specifications?.length > 0 ||
     dynamicContent.faqs?.length > 0 ||
     dynamicContent.textSections?.some(ts => ts.content?.trim()) ||
     dynamicContent.certifications?.length > 0 ||
     dynamicContent.trustBadges?.length > 0 ||
     dynamicContent.offers?.some(o => o.isActive) ||
     dynamicContent.whyLoveIt?.length > 0 ||
     dynamicContent.careInstructions?.length > 0);

  return (
    <div className="bg-[#ffffff] pt-[50px] pb-[100px] md:pb-[60px] min-h-screen font-body select-none">
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
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 mb-12 items-start">

          {/* Left Column: Media Gallery */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-[90px] space-y-4">
            <div
              className="w-full aspect-[6/7] overflow-hidden select-none bg-[#f6f5ea] cursor-zoom-in relative"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => { setIsZoomed(false); setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' }); }}
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
              <div className="flex gap-4 flex-wrap">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-24 bg-[#f6f5ea] border overflow-hidden transition-all select-none p-0 cursor-pointer ${mainImage === img ? 'border-black ring-1 ring-black' : 'border-transparent hover:border-black'}`}
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
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-[10px] text-gray-500 font-heading font-bold uppercase tracking-widest ml-1">
                {product.ratings.toFixed(1)} / ({reviews.length} Reviews)
              </span>
            </div>

            {/* Price */}
            <div className="font-sans text-lg text-black mt-2 mb-6 border-b border-[#eae8d8] pb-6 flex items-baseline gap-3">
              {product.comparePrice > (selectedVariant && typeof selectedVariant === 'object' ? selectedVariant.price : product.price) && (
                <span className="text-gray-400 line-through text-base">
                  Rs. {product.comparePrice.toLocaleString('en-IN')}.00
                </span>
              )}
              <span className="font-semibold text-xl">
                Rs. {(selectedVariant && typeof selectedVariant === 'object' ? selectedVariant.price : product.price).toLocaleString('en-IN')}.00 INR
              </span>
            </div>

            {/* Short Description */}
            <div
              className="font-body text-base leading-relaxed text-[#333] mb-6 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-6 mb-8 select-none border-t border-[#eae8d8] pt-6">
                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black mb-3">Volume Options</h4>
                  <div className="flex gap-3 text-xs font-heading font-bold uppercase tracking-wider flex-wrap">
                    {product.variants.map((v) => {
                      const name = typeof v === 'object' ? v.name : v;
                      return (
                        <button
                          key={typeof v === 'object' ? v._id : v}
                          type="button"
                          onClick={() => { setSelectedVariant(v); setSelectedSize(name); }}
                          className={`px-5 py-3 font-body text-sm cursor-pointer border transition-all ${selectedSize === name ? 'border-black bg-black text-white font-bold' : 'border-[#eae8d8] bg-[#fcfcfa] text-black hover:border-black'}`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selector & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6">
              {!isSoldOut && (
                <div className="flex items-center border border-[#eae8d8] h-11 select-none bg-[#fcfcfa] w-full sm:w-32 justify-between flex-shrink-0">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center font-semibold text-lg border-none bg-transparent cursor-pointer hover:bg-gray-100">-</button>
                  <span className="font-sans text-sm font-semibold">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-full flex items-center justify-center font-semibold text-lg border-none bg-transparent cursor-pointer hover:bg-gray-100">+</button>
                </div>
              )}
              <div className="flex gap-3 flex-grow items-center">
                {isSoldOut ? (
                  <button disabled className="flex-grow h-11 flex items-center justify-center bg-gray-300 text-gray-500 text-[11px] font-bold tracking-[0.2em] uppercase border-none cursor-not-allowed">Sold Out</button>
                ) : (
                  <button onClick={handleAddToCart} className="flex-grow h-11 flex items-center justify-center bg-[#2f3e10] hover:bg-black text-white font-heading text-[11px] font-bold tracking-[0.2em] uppercase border-none cursor-pointer transition-colors duration-300">Add to Cart</button>
                )}
                <button
                  onClick={() => toggleWishlist(product)}
                  disabled={isToggling && isToggling(product._id)}
                  className={`w-12 h-11 flex items-center justify-center border transition-all cursor-pointer flex-shrink-0 ${isWishlisted ? 'bg-black border-black text-white' : 'bg-[#fcfcfa] border-[#eae8d8] text-black hover:border-black'} disabled:opacity-60 disabled:cursor-wait`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  {isToggling && isToggling(product._id) ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className="w-[18px] h-[18px]" fill={isWishlisted ? 'currentColor' : 'none'} />
                  )}
                </button>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="text-[13px] text-gray-500 mt-2 pb-6 border-b border-[#eae8d8] flex items-center gap-2">
              <span className="font-semibold text-black">Delivery Details:</span>
              <span>Free Shipping on all orders over Rs. 1,000. Under 2-5 business days.</span>
            </div>
          </div>
        </div>

        {/* ── Dynamic Admin-Managed Sections ─────────────────────────────────── */}
        {hasDynamicContent ? (
          dynamicContent.configs && dynamicContent.configs.length > 0
            ? dynamicContent.configs
                .filter(conf => conf.isEnabled)
                .map(conf => renderDynamicSection(conf.sectionType))
            : /* configs absent but we still have data — render all available sections in default order */
              [
                'trustBadges', 'offers', 'highlights', 'richDescription', 'benefits',
                'whyLoveIt', 'certifications', 'ingredients', 'activeIngredients',
                'usageSteps', 'skinType', 'suitableFor', 'specifications', 'careInstructions',
                'care', 'storage', 'shelfLife', 'countryOfOrigin', 'faqs',
                'shipping', 'returns', 'warranty', 'safety', 'additional'
              ].map(type => renderDynamicSection(type))
        ) : (
          /* No dynamic content yet — show branded Fabish fallback sections */
          <FallbackContentSection />
        )}

        {/* ── Frequently Bought Together Bundle ───────────────────────────────── */}
        {dynamicContent?.frequentlyBoughtTogether?.length > 0 && (
          <section className="bg-[#fcfcfa] border border-[#eae8d8] p-6 md:p-8 mb-12 select-none">
            <h3 className="font-heading font-bold text-xs text-black uppercase tracking-widest mb-6 border-b border-[#eae8d8] pb-3">Frequently Bought Together</h3>
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
              {/* Bundle items list */}
              <div className="flex flex-wrap items-center gap-6">
                {/* Current Product */}
                <div className="flex items-center gap-4">
                  <img src={getLocalImageUrl(mainImage)} alt="" className="w-16 h-20 object-cover border border-[#eae8d8] mix-blend-darken bg-white" />
                  <div>
                    <h5 className="font-bold text-sm text-black leading-tight max-w-[150px] truncate">{product.title}</h5>
                    <span className="text-xs text-gray-500 font-bold">Rs. {product.price.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                {dynamicContent.frequentlyBoughtTogether.map((item) => {
                  const bp = item.bundleProduct;
                  if (!bp) return null;
                  const isChecked = selectedFbt.includes(bp._id);
                  const bpImage = bp.images?.[0]?.secure_url || bp.images?.[0] || '/assets/14.jpg';
                  return (
                    <React.Fragment key={bp._id}>
                      <span className="text-gray-400 text-lg font-bold">+</span>
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => setSelectedFbt(prev => isChecked ? prev.filter(id => id !== bp._id) : [...prev, bp._id])}
                          className="cursor-pointer accent-[#729855] w-4 h-4"
                        />
                        <img src={getLocalImageUrl(bpImage)} alt="" className="w-16 h-20 object-cover border border-[#eae8d8] mix-blend-darken bg-white" />
                        <div>
                          <h5 className="font-bold text-sm text-black leading-tight max-w-[150px] truncate">{bp.title}</h5>
                          <span className="text-xs text-gray-500 font-bold">Rs. {bp.price.toLocaleString('en-IN')}.00</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Total & Add Bundle */}
              <div className="border-t lg:border-t-0 lg:border-l border-[#eae8d8] pt-6 lg:pt-0 lg:pl-8 flex flex-col items-center lg:items-start shrink-0 w-full lg:w-auto">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Bundle Total</span>
                <span className="font-bold text-xl text-black mb-4">
                  Rs. {(
                    product.price +
                    dynamicContent.frequentlyBoughtTogether
                      .filter(item => selectedFbt.includes(item.bundleProduct?._id))
                      .reduce((sum, item) => sum + (item.bundleProduct?.price || 0), 0)
                  ).toLocaleString('en-IN')}.00 INR
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart();
                    dynamicContent.frequentlyBoughtTogether
                      .filter(item => selectedFbt.includes(item.bundleProduct?._id))
                      .forEach(item => addToCart(item.bundleProduct, 1));
                    showToast('Bundle items added to cart!', 'success');
                  }}
                  className="bg-[#2f3e10] hover:bg-black text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest border-none cursor-pointer transition-all w-full lg:w-auto text-center"
                >
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Customer Reviews Section ─────────────────────────────────────────── */}
        <section className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
          <h2 className="serif-title text-2xl text-black border-b border-[#eae8d8] pb-4 mb-6 font-medium">
            Customer Reviews {totalReviews > 0 && `(${totalReviews})`}
          </h2>

          {totalReviews > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Stats & List */}
              <div className="lg:col-span-7 space-y-6">
                {/* Stats Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#fcfcfa] border border-[#eae8d8] p-6 select-none">
                  <div className="text-center md:border-r border-[#eae8d8]/60 py-2">
                    <span className="text-5xl font-bold text-black font-sans leading-none">{averageRating}</span>
                    <div className="flex justify-center gap-0.5 mt-2 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest">Average Rating</span>
                  </div>
                  <div className="col-span-2 space-y-2">
                    {ratingBreakdown.map(row => (
                      <div
                        key={row.stars}
                        onClick={() => setSelectedRatingFilter(prev => prev === row.stars ? null : row.stars)}
                        className={`flex items-center gap-4 text-xs font-semibold cursor-pointer p-1.5 transition-all hover:bg-[#eae8d8]/20 ${selectedRatingFilter === row.stars ? 'bg-[#729855]/10 border border-[#729855]/30' : 'border border-transparent'}`}
                        title={`Click to filter ${row.stars} star reviews`}
                      >
                        <span className="w-12 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">{row.stars} Stars</span>
                        <div className="flex-grow bg-gray-200 h-2 overflow-hidden rounded-full max-w-sm">
                          <div className="bg-[#729855] h-full transition-all" style={{ width: `${row.percentage}%` }} />
                        </div>
                        <span className="w-8 text-right text-gray-400 font-bold">{row.count}</span>
                      </div>
                    ))}
                    {selectedRatingFilter && (
                      <div className="pt-2 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRatingFilter(null)}
                          className="text-xs text-[#729855] hover:text-black font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer underline"
                        >
                          Clear filter ({selectedRatingFilter} Stars)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
                  {filteredReviews.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      {selectedRatingFilter ? `No reviews found for ${selectedRatingFilter} stars.` : 'No reviews match the filter.'}
                    </p>
                  ) : (
                    filteredReviews.map((rev) => (
                      <div key={rev._id} className="border-b border-[#eae8d8] pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-heading font-bold text-xs text-black uppercase tracking-wider">{rev.user?.name || rev.name || 'Verified Customer'}</h4>
                          <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-0.5 mb-3 select-none">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-[#333] text-sm leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="lg:col-span-5 sticky lg:top-24 w-full">
                {user ? (
                  <div className="bg-[#F9F9EB] border border-[#eae8d8] p-6">
                    <h3 className="font-heading font-bold text-xs text-black uppercase tracking-widest mb-4 border-b border-[#eae8d8] pb-2">Write A Review</h3>
                    {reviewSubmitSuccess && (
                      <div className="bg-green-50 border border-[#729855] text-[#2f3e10] px-4 py-3 text-xs font-semibold mb-4 text-center">{reviewSubmitSuccess}</div>
                    )}
                    {reviewSubmitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-semibold mb-4 text-center">{reviewSubmitError}</div>
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
                          required rows={4}
                          placeholder="Write your product experience here..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full border border-[#eae8d8] px-4 py-3 font-body text-sm text-black focus:outline-none focus:border-[#729855] bg-white rounded-none"
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#2f3e10] text-white hover:bg-black py-3 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-none cursor-pointer">
                        Submit Review <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#F9F9EB] border border-[#eae8d8] p-6 text-center">
                    <p className="font-heading text-xs text-gray-500 mb-4 uppercase tracking-wider leading-relaxed">Please sign in to write customer reviews.</p>
                    <Link to="/account/login" className="bg-black text-white px-6 py-2.5 font-heading font-bold text-xs uppercase tracking-widest inline-block transition-all no-underline">Sign In</Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* No reviews yet */
            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-8 text-center">
              <div className="mb-8">
                <div className="flex justify-center gap-0.5 mb-3 select-none">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-gray-200" />
                  ))}
                </div>
                <h3 className="font-heading font-bold text-sm text-black uppercase tracking-wider mb-2">No reviews yet</h3>
                <p className="text-gray-500 text-sm font-body">Be the first to review this product.</p>
              </div>
              <div className="w-full text-left">
                {user ? (
                  <div className="bg-[#F9F9EB] border border-[#eae8d8] p-6">
                    <h3 className="font-heading font-bold text-xs text-black uppercase tracking-widest mb-4 border-b border-[#eae8d8] pb-2">Write A Review</h3>
                    {reviewSubmitSuccess && (
                      <div className="bg-green-50 border border-[#729855] text-[#2f3e10] px-4 py-3 text-xs font-semibold mb-4 text-center">{reviewSubmitSuccess}</div>
                    )}
                    {reviewSubmitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-semibold mb-4 text-center">{reviewSubmitError}</div>
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
                          required rows={4}
                          placeholder="Write your product experience here..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full border border-[#eae8d8] px-4 py-3 font-body text-sm text-black focus:outline-none focus:border-[#729855] bg-white rounded-none"
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#2f3e10] text-white hover:bg-black py-3 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-none cursor-pointer">
                        Submit Review <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#F9F9EB] border border-[#eae8d8] p-6 text-center">
                    <p className="font-heading text-xs text-gray-500 mb-4 uppercase tracking-wider leading-relaxed">Please sign in to write customer reviews.</p>
                    <Link to="/account/login" className="bg-black text-white px-6 py-2.5 font-heading font-bold text-xs uppercase tracking-widest inline-block transition-all no-underline">Sign In</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Related Products ─────────────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-[#eae8d8] pt-10 mb-12">
            <div className="border-b border-[#eae8d8] pb-4 mb-6">
              <span className="text-xs font-heading font-bold tracking-widest text-[#729855] uppercase block">Recommended Products</span>
              <h2 className="serif-title text-2xl text-black uppercase">Related Collection Items</h2>
            </div>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recently Viewed Products ─────────────────────────────────────────── */}
        {recentlyViewedProducts.length > 0 && (
          <section className="border-t border-[#eae8d8] pt-10 mt-12 select-none">
            <div className="border-b border-[#eae8d8] pb-4 mb-6">
              <span className="text-xs font-heading font-bold tracking-widest text-[#729855] uppercase block">Your Browsing History</span>
              <h2 className="serif-title text-2xl text-black uppercase">Recently Viewed Products</h2>
            </div>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentlyViewedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Sticky Bottom Add to Cart Bar ───────────────────────────────────── */}
      <div data-sticky-bottom="true" className={`fixed bottom-0 left-0 w-full bg-white border-t border-[#eae8d8] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-3 px-4 md:px-12 z-[1000] transition-all duration-300 transform flex items-center justify-between ${showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="hidden sm:flex items-center gap-4">
          <img src={getLocalImageUrl(mainImage)} alt={product.title} className="w-10 h-12 object-cover bg-[#f6f5ea] mix-blend-darken" />
          <div className="text-left">
            <h4 className="font-heading font-bold text-sm text-black truncate max-w-xs leading-snug">{product.title}</h4>
            <span className="text-xs text-[#729855] font-bold">Rs. {product.price.toLocaleString('en-IN')}.00</span>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          {!isSoldOut && (
            <div className="flex items-center border border-[#eae8d8] h-11 select-none bg-[#fcfcfa]">
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3.5 hover:bg-gray-100 h-full flex items-center justify-center font-bold border-none bg-transparent cursor-pointer">-</button>
              <span className="px-4 text-xs font-bold text-black">{quantity}</span>
              <button type="button" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3.5 hover:bg-gray-100 h-full flex items-center justify-center font-bold border-none bg-transparent cursor-pointer">+</button>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`h-11 px-6 sm:px-8 flex-grow sm:flex-grow-0 flex items-center justify-center text-white font-heading font-bold text-xs uppercase tracking-widest transition-all border-none cursor-pointer ${isSoldOut ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#2f3e10] hover:bg-black'}`}
          >
            {isSoldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
