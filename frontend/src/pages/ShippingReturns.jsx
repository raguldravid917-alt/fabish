import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, AlertTriangle } from 'lucide-react';
import { cmsService } from '../api/cmsService';
import Loader from '../components/ui/Loader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const ShippingReturns = () => {
  useDocumentTitle('Shipping & Returns - Fabish');
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await cmsService.getPage('shipping-returns');
        if (res.success && res.data) {
          setPageData(res.data);
        } else {
          setError(res.message || 'Failed to load policy data');
        }
      } catch (err) {
        setError('Could not connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

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
            {pageData?.title || 'Shipping & Returns'}
          </h1>
          <p className="text-[12px] font-bold text-[#666] tracking-[0.2em] uppercase">
            <Link to="/" className="hover:text-black">Home</Link>
            <span className="mx-2">|</span>
            <span className="text-[#8b5a2b]">Shipping & Returns</span>
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-16">
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
            <h3 className="font-heading font-semibold text-lg uppercase tracking-wider">Failed to Load Content</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="bg-white border border-[#eae8d8] p-8 md:p-16 shadow-sm">
            {/* Rich Content Container */}
            <div 
              className="prose max-w-none text-[#333] text-[15px] leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingReturns;
