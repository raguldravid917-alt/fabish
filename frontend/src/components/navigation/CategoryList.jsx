import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CategoryItem from './CategoryItem';
import { RefreshCw, Grid, AlertCircle, ChevronRight, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getLocalImageUrl } from '../../utils/imageMapper';
import { useProductsQuery } from '../../hooks/queries/useProductsQuery';

/* ─────────────────────────────────────────────────────────────────────────────
   CategoryList — Premium 2026 Catalog Mega Menu
   
   STRICT RULES & FIXES:
   • Reuses identical category matching & normalization logic as CollectionPage & ProductListing
   • Every category (Shampoo, Conditioner, Hair Serum, Toners, Serums, Cleansers, etc.)
     instantly displays its matching products on hover
   • ZERO internal scrollbars (no vertical/horizontal scrollbars on left or right panels)
   • Automatic responsive 2-column category grid on the left & 3-column product grid on the right
   • All existing APIs, React Query caching, routing, Zustand, and styling preserved
───────────────────────────────────────────────────────────────────────────── */

/* ── Shared helper to normalize category strings (slugs, names, IDs) ── */
export const normalizeCategorySlug = (val) => {
  if (!val) return '';
  let str = '';
  if (typeof val === 'object' && val !== null) {
    str = val.slug || val.name || val._id || '';
  } else {
    str = String(val);
  }
  return str
    .toLowerCase()
    .trim()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/* ── Shared helper to filter products by category matching CollectionPage / ProductListing logic ── */
export const getProductsByCategory = (category, products = [], allCategories = []) => {
  if (!category || !Array.isArray(products) || products.length === 0) {
    return [];
  }

  const catIdStr = category._id ? String(category._id) : null;
  const catNormSlug = normalizeCategorySlug(category.slug || category.name || category);
  const catNormName = normalizeCategorySlug(category.name || category.slug || category);

  // Collect child category IDs / Slugs if parent category
  const childCatIds = new Set();
  const childNormSlugs = new Set();

  if (Array.isArray(allCategories) && allCategories.length > 0 && catIdStr) {
    allCategories.forEach((c) => {
      if (!c) return;
      const pId = c.parentCategory
        ? typeof c.parentCategory === 'object'
          ? String(c.parentCategory._id)
          : String(c.parentCategory)
        : null;

      if (pId === catIdStr) {
        if (c._id) childCatIds.add(String(c._id));
        if (c.slug) childNormSlugs.add(normalizeCategorySlug(c.slug));
        if (c.name) childNormSlugs.add(normalizeCategorySlug(c.name));
      }
    });
  }

  return products.filter((p) => {
    if (!p) return false;

    // Extract product category attributes
    let pCatIdStr = null;
    let pCatNormSlug = '';

    if (typeof p.category === 'object' && p.category !== null) {
      pCatIdStr = p.category._id ? String(p.category._id) : null;
      pCatNormSlug = normalizeCategorySlug(p.category.slug || p.category.name);
    } else if (typeof p.category === 'string') {
      pCatIdStr = p.category;
      pCatNormSlug = normalizeCategorySlug(p.category);
    }

    // A. Match by ObjectId
    if (catIdStr) {
      if (pCatIdStr === catIdStr) return true;
      if (childCatIds.has(pCatIdStr)) return true;
    }

    // B. Match by Normalized Slug / Name
    if (catNormSlug) {
      if (pCatNormSlug === catNormSlug) return true;
      if (childNormSlugs.has(pCatNormSlug)) return true;

      // Singular / Plural tolerance (e.g. serums vs serum, cleansers vs cleanser)
      if (catNormSlug.endsWith('s') && pCatNormSlug === catNormSlug.slice(0, -1)) return true;
      if (pCatNormSlug.endsWith('s') && pCatNormSlug.slice(0, -1) === catNormSlug) return true;
    }

    if (catNormName && pCatNormSlug === catNormName) return true;

    // C. Match by product.subcategory
    if (p.subcategory) {
      const subNorm = normalizeCategorySlug(p.subcategory);
      if (subNorm === catNormSlug || subNorm === catNormName) return true;
    }

    // D. Match by product.tags array
    if (Array.isArray(p.tags)) {
      for (const tag of p.tags) {
        const tagNorm = normalizeCategorySlug(tag);
        if (tagNorm === catNormSlug || tagNorm === catNormName) return true;
      }
    }

    // E. Match by product.title fuzzy keyword
    if (p.title && (catNormSlug || catNormName)) {
      const pTitleNorm = normalizeCategorySlug(p.title);
      const keySlug = catNormSlug.replace(/-/g, '');
      const keyName = catNormName.replace(/-/g, '');
      const pTitleClean = pTitleNorm.replace(/-/g, '');

      if (keySlug.length >= 4 && pTitleClean.includes(keySlug)) return true;
      if (keyName.length >= 4 && pTitleClean.includes(keyName)) return true;
    }

    return false;
  });
};

/* ── Inline CSS for compact 25% / 75% mega menu without ANY internal scrollbars ── */
const MEGA_MENU_STYLES = `
  .mega-split-container {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    overflow: visible;
  }

  /* Hide scrollbars globally inside mega menu */
  .mega-split-left::-webkit-scrollbar,
  .mega-split-right::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  .mega-split-left,
  .mega-split-right {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }

  /* ── Left Side (Responsive 2-Column Compact Navigation ~360px wide) ── */
  .mega-split-left {
    width: 380px;
    min-width: 340px;
    background-color: #F7F6EF;
    border-right: 1.5px solid #EDEBD8;
    padding: 14px 12px;
    box-sizing: border-box;
    flex-shrink: 0;
    overflow: visible;
  }

  .mega-left-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3px 6px;
    width: 100%;
  }

  .mega-left-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 9px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 160ms ease;
    background-color: transparent;
    color: #1F2937;
    font-family: var(--font-heading, 'Outfit', sans-serif);
    font-weight: 600;
    font-size: 12.5px;
    text-decoration: none;
    user-select: none;
    border: 1px solid transparent;
  }

  .mega-left-item:hover {
    background-color: rgba(114, 152, 85, 0.10);
    color: #729855;
    transform: translateX(2px);
  }

  /* ── Active Category (Green Background + White Text) ── */
  .mega-left-item.active {
    background-color: #729855 !important;
    color: #FFFFFF !important;
    box-shadow: 0 2.5px 8px rgba(114, 152, 85, 0.28);
    font-weight: 700;
  }

  .mega-left-icon {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    overflow: hidden;
    background-color: #EEF3E8;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 160ms ease;
  }

  .mega-left-item.active .mega-left-icon {
    background-color: #FFFFFF;
    color: #729855;
  }

  .mega-left-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .mega-left-arrow {
    width: 12px;
    height: 12px;
    color: #9CA3AF;
    transition: transform 160ms ease, color 160ms ease;
  }

  .mega-left-item:hover .mega-left-arrow {
    color: #729855;
    transform: translateX(2px);
  }

  .mega-left-item.active .mega-left-arrow {
    color: #FFFFFF !important;
    transform: translateX(2px);
  }

  /* ── Right Side (Full Preview Area - Completely Visible without Scrollbar) ── */
  .mega-split-right {
    flex: 1;
    padding: 16px 24px;
    background-color: #FAFAF5;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-sizing: border-box;
    overflow: visible;
  }

  .mega-right-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1.5px solid #EDEBD8;
  }

  .mega-right-title {
    font-family: var(--font-heading, 'Outfit', sans-serif);
    font-size: 17px;
    font-weight: 800;
    color: #729855;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.01em;
  }

  .mega-right-view-all {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-family: var(--font-heading, 'Outfit', sans-serif);
    font-weight: 700;
    color: #729855;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    transition: all 160ms ease;
  }

  .mega-right-view-all:hover {
    color: #2F3E10;
    transform: translateX(3px);
  }

  /* ── Compact Horizontal Pill Chips ── */
  .mega-chips-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 8px;
    width: 100%;
  }

  .mega-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 9999px;
    background-color: #FFFFFF;
    border: 1.5px solid #E2E0D0;
    color: #1F2937;
    font-family: var(--font-body, 'Work Sans', sans-serif);
    font-weight: 600;
    font-size: 11.5px;
    text-decoration: none;
    cursor: pointer;
    transition: all 160ms cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    white-space: nowrap;
    user-select: none;
  }

  .mega-chip:hover {
    background-color: #729855;
    color: #FFFFFF;
    border-color: #729855;
    box-shadow: 0 3px 10px rgba(114, 152, 85, 0.25);
    transform: translateY(-1px);
  }

  .mega-chip-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  /* ── Skeleton loading animation ── */
  @keyframes mega-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
  }
  .mega-skeleton {
    animation: mega-pulse 1.6s ease-in-out infinite;
    background-color: #e5e3d4;
    border-radius: 6px;
  }

  /* ── Mobile accordion ── */
  .mega-mobile-accordion-item {
    border-bottom: 1px solid #EDEBD8;
  }
  .mega-mobile-accordion-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 14px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    gap: 10px;
    transition: background-color 150ms ease;
  }
  .mega-mobile-accordion-trigger:hover {
    background-color: rgba(114, 152, 85, 0.05);
  }
  .mega-mobile-accordion-trigger.open {
    background-color: rgba(114, 152, 85, 0.07);
  }
  .mega-mobile-chevron {
    width: 15px;
    height: 15px;
    color: #729855;
    flex-shrink: 0;
    transition: transform 250ms ease;
  }
  .mega-mobile-chevron.open {
    transform: rotate(180deg);
  }
  .mega-mobile-panel {
    overflow: hidden;
    transition: max-height 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease;
    max-height: 0;
    opacity: 0;
  }
  .mega-mobile-panel.open {
    max-height: 600px;
    opacity: 1;
  }
`;

/* ─────────────────────────────────────
   Sub-component: Mobile accordion item
───────────────────────────────────── */
const MobileAccordionItem = React.memo(({ cat, subs, onCategorySelect, location, getCategoryProductCount }) => {
  const [open, setOpen] = useState(false);
  const slug = cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const catImg = cat.image ? getLocalImageUrl(cat.image) : null;

  const totalProductCount = getCategoryProductCount(cat);
  const showCount = totalProductCount > 0;
  const hasSubs = subs.length > 0;

  return (
    <div className="mega-mobile-accordion-item">
      {hasSubs ? (
        <>
          <button
            type="button"
            className={`mega-mobile-accordion-trigger ${open ? 'open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              {catImg && (
                <img
                  src={catImg}
                  alt=""
                  loading="lazy"
                  style={{ width: '26px', height: '26px', borderRadius: '7px', objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <span style={{ fontFamily: 'var(--font-heading, "Outfit", sans-serif)', fontWeight: 600, fontSize: '13.5px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cat.name}
              </span>
              {showCount && (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '100px', backgroundColor: 'rgba(114,152,85,0.12)', color: '#4a7c35', flexShrink: 0 }}>
                  ({totalProductCount})
                </span>
              )}
            </span>
            <ChevronRight className={`mega-mobile-chevron ${open ? 'open' : ''}`} aria-hidden="true"
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }} />
          </button>
          <div className={`mega-mobile-panel ${open ? 'open' : ''}`} role="region">
            <div style={{ padding: '4px 16px 12px 52px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Link
                to={`/collections/${slug}`}
                onClick={() => { onCategorySelect && onCategorySelect(cat); }}
                style={{ fontSize: '12.5px', fontWeight: 600, color: '#729855', textDecoration: 'none', padding: '5px 0', display: 'block' }}
              >
                View All {cat.name} →
              </Link>
              {subs.map((sub) => {
                const subSlug = sub.slug || sub.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const isSubActive = location.pathname === `/collections/${subSlug}`;
                return (
                  <Link
                    key={sub._id || subSlug}
                    to={`/collections/${subSlug}`}
                    onClick={() => { onCategorySelect && onCategorySelect(sub); }}
                    style={{
                      fontSize: '12.5px',
                      fontWeight: isSubActive ? 600 : 500,
                      color: isSubActive ? '#2f3e10' : '#4B5563',
                      textDecoration: 'none',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      display: 'block',
                      backgroundColor: isSubActive ? 'rgba(114,152,85,0.10)' : 'transparent',
                      transition: 'background-color 150ms ease, color 150ms ease',
                    }}
                    onMouseEnter={(e) => { if (!isSubActive) { e.currentTarget.style.backgroundColor = 'rgba(114,152,85,0.07)'; e.currentTarget.style.color = '#729855'; } }}
                    onMouseLeave={(e) => { if (!isSubActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4B5563'; } }}
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <Link
          to={`/collections/${slug}`}
          onClick={() => onCategorySelect && onCategorySelect(cat)}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', transition: 'background-color 150ms ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(114,152,85,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {catImg && (
            <img src={catImg} alt="" loading="lazy"
              style={{ width: '26px', height: '26px', borderRadius: '7px', objectFit: 'cover', flexShrink: 0 }}
              onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <span style={{ fontFamily: 'var(--font-heading, "Outfit", sans-serif)', fontWeight: 600, fontSize: '13.5px', color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cat.name}
          </span>
          {showCount && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '100px', backgroundColor: 'rgba(114,152,85,0.12)', color: '#4a7c35', flexShrink: 0 }}>
              ({totalProductCount})
            </span>
          )}
          <ChevronRight style={{ width: '14px', height: '14px', color: '#9CA3AF', flexShrink: 0 }} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
});
MobileAccordionItem.displayName = 'MobileAccordionItem';

/* ─────────────────────────────────────────────────────────────────────────────
   Main CategoryList component
───────────────────────────────────────────────────────────────────────────── */
const CategoryList = React.memo(({
  categories = [],
  loading = false,
  error = null,
  onRetry,
  onCategorySelect,
}) => {
  const location = useLocation();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);

  // Fetch cached products via TanStack React Query (reuses existing cache - NO extra API calls)
  const { data: productsData = [], isLoading: isProductsLoading } = useProductsQuery();

  useEffect(() => {
    setFocusedIndex(-1);
  }, [categories]);

  const handleKeyDown = useCallback((e) => {
    if (!categories || categories.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % categories.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + categories.length) % categories.length);
    }
  }, [categories]);

  /* ── Build parent categories map ── */
  const { parentCategories, subcategoryMap } = useMemo(() => {
    const published = (categories || []).filter(c => c.status !== 'Hidden' && c.status !== 'Draft');
    const subMap = {};
    const parentIdSet = new Set();

    published.forEach(c => {
      if (c.parentCategory) {
        const pId = typeof c.parentCategory === 'object' ? c.parentCategory._id : c.parentCategory;
        if (pId) {
          const pIdStr = pId.toString();
          if (!subMap[pIdStr]) subMap[pIdStr] = [];
          subMap[pIdStr].push(c);
          parentIdSet.add(pIdStr);
        }
      } else if (Array.isArray(c.subcategories) && c.subcategories.length > 0) {
        const pIdStr = (c._id || c.slug || c.name).toString();
        subMap[pIdStr] = c.subcategories;
        parentIdSet.add(pIdStr);
      } else if (Array.isArray(c.children) && c.children.length > 0) {
        const pIdStr = (c._id || c.slug || c.name).toString();
        subMap[pIdStr] = c.children;
        parentIdSet.add(pIdStr);
      }
    });

    const parents = published.filter(c => {
      const cIdStr = c._id ? c._id.toString() : null;
      return !c.parentCategory || (cIdStr && parentIdSet.has(cIdStr));
    });

    return {
      parentCategories: parents.length > 0 ? parents : published,
      subcategoryMap: subMap,
    };
  }, [categories]);

  /* ── Helper: get subcategories for a category ── */
  const getSubsFor = useCallback((parent) => {
    if (!parent) return [];
    const key = (parent._id || parent.slug || parent.name).toString();
    const subsFromMap = subcategoryMap[key] || (parent._id ? subcategoryMap[parent._id.toString()] : []) || [];
    const directSubs = Array.isArray(parent.subcategories) && parent.subcategories.length > 0 ? parent.subcategories : (Array.isArray(parent.children) ? parent.children : []);
    return subsFromMap.length > 0 ? subsFromMap : directSubs;
  }, [subcategoryMap]);

  /* ── Active hovered category state ── */
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  useEffect(() => {
    if (parentCategories.length > 0 && activeCategoryIndex >= parentCategories.length) {
      setActiveCategoryIndex(0);
    }
  }, [parentCategories, activeCategoryIndex]);

  const activeCategory = parentCategories[activeCategoryIndex] || parentCategories[0] || null;
  const activeSubs = activeCategory ? getSubsFor(activeCategory) : [];

  /* ── Dynamic product count calculator per category ── */
  const getCategoryProductCount = useCallback((cat) => {
    if (!cat || !Array.isArray(productsData)) return 0;
    const matchedCount = getProductsByCategory(cat, productsData, categories).length;
    return matchedCount > 0 ? matchedCount : (typeof cat.productCount === 'number' ? cat.productCount : 0);
  }, [productsData, categories]);

  /* ── Filter products belonging to activeCategory using shared getProductsByCategory ── */
  const activeCategoryProducts = useMemo(() => {
    return getProductsByCategory(activeCategory, productsData, categories);
  }, [productsData, categories, activeCategory]);

  /* ────────────────────────────── Loading ── */
  if (loading && (!categories || categories.length === 0)) {
    return (
      <>
        <style>{MEGA_MENU_STYLES}</style>
        <div style={{ padding: '24px 28px', boxSizing: 'border-box' }}>
          <div className="hidden md:flex mega-split-container">
            <div className="mega-split-left space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="mega-skeleton" style={{ height: '40px', borderRadius: '10px' }} />
              ))}
            </div>
            <div className="mega-split-right space-y-4">
              <div className="mega-skeleton" style={{ height: '30px', width: '200px' }} />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="mega-skeleton" style={{ height: '140px', borderRadius: '12px' }} />
                ))}
              </div>
            </div>
          </div>
          {/* Mobile skeleton */}
          <div className="block md:hidden space-y-2">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px' }}>
                <div className="mega-skeleton" style={{ width: '26px', height: '26px', borderRadius: '8px' }} />
                <div className="mega-skeleton" style={{ height: '14px', width: '40%', marginLeft: '12px', flex: 1 }} />
                <div className="mega-skeleton" style={{ width: '20px', height: '14px', marginLeft: '12px' }} />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ────────────────────────────── Error ── */
  if (error) {
    return (
      <>
        <style>{MEGA_MENU_STYLES}</style>
        <div style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle style={{ width: '32px', height: '32px', color: '#F59E0B', marginBottom: '10px' }} />
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#729855', border: '1px solid #729855', borderRadius: '8px', background: 'transparent', cursor: 'pointer', transition: 'background-color 150ms ease, color 150ms ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#729855'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#729855'; }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Retry
            </button>
          )}
        </div>
      </>
    );
  }

  /* ────────────────────────────── Empty ── */
  if (!categories || categories.length === 0) {
    return (
      <>
        <style>{MEGA_MENU_STYLES}</style>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontFamily: 'var(--font-body, "Work Sans", sans-serif)' }}>
            No categories available.
          </p>
          <Link
            to="/collections/all"
            onClick={() => onCategorySelect && onCategorySelect(null)}
            style={{ fontSize: '12px', fontWeight: 600, color: '#729855', textDecoration: 'none' }}
          >
            View All Products →
          </Link>
        </div>
      </>
    );
  }

  /* ────────────────────────────── Full render ── */
  return (
    <>
      {/* Inject scoped mega-menu styles */}
      <style>{MEGA_MENU_STYLES}</style>

      <div className="w-full flex flex-col" onKeyDown={handleKeyDown} ref={listRef}>

        {/* ═══════════════════════════════════════════════════════════════════
            DESKTOP / TABLET 2-SECTION SPLIT MEGA MENU (≥ 768px)
            LEFT (25%): 2-Column Responsive Categories with green active state (NO Scrollbars)
            RIGHT (75%): Active Category Products & Chips in 3-Column Grid (NO Scrollbars)
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="hidden md:block w-full"
          role="menu"
          aria-label="Browse product categories"
        >
          <div className="mega-split-container">
            {/* ── LEFT SIDE (380px Width): 2-Column Compact Category Navigation ── */}
            <div className="mega-split-left" role="menu">
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-heading, "Outfit", sans-serif)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', padding: '2px 8px 8px' }}>
                Categories ({parentCategories.length})
              </div>
              <div className="mega-left-grid">
                {parentCategories.map((parent, idx) => {
                  const isActive = idx === activeCategoryIndex;
                  const pSlug = parent.slug || parent.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const parentImg = parent.image ? getLocalImageUrl(parent.image) : null;
                  const count = getCategoryProductCount(parent);

                  return (
                    <Link
                      key={parent._id || pSlug || idx}
                      to={`/collections/${pSlug}`}
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                      onClick={() => onCategorySelect && onCategorySelect(parent)}
                      className={`mega-left-item ${isActive ? 'active' : ''}`}
                      role="menuitem"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                        <div className="mega-left-icon">
                          {parentImg ? (
                            <img
                              src={parentImg}
                              alt=""
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <Tag style={{ width: '12px', height: '12px', color: isActive ? '#729855' : '#729855' }} />
                          )}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {parent.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        {count > 0 && (
                          <span style={{
                            fontSize: '9.5px',
                            fontWeight: '700',
                            padding: '1px 5px',
                            borderRadius: '100px',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(114,152,85,0.12)',
                            color: isActive ? '#FFFFFF' : '#4a7c35',
                            transition: 'all 160ms ease'
                          }}>
                            ({count})
                          </span>
                        )}
                        <ChevronRight className="mega-left-arrow" aria-hidden="true" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT SIDE (75% Width): Active Category's Products & Subcategory Chips ── */}
            <div className="mega-split-right">
              {activeCategory && (
                <>
                  {/* Active Category Header */}
                  <div className="mega-right-header">
                    <div className="mega-right-title">
                      <Sparkles style={{ width: '17px', height: '17px', color: '#729855' }} aria-hidden="true" />
                      <span>{activeCategory.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', backgroundColor: 'rgba(114,152,85,0.12)', color: '#4a7c35' }}>
                        ({activeCategoryProducts.length})
                      </span>
                    </div>
                    <Link
                      to={`/collections/${activeCategory.slug || activeCategory.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      onClick={() => onCategorySelect && onCategorySelect(activeCategory)}
                      className="mega-right-view-all"
                    >
                      <span>View All {activeCategory.name}</span>
                      <ArrowRight style={{ width: '13px', height: '13px' }} aria-hidden="true" />
                    </Link>
                  </div>

                  {/* Horizontal Subcategory Chips (If available) */}
                  {activeSubs.length > 0 && (
                    <div className="mega-chips-wrapper" role="menu">
                      {activeSubs.map((sub, sIdx) => {
                        const subObj = typeof sub === 'string' ? { name: sub, slug: sub.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : sub;
                        const subSlug = subObj.slug || subObj.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        const subImg = subObj.image ? getLocalImageUrl(subObj.image) : null;
                        const subCount = getCategoryProductCount(subObj);

                        return (
                          <Link
                            key={subObj._id || subSlug || sIdx}
                            to={`/collections/${subSlug}`}
                            onClick={() => onCategorySelect && onCategorySelect(subObj)}
                            className="mega-chip"
                            role="menuitem"
                          >
                            {subImg && (
                              <img
                                src={subImg}
                                alt=""
                                className="mega-chip-thumb"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <span>{subObj.name}</span>
                            {subCount > 0 && (
                              <span className="mega-chip-badge">({subCount})</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Active Category Product Cards (3-Column Grid, Zero Scrollbars) */}
                  {activeCategoryProducts.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', paddingTop: '2px' }}>
                      {activeCategoryProducts.slice(0, 6).map((prod) => {
                        const pImg = getLocalImageUrl(prod.images?.[0]?.secure_url || prod.images?.[0] || prod.thumbnail);
                        const pSlug = prod.slug || prod._id;
                        const price = prod.price || prod.salePrice || 0;
                        const comparePrice = prod.comparePrice || prod.mrp;
                        const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

                        return (
                          <Link
                            key={prod._id || pSlug}
                            to={`/products/${pSlug}`}
                            onClick={() => onCategorySelect && onCategorySelect(activeCategory)}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <div style={{
                              backgroundColor: '#FFFFFF',
                              border: '1.5px solid #E2E0D0',
                              borderRadius: '11px',
                              padding: '9px',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              transition: 'all 160ms ease',
                              boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#729855';
                              e.currentTarget.style.boxShadow = '0 5px 14px rgba(0,0,0,0.06)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#E2E0D0';
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.transform = 'none';
                            }}
                            >
                              {/* Product Image Thumbnail */}
                              <div style={{ width: '100%', height: '90px', borderRadius: '7px', backgroundColor: '#F7F6EF', overflow: 'hidden', marginBottom: '6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                  src={pImg}
                                  alt={prod.title}
                                  loading="lazy"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.src = '/assets/homepage/P1.jpg';
                                  }}
                                />
                                {prod.bestSeller ? (
                                  <span style={{ position: 'absolute', top: '5px', left: '5px', backgroundColor: '#729855', color: '#FFFFFF', fontSize: '8.5px', fontWeight: '700', padding: '1.5px 5px', borderRadius: '100px', textTransform: 'uppercase' }}>
                                    Bestseller
                                  </span>
                                ) : discount > 0 ? (
                                  <span style={{ position: 'absolute', top: '5px', left: '5px', backgroundColor: '#2f3e10', color: '#FFFFFF', fontSize: '8.5px', fontWeight: '700', padding: '1.5px 5px', borderRadius: '100px' }}>
                                    -{discount}%
                                  </span>
                                ) : null}
                              </div>

                              {/* Product Title & Pricing */}
                              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                <h4 style={{ fontSize: '11.5px', fontWeight: '700', color: '#1F2937', margin: '0 0 4px 0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {prod.title}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#729855' }}>
                                    ₹{price.toLocaleString('en-IN')}
                                  </span>
                                  {comparePrice && comparePrice > price && (
                                    <span style={{ fontSize: '9.5px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                                      ₹{comparePrice.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    /* Genuine empty state: displayed ONLY if database contains 0 matching products */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1.5px dashed #E2E0D0', textAlign: 'center', margin: 'auto 0' }}>
                      <Tag style={{ width: '28px', height: '28px', color: 'rgba(114,152,85,0.4)', marginBottom: '6px' }} />
                      <p style={{ fontSize: '12.5px', fontWeight: '700', color: '#374151', margin: '0 0 3px 0' }}>
                        Explore {activeCategory.name} Collection
                      </p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 10px 0', maxWidth: '220px' }}>
                        Browse all bio-active organic skincare items in this collection.
                      </p>
                      <Link
                        to={`/collections/${activeCategory.slug || activeCategory.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        onClick={() => onCategorySelect && onCategorySelect(activeCategory)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '700', color: '#729855', textDecoration: 'none' }}
                      >
                        <span>View All {activeCategory.name}</span>
                        <ArrowRight style={{ width: '12px', height: '12px' }} />
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            MOBILE ACCORDION (< 768px)
            Touch-friendly accordion
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="block md:hidden">
          {/* "All Collections" quick link */}
          <div style={{ padding: '6px 14px 4px', borderBottom: '1px solid rgba(234,232,216,0.6)' }}>
            <Link
              to="/collections/all"
              onClick={() => onCategorySelect && onCategorySelect(null)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 700, color: '#729855', textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'background-color 150ms ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(114,152,85,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Grid style={{ width: '14px', height: '14px' }} aria-hidden="true" />
                All Collections
              </span>
              <span aria-hidden="true">›</span>
            </Link>
          </div>

          {/* Accordion items */}
          <div
            role="menu"
            aria-label="Category menu"
          >
            {parentCategories.map((cat) => {
              const subs = getSubsFor(cat);
              return (
                <MobileAccordionItem
                  key={cat._id || cat.slug || cat.name}
                  cat={cat}
                  subs={subs}
                  onCategorySelect={onCategorySelect}
                  location={location}
                  getCategoryProductCount={getCategoryProductCount}
                />
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
});

CategoryList.displayName = 'CategoryList';

export default CategoryList;
