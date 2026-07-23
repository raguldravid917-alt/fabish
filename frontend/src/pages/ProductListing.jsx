import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Eye, Heart, Menu, X, Sparkles, Filter, ShieldCheck, ShoppingBag, Star, RefreshCw, Layers } from 'lucide-react';
import { productService } from '../api/productService';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { getLocalImageUrl } from '../utils/imageMapper';
import Loader from '../components/ui/Loader';
import { useCategories } from '../hooks/useCategories';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMobileCardActive } from '../hooks/useMobileCardActive';
import { usePrefetchProduct } from '../hooks/useProductsQuery';
import { getSkinTypeConfig, filterProductsBySkinType } from '../config/skinTypes';

/* ─────────────────────────────────────────────────────────────────────────────
   ProductListing — Premium 2026 Enterprise eCommerce Experience
   (Skin Care & Catalog Category Page)
   
   STRICT RULES PRESERVED:
   • All backend APIs, productService requests, routes (/collections/:categorySlug) unchanged
   • Existing pagination (16 items/page), sorting, filters, wishlist, and cart logic preserved
   • Redesigned with Amazon Luxury Beauty / Sephora / Dior Beauty aesthetics
───────────────────────────────────────────────────────────────────────────── */

const slugify = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const MIN_NEW_ARRIVALS = 3;

