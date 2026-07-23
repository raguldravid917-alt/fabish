import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Link, useNavigate } from 'react-router-dom';
import { getLocalImageUrl } from '../utils/imageMapper';
import { productService } from '../api/productService';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useWishlistStore } from '../store/wishlist.store';
import { useCartStore } from '../store/cart.store';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowRight,
  Sparkles,
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  CheckCircle2,
  Layers,
  TrendingUp,
  Filter,
  Grid,
  Menu,
  Eye,
  RefreshCw
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Collections — Premium 2026 Enterprise eCommerce Experience (All Collections Page)
   
   STRICT RULES PRESERVED:
   • All backend APIs, endpoints, and productService queries remain 100% intact
   • Route paths (/collections, /collections/:slug, /products/:slug) remain unchanged
   • Existing hero banner preserved & visually enhanced to match All Products page
   • Preserves Zustand cart/wishlist integration, search filtering, and React Query cache
───────────────────────────────────────────────────────────────────────────── */

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

const SKIN_CONCERNS = [
  { name: 'Dry Skin', key: 'dry' },
  { name: 'Oily Skin', key: 'oily' },
  { name: 'Combination', key: 'combination' },
  { name: 'Sensitive Skin', key: 'sensitive' },
  { name: 'Acne Care', key: 'acne' },
  { name: 'Brightening', key: 'brightening' },
  { name: 'Anti Aging', key: 'aging' },
  { name: 'Hydration', key: 'hydration' }
];

