import React, { useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
import { useCategories } from '../context/CategoryContext';
import { Link } from 'react-router-dom';
import { getLocalImageUrl } from '../utils/imageMapper';
import { productService } from '../api/productService'; // Imports backend service natively
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Search, X, ChevronDown, Tag, ArrowRight } from 'lucide-react';

// Helper to securely map database paths and prevent image breakage
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

const Collections = () => {
  useDocumentTitle('All Collections');
  const { categories, loading: categoriesLoading } = useCategories();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Desktop Accordion toggle state: key is category ID, value is boolean (true = collapsed)
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // Mobile Accordion expansion state: key is category ID, value is boolean (true = expanded)
  const [mobileExpandedCardIds, setMobileExpandedCardIds] = useState({});

  // Mobile Instant Search filter query
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  const toggleCategory = (id) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleMobileExpand = (id) => {
    setMobileExpandedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch products dynamically to group them by categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAll({ limit: 100 });
        if (res.success) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching products for All Collections page:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (categoriesLoading || productsLoading) {
    return <Loader />;
  }

  // Filter dynamic categories
  const publishedCategories = categories.filter((cat) => cat.status === 'Published');

  // Distinguish Parent Categories (Roots) from subcategories
  const parentCategories = publishedCategories.filter(
    (cat) => !cat.parentCategory
  );

  // Helper to resolve all products belonging to a parent category OR its subcategories
  const getProductsForCategory = (parentCat) => {
    const subCategoryIds = publishedCategories
      .filter((c) => {
        const parentId = c.parentCategory
          ? typeof c.parentCategory === 'object'
            ? c.parentCategory._id
            : c.parentCategory
          : null;
        return parentId === parentCat._id;
      })
      .map((c) => c._id);

    return products.filter((p) => {
      const productCatId = p.category
        ? typeof p.category === 'object'
          ? p.category._id
          : p.category
        : null;
      return productCatId === parentCat._id || subCategoryIds.includes(productCatId);
    });
  };

  // Helper to extract child subcategories for a given parent
  const getSubcategoriesForCategory = (parentCat) => {
    return publishedCategories.filter((c) => {
      const parentId = c.parentCategory
        ? typeof c.parentCategory === 'object'
          ? c.parentCategory._id
          : c.parentCategory
        : null;
      return parentId === parentCat._id;
    });
  };

  // Mobile search filtering
  const mobileFilteredParentCategories = parentCategories.filter((parentCat) => {
    if (!mobileSearchQuery.trim()) return true;
    const query = mobileSearchQuery.toLowerCase().trim();
    const nameMatch = parentCat.name?.toLowerCase().includes(query);
    const descMatch = parentCat.description?.toLowerCase().includes(query);
    const subCats = getSubcategoriesForCategory(parentCat);
    const subMatch = subCats.some((sub) => sub.name?.toLowerCase().includes(query));
    return nameMatch || descMatch || subMatch;
  });

  return (
    <div className="w-full bg-white text-left select-none">
      <style>{`
        /* BANNER (DESKTOP) */
        .catalog-banner {
          width: 100%;
          height: 240px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url('/assets/about-breadcrumb-1.jpg');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }
        .catalog-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(245, 240, 230, 0.45);
        }
        .catalog-banner h1 {
          position: relative;
          z-index: 2;
          font-family: 'Work Sans', Georgia, serif;
          font-size: 38px;
          font-weight: 700;
          color: #4B4A48;
          margin: 0;
          letter-spacing: 0.02em;
        }

        /* DYNAMIC CATEGORY SECTION WITH ALTERNATING BLOCK BANDS */
        .cat-section {
          max-width: 100%;
          padding: 50px 0;
          border-bottom: 1px solid #f2f0e4;
        }
        .cat-section:nth-child(even) {
          background-color: #faf9f5;
        }
        .cat-section:last-child {
          border-bottom: none;
        }
        .cat-content-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
        }
        
        /* CATEGORY TITLE CONTAINER */
        .cat-title-container {
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 3px solid #729855;
          padding-left: 14px;
        }
        
        /* DROPDOWN INTERACTIVE BAR (Header) */
        .cat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 15px;
          cursor: pointer;
          padding: 8px 12px 8px 0;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        .cat-header:hover {
          background-color: rgba(114, 152, 85, 0.04);
        }
        
        .cat-title {
          font-family: 'Work Sans', sans-serif;
          font-size: 30px;
          font-weight: 600;
          color: #2f3e10;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .cat-count-badge {
          background-color: rgba(114, 152, 85, 0.1);
          color: #729855;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          font-family: 'Work Sans', sans-serif;
          white-space: nowrap;
        }
        
        .cat-toggle-chevron {
          font-size: 15px;
          color: #729855;
          transition: transform 0.3s ease;
          display: inline-block;
          margin-left: 4px;
        }
        
        .cat-view-all {
          font-family: 'Work Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #729855;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease;
        }
        .cat-view-all:hover {
          color: #2f3e10;
        }

        /* SUBCATEGORY PILL CHIPS */
        .subcat-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 35px;
        }
        .subcat-pill {
          font-family: 'Work Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #555;
          background-color: #ffffff;
          border: 1px solid #eae8d8;
          padding: 8px 18px;
          border-radius: 30px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }
        .subcat-pill::after {
          content: '↗';
          font-size: 10px;
          color: #888;
          transition: color 0.3s ease;
        }
        .subcat-pill:hover {
          background-color: #729855;
          color: #ffffff;
          border-color: #729855;
        }
        .subcat-pill:hover::after {
          color: #ffffff;
        }

        /* 4-COLUMN PRODUCT GRID */
        .prod-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .prod-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
        }
        
        .prod-img-box {
          position: relative;
          aspect-ratio: 3/4;
          background-color: #f4f5eb;
          overflow: hidden;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .prod-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          mix-blend-mode: darken;
          transition: transform 0.5s ease;
        }
        .prod-card:hover .prod-img-box img {
          transform: scale(1.04);
        }

        .prod-info {
          text-align: center;
          padding: 0 6px;
        }
        .prod-title {
          font-family: 'Work Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #111;
          margin: 0 0 6px 0;
          line-height: 1.4;
          transition: color 0.3s ease;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .prod-card:hover .prod-title {
          color: #729855;
        }
        .prod-price {
          font-family: 'Work Sans', sans-serif;
          font-size: 14px;
          color: #444;
          margin: 0;
          font-weight: 600;
        }

        .empty-showcase {
          grid-column: span 4;
          padding: 40px;
          text-align: center;
          border: 1px dashed #eae8d8;
          color: #999;
          font-style: italic;
          font-size: 13px;
        }

        /* Responsive Grid viewports for desktop/tablet */
        @media (max-width: 1024px) {
          .prod-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           PREMIUM 2026 MOBILE STOREFRONT STYLES (< 768px)
        ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 767px) {
          .mobile-collections-wrapper {
            padding: 20px 16px 40px;
            background-color: #F7F6F0;
            min-height: 100vh;
          }
          .mobile-cat-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          @media (min-width: 540px) and (max-width: 767px) {
            .mobile-cat-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE VIEW (< 768px): Premium 2026 Shopify Storefront Card Grid
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden mobile-collections-wrapper">
        {/* Mobile Header Title */}
        <div style={{ marginBottom: '16px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#729855',
            }}
          >
            Formulations &amp; Ranges
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-heading, "Outfit", "Work Sans", sans-serif)',
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              margin: '2px 0 0 0',
            }}
          >
            Explore Collections
          </h1>
        </div>

        {/* Lightweight Search Box */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#729855',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={mobileSearchQuery}
            onChange={(e) => setMobileSearchQuery(e.target.value)}
            placeholder="Search collections or subcategories..."
            aria-label="Search collections"
            style={{
              width: '100%',
              padding: '12px 40px 12px 42px',
              borderRadius: '14px',
              border: '1.5px solid #E5E3D4',
              backgroundColor: '#FFFFFF',
              fontFamily: 'var(--font-body, "Work Sans", sans-serif)',
              fontSize: '14px',
              color: '#111827',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              boxSizing: 'border-box',
            }}
          />
          {mobileSearchQuery && (
            <button
              type="button"
              onClick={() => setMobileSearchQuery('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#888',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>

        {/* Mobile Collections Card Grid */}
        {mobileFilteredParentCategories.length > 0 ? (
          <div className="mobile-cat-grid">
            {mobileFilteredParentCategories.map((parentCat) => {
              const catProducts = getProductsForCategory(parentCat);
              const subCategories = getSubcategoriesForCategory(parentCat);
              const isExpanded = !!mobileExpandedCardIds[parentCat._id];
              const parentLink = `/collections/${parentCat.slug}`;

              // Determine image path using ensureAbsolutePath & getLocalImageUrl
              const rawImg = parentCat.image || (catProducts[0]?.images?.[0] || catProducts[0]?.image);
              const catImg = rawImg ? getLocalImageUrl(ensureAbsolutePath(rawImg)) : null;

              // Quick Preview: show first 3 subcategories when collapsed, all when expanded
              const visibleSubCategories = isExpanded ? subCategories : subCategories.slice(0, 3);
              const remainingCount = subCategories.length - 3;

              return (
                <div
                  key={parentCat._id}
                  style={{
                    backgroundColor: '#FAFAF5',
                    border: '1px solid #EDEBD8',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                    boxSizing: 'border-box',
                    transition: 'box-shadow 200ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Card Main Row: Thumbnail + Info + Chevron */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleMobileExpand(parentCat._id)}
                    >
                      {/* Collection Thumbnail */}
                      <Link
                        to={parentLink}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Open ${parentCat.name} collection`}
                        style={{ flexShrink: 0, textDecoration: 'none' }}
                      >
                        <div
                          style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            backgroundColor: '#EEF3E8',
                            border: '1.5px solid #D8E8C8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {catImg ? (
                            <img
                              src={catImg}
                              alt={parentCat.name}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Tag style={{ width: '24px', height: '24px', color: '#729855' }} />
                          )}
                        </div>
                      </Link>

                      {/* Info Header */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <h2
                            style={{
                              fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
                              fontSize: '17px',
                              fontWeight: 700,
                              color: '#111827',
                              margin: 0,
                              lineHeight: 1.25,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {parentCat.name}
                          </h2>
                          <ChevronDown
                            style={{
                              width: '18px',
                              height: '18px',
                              color: '#729855',
                              flexShrink: 0,
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 250ms ease',
                            }}
                            aria-hidden="true"
                          />
                        </div>

                        {/* Product count badge */}
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {catProducts.length > 0 && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '100px',
                                backgroundColor: 'rgba(114, 152, 85, 0.12)',
                                color: '#4A7C35',
                                letterSpacing: '0.02em',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {catProducts.length} Product{catProducts.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subcategories Quick Preview / Expandable Pills */}
                    {subCategories.length > 0 && (
                      <div
                        style={{
                          marginTop: '14px',
                          paddingTop: '12px',
                          borderTop: '1px solid #EDEBD8',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            transition: 'max-height 300ms ease-out',
                          }}
                        >
                          {visibleSubCategories.map((sub) => (
                            <Link
                              key={sub._id}
                              to={`/collections/${sub.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: '12px',
                                fontFamily: 'var(--font-body, "Work Sans", sans-serif)',
                                fontWeight: 500,
                                color: '#4B5563',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E3D4',
                                borderRadius: '20px',
                                padding: '5px 12px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 150ms ease, color 150ms ease',
                              }}
                            >
                              <span>{sub.name}</span>
                            </Link>
                          ))}

                          {/* "+X More" Pill Button */}
                          {!isExpanded && remainingCount > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMobileExpand(parentCat._id);
                              }}
                              style={{
                                fontSize: '11px',
                                fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
                                fontWeight: 700,
                                color: '#729855',
                                backgroundColor: 'rgba(114, 152, 85, 0.10)',
                                border: '1px solid rgba(114, 152, 85, 0.25)',
                                borderRadius: '20px',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                transition: 'background-color 150ms ease',
                              }}
                            >
                              +{remainingCount} More
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer CTA */}
                  <div
                    style={{
                      marginTop: '14px',
                      paddingTop: '10px',
                      borderTop: subCategories.length === 0 ? '1px solid #EDEBD8' : undefined,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Link
                      to={parentLink}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
                        fontWeight: 700,
                        color: '#729855',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '4px 0',
                        minHeight: '44px',
                      }}
                    >
                      Explore Collection
                      <ArrowRight style={{ width: '13px', height: '13px' }} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty search result state */
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#FAFAF5',
              borderRadius: '18px',
              border: '1px dashed #EDEBD8',
            }}
          >
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>
              No collections found matching &quot;{mobileSearchQuery}&quot;
            </p>
            <button
              type="button"
              onClick={() => setMobileSearchQuery('')}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#729855',
                background: 'transparent',
                border: '1px solid #729855',
                borderRadius: '20px',
                padding: '6px 16px',
                cursor: 'pointer',
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥ 768px): Modern 2026 Category Discovery Grid
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* TOP HEADER HERO BANNER (UNTOUCHED) */}
        <div className="catalog-banner">
          <h1>All Collections</h1>
        </div>

        {/* 2026 THUMBNAIL-BASED CATEGORY DISCOVERY EXPLORER GRID */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 md:py-16">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#E5E3D4] gap-4">
            <div>
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-[0.2em] text-[#729855] block mb-1">
                Explore Collections
              </span>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#111827] tracking-tight">
                Curated Organic Beauty Categories
              </h2>
            </div>
            <p className="text-xs md:text-sm text-[#6B7280] font-body max-w-md">
              Browse clean formulations, skincare, haircare, and wellness ranges crafted with pure botanical ingredients.
            </p>
          </div>

          {/* 3-Column Responsive Category Cards Grid (3 desktop, 2 tablet, 1 mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {parentCategories.map((parentCat) => {
              const categoryProducts = getProductsForCategory(parentCat);
              const subCategories = getSubcategoriesForCategory(parentCat);
              const parentLink = `/collections/${parentCat.slug}`;

              // Resolve thumbnail image for this category
              const rawImg = parentCat.image || (categoryProducts[0]?.images?.[0] || categoryProducts[0]?.image);
              const catImg = rawImg ? getLocalImageUrl(ensureAbsolutePath(rawImg)) : '/assets/homepage/P1.jpg';

              return (
                <Link
                  key={parentCat._id}
                  to={parentLink}
                  onClick={() => window.scrollTo(0, 0)}
                  className="group relative bg-[#FAFAF5] rounded-3xl border border-[#E5E3D4] p-5 shadow-xs hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between h-full text-left overflow-hidden no-underline cursor-pointer"
                >
                  <div>
                    {/* Large Category Thumbnail Image Container */}
                    <div className="relative w-full aspect-[4/3] bg-[#EEF3E8] rounded-2xl overflow-hidden mb-5 border border-[#D8E8C8]/60">
                      <img
                        src={catImg}
                        alt={parentCat.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => { e.target.src = '/assets/homepage/P1.jpg'; }}
                      />
                      
                      {/* Floating Product Count Badge */}
                      <span className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md text-[#2f3e10] text-[11px] font-heading font-extrabold px-3 py-1 rounded-full shadow-xs border border-[#E5E3D4]">
                        {categoryProducts.length} Product{categoryProducts.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Category Title */}
                    <h3 className="font-heading text-xl font-bold text-[#111827] group-hover:text-[#729855] transition-colors leading-snug mb-2">
                      {parentCat.name}
                    </h3>

                    {/* Category Description */}
                    {parentCat.description && (
                      <p className="text-xs text-[#6B7280] font-body line-clamp-2 leading-relaxed mb-4">
                        {parentCat.description}
                      </p>
                    )}

                    {/* Subcategories Pills Preview */}
                    {subCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {subCategories.slice(0, 4).map((sub) => (
                          <span
                            key={sub._id}
                            className="text-[11px] font-medium text-[#4B5563] bg-white border border-[#E5E3D4] px-2.5 py-1 rounded-full"
                          >
                            {sub.name}
                          </span>
                        ))}
                        {subCategories.length > 4 && (
                          <span className="text-[10px] font-bold text-[#729855] bg-[#729855]/10 px-2 py-1 rounded-full">
                            +{subCategories.length - 4} More
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Bar */}
                  <div className="pt-4 border-t border-[#EDEBD8] flex items-center justify-between mt-4">
                    <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#729855] group-hover:text-[#2f3e10] transition-colors flex items-center gap-1.5">
                      Explore Collection
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#729855] group-hover:bg-[#2f3e10] text-white flex items-center justify-center transition-colors shadow-xs group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;