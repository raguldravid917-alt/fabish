import React from 'react';

/**
 * FooterPageSkeleton — animated loading skeleton for CMS footer page content.
 */
const FooterPageSkeleton = () => {
  return (
    <div className="animate-pulse w-full">
      {/* Banner skeleton */}
      <div className="w-full h-[280px] md:h-[360px] bg-gray-200 rounded-none mb-0" />

      <div className="max-w-[900px] mx-auto px-6 md:px-10 py-12">
        {/* Title skeleton */}
        <div className="h-10 bg-gray-200 rounded w-2/3 mb-4" />
        {/* Short description */}
        <div className="h-5 bg-gray-200 rounded w-full mb-2" />
        <div className="h-5 bg-gray-200 rounded w-4/5 mb-10" />

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-10" />

        {/* Content blocks */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FooterPageSkeleton;
