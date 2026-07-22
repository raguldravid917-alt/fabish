import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { useCategories } from '../../context/CategoryContext';
import CategoryList from './CategoryList';

/* ─────────────────────────────────────────────────────────────────────────────
   CatalogDropdown
   Premium 2026 mega menu container. Handles open/close logic, positioning,
   and the accent header. Content is rendered by CategoryList.
   
   STRICT RULES:
   • Does NOT modify anything outside this component
   • All data comes from CategoryContext (dynamic — no hardcoding)
   • Solid background only (no transparency / backdrop-blur)
   • Fixed position, high z-index, always above page content
───────────────────────────────────────────────────────────────────────────── */

const CatalogDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { categories, loading, refreshCategories } = useCategories();
  const [fetchError, setFetchError] = useState(null);

  const containerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const isCatalogActive = location.pathname.startsWith('/collections');

  /* ── Anti-flicker: open immediately on enter ── */
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  /* ── Anti-flicker: 150ms buffer on leave ── */
  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }, []);

  /* ── Touch/tablet: toggle on click ── */
  const handleClick = useCallback((e) => {
    if (window.innerWidth < 1024) {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }, []);

  /* ── Click-outside & Escape to close ── */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  /* ── Close on route change ── */
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleRetry = useCallback(() => {
    setFetchError(null);
    refreshCategories();
  }, [refreshCategories]);

  return (
    <div
      ref={containerRef}
      className="relative h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Catalog Trigger Button ── */}
      <Link
        to="/collections"
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="catalog-mega-menu"
        className={`flex items-center gap-1.5 text-[16px] font-heading font-normal py-[5px] px-[16px] h-full transition-colors ${
          isOpen || isCatalogActive ? 'text-[#729855]' : 'text-black hover:text-[#729855]'
        }`}
        style={{ textDecoration: 'none' }}
      >
        <span>Catalog</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#729855]' : 'text-gray-600'
          }`}
          aria-hidden="true"
        />
      </Link>

      {/* ══════════════════════════════════════════════════════════════════
          MEGA MENU PANEL
          ─ Fixed so it always floats above page content
          ─ Solid opaque background (NO transparency, NO backdrop-blur)
          ─ Perfectly centered, full content-width
          ─ Large rounded corners + premium layered shadow
          ─ Smooth 180ms fade + slide-down animation
          ─ z-index 9999 covers every section including heroes & banners
      ══════════════════════════════════════════════════════════════════ */}
      <div
        id="catalog-mega-menu"
        role="menu"
        aria-label="Catalog mega menu"
        aria-hidden={!isOpen}
        style={{
          /* ── Position ── */
          position: 'fixed',
          top: '66px',
          left: '50%',

          /* ── Size: fills viewport minus 24px gutter each side, capped at 1400px ── */
          width: 'min(1400px, calc(100vw - 48px))',
          maxWidth: '100%',
          boxSizing: 'border-box',

          /* ── Transform: center + slide animation ── */
          transform: isOpen
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(-10px)',

          /* ── Solid opaque background — NO transparency ── */
          backgroundColor: '#FAFAF5',

          /* ── Premium card aesthetics ── */
          borderRadius: '20px',
          border: '1px solid #E5E3D4',
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.04), ' +
            '0 20px 60px -10px rgba(0,0,0,0.16), ' +
            '0 10px 28px -6px rgba(0,0,0,0.08)',

          /* ── Always above everything ── */
          zIndex: 9999,
          height: 'auto',
          overflow: 'hidden',

          /* ── Smooth open/close (180ms) ── */
          transition: 'opacity 180ms ease-out, transform 180ms ease-out',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transformOrigin: 'top center',
          willChange: 'opacity, transform',
        }}
      >
        {/* ── Accent Header Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '13px 40px',
            borderBottom: '1px solid #E5E3D4',
            backgroundColor: '#F2F0E6',
          }}
        >
          {/* Left: label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutGrid
              style={{ width: '15px', height: '15px', color: '#729855', flexShrink: 0 }}
              aria-hidden="true"
            />
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#2f3e10',
              }}
            >
              Shop By Category
            </span>
          </div>

          {/* Right: count + browse all */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {categories && categories.length > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-body, "Work Sans", sans-serif)',
                  color: '#888',
                  fontWeight: 500,
                }}
                aria-live="polite"
              >
                {categories.length} Collection{categories.length !== 1 ? 's' : ''}
              </span>
            )}
            <Link
              to="/collections/all"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
                fontWeight: 700,
                color: '#729855',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2f3e10')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#729855')}
              tabIndex={isOpen ? 0 : -1}
            >
              Browse All →
            </Link>
          </div>
        </div>

        {/* ── Mega Menu Content ── */}
        <CategoryList
          categories={categories}
          loading={loading}
          error={fetchError}
          onRetry={handleRetry}
          onCategorySelect={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
};

export default CatalogDropdown;