const Collections = () => {
  useDocumentTitle('All Collections');
  const navigate = useNavigate();

  const { categories, loading: categoriesLoading } = useCategories();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Zustand Store integrations
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConcern, setSelectedConcern] = useState('');
  const [activeSort, setActiveSort] = useState("MOST PRODUCTS");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [addedToastProduct, setAddedToastProduct] = useState(null);

  // Default grid columns: 5 on xl desktop, 4 on desktop, 3 on tablet, 2 on mobile
  const [gridCols, setGridCols] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 2 : 5
  );

  // Accordion toggle sections for sidebar
  const [openSections, setOpenSections] = useState({
    categories: true,
    concerns: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    return (wishlistItems || []).some(
      (item) => (item._id || item.id || item).toString() === productId.toString()
    );
  }, [wishlistItems]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedToastProduct(product.title);
    setTimeout(() => setAddedToastProduct(null), 2500);
  };

  // Fetch products dynamically for count matching & bestsellers preview
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const res = await productService.getAll({ limit: 120 });
        if (isMounted && res.success) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching products for Collections page:', err);
      } finally {
        if (isMounted) setProductsLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  // Filter dynamic published categories
  const publishedCategories = useMemo(() => {
    return (categories || []).filter((cat) => cat.status === 'Published');
  }, [categories]);

  // Distinguish Parent Categories (Roots) from subcategories
  const parentCategories = useMemo(() => {
    return publishedCategories.filter((cat) => !cat.parentCategory);
  }, [publishedCategories]);

  // Helper to resolve products for a category
  const getProductsForCategory = useCallback((parentCat) => {
    if (!parentCat || !Array.isArray(products)) return [];
    
    const targetId = parentCat._id ? parentCat._id.toString() : null;
    const targetSlug = (parentCat.slug || parentCat.name || '').toLowerCase().trim();

    const subCategoryIds = publishedCategories
      .filter((c) => {
        const parentId = c.parentCategory
          ? typeof c.parentCategory === 'object'
            ? c.parentCategory._id
            : c.parentCategory
          : null;
        return parentId && targetId && parentId.toString() === targetId;
      })
      .map((c) => c._id ? c._id.toString() : '');

    return products.filter((p) => {
      if (!p) return false;
      let pCatId = null;
      let pCatSlug = '';

      if (typeof p.category === 'object' && p.category !== null) {
        pCatId = p.category._id ? p.category._id.toString() : null;
        pCatSlug = (p.category.slug || p.category.name || '').toLowerCase().trim();
      } else if (typeof p.category === 'string') {
        pCatId = p.category;
        pCatSlug = p.category.toLowerCase().trim();
      }

      if (targetId && pCatId === targetId) return true;
      if (pCatId && subCategoryIds.includes(pCatId)) return true;
      if (targetSlug && pCatSlug === targetSlug) return true;
      if (p.title && targetSlug && p.title.toLowerCase().includes(targetSlug.replace(/-/g, ' '))) return true;

      return false;
    });
  }, [publishedCategories, products]);

  // Helper to extract child subcategories
  const getSubcategoriesForCategory = useCallback((parentCat) => {
    return publishedCategories.filter((c) => {
      const parentId = c.parentCategory
        ? typeof c.parentCategory === 'object'
          ? c.parentCategory._id
          : c.parentCategory
        : null;
      return parentId && parentCat._id && parentId.toString() === parentCat._id.toString();
    });
  }, [publishedCategories]);

  // Instant Search & Filter Query
  const filteredParentCategories = useMemo(() => {
    return parentCategories.filter((parentCat) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = parentCat.name?.toLowerCase().includes(query);
        const descMatch = parentCat.description?.toLowerCase().includes(query);
        const subCats = getSubcategoriesForCategory(parentCat);
        const subMatch = subCats.some((sub) => sub.name?.toLowerCase().includes(query));
        if (!nameMatch && !descMatch && !subMatch) return false;
      }

      if (selectedConcern) {
        const concernNorm = selectedConcern.toLowerCase();
        const nameMatch = parentCat.name?.toLowerCase().includes(concernNorm);
        const descMatch = parentCat.description?.toLowerCase().includes(concernNorm);
        const subCats = getSubcategoriesForCategory(parentCat);
        const subMatch = subCats.some((sub) => sub.name?.toLowerCase().includes(concernNorm));
        if (!nameMatch && !descMatch && !subMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeSort === "ALPHABETICALLY, A-Z") {
        return a.name.localeCompare(b.name);
      }
      if (activeSort === "ALPHABETICALLY, Z-A") {
        return b.name.localeCompare(a.name);
      }
      if (activeSort === "MOST PRODUCTS") {
        return getProductsForCategory(b).length - getProductsForCategory(a).length;
      }
      return 0;
    });
  }, [parentCategories, searchQuery, selectedConcern, activeSort, getSubcategoriesForCategory, getProductsForCategory]);

  // Featured Products preview
  const featuredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const bests = products.filter((p) => p.featured || p.bestSeller);
    return bests.length >= 4 ? bests.slice(0, 8) : products.slice(0, 8);
  }, [products]);

  // Trending Collections
  const trendingCollections = useMemo(() => {
    return parentCategories.slice(0, 4);
  }, [parentCategories]);

  // Dynamic grid class
  const gridClass = useMemo(() => {
    switch (gridCols) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-3";
      case 4: return "grid-cols-4";
      case 5:
      default: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    }
  }, [gridCols]);

  const isLoading = categoriesLoading || productsLoading;

  return (
    <div className="w-full bg-[#FAFAF5] text-left select-none min-h-screen font-body">

      {/* Toast Notification */}
      {addedToastProduct && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#729855] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border border-white/20">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-heading font-bold">
            Added &quot;{addedToastProduct}&quot; to your bag!
          </span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          1. HERO BANNER (PRESERVED CONTENT & ROUTING, ENHANCED VISUALS)
      ───────────────────────────────────────────────────────────────── */}
      <style>{`
        .catalog-banner {
          width: 100%;
          min-height: 140px;
          padding: 24px 16px;
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
          background: rgba(245, 240, 230, 0.50);
          backdrop-filter: blur(2px);
        }
        .catalog-banner h1 {
          position: relative;
          z-index: 2;
          font-family: var(--font-heading, 'Outfit', 'Work Sans', sans-serif);
          font-size: 38px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          letter-spacing: 0.01em;
        }
      `}</style>
      
      <div className="catalog-banner sm:!h-[280px]">
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-heading font-extrabold uppercase tracking-[0.2em] text-[#729855] bg-white/80 px-3.5 py-1 rounded-full border border-[#E5E3D4] mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#729855]" />
            Curated Organic Ranges
          </span>
          <h1>All Collections</h1>
          <p className="text-[10.5px] sm:text-[11.5px] font-heading font-bold uppercase tracking-widest text-[#6B7280] mt-2">
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#729855] transition-colors">Home</Link>
            <span className="mx-2 text-[#9CA3AF]">/</span>
            <span className="text-[#111827]">Catalog</span>
            <span className="mx-2 text-[#9CA3AF]">/</span>
            <span className="text-[#729855]">All Collections</span>
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          2. SHOP BY SKIN CONCERN QUICK STRIP
      ───────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-2">
        <div className="bg-white rounded-2xl border border-[#E5E3D4] p-3 sm:p-4 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#729855] shrink-0 flex items-center gap-1 pl-1 pr-2">
            <Layers className="w-3.5 h-3.5" />
            Skin Concerns:
          </span>
          <button
            type="button"
            onClick={() => setSelectedConcern('')}
            className={`text-xs font-heading font-bold px-3.5 py-1.5 rounded-full transition-all shrink-0 cursor-pointer border ${
              selectedConcern === ''
                ? 'bg-[#729855] text-white border-[#729855] shadow-2xs'
                : 'bg-[#FAFAF5] text-[#374151] border-[#E5E3D4] hover:border-[#729855] hover:text-[#729855]'
            }`}
          >
            All Concerns
          </button>
          {SKIN_CONCERNS.map((concern) => {
            const isSelected = selectedConcern === concern.key;
            return (
              <button
                key={concern.key}
                type="button"
                onClick={() => setSelectedConcern(isSelected ? '' : concern.key)}
                className={`text-xs font-heading font-bold px-3.5 py-1.5 rounded-full transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#729855] text-white border-[#729855] shadow-2xs'
                    : 'bg-[#FAFAF5] text-[#374151] border-[#E5E3D4] hover:border-[#729855] hover:text-[#729855]'
                }`}
              >
                {concern.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          3. MAIN CATALOG WORKSPACE CONTAINER
      ───────────────────────────────────────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">

        {/* TOP TOOLBAR & SEARCH BAR */}
        <div className="bg-white rounded-2xl border border-[#E5E3D4] p-4 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[12px] sm:text-[13px] font-heading font-extrabold text-[#111827]">
              Showing <span className="text-[#729855]">{filteredParentCategories.length}</span> Organic Collections
            </span>
          </div>

          {/* Search Box & Controls */}
          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#729855] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections..."
                aria-label="Search collections"
                className="w-full pl-10 pr-9 py-2.5 bg-[#FAFAF5] border border-[#E5E3D4] rounded-xl text-xs sm:text-sm font-body text-[#111827] placeholder:text-gray-400 focus:border-[#729855] outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 bg-transparent border-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grid Switcher */}
            <div className="flex items-center gap-1 bg-[#FAFAF5] p-1 rounded-xl border border-[#E5E3D4]">
              <button
                type="button"
                onClick={() => setGridCols(1)}
                aria-label="1 Column View"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${gridCols === 1 ? 'bg-[#729855] text-white' : 'text-gray-500'}`}
              >
                <Menu className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(3)}
                aria-label="3 Columns View"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${gridCols === 3 ? 'bg-[#729855] text-white' : 'text-gray-500'}`}
              >
                <div className="flex gap-[2px]">
                  <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                  <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                  <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGridCols(5)}
                aria-label="5 Columns View"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${gridCols === 5 ? 'bg-[#729855] text-white' : 'text-gray-500'}`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[170px]">
              <button
                type="button"
                className="w-full h-9 sm:h-10 px-3.5 bg-[#FAFAF5] border border-[#E5E3D4] rounded-xl flex items-center justify-between gap-2 cursor-pointer outline-none hover:border-[#729855] transition-colors"
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                <span className="text-[11px] font-heading font-extrabold text-[#111827] tracking-[0.05em] uppercase truncate">{activeSort}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#729855] flex-shrink-0" />
              </button>
              {isSortOpen && (
                <div className="absolute top-full right-0 mt-2 w-full min-w-[190px] bg-white shadow-2xl rounded-2xl border border-[#E5E3D4] py-2 z-50 flex flex-col overflow-hidden">
                  {["MOST PRODUCTS", "ALPHABETICALLY, A-Z", "ALPHABETICALLY, Z-A"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`text-left px-4 py-2 text-[11px] font-heading font-bold uppercase cursor-pointer hover:bg-[#FAF9F5] transition-colors bg-transparent border-none ${activeSort === option ? 'text-[#729855] bg-[#729855]/10 font-extrabold' : 'text-[#374151]'}`}
                      onClick={() => {
                        setActiveSort(option);
                        setIsSortOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            4. 2026 CATEGORY COLLECTION CARDS GRID
        ───────────────────────────────────────────────────────────────── */}
        {isLoading ? (
          /* Shimmer Skeletons */
          <div className={`grid ${gridClass} gap-6 mb-16`}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-4 border border-[#E5E3D4] shadow-xs animate-pulse flex flex-col gap-3"
              >
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-2xl" />
                <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                <div className="h-3 bg-gray-200 rounded-md w-1/2" />
                <div className="h-8 bg-gray-200 rounded-xl w-full mt-2" />
              </div>
            ))}
          </div>
        ) : filteredParentCategories.length > 0 ? (
          /* Responsive 2026 Category Collection Cards Grid */
          <div className={`grid ${gridClass} gap-6 mb-16`}>
            {filteredParentCategories.map((parentCat) => {
              const catProducts = getProductsForCategory(parentCat);
              const subCategories = getSubcategoriesForCategory(parentCat);
              const parentLink = `/collections/${parentCat.slug}`;

              const rawImg = parentCat.image || (catProducts[0]?.images?.[0] || catProducts[0]?.image);
              const catImg = rawImg ? getLocalImageUrl(ensureAbsolutePath(rawImg)) : '/assets/homepage/P1.jpg';

              return (
                <Link
                  key={parentCat._id}
                  to={parentLink}
                  onClick={() => window.scrollTo(0, 0)}
                  className="group relative bg-white hover:bg-[#FAFAF5] rounded-3xl border border-[#E5E3D4] hover:border-[#729855] p-4 sm:p-5 shadow-xs hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full no-underline cursor-pointer overflow-hidden"
                >
                  <div>
                    {/* Large Category Thumbnail Image Container */}
                    <div className="relative w-full aspect-[4/3] bg-[#F7F6EF] rounded-2xl overflow-hidden mb-4 border border-[#E5E3D4] flex items-center justify-center">
                      <img
                        src={catImg}
                        alt={parentCat.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                        onError={(e) => { e.target.src = '/assets/homepage/P1.jpg'; }}
                      />
                      
                      {/* Floating Product Count Badge */}
                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#2f3e10] text-[10px] sm:text-[11px] font-heading font-extrabold px-2.5 py-1 rounded-full shadow-xs border border-[#E5E3D4]">
                        {catProducts.length} Product{catProducts.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Category Title */}
                    <h3 className="font-heading text-base sm:text-lg font-bold text-[#111827] group-hover:text-[#729855] transition-colors leading-snug mb-1.5 line-clamp-1">
                      {parentCat.name}
                    </h3>

                    {/* Category Description */}
                    {parentCat.description ? (
                      <p className="text-[11px] sm:text-xs text-[#6B7280] font-body line-clamp-2 leading-relaxed mb-3">
                        {parentCat.description}
                      </p>
                    ) : (
                      <p className="text-[11px] sm:text-xs text-[#9CA3AF] font-body line-clamp-1 mb-3">
                        Bio-active botanical formulations for {parentCat.name.toLowerCase()}.
                      </p>
                    )}

                    {/* Subcategories Pills Preview */}
                    {subCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {subCategories.slice(0, 3).map((sub) => (
                          <span
                            key={sub._id}
                            className="text-[10px] font-medium text-[#4B5563] bg-[#F7F6EF] border border-[#E5E3D4] px-2 py-0.5 rounded-full"
                          >
                            {sub.name}
                          </span>
                        ))}
                        {subCategories.length > 3 && (
                          <span className="text-[9.5px] font-bold text-[#729855] bg-[#729855]/10 px-1.5 py-0.5 rounded-full">
                            +{subCategories.length - 3} More
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Bar */}
                  <div className="pt-3.5 border-t border-[#EDEBD8] flex items-center justify-between mt-2">
                    <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#729855] group-hover:text-[#2f3e10] transition-colors flex items-center gap-1">
                      Explore Collection
                    </span>
                    <span className="w-7.5 h-7.5 rounded-full bg-[#729855] group-hover:bg-[#2f3e10] text-white flex items-center justify-center transition-all shadow-xs group-hover:translate-x-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty Search Result State */
          <div className="py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-[#E5E3D4] max-w-lg mx-auto mb-16">
            <Tag className="w-10 h-10 text-[#729855]/40 mx-auto mb-3" />
            <h3 className="text-lg font-heading font-bold text-[#111827] mb-1">
              No collections found matching &quot;{searchQuery || selectedConcern}&quot;
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">
              Try resetting your search query or selecting all skin concerns.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedConcern(''); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#729855] hover:bg-[#2f3e10] text-white text-xs font-heading font-bold rounded-xl transition-colors cursor-pointer border-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Search Filters
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            5. TRENDING COLLECTIONS SHOWCASE BANNER
        ───────────────────────────────────────────────────────────────── */}
        {trendingCollections.length > 0 && (
          <div className="mb-16 bg-gradient-to-r from-[#2f3e10] to-[#729855] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-heading font-extrabold uppercase tracking-[0.2em] text-[#D8E8C8] mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trending Skincare Ranges
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">
                  Popular Organic Collections
                </h3>
              </div>
              <Link
                to="/collections/all"
                className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-white hover:text-[#D8E8C8] transition-colors"
              >
                <span>Browse All Ranges</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {trendingCollections.map((col) => {
                const cProds = getProductsForCategory(col);
                const rawImg = col.image || (cProds[0]?.images?.[0] || cProds[0]?.image);
                const img = rawImg ? getLocalImageUrl(ensureAbsolutePath(rawImg)) : '/assets/homepage/P1.jpg';

                return (
                  <Link
                    key={col._id}
                    to={`/collections/${col.slug}`}
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 text-white no-underline"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/20 flex-shrink-0 border border-white/30">
                      <img src={img} alt={col.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onError={(e) => { e.target.src = '/assets/homepage/P1.jpg'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-sm font-bold truncate group-hover:text-[#D8E8C8] transition-colors">
                        {col.name}
                      </h4>
                      <p className="text-[11px] text-white/80 font-body">
                        {cProds.length} Products
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            6. FEATURED PRODUCTS SHOWCASE (EXACT AMAZON LUXURY CARD MATCH)
        ───────────────────────────────────────────────────────────────── */}
        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E5E3D4] gap-3">
              <div>
                <span className="text-[11px] font-heading font-extrabold uppercase tracking-[0.2em] text-[#729855] block mb-1">
                  Bestsellers &amp; Favorites
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#111827]">
                  Top-Rated Organic Products
                </h3>
              </div>
              <Link
                to="/collections/all"
                className="text-xs font-heading font-bold uppercase tracking-wider text-[#729855] hover:text-[#2f3e10] transition-colors flex items-center gap-1"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4-Column Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
                const pImg = getLocalImageUrl(ensureAbsolutePath(product.images?.[0] || product.thumbnail || '/assets/homepage/P1.jpg'));
                const price = product.price || 0;
                const comparePrice = product.comparePrice || product.mrp;
                const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
                const inWishlist = isInWishlist(product._id);
                const isSoldOut = product.stock === 0;

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-3xl border border-[#E5E3D4] hover:border-[#729855] p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Badges & Wishlist Heart */}
                    <div className="relative w-full aspect-square bg-[#F7F6EF] rounded-2xl overflow-hidden mb-3 flex items-center justify-center border border-[#E5E3D4]">
                      <img
                        src={pImg}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                        onError={(e) => { e.target.src = '/assets/homepage/P1.jpg'; }}
                      />

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                        {discount > 0 && (
                          <span className="bg-[#2f3e10] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-xs">
                            -{discount}% OFF
                          </span>
                        )}
                        {product.bestSeller && (
                          <span className="bg-[#729855] text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-xs">
                            Bestseller
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        aria-label="Toggle Wishlist"
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 border-none cursor-pointer ${
                          inWishlist
                            ? 'bg-[#2f3e10] text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-[#729855] hover:text-white shadow-xs'
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
                      </button>

                      {/* Add to Cart Overlay Button */}
                      {!isSoldOut && (
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full py-2 bg-[#729855] hover:bg-[#2f3e10] text-white text-[11px] font-heading font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-colors border-none cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add To Bag
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-1 justify-between">
                      <div>
                        {/* Category Tag */}
                        <span className="text-[10px] font-heading font-extrabold text-[#729855] uppercase tracking-wider block mb-1">
                          {typeof product.category === 'object' ? product.category?.name : (product.category || 'SKINCARE')}
                        </span>

                        {/* Title */}
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-[#111827] group-hover:text-[#729855] transition-colors leading-snug line-clamp-2 mb-1.5">
                          <Link to={`/products/${product.slug}`} onClick={() => window.scrollTo(0, 0)}>
                            {product.title}
                          </Link>
                        </h4>

                        {/* Ratings */}
                        <div className="flex items-center gap-1 mb-2 text-[11px]">
                          <div className="flex items-center text-[#F59E0B] text-xs">
                            {'★'.repeat(5)}
                          </div>
                          <span className="font-bold text-[#111827]">{product.ratings || 4.8}</span>
                          <span className="text-gray-400 text-[10px]">({product.reviewsCount || 34})</span>
                        </div>
                      </div>

                      {/* Price & Delivery */}
                      <div className="pt-2 border-t border-[#F0EFE6] flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-extrabold text-[#2f3e10]">
                            Rs. {price.toLocaleString('en-IN')}.00
                          </span>
                          {comparePrice && comparePrice > price && (
                            <span className="text-xs text-gray-400 line-through">
                              Rs. {comparePrice.toLocaleString('en-IN')}.00
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-[#729855] flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          Free Ship
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Collections;