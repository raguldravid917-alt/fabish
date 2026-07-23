import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Loader from '../components/ui/Loader';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Heart, ShoppingBag, ArrowLeft, Send, Check, Shield, Truck,
  Sparkles, Smile, Award, HelpCircle, ChevronDown, ChevronUp,
  Info, Leaf, Zap, Clock, Tag, Package, RotateCcw, Lock,
  Droplets, Sun, Wind, ThumbsUp, CheckCircle, Copy, FlaskConical,
  Layers, Globe, Timer, AlarmClock, HandHeart, Beaker, ShieldCheck, Share2
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
import { recentlyViewedService } from '../api/recentlyViewedService';

/* ─────────────────────────────────────────────────────────────────────────────
   ProductDetail — Premium 2026 Enterprise Luxury eCommerce Experience
   (Amazon Luxury Beauty / Sephora / Dior Beauty Inspired)
   
   STRICT RULES PRESERVED:
   • All backend APIs (productService, reviewService), routes, and URLs unchanged
   • Existing variant selection, quantity counters, wishlist toggle, cart dispatch,
     review submission, and recently viewed localStorage logic preserved
───────────────────────────────────────────────────────────────────────────── */

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

const OFFER_COLOURS = {
  coupon:  { bg: 'bg-[#F7F6EF]', border: 'border-[#729855]', badge: 'bg-[#729855] text-white',  label: 'COUPON' },
  bundle:  { bg: 'bg-purple-50/50', border: 'border-purple-300', badge: 'bg-purple-600 text-white', label: 'BUNDLE' },
  combo:   { bg: 'bg-orange-50/50', border: 'border-orange-300', badge: 'bg-orange-600 text-white', label: 'COMBO' },
  limited: { bg: 'bg-red-50/50', border: 'border-red-300', badge: 'bg-red-600 text-white', label: 'LIMITED TIME' }
};

const ensureAbsolutePath = (path) => {
  if (!path) return '';
  let pathStr = '';
  if (typeof path === 'string') {
    pathStr = path;
  } else if (typeof path === 'object' && path !== null) {
    pathStr = path.url || path.secure_url || '';
  }
  if (!pathStr || typeof pathStr !== 'string') return '';

  if (pathStr.includes('via.placeholder.com')) {
    pathStr = pathStr.replace('via.placeholder.com', 'placehold.co');
  }

  if (!pathStr.startsWith('/') && !pathStr.startsWith('http')) {
    return '/' + pathStr;
  }
  return pathStr;
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
        setMainImage(ensureAbsolutePath(pData.images?.[0]?.secure_url || pData.images?.[0] || '/assets/14.jpg'));
        setQuantity(1);

        if (pData.variants && pData.variants.length > 0) {
          setSelectedVariant(pData.variants[0]);
          setSelectedSize(pData.variants[0].name);
        } else {
          setSelectedVariant(null);
          setSelectedSize('');
        }

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

  // Track recently viewed products (local storage + MongoDB backend)
  useEffect(() => {
    if (!product?._id) return;
    try {
      recentlyViewedService.recordView(product._id).catch(() => {});
      const stored = localStorage.getItem('recentlyViewed');
      let arr = stored ? JSON.parse(stored) : [];
      arr = arr.filter(item => (typeof item === 'string' ? item !== product._id : item?._id !== product._id));
      const productSummary = {
        _id: product._id,
        title: product.title || product.name || 'Botanical Product',
        name: product.name || product.title,
        slug: product.slug || '',
        price: product.price || 0,
        comparePrice: product.comparePrice || 0,
        images: product.images || [],
        stock: product.stock ?? 10,
        rating: product.rating || 5,
        category: product.category,
      };
      arr.unshift(productSummary);
      arr = arr.slice(0, 30);
      localStorage.setItem('recentlyViewed', JSON.stringify(arr));
    } catch (e) { /* ignore storage error */ }
  }, [product]);

  // Fetch details for recently viewed products
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        if (!stored) return;
        const arr = JSON.parse(stored).filter(id => id !== product?._id);
        if (arr.length === 0) { setRecentlyViewedProducts([]); return; }
        const promises = arr.slice(0, 8).map(id => productService.getById(id));
        const results = await Promise.allSettled(promises);
        const resolved = results
          .filter(r => r.status === 'fulfilled' && r.value.success)
          .map(r => r.value.data);
        setRecentlyViewedProducts(resolved);
      } catch (e) { /* ignore storage error */ }
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
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.7)' });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitError('');
    setReviewSubmitSuccess('');
    if (!comment.trim()) { setReviewSubmitError('Please enter a review comment'); return; }
    try {
      const res = await reviewService.create({ rating, comment, product: product._id });
      if (res.success) {
        setReviewSubmitSuccess('Thank you! Your review has been submitted.');
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
    showToast(`${quantity}x ${product.title} added to your bag`, 'success');
  }, [selectedVariant, product, quantity, selectedSize, addToCart, showToast]);

  const handleCopyCode = useCallback((code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      showToast(`Coupon code "${code}" copied!`, 'success');
      setTimeout(() => setCopiedCode(''), 3000);
    });
  }, [showToast]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: product?.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'success');
    }
  }, [product, showToast]);

  // Section Renderers for Admin-Managed Sections
  const renderDynamicSection = useCallback((sectionType) => {
    if (!dynamicContent) return null;

    switch (sectionType) {
      case 'highlights': {
        if (!dynamicContent.highlights?.length) return null;
        return (
          <section key="highlights" className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#729855]" />
              Product Highlights
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#374151] text-xs sm:text-sm list-none p-0">
              {dynamicContent.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 bg-[#FAFAF5] border border-[#E5E3D4] p-4 rounded-2xl leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-[#729855] shrink-0 mt-0.5" />
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      }

      case 'benefits': {
        if (!dynamicContent.benefits?.length) return null;
        return (
          <section key="benefits" className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#729855]" />
              Key Benefits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dynamicContent.benefits.map((b, i) => (
                <div key={i} className="bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl p-5 hover:border-[#729855] transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#729855]/10 p-2.5 rounded-xl text-[#729855] group-hover:bg-[#729855] group-hover:text-white transition-colors">
                      {getIcon(b.icon, 'w-5 h-5')}
                    </div>
                    <h4 className="font-heading font-bold text-xs text-[#111827] uppercase tracking-wider">{b.title}</h4>
                  </div>
                  <p className="text-[#6B7280] text-xs leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'whyLoveIt': {
        if (!dynamicContent.whyLoveIt?.length) return null;
        return (
          <section key="whyLoveIt" className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#729855]" />
              Why You&apos;ll Love It
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dynamicContent.whyLoveIt.map((w, i) => (
                <div key={i} className="flex items-start gap-4 bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl p-5 hover:border-[#729855] transition-all">
                  <div className="text-[#729855] shrink-0 mt-0.5">{getIcon(w.icon, 'w-6 h-6')}</div>
                  <div>
                    <h4 className="font-heading font-bold text-xs text-[#111827] uppercase tracking-wider mb-1.5">{w.title}</h4>
                    {w.description && <p className="text-[#6B7280] text-xs leading-relaxed">{w.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'certifications': {
        if (!dynamicContent.certifications?.length) return null;
        return (
          <section key="certifications" className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#729855]" />
              Certifications &amp; Standards
            </h2>
            <div className="flex flex-wrap gap-4">
              {dynamicContent.certifications.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-2 bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl px-6 py-5 hover:border-[#729855] transition-all text-center min-w-[120px] group">
                  <div className="text-[#729855] group-hover:scale-110 transition-transform">{getIcon(c.icon, 'w-8 h-8')}</div>
                  <span className="font-heading font-bold text-[11px] text-[#111827] uppercase tracking-wider leading-tight">{c.name}</span>
                  {c.description && <p className="text-[10px] text-gray-400 leading-snug">{c.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'trustBadges': {
        if (!dynamicContent.trustBadges?.length) return null;
        return (
          <section key="trustBadges" className="bg-gradient-to-r from-[#2f3e10] to-[#729855] rounded-3xl p-6 mb-10 shadow-lg text-white">
            <div className="flex flex-wrap items-center justify-around gap-6">
              {dynamicContent.trustBadges.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-white bg-white/20 p-2 rounded-xl">{getIcon(b.icon, 'w-5 h-5')}</div>
                  <span className="font-heading font-bold text-xs uppercase tracking-wider">{b.title}</span>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'offers': {
        const activeOffers = dynamicContent.offers?.filter(o => o.isActive);
        if (!activeOffers?.length) return null;
        return (
          <section key="offers" className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#729855]" />
              Exclusive Offers &amp; Coupons
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeOffers.map((o, i) => {
                const colour = OFFER_COLOURS[o.type] || OFFER_COLOURS.coupon;
                const isExpired = o.validUntil && new Date(o.validUntil) < new Date();
                if (isExpired) return null;
                return (
                  <div key={i} className={`border ${colour.border} ${colour.bg} rounded-2xl p-5 relative`}>
                    <span className={`absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[9.5px] font-heading font-extrabold tracking-widest ${colour.badge}`}>
                      {colour.label}
                    </span>
                    <h4 className="font-heading font-bold text-xs text-[#111827] uppercase tracking-wider mb-1.5 pr-20">{o.title}</h4>
                    {o.description && <p className="text-[#6B7280] text-xs leading-relaxed mb-3">{o.description}</p>}
                    {o.discountValue && (
                      <p className="text-[#729855] font-extrabold text-sm mb-2">{o.discountValue}</p>
                    )}
                    {o.code && (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(o.code)}
                        className="flex items-center gap-2 bg-white border border-dashed border-[#729855] px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-[#2f3e10] hover:bg-[#729855] hover:text-white transition-all cursor-pointer"
                      >
                        <Tag className="w-3.5 h-3.5 text-[#729855]" />
                        {o.code}
                        {copiedCode === o.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      }

      case 'ingredients': {
        if (!dynamicContent.ingredients?.length) return null;
        return (
          <section key="ingredients" className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#729855]" />
              Bio-Active Ingredients
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dynamicContent.ingredients.map((ing, i) => (
                <div key={i} className="bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl p-4 flex items-start gap-3">
                  <Beaker className="w-4 h-4 text-[#729855] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-bold text-xs text-[#111827] uppercase tracking-wider mb-1">{ing.name}</h4>
                    {ing.description && <p className="text-[#6B7280] text-xs leading-relaxed">{ing.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'usageSteps': {
        if (!dynamicContent.usageSteps?.length) return null;
        return (
          <section key="usageSteps" className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#729855]" />
              How To Use
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {dynamicContent.usageSteps.map((st, i) => (
                <div key={i} className="bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl p-5 relative">
                  <span className="absolute top-4 right-4 text-3xl font-heading text-[#729855]/20 font-extrabold select-none">0{i + 1}</span>
                  <h4 className="font-heading font-bold text-xs text-[#111827] uppercase tracking-wider mb-3 pr-8">{st.title || `Step 0${i + 1}`}</h4>
                  <p className="text-[#6B7280] text-xs leading-relaxed">{st.instruction}</p>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'specifications': {
        if (!dynamicContent.specifications?.length) return null;
        return (
          <section key="specifications" className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#729855]" />
              Product Specifications
            </h2>
            <div className="border border-[#EDEBD8] rounded-2xl overflow-hidden divide-y divide-[#EDEBD8]">
              {dynamicContent.specifications.map((s, i) => (
                <div key={i} className={`flex justify-between p-4 text-xs sm:text-sm hover:bg-[#FAFAF5] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF5]/60'}`}>
                  <span className="font-extrabold text-[#111827] uppercase text-xs tracking-wider font-heading">{s.key}</span>
                  <span className="text-[#6B7280] text-right max-w-[55%] font-body">{s.value}</span>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'faqs': {
        if (!dynamicContent.faqs?.length) return null;
        return (
          <section key="faqs" className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#729855]" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {dynamicContent.faqs.map((f, i) => {
                const isExpanded = expandedFaqs.includes(i);
                return (
                  <div key={i} className="border border-[#E5E3D4] rounded-2xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setExpandedFaqs(prev => isExpanded ? prev.filter(idx => idx !== i) : [...prev, i])}
                      className="w-full flex items-center justify-between p-4 font-heading font-bold text-xs sm:text-sm text-[#111827] uppercase tracking-wider text-left bg-transparent border-none cursor-pointer hover:bg-[#FAFAF5]"
                    >
                      <span className="flex items-center gap-2.5"><HelpCircle className="w-4 h-4 text-[#729855] shrink-0" />{f.question}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#729855] shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#6B7280] leading-relaxed border-t border-[#EDEBD8]/50 bg-[#FAFAF5]/60">
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
        return (
          <section key={sectionType} className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6">{titleMap[sectionType]}</h2>
            <div
              className="text-xs sm:text-sm text-[#6B7280] leading-relaxed font-body max-w-4xl prose prose-sm"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </section>
        );
      }

      default:
        return null;
    }
  }, [dynamicContent, expandedFaqs, copiedCode, handleCopyCode]);

  if (loading) return <Loader fullScreen />;

  if (error || !product) {
    return (
      <div className="py-20 text-center bg-[#FAFAF5] min-h-screen flex flex-col items-center justify-center px-6">
        <h2 className="font-heading text-3xl font-bold text-[#111827] mb-3">Product Not Found</h2>
        <p className="text-[#6B7280] mb-6 font-body text-sm">The product you are looking for might have been removed or does not exist.</p>
        <Link to="/collections/all" className="bg-[#729855] hover:bg-[#2f3e10] text-white px-8 py-3.5 rounded-xl font-heading font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const isSoldOut = product.stock === 0;
  const currentPrice = selectedVariant && typeof selectedVariant === 'object' ? selectedVariant.price : product.price;
  const comparePrice = product.comparePrice || product.mrp;
  const discount = comparePrice > currentPrice ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100) : 0;

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : (product.ratings || 4.8);

  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return { stars, count, percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0 };
  });

  const filteredReviews = selectedRatingFilter
    ? reviews.filter(r => r.rating === selectedRatingFilter)
    : reviews;

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
    <div className="bg-[#FAFAF5] pt-6 pb-20 md:pb-12 min-h-screen font-body select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Breadcrumb Bar ── */}
        <div className="text-[10px] sm:text-[11px] font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#729855] transition-colors">Home</Link>
          <span className="text-[#9CA3AF]">/</span>
          <Link to={`/collections/${typeof product.category === 'object' ? product.category?.slug : product.category}`} className="hover:text-[#729855] transition-colors">
            {typeof product.category === 'object' ? product.category?.name : product.category}
          </Link>
          <span className="text-[#9CA3AF]">/</span>
          <span className="text-[#111827]">{product.title}</span>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            PRODUCT MAIN LAYOUT - 2 COLUMN ENTERPRISE GRID
        ───────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 mb-16 items-start">

          {/* LEFT COLUMN: 2026 LUXURY MEDIA GALLERY */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-[90px] space-y-4">
            <div
              className="w-full aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E5E3D4] cursor-zoom-in relative flex items-center justify-center p-3"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => { setIsZoomed(false); setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' }); }}
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {isSoldOut ? (
                  <span className="bg-[#111827] text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    Sold Out
                  </span>
                ) : discount > 0 ? (
                  <span className="bg-[#729855] text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    -{discount}% OFF
                  </span>
                ) : null}
                {product.bestSeller && (
                  <span className="bg-[#2f3e10] text-white text-[9.5px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    100% Organic
                  </span>
                )}
              </div>

              {/* Share & Wishlist quick action overlay */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="w-9 h-9 rounded-full bg-white/95 text-[#111827] shadow-md hover:bg-[#729855] hover:text-white flex items-center justify-center transition-all border-none cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <img
                src={getLocalImageUrl(mainImage)}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-200 ease-out rounded-2xl"
                style={isZoomed ? zoomStyle : {}}
              />
            </div>

            {/* Thumbnail Carousel */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {product.images.map((img, idx) => {
                  const imgUrl = ensureAbsolutePath(typeof img === 'object' ? (img.url || img.secure_url) : img);
                  const isSelected = mainImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      onClick={() => setMainImage(imgUrl)}
                      className={`w-20 h-24 rounded-2xl bg-white border-2 overflow-hidden transition-all cursor-pointer p-1 shadow-2xs ${
                        isSelected ? 'border-[#729855] ring-2 ring-[#729855]/20' : 'border-[#E5E3D4] hover:border-[#729855]'
                      }`}
                    >
                      <img src={getLocalImageUrl(imgUrl)} alt="" className="w-full h-full object-cover rounded-xl" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRODUCT INFORMATION & PURCHASE CARD */}
          <div className="w-full lg:w-1/2 flex flex-col">
            
            {/* Category Subtitle */}
            <span className="inline-flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-[0.18em] text-[#729855] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {typeof product.category === 'object' ? product.category?.name : product.category}
            </span>

            {/* Title */}
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#111827] mb-3 tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating & Review Summary */}
            <div className="flex items-center gap-3 mb-6 select-none flex-wrap">
              <div className="flex items-center gap-1 bg-[#729855]/10 px-2.5 py-1 rounded-full border border-[#729855]/20">
                <div className="flex gap-0.5 text-[#F59E0B] text-xs">
                  {'★'.repeat(5)}
                </div>
                <span className="text-xs font-bold text-[#2f3e10] ml-1">{averageRating}</span>
              </div>
              <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">
                ({totalReviews} Customer Reviews)
              </span>
              <span className="text-[#6B7280]">•</span>
              <span className="text-xs font-semibold text-[#729855] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Verified Organic Formula
              </span>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-3xl border border-[#E5E3D4] p-5 sm:p-6 mb-6 shadow-xs">
              <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2f3e10] font-body">
                  Rs. {currentPrice.toLocaleString('en-IN')}.00 INR
                </span>
                {comparePrice && comparePrice > currentPrice && (
                  <span className="text-sm sm:text-base text-gray-400 line-through font-body">
                    Rs. {comparePrice.toLocaleString('en-IN')}.00
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-[#2f3e10] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                    Save {discount}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-body mb-4">
                Inclusive of all taxes. Free express shipping on orders above ₹1,000.
              </p>

              {/* Delivery Trust Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-[#EDEBD8]">
                <div className="flex items-center gap-2 text-xs font-medium text-[#374151]">
                  <Truck className="w-4 h-4 text-[#729855]" />
                  <span>Free Express Ship</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#374151]">
                  <ShieldCheck className="w-4 h-4 text-[#729855]" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#374151]">
                  <RotateCcw className="w-4 h-4 text-[#729855]" />
                  <span>Easy 7-Day Return</span>
                </div>
              </div>
            </div>

            {/* Short Description */}
            {product.description && (
              <div
                className="font-body text-xs sm:text-sm leading-relaxed text-[#4B5563] mb-6 prose max-w-none bg-white p-5 rounded-2xl border border-[#E5E3D4]"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            {/* Volume / Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 mb-6 bg-white p-5 rounded-2xl border border-[#E5E3D4]">
                <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-[#111827]">
                  Select Volume Option
                </h4>
                <div className="flex gap-2.5 flex-wrap">
                  {product.variants.map((v) => {
                    const name = typeof v === 'object' ? v.name : v;
                    const isSelected = selectedSize === name;
                    return (
                      <button
                        key={typeof v === 'object' ? (v._id || name) : v}
                        type="button"
                        onClick={() => { setSelectedVariant(v); setSelectedSize(name); }}
                        className={`px-4 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                          isSelected
                            ? 'border-[#729855] bg-[#729855] text-white shadow-xs'
                            : 'border-[#E5E3D4] bg-[#FAFAF5] text-[#374151] hover:border-[#729855]'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Counter & Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              {!isSoldOut && (
                <div className="flex items-center border border-[#E5E3D4] h-12 rounded-2xl bg-white select-none w-full sm:w-36 justify-between px-3 shrink-0 shadow-xs">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center font-extrabold text-base border-none bg-transparent cursor-pointer text-[#729855] hover:bg-[#FAFAF5] rounded-lg">-</button>
                  <span className="font-body text-sm font-extrabold text-[#111827]">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))} className="w-8 h-8 flex items-center justify-center font-extrabold text-base border-none bg-transparent cursor-pointer text-[#729855] hover:bg-[#FAFAF5] rounded-lg">+</button>
                </div>
              )}
              
              <div className="flex gap-3 flex-grow items-center">
                {isSoldOut ? (
                  <button disabled className="flex-grow h-12 flex items-center justify-center bg-gray-200 text-gray-400 text-xs font-heading font-extrabold tracking-widest uppercase rounded-2xl border-none cursor-not-allowed">
                    Sold Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-grow h-12 flex items-center justify-center gap-2 bg-[#729855] hover:bg-[#2f3e10] text-white font-heading text-xs font-extrabold tracking-widest uppercase rounded-2xl border-none cursor-pointer transition-colors shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add To Cart
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  disabled={isToggling && isToggling(product._id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all cursor-pointer shrink-0 shadow-xs ${
                    isWishlisted
                      ? 'bg-[#2f3e10] border-[#2f3e10] text-white'
                      : 'bg-white border-[#E5E3D4] text-[#111827] hover:border-[#729855] hover:text-[#729855]'
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Trust Badges Strip */}
            <div className="bg-white rounded-2xl border border-[#E5E3D4] p-4 flex items-center justify-around gap-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <Leaf className="w-5 h-5 text-[#729855]" />
                <span className="text-[10px] font-heading font-bold text-[#111827] uppercase">100% Organic</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-[#729855]" />
                <span className="text-[10px] font-heading font-bold text-[#111827] uppercase">Derm Approved</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Award className="w-5 h-5 text-[#729855]" />
                <span className="text-[10px] font-heading font-bold text-[#111827] uppercase">Cruelty Free</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Globe className="w-5 h-5 text-[#729855]" />
                <span className="text-[10px] font-heading font-bold text-[#111827] uppercase">Made in India</span>
              </div>
            </div>

          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            DYNAMIC CONTENT & SECTIONS
        ───────────────────────────────────────────────────────────────── */}
        {hasDynamicContent ? (
          dynamicContent.configs && dynamicContent.configs.length > 0
            ? dynamicContent.configs
                .filter(conf => conf.isEnabled)
                .map(conf => renderDynamicSection(conf.sectionType))
            : [
                'trustBadges', 'offers', 'highlights', 'richDescription', 'benefits',
                'whyLoveIt', 'certifications', 'ingredients', 'activeIngredients',
                'usageSteps', 'skinType', 'suitableFor', 'specifications', 'careInstructions',
                'care', 'storage', 'shelfLife', 'countryOfOrigin', 'faqs',
                'shipping', 'returns', 'warranty', 'safety', 'additional'
              ].map(type => renderDynamicSection(type))
        ) : (
          <FallbackContentSection />
        )}

        {/* ─────────────────────────────────────────────────────────────────
            FREQUENTLY BOUGHT TOGETHER BUNDLE
        ───────────────────────────────────────────────────────────────── */}
        {dynamicContent?.frequentlyBoughtTogether?.length > 0 && (
          <section className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-12 shadow-xs">
            <h3 className="font-heading font-bold text-lg text-[#111827] uppercase tracking-wider mb-6 border-b border-[#EDEBD8] pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#729855]" />
              Frequently Bought Together
            </h3>
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <img src={getLocalImageUrl(mainImage)} alt="" className="w-16 h-20 object-cover rounded-xl border border-[#E5E3D4] bg-[#FAFAF5]" />
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-[#111827] leading-tight max-w-[140px] truncate">{product.title}</h5>
                    <span className="text-xs text-[#729855] font-bold">Rs. {product.price.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                {dynamicContent.frequentlyBoughtTogether.map((item) => {
                  const bp = item.bundleProduct;
                  if (!bp) return null;
                  const isChecked = selectedFbt.includes(bp._id);
                  const bpImage = ensureAbsolutePath(bp.images?.[0]?.secure_url || bp.images?.[0] || '/assets/14.jpg');
                  return (
                    <React.Fragment key={bp._id}>
                      <span className="text-gray-400 text-lg font-bold">+</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => setSelectedFbt(prev => isChecked ? prev.filter(id => id !== bp._id) : [...prev, bp._id])}
                          className="cursor-pointer accent-[#729855] w-4 h-4"
                        />
                        <img src={getLocalImageUrl(bpImage)} alt="" className="w-16 h-20 object-cover rounded-xl border border-[#E5E3D4] bg-[#FAFAF5]" />
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-[#111827] leading-tight max-w-[140px] truncate">{bp.title}</h5>
                          <span className="text-xs text-[#729855] font-bold">Rs. {bp.price.toLocaleString('en-IN')}.00</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="border-t lg:border-t-0 lg:border-l border-[#EDEBD8] pt-6 lg:pt-0 lg:pl-8 flex flex-col items-center lg:items-start shrink-0 w-full lg:w-auto">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Bundle Price</span>
                <span className="font-extrabold text-xl text-[#2f3e10] mb-4">
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
                    showToast('Bundle items added to your bag!', 'success');
                  }}
                  className="bg-[#729855] hover:bg-[#2f3e10] text-white px-6 py-3 rounded-xl font-heading font-extrabold text-xs uppercase tracking-widest border-none cursor-pointer transition-colors w-full lg:w-auto text-center shadow-md"
                >
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            CUSTOMER REVIEWS SECTION
        ───────────────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#E5E3D4] p-6 sm:p-8 mb-12 shadow-xs">
          <h2 className="font-heading text-xl font-bold text-[#111827] border-b border-[#EDEBD8] pb-4 mb-6">
            Customer Reviews {totalReviews > 0 && `(${totalReviews})`}
          </h2>

          {totalReviews > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Stats Breakdown */}
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl p-6 select-none">
                  <div className="text-center md:border-r border-[#EDEBD8] py-2">
                    <span className="text-5xl font-extrabold text-[#111827] font-body leading-none">{averageRating}</span>
                    <div className="flex justify-center gap-0.5 mt-2 mb-1 text-[#F59E0B]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-heading font-extrabold text-gray-400 uppercase tracking-widest">Average Rating</span>
                  </div>

                  <div className="col-span-2 space-y-2">
                    {ratingBreakdown.map(row => (
                      <div
                        key={row.stars}
                        onClick={() => setSelectedRatingFilter(prev => prev === row.stars ? null : row.stars)}
                        className={`flex items-center gap-3 text-xs font-semibold cursor-pointer p-1.5 rounded-lg transition-all ${selectedRatingFilter === row.stars ? 'bg-[#729855]/10 border border-[#729855]/30' : ''}`}
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
                          className="text-xs text-[#729855] font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer underline"
                        >
                          Clear filter ({selectedRatingFilter} Stars)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
                  {filteredReviews.length === 0 ? (
                    <p className="text-gray-500 text-xs italic">
                      {selectedRatingFilter ? `No reviews found for ${selectedRatingFilter} stars.` : 'No reviews match.'}
                    </p>
                  ) : (
                    filteredReviews.map((rev) => (
                      <div key={rev._id} className="border-b border-[#EDEBD8] pb-5 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1.5">
                          <h4 className="font-heading font-bold text-xs text-[#111827] uppercase tracking-wider">{rev.user?.name || rev.name || 'Verified Customer'}</h4>
                          <span className="text-[11px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2 select-none text-[#F59E0B]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-[#4B5563] text-xs leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-5 sticky lg:top-24 w-full">
                {user ? (
                  <div className="bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl p-6">
                    <h3 className="font-heading font-extrabold text-xs text-[#111827] uppercase tracking-widest mb-4 border-b border-[#EDEBD8] pb-2">Write A Review</h3>
                    {reviewSubmitSuccess && (
                      <div className="bg-green-50 border border-[#729855] text-[#2f3e10] p-3 text-xs font-bold rounded-xl mb-4 text-center">{reviewSubmitSuccess}</div>
                    )}
                    {reviewSubmitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-bold rounded-xl mb-4 text-center">{reviewSubmitError}</div>
                    )}
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5 block">Rating</label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="w-full border border-[#E5E3D4] bg-white px-3 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider outline-none cursor-pointer"
                        >
                          <option value={5}>5 Stars - Excellent</option>
                          <option value={4}>4 Stars - Very Good</option>
                          <option value={3}>3 Stars - Good</option>
                          <option value={2}>2 Stars - Fair</option>
                          <option value={1}>1 Star - Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5 block">Comment</label>
                        <textarea
                          required rows={4}
                          placeholder="Write your product experience here..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full border border-[#E5E3D4] p-3 rounded-xl font-body text-xs text-[#111827] outline-none focus:border-[#729855] bg-white"
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#729855] hover:bg-[#2f3e10] text-white py-3 px-6 rounded-xl font-heading font-extrabold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border-none cursor-pointer shadow-md">
                        Submit Review <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl p-6 text-center">
                    <p className="font-heading text-xs text-gray-500 mb-4 uppercase tracking-wider leading-relaxed">Please sign in to write customer reviews.</p>
                    <Link to="/account/login" className="bg-[#729855] hover:bg-[#2f3e10] text-white px-6 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-widest inline-block transition-colors no-underline">Sign In</Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-6 text-center">
              <div className="mb-6">
                <div className="flex justify-center gap-1 mb-2 text-gray-300 select-none">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5" />
                  ))}
                </div>
                <h3 className="font-heading font-bold text-sm text-[#111827] uppercase tracking-wider mb-1">No reviews yet</h3>
                <p className="text-gray-500 text-xs font-body">Be the first to review this organic product.</p>
              </div>
              <div className="w-full text-left">
                {user ? (
                  <div className="bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl p-6">
                    <h3 className="font-heading font-extrabold text-xs text-[#111827] uppercase tracking-widest mb-4 border-b border-[#EDEBD8] pb-2">Write A Review</h3>
                    {reviewSubmitSuccess && (
                      <div className="bg-green-50 border border-[#729855] text-[#2f3e10] p-3 text-xs font-bold rounded-xl mb-4 text-center">{reviewSubmitSuccess}</div>
                    )}
                    {reviewSubmitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-bold rounded-xl mb-4 text-center">{reviewSubmitError}</div>
                    )}
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5 block">Rating</label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="w-full border border-[#E5E3D4] bg-white px-3 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider outline-none cursor-pointer"
                        >
                          <option value={5}>5 Stars - Excellent</option>
                          <option value={4}>4 Stars - Very Good</option>
                          <option value={3}>3 Stars - Good</option>
                          <option value={2}>2 Stars - Fair</option>
                          <option value={1}>1 Star - Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5 block">Comment</label>
                        <textarea
                          required rows={4}
                          placeholder="Write your product experience here..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full border border-[#E5E3D4] p-3 rounded-xl font-body text-xs text-[#111827] outline-none focus:border-[#729855] bg-white"
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#729855] hover:bg-[#2f3e10] text-white py-3 px-6 rounded-xl font-heading font-extrabold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border-none cursor-pointer shadow-md">
                        Submit Review <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#FAFAF5] border border-[#E5E3D4] rounded-2xl p-6 text-center">
                    <p className="font-heading text-xs text-gray-500 mb-4 uppercase tracking-wider leading-relaxed">Please sign in to write customer reviews.</p>
                    <Link to="/account/login" className="bg-[#729855] hover:bg-[#2f3e10] text-white px-6 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-widest inline-block transition-colors no-underline">Sign In</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            RELATED PRODUCTS SHOWCASE
        ───────────────────────────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <div className="border-b border-[#E5E3D4] pb-4 mb-6">
              <span className="text-xs font-heading font-extrabold tracking-widest text-[#729855] uppercase block mb-0.5">Recommended Formulations</span>
              <h2 className="font-heading text-2xl font-bold text-[#111827]">Related Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            RECENTLY VIEWED PRODUCTS SHOWCASE
        ───────────────────────────────────────────────────────────────── */}
        {recentlyViewedProducts.length > 0 && (
          <section className="mb-12">
            <div className="border-b border-[#E5E3D4] pb-4 mb-6">
              <span className="text-xs font-heading font-extrabold tracking-widest text-[#729855] uppercase block mb-0.5">Your Browsing History</span>
              <h2 className="font-heading text-2xl font-bold text-[#111827]">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ─────────────────────────────────────────────────────────────────
          STICKY BOTTOM ADD TO CART BAR
      ───────────────────────────────────────────────────────────────── */}
      <div data-sticky-bottom="true" className={`fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#E5E3D4] shadow-2xl py-3 px-4 sm:px-8 md:px-12 z-[1000] transition-all duration-300 transform flex items-center justify-between ${showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="hidden sm:flex items-center gap-4">
          <img src={getLocalImageUrl(mainImage)} alt={product.title} className="w-11 h-13 object-cover rounded-xl bg-[#FAFAF5] border border-[#E5E3D4]" />
          <div className="text-left">
            <h4 className="font-heading font-bold text-xs sm:text-sm text-[#111827] truncate max-w-xs leading-snug">{product.title}</h4>
            <span className="text-xs text-[#729855] font-extrabold">Rs. {currentPrice.toLocaleString('en-IN')}.00</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {!isSoldOut && (
            <div className="flex items-center border border-[#E5E3D4] h-10 rounded-xl bg-[#FAFAF5] select-none">
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 hover:bg-gray-200 h-full flex items-center justify-center font-bold border-none bg-transparent cursor-pointer text-[#729855]">-</button>
              <span className="px-3 text-xs font-bold text-[#111827]">{quantity}</span>
              <button type="button" onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))} className="px-3 hover:bg-gray-200 h-full flex items-center justify-center font-bold border-none bg-transparent cursor-pointer text-[#729855]">+</button>
            </div>
          )}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`h-10 px-6 flex-grow sm:flex-grow-0 flex items-center justify-center text-white font-heading font-extrabold text-xs uppercase tracking-widest transition-colors rounded-xl border-none cursor-pointer shadow-md ${isSoldOut ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-[#729855] hover:bg-[#2f3e10]'}`}
          >
            {isSoldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
