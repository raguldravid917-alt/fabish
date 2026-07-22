import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CategoryItem from './CategoryItem';
import { RefreshCw, Grid, AlertCircle, ChevronRight, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getLocalImageUrl } from '../../utils/imageMapper';

/* ─────────────────────────────────────────────────────────────────────────────
   CategoryList — Premium 2026 Catalog Mega Menu
   Desktop (≥1024px): Full-width, equal columns, large thumbnails, polished
   Tablet (768–1023px): 3-column condensed view
   Mobile (<768px): Accordion-style stacked single column
   
   RULES:
   • productCount is shown ONLY when count > 0 (never shows 0, 1-dummy or any
     placeholder; comes 100% from backend API)
   • All data is dynamic (collections, thumbnails, routes, subcategories)
   • Mobile list is preserved exactly as original
───────────────────────────────────────────────────────────────────────────── */

/* ── Inline CSS for mega-menu-specific styles (no global pollution) ── */
const MEGA_MENU_STYLES = `
  .mega-desktop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px 16px;
    align-items: start;
    width: 100%;
    box-sizing: border-box;
  }

  @media (min-width: 1280px) {
    .mega-desktop-grid {
      grid-template-columns: repeat(6, minmax(180px, 1fr));
    }
  }

  .mega-col {
    display: flex;
    flex-direction: column;
    padding: 8px 10px;
    border-right: 1px solid #EDEBD8;
    transition: background-color 180ms ease;
    border-radius: 12px;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
  }
  .mega-col:last-child {
    border-right: none;
  }
  .mega-col:hover {
    background-color: rgba(114, 152, 85, 0.03);
  }
  .mega-col-first {
    /* Inherits equal column padding */
  }
  .mega-col-last {
    border-right: none;
  }

  /* ── Thumbnail container ── */
  .mega-thumb {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    overflow: hidden;
    border: 1.5px solid #D8E8C8;
    background-color: #EEF3E8;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease;
    will-change: transform;
  }
  .mega-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 300ms ease;
  }
  .mega-col-header:hover .mega-thumb {
    box-shadow: 0 6px 18px rgba(114, 152, 85, 0.30);
    border-color: #729855;
    transform: translateY(-1px);
  }
  .mega-col-header:hover .mega-thumb img {
    transform: scale(1.06);
  }

  /* ── Category title ── */
  .mega-cat-title {
    font-family: var(--font-heading, 'Outfit', sans-serif);
    font-weight: 700;
    font-size: 14px;
    color: #111827;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 200ms ease;
    line-height: 1.3;
  }
  .mega-col-header:hover .mega-cat-title {
    color: #729855;
  }

  /* ── Product count badge ── */
  .mega-count-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 100px;
    background-color: rgba(114, 152, 85, 0.12);
    color: #4a7c35;
    flex-shrink: 0;
    letter-spacing: 0.02em;
    white-space: nowrap;
    transition: background-color 200ms ease, color 200ms ease;
  }
  .mega-col-header:hover .mega-count-badge {
    background-color: #729855;
    color: #fff;
  }

  /* ── Divider line ── */
  .mega-divider {
    height: 2px;
    background-color: #E5E3D4;
    margin: 12px 0;
    border-radius: 2px;
    transition: background-color 200ms ease;
  }
  .mega-col:hover .mega-divider {
    background-color: #729855;
  }

  /* ── Subcategory items ── */
  .mega-sub-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 13px;
    font-family: var(--font-body, 'Work Sans', sans-serif);
    font-weight: 500;
    color: #4B5563;
    background-color: transparent;
    border-left: 2px solid transparent;
    transition: background-color 150ms ease, color 150ms ease,
                border-left-color 150ms ease, transform 120ms ease;
    cursor: pointer;
    will-change: transform;
    min-width: 0;
  }
  .mega-sub-link:hover {
    background-color: rgba(114, 152, 85, 0.09);
    color: #729855;
    border-left-color: #729855;
    transform: translateX(2px);
  }
  .mega-sub-link.active-sub {
    background-color: rgba(114, 152, 85, 0.12);
    color: #2f3e10;
    border-left-color: #729855;
    font-weight: 600;
  }
  .mega-sub-arrow {
    width: 13px;
    height: 13px;
    color: #729855;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 150ms ease, transform 150ms ease;
  }
  .mega-sub-link:hover .mega-sub-arrow,
  .mega-sub-link.active-sub .mega-sub-arrow {
    opacity: 1;
    transform: translateX(2px);
  }

  /* ── Explore link fallback ── */
  .mega-explore-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: #729855;
    text-decoration: none;
    transition: color 150ms ease, gap 150ms ease;
    padding: 4px 0;
  }
  .mega-explore-link:hover {
    color: #2f3e10;
    gap: 8px;
  }

  /* ── Footer banner ── */
  .mega-footer-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: rgba(114, 152, 85, 0.06);
    padding: 14px 20px;
    border-radius: 12px;
    margin-top: 24px;
    border: 1px solid rgba(114, 152, 85, 0.1);
    transition: background-color 200ms ease, border-color 200ms ease;
  }
  .mega-footer-banner:hover {
    background-color: rgba(114, 152, 85, 0.10);
    border-color: rgba(114, 152, 85, 0.2);
  }
  .mega-footer-cta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    color: #729855;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: color 150ms ease, gap 150ms ease;
  }
  .mega-footer-cta:hover {
    color: #2f3e10;
    gap: 7px;
  }

  /* ── Focus ring for accessibility ── */
  .mega-col-header:focus-visible,
  .mega-sub-link:focus-visible,
  .mega-explore-link:focus-visible,
  .mega-footer-cta:focus-visible {
    outline: 2px solid #729855;
    outline-offset: 2px;
    border-radius: 6px;
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

  /* ── Tablet responsive: 3 columns ── */
  @media (min-width: 768px) and (max-width: 1023px) {
    .mega-desktop-grid {
      grid-template-columns: repeat(3, minmax(160px, 1fr)) !important;
      gap: 16px 12px;
    }
    .mega-col {
      padding: 6px 8px;
    }
    .mega-thumb {
      width: 42px;
      height: 42px;
    }
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
    padding: 14px 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    gap: 12px;
    transition: background-color 150ms ease;
  }
  .mega-mobile-accordion-trigger:hover {
    background-color: rgba(114, 152, 85, 0.05);
  }
  .mega-mobile-accordion-trigger.open {
    background-color: rgba(114, 152, 85, 0.07);
  }
  .mega-mobile-chevron {
    width: 16px;
    height: 16px;
    color: #729855;
    flex-shrink: 0;
    transition: transform 250ms ease;
  }
  .mega-mobile-chevron.open {
    transform: rotate(180deg);
  }
  .mega-mobile-panel {
    overflow: hidden;
    transition: max-height 280ms cubic-bezier(0.16, 1, 0.3, 1),
                opacity 250ms ease;
    max-height: 0;
    opacity: 0;
  }
  .mega-mobile-panel.open {
    max-height: 600px;
    opacity: 1;
  }
`;

