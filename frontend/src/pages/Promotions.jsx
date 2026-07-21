import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Tag, Copy, Check, Calendar, HelpCircle, AlertTriangle, Clock } from 'lucide-react';
import { couponService } from '../api/couponService';
import { footerPageService } from '../api/footerPageService';
import { getLocalImageUrl } from '../utils/imageMapper';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Promotions = () => {
  useDocumentTitle('Offers & Promotions - Fabish');
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [cmsPage, setCmsPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const [couponRes, pageRes] = await Promise.all([
          couponService.getPublicCoupons(),
          footerPageService.getPageBySlug('promotions').catch(() => ({ success: false }))
        ]);

        if (couponRes.success && couponRes.data) {
          setCoupons(couponRes.data);
        } else {
          setError(couponRes.message || 'Failed to load offers');
        }

        if (pageRes.success && pageRes.data) {
          setCmsPage(pageRes.data);
        }
      } catch (err) {
        setError('Could not connect to server. Please check your network.');
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const getCountdown = (expiryDateStr) => {
    if (!expiryDateStr) return null;
    const diff = new Date(expiryDateStr) - now;
    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) {
      return `Ends in: ${days}d ${hours}h`;
    }
    return `Ends in: ${hours}h ${minutes}m`;
  };

  return (
    <div className="w-full bg-white font-body min-h-screen pb-24 text-left select-text">
      {/* Hero Banner with Breadcrumbs */}
      <div
        className="relative w-full h-[280px] md:h-[220px] flex items-center justify-center bg-cover bg-center bg-no-repeat border-b border-gray-200"
        style={{ backgroundImage: `url(${cmsPage?.bannerImage ? getLocalImageUrl(cmsPage.bannerImage) : '/assets/Rectangle_337.jpg'})` }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-[32px] md:text-[40px] font-heading font-extrabold text-black mb-3 tracking-tight uppercase">
            {cmsPage?.title || 'Promotions & Offers'}
          </h1>
          {cmsPage?.shortDescription && (
            <p className="text-xs text-gray-700 font-semibold max-w-lg mx-auto mb-4">{cmsPage.shortDescription}</p>
          )}
          <div className="text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase flex items-center justify-center gap-2">
            <Link to="/" className="text-gray-505 hover:text-black transition-colors">Home</Link>
            <span>|</span>
            <span className="text-black">Promotions</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-16">
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:text-gray-600 no-underline transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Home
          </Link>
        </div>

        {cmsPage?.content && !loading && !error && (
          <div className="mb-12 bg-white border border-gray-200 p-6 md:p-10 rounded-xl shadow-sm prose max-w-none text-left footer-page-content">
            <div dangerouslySetInnerHTML={{ __html: cmsPage.content }} />
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 shadow-sm text-center flex flex-col items-center gap-3 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h3 className="font-heading font-semibold text-lg uppercase tracking-wider">Failed to Load Offers</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center flex flex-col items-center rounded-xl shadow-sm">
            <div className="p-4 bg-gray-100 text-black rounded-full mb-4">
              <Tag className="w-10 h-10" />
            </div>
            <h3 className="font-heading text-lg font-bold text-black uppercase tracking-wider">No Offers Available</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-sm">
              We don't have any active discount codes right now. Please subscribe to our newsletter in the footer to get notified of upcoming sales!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              const countdown = getCountdown(coupon.expiryDate);
              return (
                <div
                  key={coupon._id}
                  className="bg-white border border-gray-200 hover:border-black p-6 rounded-xl shadow-sm hover:shadow-md flex flex-col justify-between transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Decorative side ribbon */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black group-hover:bg-gray-800 transition-colors" />

                  <div>
                    {/* Header: Discount value / Tag */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-black px-2.5 py-1 rounded">
                          <Tag className="w-3 h-3 text-black" />
                          {coupon.discountType === 'FreeShipping' ? 'Free Shipping' : `${coupon.discountType} Discount`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-heading text-2xl font-black text-black">
                          {coupon.discountType === 'Percentage'
                            ? `${coupon.discountPercentage || coupon.discountValue}% OFF`
                            : coupon.discountType === 'Fixed'
                              ? `₹${coupon.discountValue} OFF`
                              : 'FREE'}
                        </span>
                      </div>
                    </div>

                    {/* Code copy container */}
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 flex justify-between items-center mb-6">
                      <span className="font-mono font-bold text-lg tracking-wider text-black select-all">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-205 rounded flex items-center gap-1.5 cursor-pointer border ${
                          isCopied
                            ? 'bg-gray-250 text-gray-800 border-gray-300'
                            : 'bg-black text-white hover:bg-gray-800 border-black'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <h3 className="font-heading text-sm font-bold text-black uppercase tracking-wide mb-2">
                      Save on your next order
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed mb-6">
                      Apply this coupon code at checkout to claim your discount.
                      {coupon.minimumOrderAmount > 0 && ` Applicable on orders above ₹${coupon.minimumOrderAmount.toLocaleString('en-IN')}.`}
                      {coupon.maxDiscountCap > 0 && ` Maximum discount up to ₹${coupon.maxDiscountCap.toLocaleString('en-IN')}.`}
                    </p>
                  </div>

                  {/* Footer: Expiry info */}
                  <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 mt-2 gap-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Expires on: {formatDate(coupon.expiryDate)}
                    </span>
                    {countdown && (
                      <span className="flex items-center gap-1 text-black font-semibold bg-gray-100 px-2.5 py-1 border border-gray-200 uppercase tracking-wider text-[9px] rounded-full self-start sm:self-auto">
                        <Clock className="w-3 h-3 text-black" />
                        {countdown}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;
