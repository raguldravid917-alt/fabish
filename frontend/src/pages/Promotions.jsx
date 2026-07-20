import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Tag, Copy, Check, Calendar, HelpCircle, AlertTriangle } from 'lucide-react';
import { couponService } from '../api/couponService';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Promotions = () => {
  useDocumentTitle('Offers & Promotions - Fabish');
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await couponService.getPublicCoupons();
        if (res.success && res.data) {
          setCoupons(res.data);
        } else {
          setError(res.message || 'Failed to load offers');
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

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24 text-left select-text">
      {/* Hero Banner with Breadcrumbs */}
      <div
        className="relative w-full h-[300px] md:h-[250px] flex items-center justify-center bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: `url('/assets/Rectangle_337.jpg')` }}
      >
        <div className="absolute inset-0 bg-[#faf9f5]/50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-[36px] md:text-[40px] font-heading font-semibold text-[#555] mb-2 tracking-tight uppercase">
            Promotions & Offers
          </h1>
          <p className="text-[12px] font-bold text-[#666] tracking-[0.2em] uppercase">
            <Link to="/" className="hover:text-black">Home</Link>
            <span className="mx-2">|</span>
            <span className="text-[#8b5a2b]">Promotions</span>
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-16">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#729855] hover:text-[#2f3e10] no-underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 shadow-sm text-center flex flex-col items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h3 className="font-heading font-semibold text-lg uppercase tracking-wider">Failed to Load Offers</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white border border-[#eae8d8] p-12 text-center flex flex-col items-center">
            <div className="p-4 bg-[#eae8d8]/50 text-[#8b5a2b] rounded-full mb-4">
              <Tag className="w-10 h-10" />
            </div>
            <h3 className="font-heading text-lg font-bold text-black uppercase tracking-wider">No Offers Available</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-sm">
              We don't have any active discount codes right now. Please subscribe to our newsletter in the footer to get notified of upcoming sales!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              return (
                <div 
                  key={coupon._id}
                  className="bg-white border border-[#eae8d8] hover:border-[#729855] p-6 shadow-sm flex flex-col justify-between transition-colors duration-300 relative overflow-hidden group"
                >
                  {/* Decorative side ribbon */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2f3e10] group-hover:bg-[#729855] transition-colors" />
                  
                  <div>
                    {/* Header: Discount value / Tag */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#2f3e10]/10 text-[#2f3e10] px-2.5 py-1 rounded-none">
                          <Tag className="w-3 h-3" /> 
                          {coupon.discountType === 'FreeShipping' ? 'Free Shipping' : `${coupon.discountType} Discount`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="serif-title text-2xl font-bold text-[#8b5a2b]">
                          {coupon.discountType === 'Percentage' 
                            ? `${coupon.discountPercentage || coupon.discountValue}% OFF` 
                            : coupon.discountType === 'Fixed' 
                            ? `₹${coupon.discountValue} OFF` 
                            : 'FREE'}
                        </span>
                      </div>
                    </div>

                    {/* Code copy container */}
                    <div className="bg-[#faf9f5] border border-dashed border-[#d2cfb6] p-3 flex justify-between items-center mb-4">
                      <span className="font-mono font-bold text-base tracking-wider text-black select-all">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="text-xs font-heading font-bold uppercase tracking-wider text-[#729855] hover:text-[#2f3e10] flex items-center gap-1 bg-transparent border-none cursor-pointer p-1"
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
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      Apply this coupon code at checkout to claim your discount. 
                      {coupon.minimumOrderAmount > 0 && ` Applicable on orders above ₹${coupon.minimumOrderAmount.toLocaleString('en-IN')}.`}
                      {coupon.maxDiscountCap > 0 && ` Maximum discount up to ₹${coupon.maxDiscountCap.toLocaleString('en-IN')}.`}
                    </p>
                  </div>

                  {/* Footer: Expiry info */}
                  <div className="border-t border-[#eae8d8] pt-4 flex items-center justify-between text-[11px] text-gray-400 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Expires on: {formatDate(coupon.expiryDate)}
                    </span>
                    <span className="flex items-center gap-1 text-[#729855] font-semibold">
                      Active
                    </span>
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