/* ─────────────────────────────────────
   Sub-component: Single column cell
───────────────────────────────────── */
const MegaColumn = React.memo(({ parent, subs, colIdx, isFirst, isLast, onCategorySelect, location }) => {
  const pSlug = parent.slug || parent.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const isParentActive = location.pathname === `/collections/${pSlug}`;
  const parentImg = parent.image ? getLocalImageUrl(parent.image) : null;

  // Calculate total product count dynamically (parent direct count + sum of subcategory product counts)
  const totalProductCount = useMemo(() => {
    const parentCount = typeof parent.productCount === 'number' ? parent.productCount : 0;
    const subSum = (subs || []).reduce((acc, sub) => acc + (typeof sub.productCount === 'number' ? sub.productCount : 0), 0);
    return Math.max(parentCount, subSum);
  }, [parent.productCount, subs]);

  const showCount = totalProductCount > 0;

  return (
    <div
      className={`mega-col ${isFirst ? 'mega-col-first' : ''} ${isLast ? 'mega-col-last' : ''}`}
    >
      {/* ── Category Header: Thumbnail + Title + Count + Divider ── */}
      <Link
        to={`/collections/${pSlug}`}
        onClick={() => onCategorySelect && onCategorySelect(parent)}
        style={{ textDecoration: 'none', display: 'block' }}
        aria-label={`Browse ${parent.name} collection`}
        className="mega-col-header"
        tabIndex={0}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          {/* Thumbnail */}
          <div className="mega-thumb" role="img" aria-hidden="true">
            {parentImg ? (
              <img
                src={parentImg}
                alt=""
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <Tag style={{ width: '20px', height: '20px', color: '#729855' }} />
            )}
          </div>

          {/* Title & Count */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
              <span
                className="mega-cat-title"
                style={{ color: isParentActive ? '#729855' : undefined }}
              >
                {parent.name}
              </span>
              {showCount && (
                <span className="mega-count-badge" aria-label={`${totalProductCount} products`}>
                  {totalProductCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mega-divider" aria-hidden="true" />
      </Link>

      {/* ── Subcategories ── */}
      {subs.length > 0 ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1px' }} role="menu">
          {subs.map((sub) => {
            const subSlug = sub.slug || sub.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const isSubActive = location.pathname === `/collections/${subSlug}`;
            const subImg = sub.image ? getLocalImageUrl(sub.image) : null;
            const showSubCount = typeof sub.productCount === 'number' && sub.productCount > 0;

            return (
              <li key={sub._id || subSlug} role="none">
                <Link
                  to={`/collections/${subSlug}`}
                  onClick={() => onCategorySelect && onCategorySelect(sub)}
                  className={`mega-sub-link ${isSubActive ? 'active-sub' : ''}`}
                  role="menuitem"
                  aria-current={isSubActive ? 'page' : undefined}
                  tabIndex={0}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, overflow: 'hidden' }}>
                    {subImg && (
                      <img
                        src={subImg}
                        alt=""
                        loading="lazy"
                        style={{ width: '15px', height: '15px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, opacity: 0.8 }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub.name}
                    </span>
                    {showSubCount && (
                      <span style={{ fontSize: '10px', color: '#9CA3AF', flexShrink: 0 }}>
                        ({sub.productCount})
                      </span>
                    )}
                  </span>
                  <ChevronRight className="mega-sub-arrow" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        /* Fallback: Explore link when no subcategories */
        <div style={{ paddingTop: '4px' }}>
          <Link
            to={`/collections/${pSlug}`}
            onClick={() => onCategorySelect && onCategorySelect(parent)}
            className="mega-explore-link"
            tabIndex={0}
          >
            <span>Explore Collection</span>
            <ArrowRight style={{ width: '13px', height: '13px' }} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
});
MegaColumn.displayName = 'MegaColumn';

/* ─────────────────────────────────────
   Sub-component: Mobile accordion item
───────────────────────────────────── */
const MobileAccordionItem = React.memo(({ cat, subs, onCategorySelect, location }) => {
  const [open, setOpen] = useState(false);
  const slug = cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const catImg = cat.image ? getLocalImageUrl(cat.image) : null;

  const totalProductCount = useMemo(() => {
    const catCount = typeof cat.productCount === 'number' ? cat.productCount : 0;
    const subSum = (subs || []).reduce((acc, sub) => acc + (typeof sub.productCount === 'number' ? sub.productCount : 0), 0);
    return Math.max(catCount, subSum);
  }, [cat.productCount, subs]);

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
                  style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <span style={{ fontFamily: 'var(--font-heading, "Outfit", sans-serif)', fontWeight: 600, fontSize: '14px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cat.name}
              </span>
              {showCount && (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '100px', backgroundColor: 'rgba(114,152,85,0.12)', color: '#4a7c35', flexShrink: 0 }}>
                  {totalProductCount}
                </span>
              )}
            </span>
            <ChevronRight className={`mega-mobile-chevron ${open ? 'open' : ''}`} aria-hidden="true"
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }} />
          </button>
          <div className={`mega-mobile-panel ${open ? 'open' : ''}`} role="region">
            <div style={{ padding: '4px 16px 12px 56px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Link
                to={`/collections/${slug}`}
                onClick={() => { onCategorySelect && onCategorySelect(cat); }}
                style={{ fontSize: '13px', fontWeight: 600, color: '#729855', textDecoration: 'none', padding: '5px 0', display: 'block' }}
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
                      fontSize: '13px',
                      fontWeight: isSubActive ? 600 : 500,
                      color: isSubActive ? '#2f3e10' : '#4B5563',
                      textDecoration: 'none',
                      padding: '6px 10px',
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
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', transition: 'background-color 150ms ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(114,152,85,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {catImg && (
            <img src={catImg} alt="" loading="lazy"
              style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
              onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <span style={{ fontFamily: 'var(--font-heading, "Outfit", sans-serif)', fontWeight: 600, fontSize: '14px', color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cat.name}
          </span>
          {showCount && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '100px', backgroundColor: 'rgba(114,152,85,0.12)', color: '#4a7c35', flexShrink: 0 }}>
              {totalProductCount}
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

  /* ── Build parent → subcategory map ── */
  const { parentCategories, subcategoryMap, standaloneCategories } = useMemo(() => {
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
      standaloneCategories: published,
    };
  }, [categories]);

  /* ── Helper: get subs for a parent ── */
  const getSubsFor = useCallback((parent) => {
    const key = (parent._id || parent.slug || parent.name).toString();
    return subcategoryMap[key] || (parent._id ? subcategoryMap[parent._id.toString()] : []) || [];
  }, [subcategoryMap]);

  /* ── Column count: 3–6 based on number of categories ── */
  const colCount = Math.min(Math.max(parentCategories.length, 3), 6);

  /* ────────────────────────────── Loading ── */
  if (loading) {
    return (
      <>
        <style>{MEGA_MENU_STYLES}</style>
        <div style={{ padding: '28px 32px 24px', boxSizing: 'border-box' }}>
          <div className="hidden lg:grid mega-desktop-grid">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="mega-col" style={{ paddingLeft: idx === 1 ? '0' : undefined, borderRight: idx === 6 ? 'none' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <div className="mega-skeleton" style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="mega-skeleton" style={{ height: '14px', width: '80%', marginBottom: '6px' }} />
                    <div className="mega-skeleton" style={{ height: '10px', width: '40%' }} />
                  </div>
                </div>
                <div className="mega-divider" style={{ marginTop: '12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="mega-skeleton" style={{ height: '28px', borderRadius: '8px', width: j % 2 === 0 ? '85%' : '70%' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Mobile skeleton */}
          <div className="block lg:hidden space-y-2">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '8px' }}>
                <div className="mega-skeleton" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
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
        <div style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
        <div style={{ padding: '48px', textAlign: 'center' }}>
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
            DESKTOP / TABLET PREMIUM MEGA MENU (≥ 768px)
            Solid opaque surface · equal columns · strong visual hierarchy
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="hidden md:block"
          style={{ padding: '28px 32px 24px', boxSizing: 'border-box', width: '100%' }}
          role="menu"
          aria-label="Browse product categories"
        >
          {parentCategories.length > 0 ? (
            /* ── Multi-column equal grid ── */
            <div className="mega-desktop-grid">
              {parentCategories.map((parent, colIdx) => {
                const subs = getSubsFor(parent);
                const isFirst = colIdx === 0;
                const isLast = colIdx === parentCategories.length - 1;
                return (
                  <MegaColumn
                    key={parent._id || parent.slug || parent.name}
                    parent={parent}
                    subs={subs}
                    colIdx={colIdx}
                    isFirst={isFirst}
                    isLast={isLast}
                    onCategorySelect={onCategorySelect}
                    location={location}
                  />
                );
              })}
            </div>
          ) : (
            /* ── Fallback: standalone categories grid ── */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
              {standaloneCategories.map((cat, idx) => (
                <CategoryItem
                  key={cat._id || cat.slug || idx}
                  category={cat}
                  onSelect={onCategorySelect}
                  isFocused={idx === focusedIndex}
                />
              ))}
            </div>
          )}

          {/* ── Footer CTA Banner ── */}
          <div className="mega-footer-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ width: '15px', height: '15px', color: '#729855', flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-heading, "Outfit", sans-serif)', fontWeight: 700, color: '#2f3e10', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Explore All Fabish Formulations &amp; Collections
              </span>
            </div>
            <Link
              to="/collections/all"
              onClick={() => onCategorySelect && onCategorySelect(null)}
              className="mega-footer-cta"
              tabIndex={0}
            >
              View All Collections
              <ArrowRight style={{ width: '13px', height: '13px' }} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            MOBILE ACCORDION (< 768px)
            Touch-friendly accordion, 2-col sub grid where space allows
            ⚠️ Original mobile list structure is preserved & extended
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="block md:hidden">
          {/* "All Collections" quick link */}
          <div style={{ padding: '6px 16px 4px', borderBottom: '1px solid rgba(234,232,216,0.6)' }}>
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
            style={{ maxHeight: '420px', overflowY: 'auto' }}
            className="custom-scrollbar"
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