const fetchWithRetry = async (fn, options = {}) => {
  const { retries = 2, baseDelayMs = 300, label = 'request' } = options;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fn();
      if (res && res.success === false) {
        throw new Error(res.message || 'API responded with success: false');
      }
      return res;
    } catch (err) {
      lastError = err;
      const isFinalAttempt = attempt === retries;
      if (!isFinalAttempt) {
        const delayMs = baseDelayMs * 2 ** attempt;
        console.warn(`[ProductListing] ${label} failed (attempt ${attempt + 1}/${retries + 1}). Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error(`[ProductListing] ${label} failed.`, lastError);
  throw lastError;
};

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

/* ── 2026 Amazon Luxury Beauty Inspired Product Card ── */
const ListingProductCard = ({
  product,
  gridCols,
  cardWidthClass,
  isInWishlist,
  toggleWishlist,
  addToCart,
  handleImageError
}) => {
  const cardRef = useRef(null);
  const { isActiveMobile, useMobileInteraction, handleCardInteraction, cardId } = useMobileCardActive(product._id, cardRef);
  const prefetchProduct = usePrefetchProduct();

  const mainImg = getLocalImageUrl(ensureAbsolutePath(product.images?.[0] || product.image || '/assets/14.jpg'));
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const isSoldOut = product.stock === 0;

  const ratingValue = product.rating || product.ratings || 4.8;
  const reviewCount = product.reviewsCount || product.numReviews || (product.price ? (product.price % 37) + 14 : 28);
  const inWishlist = product?._id && isInWishlist(product._id);

  return (
    <div
      ref={cardRef}
      data-card-id={cardId}
      onClickCapture={handleCardInteraction}
      onMouseEnter={() => prefetchProduct(product.slug)}
      className={`group relative bg-white hover:bg-[#FAFAF5] rounded-3xl border border-[#E5E3D4] hover:border-[#729855] p-3 sm:p-4 shadow-xs hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full w-full overflow-hidden ${cardWidthClass}`}
    >
      <div>
        {/* Large Product Image Box */}
        <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#F7F6EF] rounded-2xl overflow-hidden mb-3 border border-[#E5E3D4] flex items-center justify-center p-2">
          
          {/* Top Left Badges */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
            {isSoldOut ? (
              <span className="bg-[#111827] text-white text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                Sold Out
              </span>
            ) : discount > 0 ? (
              <span className="bg-[#729855] text-white text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                -{discount}% OFF
              </span>
            ) : null}
            {product.bestSeller && !isSoldOut && (
              <span className="bg-[#2f3e10] text-white text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                Organic
              </span>
            )}
          </div>

          {/* Product Image Link */}
          <Link to={`/products/${product.slug}`} onClick={() => window.scrollTo(0, 0)} className="w-full h-full block relative z-0">
            <img
              src={mainImg}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 p-1"
              onError={handleImageError}
              loading="lazy"
            />
          </Link>

          {/* Floating Action Buttons (Top Right) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-20">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
              aria-label={`Add ${product.title} to wishlist`}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all border-none cursor-pointer ${
                inWishlist
                  ? 'bg-[#2f3e10] text-white'
                  : 'bg-white/95 text-[#111827] hover:bg-[#729855] hover:text-white'
              }`}
            >
              <Heart size={14} strokeWidth={2} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <Link
              to={`/products/${product.slug}`}
              onClick={(e) => { e.stopPropagation(); window.scrollTo(0, 0); }}
              aria-label={`Quick view ${product.title}`}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 text-[#111827] shadow-md hover:bg-[#729855] hover:text-white flex items-center justify-center hover:scale-110 transition-all cursor-pointer no-underline"
            >
              <Eye size={14} strokeWidth={2} />
            </Link>
          </div>

          {/* Desktop Hover Add To Cart Overlay */}
          {!isSoldOut && (
            <div className={`absolute bottom-3 left-3 right-3 hidden lg:flex justify-center transition-all duration-300 z-20 opacity-0 group-hover:opacity-100`}>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); }}
                className="w-full py-2 px-3 bg-[#729855] hover:bg-[#2f3e10] text-white text-[10.5px] font-heading font-extrabold uppercase tracking-wider rounded-xl transition-colors shadow-md border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShoppingBag size={13} />
                Add To Cart
              </button>
            </div>
          )}
        </div>

        {/* Product Category Subtitle */}
        <span className="text-[9.5px] sm:text-[10px] font-heading font-extrabold text-[#729855] uppercase tracking-wider block mb-0.5 line-clamp-1">
          {typeof product.category === 'object' ? product.category?.name : (product.category || 'ORGANIC SKINCARE')}
        </span>

        {/* Product Title (line-clamp-2) */}
        <h3 className="font-heading font-bold text-[12.5px] sm:text-[14px] text-[#111827] group-hover:text-[#729855] transition-colors leading-snug line-clamp-2 mb-1.5 cursor-pointer">
          <Link to={`/products/${product.slug}`} onClick={() => window.scrollTo(0, 0)}>
            {product.title}
          </Link>
        </h3>

        {/* Rating Stars & Count */}
        <div className="flex items-center gap-1 mb-2 text-[10px] sm:text-[11px]">
          <div className="flex items-center text-[#F59E0B] text-[10px]">
            {'★'.repeat(5)}
          </div>
          <span className="font-bold text-[#111827]">{ratingValue}</span>
          <span className="text-[#6B7280] text-[9.5px]">({reviewCount})</span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-1.5 mb-2 flex-wrap">
          <span className="text-[14px] sm:text-[16px] font-extrabold text-[#2f3e10] font-body whitespace-nowrap">
            Rs. {(product?.price ?? 0).toLocaleString('en-IN')}.00
          </span>
          {product.comparePrice > product.price && (
            <span className="text-[11px] sm:text-[12px] text-[#9CA3AF] line-through font-body whitespace-nowrap">
              Rs. {product.comparePrice.toLocaleString('en-IN')}.00
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-2.5 border-t border-[#EDEBD8] flex flex-col gap-1.5 mt-auto">
        <div className="flex items-center justify-between text-[9.5px] sm:text-[10px] font-medium text-[#6B7280]">
          <span className="flex items-center gap-1 text-[#4B5563]">
            <span className={`w-1.5 h-1.5 rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-[#729855]'}`}></span>
            {isSoldOut ? 'Out of Stock' : 'In Stock'}
          </span>
          <span className="text-[#729855] font-semibold flex items-center gap-0.5">
            <ShieldCheck size={11} />
            Free Shipping
          </span>
        </div>

        {/* Mobile Always-Visible Add to Cart Button */}
        <div className="block lg:hidden mt-1">
          {!isSoldOut ? (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); }}
              className="w-full py-1.5 px-2 bg-[#729855] active:bg-[#2f3e10] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-colors shadow-2xs border-none cursor-pointer flex items-center justify-center gap-1"
            >
              <ShoppingBag size={12} />
              Add To Cart
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-1.5 px-2 bg-gray-200 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-xl border-none cursor-not-allowed"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SKIN_CONCERNS = [
  { name: 'Dry Skin', key: 'Dry' },
  { name: 'Oily Skin', key: 'Oily' },
  { name: 'Combination', key: 'Medium' },
  { name: 'Sensitive Skin', key: 'Sensitive' },
  { name: 'Acne Care', key: 'Fair' },
  { name: 'Brightening', key: 'Light' }
];

const ProductListing = () => {
  const { categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { categories, loading: categoriesLoading } = useCategories();

  const isValidCategory = useMemo(() => {
    if (!categorySlug || categorySlug === 'all') return true;
    if (getSkinTypeConfig(categorySlug)) return true;
    if (categoriesLoading) return true;

    return categories.some(cat => {
      const slug = cat.slug || slugify(cat.name);
      return slug === categorySlug || 
             (categorySlug === 'lotion' && slug === 'body-lotion') ||
             (categorySlug === 'cleanse' && slug === 'cleanser') ||
             (categorySlug === 'serums' && slug === 'serum');
    });
  }, [categorySlug, categories, categoriesLoading]);

  const displayTitle = useMemo(() => {
    if (!categorySlug || categorySlug === 'all') return 'All Products';
    const skinConfig = getSkinTypeConfig(categorySlug);
    if (skinConfig) return `${skinConfig.name} Collection`;

    const cat = categories.find(c => {
      const slug = c.slug || slugify(c.name);
      return slug === categorySlug || 
             (categorySlug === 'lotion' && slug === 'body-lotion') ||
             (categorySlug === 'cleanse' && slug === 'cleanser') ||
             (categorySlug === 'serums' && slug === 'serum');
    });
    return cat ? cat.name : categorySlug.replace(/-/g, ' ').toUpperCase();
  }, [categorySlug, categories]);

  useDocumentTitle(displayTitle);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("BEST SELLING");

  // Default to 4 columns on desktop, 2 columns on tablet/mobile
  const [gridCols, setGridCols] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 2 : 4
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const [openSections, setOpenSections] = useState({
    availability: true,
    skinType: true,
    unitCount: true,
  });

  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellerIndex, setBestSellerIndex] = useState(0);
  const [bestSeller, setBestSeller] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.classList.add('body-scroll-lock');
    } else {
      document.body.classList.remove('body-scroll-lock');
    }
    return () => {
      document.body.classList.remove('body-scroll-lock');
    };
  }, [isFilterDrawerOpen]);

  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedUnitCounts, setSelectedUnitCounts] = useState([]);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const searchKeyword = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('search') || '';
  }, [location.search]);

  const getSortParam = (sortLabel) => {
    switch (sortLabel) {
      case "PRICE, LOW TO HIGH":
        return "priceAsc";
      case "PRICE, HIGH TO LOW":
        return "priceDesc";
      case "ALPHABETICALLY, A-Z":
        return "titleAsc";
      case "ALPHABETICALLY, Z-A":
        return "titleDesc";
      case "DATE, OLD TO NEW":
        return "created-ascending";
      case "DATE, NEW TO OLD":
        return "newest";
      case "FEATURED":
        return "rating";
      case "MOST RELEVANT":
        return "newest";
      case "BEST SELLING":
      default:
        return "newest";
    }
  };

  const handlePrevBestSeller = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (bestSellers && bestSellers.length > 0) {
      setBestSellerIndex((prev) => (prev - 1 + bestSellers.length) % bestSellers.length);
    }
  }, [bestSellers]);

  const handleNextBestSeller = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (bestSellers && bestSellers.length > 0) {
      setBestSellerIndex((prev) => (prev + 1) % bestSellers.length);
    }
  }, [bestSellers]);

  const currentBestSeller = useMemo(() => {
    if (bestSellers && bestSellers.length > bestSellerIndex) {
      return bestSellers[bestSellerIndex];
    }
    return bestSeller;
  }, [bestSellers, bestSellerIndex, bestSeller]);

  useEffect(() => {
    let isMounted = true;

    const fetchSideData = async () => {
      try {
        const bsRes = await productService.getAll({ bestSeller: true, limit: 5 });
        if (isMounted) {
          if (bsRes?.success && bsRes.data?.length > 0) {
            setBestSellers(bsRes.data);
            setBestSeller(bsRes.data[0]);
          } else {
            setBestSellers([]);
            setBestSeller(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setBestSellers([]);
          setBestSeller(null);
        }
      }

      try {
        const naRes = await productService.getAll({ newArrival: true, limit: MIN_NEW_ARRIVALS });
        if (isMounted) {
          if (naRes?.success && naRes.data?.length > 0) {
            setNewArrivals(naRes.data);
          } else {
            setNewArrivals([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setNewArrivals([]);
        }
      }
    };

    fetchSideData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = {
          limit: 100,
          sort: getSortParam(activeSort)
        };

        if (categorySlug && categorySlug !== 'all') {
          const isSkinTypeCollection = !!getSkinTypeConfig(categorySlug);
          if (!isSkinTypeCollection) {
            queryParams.category = categorySlug;
          }
        }

        if (searchKeyword) {
          queryParams.keyword = searchKeyword;
        }

        const res = await fetchWithRetry(() => productService.getAll(queryParams), {
          label: 'product list fetch',
        });

        if (isMounted && res?.success) {
          setProducts(res.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [categorySlug, searchKeyword, activeSort]);

  const toggleFilter = (type, value) => {
    if (type === 'availability') {
      setSelectedAvailability(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    } else if (type === 'skinType') {
      setSelectedSkinTypes(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    } else if (type === 'unitCount') {
      setSelectedUnitCounts(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, selectedAvailability, selectedSkinTypes, selectedUnitCounts, activeSort]);

  const filteredProducts = useMemo(() => {
    let list = products;
    const skinConfig = getSkinTypeConfig(categorySlug);
    if (skinConfig) {
      list = filterProductsBySkinType(products, categorySlug);
    }

    return list.filter((product) => {
      if (selectedAvailability.length > 0) {
        const inStock = product.stock > 0;
        const wantsInStock = selectedAvailability.includes('In stock');
        const wantsOutOfStock = selectedAvailability.includes('Out of stock');
        if (wantsInStock && !wantsOutOfStock && !inStock) return false;
        if (wantsOutOfStock && !wantsInStock && inStock) return false;
      }

      if (selectedSkinTypes.length > 0) {
        const matchesSkin = selectedSkinTypes.some((type) =>
          product.tags?.some((tag) => tag.toLowerCase() === type.toLowerCase()) ||
          product.variants?.some((v) => v.toLowerCase() === type.toLowerCase()) ||
          product.description?.toLowerCase().includes(type.toLowerCase())
        );
        if (!matchesSkin) return false;
      }

      if (selectedUnitCounts.length > 0) {
        const matchesUnit = selectedUnitCounts.some((unit) => {
          const numOnly = unit.split(' ')[0];
          return (
            product.variants?.some((v) => v.toLowerCase().includes(numOnly)) ||
            product.tags?.some((tag) => tag.toLowerCase().includes(numOnly)) ||
            product.title?.toLowerCase().includes(numOnly) ||
            product.description?.toLowerCase().includes(numOnly)
          );
        });
        if (!matchesUnit) return false;
      }

      return true;
    });
  }, [products, selectedAvailability, selectedSkinTypes, selectedUnitCounts]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const showingStart = filteredProducts.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  const sortOptions = [
    "FEATURED", "MOST RELEVANT", "BEST SELLING", "ALPHABETICALLY, A-Z",
    "ALPHABETICALLY, Z-A", "PRICE, LOW TO HIGH", "PRICE, HIGH TO LOW",
    "DATE, OLD TO NEW", "DATE, NEW TO OLD"
  ];

  const skinTypeOptions = ["Dark", "Fair", "Light", "Medium", "Sensitive"];

  const unitCountOptions = [
    "120.0 millilitre",
    "150.0 millilitre",
    "200.0 millilitre",
    "300.0 millilitre",
    "400.0 millilitre",
    "600.0 millilitre",
  ];

  const gridClass = useMemo(() => {
    switch (gridCols) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
      default:
        return "grid-cols-4";
    }
  }, [gridCols]);

  const handleImageError = useCallback((e) => {
    if (e.target.src.indexOf('/assets/14.jpg') === -1) {
      e.target.src = '/assets/14.jpg';
    }
  }, []);

  if (!categoriesLoading && !isValidCategory) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#FAFAF5] px-6">
        <h1 className="text-[60px] font-heading font-bold text-[#729855] mb-2">404</h1>
        <h2 className="text-[24px] font-heading font-semibold text-[#111827] mb-4">Collection Not Found</h2>
        <p className="text-[#6B7280] mb-8 text-center max-w-md font-body leading-relaxed">
          The collection you are looking for does not exist or has been removed.
        </p>
        <Link 
          to="/collections/all" 
          className="bg-[#729855] hover:bg-[#2f3e10] text-white px-8 py-3.5 rounded-xl font-heading font-bold text-xs uppercase tracking-widest transition-all text-center inline-block"
          style={{ textDecoration: 'none' }}
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAFAF5] font-body min-h-screen text-left select-none">

      {/* ─────────────────────────────────────────────────────────────────
          1. TOP ENHANCED HERO BANNER (PRESERVED CONTENT & ROUTING)
      ───────────────────────────────────────────────────────────────── */}
      <div
        className="relative w-full py-6 sm:py-0 sm:h-[300px] flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
        style={{ backgroundImage: `url('/assets/Rectangle_337.jpg')` }}
      >
        <div className="absolute inset-0 bg-[#FAFAF5]/60 backdrop-blur-[2px]"></div>
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-heading font-extrabold uppercase tracking-[0.2em] text-[#729855] bg-white/80 px-3.5 py-1 rounded-full border border-[#E5E3D4] mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#729855]" />
            Organic Skincare Collection
          </span>
          <h1 className="text-[30px] sm:text-[44px] font-heading font-extrabold text-[#111827] mb-2 tracking-tight leading-tight">
            {displayTitle}
          </h1>
          <p className="text-[10px] sm:text-[11.5px] font-heading font-bold uppercase tracking-widest text-[#6B7280]">
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#729855] transition-colors">Home</Link>
            <span className="mx-2 text-[#9CA3AF]">/</span>
            <Link to="/collections" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#729855] transition-colors">Catalog</Link>
            <span className="mx-2 text-[#9CA3AF]">/</span>
            <span className="text-[#111827]">{displayTitle}</span>
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          2. SHOP BY SKIN CONCERN BAR (QUICK DISCOVERY)
      ───────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-2">
        <div className="bg-white rounded-2xl border border-[#E5E3D4] p-3 sm:p-4 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#729855] shrink-0 flex items-center gap-1 pl-1 pr-2">
            <Layers className="w-3.5 h-3.5" />
            Skin Concerns:
          </span>
          {SKIN_CONCERNS.map((concern) => {
            const isSelected = selectedSkinTypes.includes(concern.key);
            return (
              <button
                key={concern.key}
                type="button"
                onClick={() => toggleFilter('skinType', concern.key)}
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
          3. MAIN WORKSPACE CONTAINER
      ───────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-10 flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-stretch items-start relative">

        {/* LEFT COLUMN: STICKY FILTERS & SIDEBAR */}
        <div className="hidden lg:block lg:w-[25%] shrink-0 select-none relative pt-2 pb-10 pr-2">
          <div className="lg:sticky lg:top-24 lg:h-fit flex flex-col gap-6 bg-white rounded-3xl border border-[#E5E3D4] p-5 shadow-xs">

            {/* Header & Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E3D4]">
              <h3 className="font-heading font-extrabold text-[14.5px] uppercase tracking-[0.12em] text-[#111827] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#729855]" />
                Filters
              </h3>
              {(selectedAvailability.length > 0 || selectedSkinTypes.length > 0 || selectedUnitCounts.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvailability([]);
                    setSelectedSkinTypes([]);
                    setSelectedUnitCounts([]);
                  }}
                  className="text-[11px] font-bold text-[#729855] hover:text-[#2f3e10] uppercase tracking-wider bg-transparent border-none cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Availability filter */}
            <div className="border-b border-[#E5E3D4] pb-5">
              <button
                onClick={() => toggleSection('availability')}
                className="w-full flex items-center justify-between font-heading font-extrabold text-[13px] text-[#111827] uppercase tracking-wider py-1 cursor-pointer bg-transparent border-none"
              >
                <span>Availability</span>
                {openSections.availability ? (
                  <ChevronUp className="w-4 h-4 text-[#729855]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#729855]" />
                )}
              </button>
              {openSections.availability && (
                <div className="flex flex-col space-y-2.5 pt-3 pl-1">
                  {['In stock', 'Out of stock'].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(option)}
                        onChange={() => toggleFilter('availability', option)}
                        className="w-4 h-4 rounded border-gray-300 text-[#729855] focus:ring-[#729855] cursor-pointer"
                      />
                      <span className="text-[13px] font-medium text-[#374151] group-hover:text-[#729855] transition-colors">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Skin Type filter */}
            <div className="border-b border-[#E5E3D4] pb-5">
              <button
                onClick={() => toggleSection('skinType')}
                className="w-full flex items-center justify-between font-heading font-extrabold text-[13px] text-[#111827] uppercase tracking-wider py-1 cursor-pointer bg-transparent border-none"
              >
                <span>Skin Type</span>
                {openSections.skinType ? (
                  <ChevronUp className="w-4 h-4 text-[#729855]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#729855]" />
                )}
              </button>
              {openSections.skinType && (
                <div className="flex flex-col space-y-2.5 pt-3 pl-1">
                  {skinTypeOptions.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={selectedSkinTypes.includes(type)}
                        onChange={() => toggleFilter('skinType', type)}
                        className="w-4 h-4 rounded border-gray-300 text-[#729855] focus:ring-[#729855] cursor-pointer"
                      />
                      <span className="text-[13px] font-medium text-[#374151] group-hover:text-[#729855] transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Unit Count filter */}
            <div className="border-b border-[#E5E3D4] pb-5">
              <button
                onClick={() => toggleSection('unitCount')}
                className="w-full flex items-center justify-between font-heading font-extrabold text-[13px] text-[#111827] uppercase tracking-wider py-1 cursor-pointer bg-transparent border-none"
              >
                <span>Unit Count</span>
                {openSections.unitCount ? (
                  <ChevronUp className="w-4 h-4 text-[#729855]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#729855]" />
                )}
              </button>
              {openSections.unitCount && (
                <div className="flex flex-col space-y-2.5 pt-3 pl-1">
                  {unitCountOptions.map((unit) => (
                    <label key={unit} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={selectedUnitCounts.includes(unit)}
                        onChange={() => toggleFilter('unitCount', unit)}
                        className="w-4 h-4 rounded border-gray-300 text-[#729855] focus:ring-[#729855] cursor-pointer"
                      />
                      <span className="text-[13px] font-medium text-[#374151] group-hover:text-[#729855] transition-colors">{unit}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Best Seller Showcase Card */}
            <div className="pt-1 text-left">
              <h3 className="text-[14px] font-heading font-extrabold uppercase tracking-[0.12em] text-[#111827] mb-3">
                Best Seller
              </h3>
              {currentBestSeller ? (
                <div
                  onClick={() => {
                    navigate(`/products/${currentBestSeller?.slug}`);
                    window.scrollTo(0, 0);
                  }}
                  className="block cursor-pointer bg-[#FAFAF5] rounded-2xl p-3 border border-[#E5E3D4] shadow-2xs hover:shadow-md transition-all text-center"
                >
                  <div className="group relative aspect-[4/3] bg-white rounded-xl overflow-hidden mb-3 border border-[#E5E3D4]">
                    <img
                      src={getLocalImageUrl(ensureAbsolutePath(currentBestSeller?.images?.[0] || currentBestSeller?.image))}
                      alt={currentBestSeller?.title || "Best Seller"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <Link
                        to={`/products/${currentBestSeller?.slug}`}
                        aria-label={`Quick view ${currentBestSeller?.title || ""}`}
                        onClick={(e) => { e.stopPropagation(); window.scrollTo(0, 0); }}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-[#729855] hover:text-white transition-all text-[#111]"
                      >
                        <Eye size={13} strokeWidth={2} />
                      </Link>
                    </div>
                  </div>
                  <h4 className="text-[13px] font-heading font-bold text-[#111827] line-clamp-2 leading-snug mb-1 hover:text-[#729855] transition-colors">
                    {currentBestSeller?.title}
                  </h4>
                  <p className="text-[13px] font-extrabold text-[#2f3e10] font-body">
                    Rs. {(currentBestSeller?.price ?? 0).toLocaleString('en-IN')}.00
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-2 text-black font-semibold">
                    <button
                      type="button"
                      onClick={handlePrevBestSeller}
                      className="bg-transparent border-none cursor-pointer px-2 py-0.5 text-base font-bold text-[#729855] hover:text-[#2f3e10] transition-colors"
                      aria-label="Previous Best Seller"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={handleNextBestSeller}
                      className="bg-transparent border-none cursor-pointer px-2 py-0.5 text-base font-bold text-[#729855] hover:text-[#2f3e10] transition-colors"
                      aria-label="Next Best Seller"
                    >
                      →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-gray-400 italic">
                  No products available
                </div>
              )}
            </div>

            {/* New Arrivals List */}
            <div className="pt-1 text-left">
              <h3 className="text-[14px] font-heading font-extrabold uppercase tracking-[0.12em] text-[#111827] mb-3">
                New Arrivals
              </h3>
              {newArrivals.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {newArrivals.slice(0, MIN_NEW_ARRIVALS).map((item) => (
                    <Link
                      key={item._id}
                      to={`/products/${item.slug}`}
                      onClick={() => window.scrollTo(0, 0)}
                      className="flex items-center gap-3 bg-[#FAFAF5] rounded-xl p-2 border border-[#E5E3D4] hover:border-[#729855] shadow-2xs transition-all group no-underline"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-[#E5E3D4]">
                        <img
                          src={getLocalImageUrl(ensureAbsolutePath(item.images?.[0] || item.image))}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-[12px] font-heading font-bold text-[#111827] group-hover:text-[#729855] transition-colors line-clamp-1 leading-snug">
                          {item.title}
                        </span>
                        <span className="text-[11.5px] font-bold text-[#2f3e10] mt-0.5">Rs. {(item?.price ?? 0).toLocaleString('en-IN')}.00</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-gray-400 italic">
                  No products available
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT CONTENT: TOOLBAR & PRODUCT GRID */}
        <div className="w-full lg:w-[75%] flex flex-col pt-1 pb-10">

          {/* Sticky Modern Top Toolbar */}
          <div className="sticky top-16 sm:top-20 bg-white/95 backdrop-blur-md z-30 py-3 mb-6 border border-[#E5E3D4] rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5">
            <span className="text-[12px] sm:text-[13px] font-heading font-extrabold text-[#111827]">
              Showing <span className="text-[#729855]">{showingStart}-{showingEnd}</span> of <span className="text-[#111827]">{filteredProducts.length}</span> Results
            </span>

            {/* Mobile filters button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden h-9 px-3.5 border border-[#729855] flex items-center justify-center gap-1.5 font-heading text-[11px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer bg-[#729855] text-white rounded-xl shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>

            {/* Grid Layout Toggles & Sort Dropdown */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto justify-between sm:justify-start">
              {/* Grid Layout Toggles */}
              <div className="flex items-center gap-1 bg-[#FAFAF5] p-1 rounded-xl border border-[#E5E3D4]">
                <button
                  type="button"
                  onClick={() => setGridCols(1)}
                  aria-label="View 1 column"
                  aria-pressed={gridCols === 1}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${gridCols === 1 ? 'bg-[#729855] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#111827]'}`}
                >
                  <Menu className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(2)}
                  aria-label="View 2 columns"
                  aria-pressed={gridCols === 2}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${gridCols === 2 ? 'bg-[#729855] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#111827]'}`}
                >
                  <div className="flex gap-[2px]">
                    <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(3)}
                  aria-label="View 3 columns"
                  aria-pressed={gridCols === 3}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${gridCols === 3 ? 'bg-[#729855] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#111827]'}`}
                >
                  <div className="flex gap-[2px]">
                    <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(4)}
                  aria-label="View 4 columns"
                  aria-pressed={gridCols === 4}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${gridCols === 4 ? 'bg-[#729855] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#111827]'}`}
                >
                  <div className="flex gap-[2px]">
                    <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] bg-current rounded-full"></div>
                  </div>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-1 sm:flex-none sm:min-w-[190px]">
                <button
                  type="button"
                  className="w-full h-9 sm:h-10 px-3 sm:px-4 bg-[#FAFAF5] border border-[#E5E3D4] rounded-xl flex items-center justify-between gap-2 cursor-pointer outline-none hover:border-[#729855] transition-colors shadow-2xs"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  aria-expanded={isSortOpen}
                  aria-haspopup="listbox"
                >
                  <span className="text-[10.5px] sm:text-[11.5px] font-heading font-extrabold text-[#111827] tracking-[0.05em] uppercase truncate">{activeSort}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#729855] flex-shrink-0" />
                </button>

                {isSortOpen && (
                  <div
                    role="listbox"
                    className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-white shadow-2xl rounded-2xl border border-[#E5E3D4] py-2 z-50 flex flex-col overflow-hidden"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="option"
                        aria-selected={activeSort === option}
                        className={`text-left px-4 py-2.5 text-[10.5px] sm:text-[11px] font-heading font-bold tracking-[0.05em] uppercase cursor-pointer hover:bg-[#FAF9F5] transition-colors bg-transparent border-none ${activeSort === option ? 'text-[#729855] bg-[#729855]/10 font-extrabold' : 'text-[#374151]'}`}
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

          {/* Product Grid / Shimmer Loading / Empty State */}
          {loading ? (
            <div className={`grid ${gridClass} gap-4 sm:gap-6`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-4 border border-[#E5E3D4] animate-pulse flex flex-col gap-3">
                  <div className="w-full aspect-square bg-gray-200 rounded-2xl" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="w-full text-center py-20 bg-white rounded-3xl border border-dashed border-[#E5E3D4] p-8 max-w-md mx-auto my-6">
              <Sparkles className="w-10 h-10 text-[#729855]/40 mx-auto mb-3" />
              <h3 className="text-lg font-heading font-bold text-[#111827] mb-1">No products found</h3>
              <p className="text-xs text-[#6B7280] mb-5">Try modifying your filter options or search terms.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedAvailability([]);
                  setSelectedSkinTypes([]);
                  setSelectedUnitCounts([]);
                }}
                className="px-5 py-2.5 bg-[#729855] hover:bg-[#2f3e10] text-white text-xs font-heading font-bold rounded-xl transition-colors cursor-pointer border-none"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className={`grid ${gridClass} gap-3 sm:gap-6`}>
                {displayedProducts.map((product) => (
                  <ListingProductCard
                    key={product._id}
                    product={product}
                    gridCols={gridCols}
                    cardWidthClass="w-full"
                    isInWishlist={isInWishlist}
                    toggleWishlist={toggleWishlist}
                    addToCart={addToCart}
                    handleImageError={handleImageError}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 font-heading text-xs font-bold uppercase tracking-widest no-print select-none">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                      window.scrollTo(0, 0);
                    }}
                    className="px-4 py-2.5 border border-[#E5E3D4] hover:border-[#729855] text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white rounded-xl font-bold cursor-pointer"
                  >
                    Prev
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNumber);
                          window.scrollTo(0, 0);
                        }}
                        className={`w-10 h-10 rounded-xl border transition-colors cursor-pointer flex items-center justify-center font-bold ${
                          currentPage === pageNumber
                            ? 'border-[#729855] bg-[#729855] text-white shadow-2xs'
                            : 'border-[#E5E3D4] bg-white text-[#111827] hover:border-[#729855]'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      window.scrollTo(0, 0);
                    }}
                    className="px-4 py-2.5 border border-[#E5E3D4] hover:border-[#729855] text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white rounded-xl font-bold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center">
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          ></div>
          <div className="relative flex flex-col w-full max-h-[85vh] bg-[#FAFAF5] shadow-2xl rounded-t-3xl p-5 overflow-y-auto z-50 animate-slide-up pb-24 border-t border-[#E5E3D4]">
            <div className="flex items-center justify-between mb-5 border-b border-[#E5E3D4] pb-4 sticky top-0 bg-[#FAFAF5] z-10">
              <span className="font-heading text-base font-extrabold text-[#111827] uppercase tracking-wider">Filters</span>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-[#111827] hover:text-[#729855] bg-[#E5E3D4]/50 rounded-full border-none cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col space-y-5">
              <div className="border-b border-[#E5E3D4] pb-4">
                <h3 className="font-heading font-extrabold text-[13.5px] text-[#111827] uppercase tracking-wider mb-3">Availability</h3>
                <div className="flex flex-col space-y-3 pl-1">
                  {['In stock', 'Out of stock'].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(option)}
                        onChange={() => toggleFilter('availability', option)}
                        className="w-4 h-4 rounded border-gray-300 text-[#729855] focus:ring-[#729855] cursor-pointer"
                      />
                      <span className="text-[13.5px] font-medium text-[#374151] group-hover:text-[#729855] transition-colors">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-b border-[#E5E3D4] pb-4">
                <h3 className="font-heading font-extrabold text-[13.5px] text-[#111827] uppercase tracking-wider mb-3">Skin Type</h3>
                <div className="flex flex-col space-y-3 pl-1">
                  {skinTypeOptions.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={selectedSkinTypes.includes(type)}
                        onChange={() => toggleFilter('skinType', type)}
                        className="w-4 h-4 rounded border-gray-300 text-[#729855] focus:ring-[#729855] cursor-pointer"
                      />
                      <span className="text-[13.5px] font-medium text-[#374151] group-hover:text-[#729855] transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pb-4">
                <h3 className="font-heading font-extrabold text-[13.5px] text-[#111827] uppercase tracking-wider mb-3">Unit Count</h3>
                <div className="flex flex-col space-y-3 pl-1">
                  {unitCountOptions.map((unit) => (
                    <label key={unit} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={selectedUnitCounts.includes(unit)}
                        onChange={() => toggleFilter('unitCount', unit)}
                        className="w-4 h-4 rounded border-gray-300 text-[#729855] focus:ring-[#729855] cursor-pointer"
                      />
                      <span className="text-[13.5px] font-medium text-[#374151] group-hover:text-[#729855] transition-colors">{unit}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#FAFAF5] border-t border-[#E5E3D4] z-10 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedAvailability([]);
                  setSelectedSkinTypes([]);
                  setSelectedUnitCounts([]);
                }}
                className="w-1/2 py-2.5 border border-[#E5E3D4] hover:bg-gray-100 font-heading font-bold text-xs uppercase tracking-wider transition-all bg-white text-[#111827] rounded-xl cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-1/2 py-2.5 bg-[#729855] hover:bg-[#2f3e10] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all border-none rounded-xl cursor-pointer shadow-2xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductListing;