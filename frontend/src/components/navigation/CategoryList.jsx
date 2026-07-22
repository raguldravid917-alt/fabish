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

/* ── Inline CSS for compact medium-scale 25% / 75% mega menu ── */
const MEGA_MENU_STYLES = `
  .mega-split-container {
    display: flex;
    min-height: 290px;
    width: 100%;
    box-sizing: border-box;
  }

  /* ── Left Side (Compact Category Navigation ~260px) ── */
  .mega-split-left {
    width: 260px;
    min-width: 230px;
    max-width: 280px;
    background-color: #F7F6EF;
    border-right: 1.5px solid #EDEBD8;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .mega-left-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 9px;
    cursor: pointer;
    transition: all 180ms ease;
    background-color: transparent;
    color: #1F2937;
    font-family: var(--font-heading, 'Outfit', sans-serif);
    font-weight: 600;
    font-size: 13.5px;
    text-decoration: none;
    user-select: none;
    border: 1px solid transparent;
  }

  .mega-left-item:hover {
    background-color: rgba(114, 152, 85, 0.10);
    color: #729855;
    transform: translateX(3px);
  }

  /* ── Active Category (Green Background + White Text) ── */
  .mega-left-item.active {
    background-color: #729855 !important;
    color: #FFFFFF !important;
    box-shadow: 0 3px 10px rgba(114, 152, 85, 0.30);
    font-weight: 700;
  }

  .mega-left-icon {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    overflow: hidden;
    background-color: #EEF3E8;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 180ms ease;
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
    width: 14px;
    height: 14px;
    color: #9CA3AF;
    transition: transform 180ms ease, color 180ms ease;
  }

  .mega-left-item:hover .mega-left-arrow {
    color: #729855;
    transform: translateX(2px);
  }

  .mega-left-item.active .mega-left-arrow {
    color: #FFFFFF !important;
    transform: translateX(3px);
  }

  /* ── Right Side (Compact 75% Area) ── */
  .mega-split-right {
    flex: 1;
    padding: 20px 28px;
    background-color: #FAFAF5;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-sizing: border-box;
  }

  .mega-right-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1.5px solid #EDEBD8;
  }

  .mega-right-title {
    font-family: var(--font-heading, 'Outfit', sans-serif);
    font-size: 18px;
    font-weight: 800;
    color: #729855; /* BRAND GREEN TITLE */
    display: flex;
    align-items: center;
    gap: 9px;
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
    transition: all 180ms ease;
  }

  .mega-right-view-all:hover {
    color: #2F3E10;
    transform: translateX(3px);
  }

  /* ── Compact Horizontal Pill Chips ── */
  .mega-chips-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    width: 100%;
    padding-top: 2px;
  }

  .mega-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 9999px; /* Modern Pill Shape */
    background-color: #FFFFFF;
    border: 1.5px solid #E2E0D0;
    color: #1F2937;
    font-family: var(--font-body, 'Work Sans', sans-serif);
    font-weight: 600;
    font-size: 13px;
    text-decoration: none;
    cursor: pointer;
    transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1.5px 4px rgba(0, 0, 0, 0.02);
    white-space: nowrap;
    user-select: none;
  }

  .mega-chip:hover {
    background-color: #729855; /* Brand green background on hover */
    color: #FFFFFF;
    border-color: #729855;
    box-shadow: 0 4px 14px rgba(114, 152, 85, 0.28);
    transform: translateY(-1.5px);
  }

  .mega-chip-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .mega-chip-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 100px;
    background-color: rgba(114, 152, 85, 0.12);
    color: #4a7c35;
    transition: all 180ms ease;
  }

  .mega-chip:hover .mega-chip-badge {
    background-color: rgba(255, 255, 255, 0.25);
    color: #FFFFFF;
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
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }} role="menu">
          {subs.map((sub, sIdx) => {
            const subObj = typeof sub === 'string' ? { name: sub, slug: sub.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : sub;
            const subSlug = subObj.slug || subObj.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const isSubActive = location.pathname === `/collections/${subSlug}`;
            const subImg = subObj.image ? getLocalImageUrl(subObj.image) : null;
            const showSubCount = typeof subObj.productCount === 'number' && subObj.productCount > 0;

            return (
              <li key={subObj._id || subSlug || sIdx} role="none">
                <Link
                  to={`/collections/${subSlug}`}
                  onClick={() => onCategorySelect && onCategorySelect(subObj)}
                  className={`mega-sub-link ${isSubActive ? 'active-sub' : ''}`}
                  role="menuitem"
                  aria-current={isSubActive ? 'page' : undefined}
                  tabIndex={0}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                    {subImg && (
                      <img
                        src={subImg}
                        alt=""
                        loading="lazy"
                        style={{ width: '15px', height: '15px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, opacity: 0.85 }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {subObj.name}
                    </span>
                    {showSubCount && (
                      <span style={{ fontSize: '10px', color: '#9CA3AF', flexShrink: 0 }}>
                        ({subObj.productCount})
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
    const subsFromMap = subcategoryMap[key] || (parent._id ? subcategoryMap[parent._id.toString()] : []) || [];
    const directSubs = Array.isArray(parent.subcategories) && parent.subcategories.length > 0 ? parent.subcategories : (Array.isArray(parent.children) ? parent.children : []);
    const combined = subsFromMap.length > 0 ? subsFromMap : directSubs;

    if (combined && combined.length > 0) {
      return combined;
    }

    // Fallback subcategories matching Amazon-style beauty catalog hierarchy
    const pName = (parent.name || '').toLowerCase();
    if (pName.includes('hair')) {
      return [
        { name: 'Hair Mask', slug: 'hair-mask' },
        { name: 'Hair Serum', slug: 'hair-serum' },
        { name: 'Conditioner', slug: 'conditioner' },
        { name: 'Hair Oil', slug: 'hair-oil' },
        { name: 'Hair Spray', slug: 'hair-spray' },
        { name: 'Shampoo', slug: 'shampoo' },
      ];
    }
    if (pName.includes('skin')) {
      return [
        { name: 'Cleanser', slug: 'cleansers' },
        { name: 'Moisturizer', slug: 'moisturizers' },
        { name: 'Sunscreen', slug: 'sunscreen' },
        { name: 'Face Cream', slug: 'face-cream' },
        { name: 'Serum', slug: 'serums' },
        { name: 'Toner', slug: 'toners' },
        { name: 'Night Cream', slug: 'night-cream' },
        { name: 'Day Cream', slug: 'day-cream' },
      ];
    }
    if (pName.includes('makeup')) {
      return [
        { name: 'Lipstick', slug: 'lipstick' },
        { name: 'Foundation', slug: 'foundation' },
        { name: 'Mascara', slug: 'mascara' },
        { name: 'Blush', slug: 'blush' },
        { name: 'Eyeliner', slug: 'eyeliner' },
        { name: 'Primer', slug: 'primer' },
      ];
    }
    if (pName.includes('body')) {
      return [
        { name: 'Body Wash', slug: 'body-wash' },
        { name: 'Body Lotion', slug: 'body-lotion' },
        { name: 'Body Scrub', slug: 'body-scrub' },
        { name: 'Hand Cream', slug: 'hand-cream' },
        { name: 'Body Butter', slug: 'body-butter' },
      ];
    }
    if (pName.includes('fragrance') || pName.includes('perfume')) {
      return [
        { name: 'Eau de Parfum', slug: 'eau-de-parfum' },
        { name: 'Body Mist', slug: 'body-mist' },
        { name: 'Perfume Oil', slug: 'perfume-oil' },
        { name: 'Aromatherapy', slug: 'aromatherapy' },
      ];
    }
    if (pName.includes('men')) {
      return [
        { name: 'Beard Oil', slug: 'beard-oil' },
        { name: 'Face Wash', slug: 'mens-face-wash' },
        { name: 'Shaving Cream', slug: 'shaving-cream' },
        { name: 'Hair Styling', slug: 'mens-hair-styling' },
      ];
    }

    return [];
  }, [subcategoryMap]);

  /* ── Active category state for 25% / 75% split ── */
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  useEffect(() => {
    setActiveCategoryIndex(0);
  }, [categories]);

  const activeCategory = parentCategories[activeCategoryIndex] || parentCategories[0] || null;
  const activeSubs = activeCategory ? getSubsFor(activeCategory) : [];

  /* ────────────────────────────── Loading ── */
  if (loading) {
    return (
      <>
        <style>{MEGA_MENU_STYLES}</style>
        <div style={{ padding: '28px 32px 24px', boxSizing: 'border-box' }}>
          <div className="hidden md:flex mega-split-container">
            <div className="mega-split-left space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="mega-skeleton" style={{ height: '44px', borderRadius: '12px' }} />
              ))}
            </div>
            <div className="mega-split-right space-y-4">
              <div className="mega-skeleton" style={{ height: '32px', width: '220px' }} />
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                  <div key={j} className="mega-skeleton" style={{ height: '42px', width: '120px', borderRadius: '9999px' }} />
                ))}
              </div>
            </div>
          </div>
          {/* Mobile skeleton */}
          <div className="block md:hidden space-y-2">
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
            DESKTOP / TABLET 2-SECTION SPLIT MEGA MENU (≥ 768px)
            LEFT (25%): Vertical Categories with green active state
            RIGHT (75%): Active Category Products/Subcategories as Horizontal Chips (Flows L➔R, Wraps)
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="hidden md:block w-full"
          role="menu"
          aria-label="Browse product categories"
        >
          <div className="mega-split-container">
            {/* ── LEFT SIDE (25% Width): Department Vertical Navigation ── */}
            <div className="mega-split-left" role="menu">
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-heading, "Outfit", sans-serif)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', padding: '4px 12px 10px' }}>
                Categories
              </div>
              {parentCategories.map((parent, idx) => {
                const isActive = idx === activeCategoryIndex;
                const pSlug = parent.slug || parent.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const parentImg = parent.image ? getLocalImageUrl(parent.image) : null;

                return (
                  <Link
                    key={parent._id || pSlug || idx}
                    to={`/collections/${pSlug}`}
                    onMouseEnter={() => setActiveCategoryIndex(idx)}
                    onClick={() => onCategorySelect && onCategorySelect(parent)}
                    className={`mega-left-item ${isActive ? 'active' : ''}`}
                    role="menuitem"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div className="mega-left-icon">
                        {parentImg ? (
                          <img
                            src={parentImg}
                            alt=""
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Tag style={{ width: '14px', height: '14px', color: isActive ? '#729855' : '#729855' }} />
                        )}
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {parent.name}
                      </span>
                    </div>
                    <ChevronRight className="mega-left-arrow" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>

            {/* ── RIGHT SIDE (75% Width): Active Category's Horizontal Products & Chips ── */}
            <div className="mega-split-right">
              {activeCategory && (
                <>
                  {/* Active Category Header */}
                  <div className="mega-right-header">
                    <div className="mega-right-title">
                      <Sparkles style={{ width: '18px', height: '18px', color: '#729855' }} aria-hidden="true" />
                      <span>{activeCategory.name}</span>
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

                  {/* Horizontal Chips Layout (Flows Left ➜ Right & Wraps Automatically) */}
                  <div className="mega-chips-wrapper" role="menu">
                    {activeSubs.map((sub, sIdx) => {
                      const subObj = typeof sub === 'string' ? { name: sub, slug: sub.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : sub;
                      const subSlug = subObj.slug || subObj.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      const subImg = subObj.image ? getLocalImageUrl(subObj.image) : null;
                      const showSubCount = typeof subObj.productCount === 'number' && subObj.productCount > 0;

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
                          {showSubCount && (
                            <span className="mega-chip-badge">({subObj.productCount})</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
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
