import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, History, ChevronDown } from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { cmsService } from '../api/cmsService';

/* ── Skeleton ───────────────────────────────────────────────── */
const ContentSkeleton = () => (
  <div className="animate-pulse space-y-4 p-8 md:p-16">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i}>
        <div className={`h-4 bg-gray-200 rounded mb-2 ${i % 2 === 0 ? 'w-3/4' : 'w-full'}`} />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6 mt-1" />
      </div>
    ))}
  </div>
);

const TermsConditions = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useDocumentTitle(pageData?.metaTitle || 'Terms & Conditions - Fabish');

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await cmsService.getPage('terms-conditions');
        if (res.success && res.data) {
          setPageData(res.data);
        } else {
          setError(res.message || 'Failed to load page');
        }
      } catch {
        setError('Could not connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  // SEO meta description
  useEffect(() => {
    if (!pageData?.metaDescription) return;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = pageData.metaDescription;
  }, [pageData]);

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Terms & Conditions' },
  ];

  const formattedDate = pageData?.updatedAt
    ? new Date(pageData.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24 text-left select-text">
      <PageBanner title="Terms & Conditions" breadcrumbs={breadcrumbs} />

      <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-16">

        {/* Meta bar */}
        {!loading && pageData && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-[#eae8d8]">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileText className="w-4 h-4" />
              <span>Version {pageData.currentVersion || 1}</span>
              {formattedDate && (
                <>
                  <span className="text-gray-300">·</span>
                  <span>Last updated: <strong className="text-black">{formattedDate}</strong></span>
                </>
              )}
            </div>
            {(pageData.versionHistory?.length > 0) && (
              <button
                onClick={() => setShowHistory((s) => !s)}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8B5A2B] hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                <History className="w-3.5 h-3.5" />
                Version History
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Version history panel */}
        {showHistory && pageData?.versionHistory?.length > 0 && (
          <div className="bg-[#f0ede0] border border-[#d9d4be] p-6 mb-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B5A2B] mb-4">Version History</h3>
            <div className="space-y-2">
              {[...pageData.versionHistory].reverse().map((v, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-[#d9d4be] last:border-0">
                  <span className="text-gray-700 font-medium">v{v.version} — {v.title}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(v.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white border border-[#eae8d8] shadow-sm">
            <ContentSkeleton />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 shadow-sm text-center flex flex-col items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h3 className="font-heading font-semibold text-lg uppercase tracking-wider">Failed to Load Content</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="bg-white border border-[#eae8d8] p-8 md:p-16 shadow-sm">
            <div
              className="prose max-w-none text-[#333] text-[15px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsConditions;
