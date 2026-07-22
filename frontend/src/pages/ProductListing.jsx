import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Eye, Heart, Menu, X } from 'lucide-react';
import { productService } from '../api/productService';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { getLocalImageUrl } from '../utils/imageMapper';
import Loader from '../components/ui/Loader';
import { useCategories } from '../context/CategoryContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMobileCardActive } from '../hooks/useMobileCardActive';
import { usePrefetchProduct } from '../hooks/useProductsQuery';
/**
 * Converts a product title into a URL-safe slug.
 */
const slugify = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Minimum number of items the "New Arrivals" sidebar list should always
 * try to display.
 */
const MIN_NEW_ARRIVALS = 3;

/**
 * Executes an async function with exponential backoff retry.
 */
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
        console.warn(
          `[ProductListing] ${label} failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delayMs}ms.`,
          err?.message || err
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error(`[ProductListing] ${label} failed after ${retries + 1} attempt(s).`, lastError);
  throw lastError;
};

// Safe helper to handle paths, Cloudinary objects, and nested routes
const ensureAbsolutePath = (path) => {
  if (!path) return '';
  let pathStr = '';
  if (typeof path === 'string') {
    pathStr = path;
  } else if (typeof path === 'object' && path !== null) {
    pathStr = path.url || path.secure_url || '';
  }
  if (!pathStr || typeof pathStr !== 'string') return '';

  // ERR_CONNECTION_CLOSED 
  if (pathStr.includes('via.placeholder.com')) {
    pathStr = pathStr.replace('via.placeholder.com', 'placehold.co');
  }

  if (!pathStr.startsWith('/') && !pathStr.startsWith('http')) {
    return '/' + pathStr;
  }
  return pathStr;
};

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

  const localEnsureAbsolutePath = (path) => {
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

  const mainImg = getLocalImageUrl(localEnsureAbsolutePath(product.images?.[0] || product.image || '/assets/14.jpg'));
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const isSoldOut = product.stock === 0;

  // Rating fallback if not populated
  const ratingValue = product.rating || product.ratings || 4.8;
  const reviewCount = product.reviewsCount || product.numReviews || (product.price ? (product.price % 37) + 12 : 24);

  return (
    <div
      ref={cardRef}
      data-card-id={cardId}
      onClickCapture={handleCardInteraction}
      onMouseEnter={() => prefetchProduct(product.slug)}
      className={`group relative bg-white rounded-2xl border border-[#E5E3D4] p-2.5 sm:p-4 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full w-full overflow-hidden ${cardWidthClass}`}
    >
      <div>
        {/* Large Product Image Container */}
        <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#FAF9F5] rounded-xl overflow-hidden mb-2.5 sm:mb-3.5 border border-[#EDEBD8]/80 flex items-center justify-center p-1.5 sm:p-2">
          
          {/* Top-Left Discount/Stock Badge */}
          {isSoldOut ? (
            <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 bg-[#111827] text-white text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-2xs pointer-events-none whitespace-nowrap">
              Sold Out
            </span>
          ) : discount > 0 ? (
            <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 bg-[#729855] text-white text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-2xs pointer-events-none whitespace-nowrap">
              -{discount}% OFF
            </span>
          ) : null}

          {/* Product Image Link */}
          <Link to={`/products/${product.slug}`} onClick={() => window.scrollTo(0, 0)} className="w-full h-full block relative z-0">
            <img
              src={mainImg}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-1 sm:p-1.5"
              onError={handleImageError}
              loading="lazy"
            />
          </Link>

          {/* Floating Action Icons (Top Right Overlay) */}
          <div className={useMobileInteraction
            ? `absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex flex-col gap-1.5 sm:gap-2 z-20 transition-all duration-250 ${
                isActiveMobile ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'
              }`
            : `absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex flex-col gap-1.5 sm:gap-2 z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300`
          }>
            <Link
              to={`/products/${product.slug}`}
              onClick={(e) => { e.stopPropagation(); window.scrollTo(0, 0); }}
              aria-label={`Quick view ${product.title}`}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/95 text-[#111827] shadow-md hover:bg-[#729855] hover:text-white flex items-center justify-center hover:scale-110 transition-all cursor-pointer no-underline"
            >
              <Eye size={13} strokeWidth={2} className="sm:w-4 sm:h-4" />
            </Link>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
              aria-label={`Add ${product.title} to wishlist`}
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all border-none cursor-pointer ${
                product?._id && isInWishlist(product._id)
                  ? 'bg-[#2f3e10] text-white'
                  : 'bg-white/95 text-[#111827] hover:bg-[#729855] hover:text-white'
              }`}
            >
              <Heart size={13} strokeWidth={2} className="sm:w-4 sm:h-4" fill={product?._id && isInWishlist(product._id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Desktop Hover Add To Cart Overlay */}
          {!isSoldOut && (
            <div className={`absolute bottom-3 left-3 right-3 hidden lg:flex justify-center transition-all duration-300 z-20 ${
              useMobileInteraction
                ? (isActiveMobile ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none')
                : 'opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2'
            }`}>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); }}
                className="w-full py-2 px-3 bg-[#729855] hover:bg-[#2f3e10] text-white text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-colors shadow-md border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                Add To Cart
              </button>
            </div>
          )}
        </div>

        {/* Product Category Subtitle */}
        <span className="text-[9px] sm:text-[10px] font-heading font-extrabold text-[#729855] uppercase tracking-wider block mb-0.5 line-clamp-1">
          {typeof product.category === 'object' ? product.category?.name : (product.category || 'ORGANIC BEAUTY')}
        </span>

        {/* Product Title (line-clamp-2) */}
        <h3 className="font-heading font-bold text-[12px] sm:text-[14.5px] text-[#111827] hover:text-[#729855] transition-colors leading-snug line-clamp-2 mb-1 cursor-pointer">
          <Link to={`/products/${product.slug}`} onClick={() => window.scrollTo(0, 0)}>
            {product.title}
          </Link>
        </h3>

        {/* Rating Stars & Count */}
        <div className="flex items-center gap-1 mb-1.5 text-[10px] sm:text-[11px]">
          <div className="flex items-center text-[#F59E0B] text-[10px]">
            {'★'.repeat(5)}
          </div>
          <span className="font-bold text-[#111827]">{ratingValue}</span>
          <span className="text-[#6B7280] text-[9px] sm:text-[10px]">({reviewCount})</span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-1.5 mb-2 flex-wrap">
          <span className="text-[13px] sm:text-[15px] font-extrabold text-[#2f3e10] font-body whitespace-nowrap">
            Rs. {(product?.price ?? 0).toLocaleString('en-IN')}.00
          </span>
          {product.comparePrice > product.price && (
            <span className="text-[10.5px] sm:text-[12px] text-[#9CA3AF] line-through font-body whitespace-nowrap">
              Rs. {product.comparePrice.toLocaleString('en-IN')}.00
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Stock status & Mobile Add to Cart */}
      <div className="pt-2 border-t border-[#F0EFE6] flex flex-col gap-1.5 mt-auto">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-medium text-[#6B7280]">
          <span className="flex items-center gap-1 text-[#4B5563]">
            <span className={`w-1.5 h-1.5 rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-[#729855]'}`}></span>
            {isSoldOut ? 'Out of Stock' : 'In Stock'}
          </span>
          <span className="text-[#729855] font-semibold">Free Shipping</span>
        </div>

        {/* Mobile Always-Visible Add to Cart Button */}
        <div className="block lg:hidden mt-0.5">
          {!isSoldOut ? (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); }}
              className="w-full py-1.5 sm:py-2 px-2.5 bg-[#729855] active:bg-[#2f3e10] text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-colors shadow-2xs border-none cursor-pointer flex items-center justify-center gap-1"
            >
              Add To Cart
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-1.5 sm:py-2 px-2.5 bg-gray-200 text-gray-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-xl border-none cursor-not-allowed"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductListing = () => {
  const { categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { categories, loading: categoriesLoading } = useCategories();

  const isValidCategory = useMemo(() => {
    if (!categorySlug || categorySlug === 'all') return true;
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

  // Grid columns initialize: 2 columns on mobile/tablet viewports, 4 columns on desktop by default
  const [gridCols, setGridCols] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 2 : 4
  );

  // Pagination states [1]
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; // Restricts strictly to 16 products per page [1]

  // Collapsible filter sections
  const [openSections, setOpenSections] = useState({
    availability: true,
    skinType: true,
    unitCount: true,
  });

  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // API State
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellerIndex, setBestSellerIndex] = useState(0);
  const [bestSeller, setBestSeller] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lock body scroll when mobile filter bottom sheet is open
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

  // Filter Selection State
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedUnitCounts, setSelectedUnitCounts] = useState([]);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Search keyword from query parameters
  const searchKeyword = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('search') || '';
  }, [location.search]);

  // Map sort options to API parameters
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

  // Best seller pagination triggers with safe state guarding
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

  // Fetch best seller & new arrivals with decoupled try-catch blocks
  useEffect(() => {
    let isMounted = true;

    const fetchSideData = async () => {
      // 1. Fetch Best Sellers
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
        console.error('[ProductListing] Error fetching best sellers:', err);
        if (isMounted) {
          setBestSellers([]);
          setBestSeller(null);
        }
      }

      // 2. Fetch New Arrivals
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
        console.error('[ProductListing] Error fetching new arrivals:', err);
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

  // Fetch listing products dynamically on route/sort changes
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = {
          limit: 100, // Fetch sufficiently large page
          sort: getSortParam(activeSort)
        };

        if (categorySlug && categorySlug !== 'all') {
          queryParams.category = categorySlug;
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
        console.error('[ProductListing] Error fetching products list:', err);
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

  // Reset page pagination back to 1 when filters or categories update [1]
  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, selectedAvailability, selectedSkinTypes, selectedUnitCounts, activeSort]);

  // Dynamic filter lists matching product metadata
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Availability filter
      if (selectedAvailability.length > 0) {
        const inStock = product.stock > 0;
        const wantsInStock = selectedAvailability.includes('In stock');
        const wantsOutOfStock = selectedAvailability.includes('Out of stock');
        if (wantsInStock && !wantsOutOfStock && !inStock) return false;
        if (wantsOutOfStock && !wantsInStock && inStock) return false;
      }

      // 2. Skin Type filter
      if (selectedSkinTypes.length > 0) {
        const matchesSkin = selectedSkinTypes.some((type) =>
          product.tags?.some((tag) => tag.toLowerCase() === type.toLowerCase()) ||
          product.variants?.some((v) => v.toLowerCase() === type.toLowerCase()) ||
          product.description?.toLowerCase().includes(type.toLowerCase())
        );
        if (!matchesSkin) return false;
      }

      // 3. Unit Count filter
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

  // Slices filtered listing grid cleanly to maximum of 16 products [1]
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

  // Dynamic responsive grid columns supporting up to 4 columns directly on mobile [1]
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

  const cardWidthClass = useMemo(() => {
    return "w-full";
  }, []);

  const handleImageError = useCallback((e) => {
    if (e.target.src.indexOf('/assets/14.jpg') === -1) {
      e.target.src = '/assets/14.jpg';
    }
  }, []);

  if (!categoriesLoading && !isValidCategory) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white px-6">
        <h1 className="text-[60px] font-heading font-bold text-[#2f3e10] mb-2">404</h1>
        <h2 className="text-[24px] font-heading font-semibold text-black mb-4">Collection Not Found</h2>
        <p className="text-[#666] mb-8 text-center max-w-md font-body leading-relaxed">
          The collection you are looking for does not exist or has been removed.
        </p>
        <Link 
          to="/collections/all" 
          className="bg-[#2f3e10] hover:bg-black text-white px-8 py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all text-center inline-block"
          style={{ textDecoration: 'none' }}
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white font-body min-h-screen">

      {/* 1. TOP BANNER SECTION */}
      <div
        className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center bg-cover bg-left bg-no-repeat px-4"
        style={{ backgroundImage: `url('/assets/Rectangle_337.jpg')` }}
      >
        <div className="absolute inset-0 bg-[#faf9f5]/50"></div>
        <div className="relative z-10 text-center mt-4 sm:mt-6">
          <h1 className="text-[28px] sm:text-[40px] md:text-[50px] font-heading font-semibold text-[#555] mb-2 sm:mb-3 tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-widest text-[#729855]">
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition-colors">Home</Link>
            <span className="mx-1.5 sm:mx-2 text-gray-400">/</span>
            <Link to="/collections" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition-colors">Catalog</Link>
            <span className="mx-1.5 sm:mx-2 text-gray-400">/</span>
            <span className="text-black">{displayTitle}</span>
          </p>
        </div>
      </div>

      {/* 2. CATALOG WORKSPACE CONTAINER */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-10 flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-stretch items-start relative">

        {/* LEFT COLUMN OUTER WRAPPER - Hidden on mobile/tablet */}
        <div className="hidden lg:block lg:w-[25%] shrink-0 select-none relative pt-4 pb-10 pr-2">

          {/* INNER STICKY CONTAINER */}
          <div className="lg:sticky lg:top-24 lg:h-fit flex flex-col gap-6 bg-[#FAFAF5] rounded-3xl border border-[#E5E3D4] p-5 shadow-xs">

            {/* Sidebar Title */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E3D4]">
              <h3 className="font-heading font-extrabold text-[15px] uppercase tracking-[0.12em] text-[#111827]">
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
                className="w-full flex items-center justify-between font-heading font-extrabold text-[13.5px] text-[#111827] uppercase tracking-wider py-1.5 cursor-pointer bg-transparent border-none"
              >
                <span>Availability</span>
                {openSections.availability ? (
                  <ChevronUp className="w-4 h-4 text-[#729855]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#729855]" />
                )}
              </button>
              {openSections.availability && (
                <div className="flex flex-col space-y-3 pt-3 pl-1">
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
              )}
            </div>

            {/* Skin Type filter */}
            <div className="border-b border-[#E5E3D4] pb-5">
              <button
                onClick={() => toggleSection('skinType')}
                className="w-full flex items-center justify-between font-heading font-extrabold text-[13.5px] text-[#111827] uppercase tracking-wider py-1.5 cursor-pointer bg-transparent border-none"
              >
                <span>Skin Type</span>
                {openSections.skinType ? (
                  <ChevronUp className="w-4 h-4 text-[#729855]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#729855]" />
                )}
              </button>
              {openSections.skinType && (
                <div className="flex flex-col space-y-3 pt-3 pl-1">
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
              )}
            </div>

            {/* Unit Count filter */}
            <div className="border-b border-[#E5E3D4] pb-5">
              <button
                onClick={() => toggleSection('unitCount')}
                className="w-full flex items-center justify-between font-heading font-extrabold text-[13.5px] text-[#111827] uppercase tracking-wider py-1.5 cursor-pointer bg-transparent border-none"
              >
                <span>Unit Count</span>
                {openSections.unitCount ? (
                  <ChevronUp className="w-4 h-4 text-[#729855]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#729855]" />
                )}
              </button>
              {openSections.unitCount && (
                <div className="flex flex-col space-y-3 pt-3 pl-1">
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
              )}
            </div>

            {/* Best Seller Section */}
            <div className="pt-2 text-left">
              <h3 className="text-[15px] font-heading font-extrabold uppercase tracking-[0.12em] text-[#111827] mb-4">
                Best Seller
              </h3>
              {currentBestSeller ? (
                <div
                  onClick={() => {
                    navigate(`/products/${currentBestSeller?.slug}`);
                    window.scrollTo(0, 0);
                  }}
                  className="block cursor-pointer bg-white rounded-2xl p-3 border border-[#E5E3D4] shadow-2xs hover:shadow-md transition-all text-center"
                >
                  <div className="group relative aspect-[4/3] bg-[#FAF9F5] rounded-xl overflow-hidden mb-3">
                    <img
                      src={getLocalImageUrl(ensureAbsolutePath(currentBestSeller?.images?.[0] || currentBestSeller?.image))}
                      alt={currentBestSeller?.title || "Best Seller"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={handleImageError}
                      loading="lazy"
                    />

                    {/* Hover Actions */}
                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
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
                  <h4 className="text-[13.5px] font-heading font-bold text-[#111827] line-clamp-2 leading-snug mb-1 hover:text-[#729855] transition-colors">
                    {currentBestSeller?.title}
                  </h4>
                  <p className="text-[13px] font-extrabold text-[#2f3e10] font-body">
                    Rs. {(currentBestSeller?.price ?? 0).toLocaleString('en-IN')}.00
                  </p>

                  <div className="flex items-center justify-center gap-4 mt-3 text-black font-semibold">
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

            {/* New Arrivals */}
            <div className="pt-2 text-left">
              <h3 className="text-[15px] font-heading font-extrabold uppercase tracking-[0.12em] text-[#111827] mb-4">
                New Arrivals
              </h3>
              {newArrivals.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {newArrivals.slice(0, MIN_NEW_ARRIVALS).map((item) => (
                    <Link
                      key={item._id}
                      to={`/products/${item.slug}`}
                      onClick={() => window.scrollTo(0, 0)}
                      className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-[#E5E3D4] hover:border-[#729855] shadow-2xs transition-all group no-underline"
                    >
                      <div className="w-14 h-14 bg-[#FAF9F5] rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getLocalImageUrl(ensureAbsolutePath(item.images?.[0] || item.image))}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-[12.5px] font-heading font-bold text-[#111827] group-hover:text-[#729855] transition-colors line-clamp-1 leading-snug">
                          {item.title}
                        </span>
                        <span className="text-[12px] font-bold text-[#2f3e10] mt-0.5">Rs. {(item?.price ?? 0).toLocaleString('en-IN')}.00</span>
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

        {/* RIGHT CONTENT (Toolbar + Grid) */}
        <div className="w-full lg:w-[75%] flex flex-col pt-2 pb-10">

          {/* Sticky Modern Top Toolbar (Fully Responsive on Mobile/Tablet/Desktop) */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 py-2.5 sm:py-3.5 mb-5 sm:mb-8 border-b border-[#E5E3D4] shadow-2xs flex flex-wrap items-center justify-between gap-3 px-1">
            <span className="text-[12px] sm:text-[13px] font-heading font-extrabold text-[#111827]">
              Showing <span className="text-[#729855]">{showingStart}-{showingEnd}</span> of <span className="text-[#111827]">{filteredProducts.length}</span> Results
            </span>

            {/* Mobile filters button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden h-9 px-3.5 border border-[#E5E3D4] hover:border-[#729855] flex items-center justify-center gap-1.5 font-heading text-[11px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer bg-[#729855] text-white rounded-xl shadow-2xs"
            >
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
                  <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(2)}
                  aria-label="View 2 columns"
                  aria-pressed={gridCols === 2}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${gridCols === 2 ? 'bg-[#729855] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#111827]'}`}
                >
                  <div className="flex gap-[2px]">
                    <div className="w-[3px] h-[12px] sm:h-[13px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] sm:h-[13px] bg-current rounded-full"></div>
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
                    <div className="w-[3px] h-[12px] sm:h-[13px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] sm:h-[13px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] sm:h-[13px] bg-current rounded-full"></div>
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
                    <div className="w-[3px] h-[12px] sm:h-[13px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] sm:h-[13px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] sm:h-[13px] bg-current rounded-full"></div>
                    <div className="w-[3px] h-[12px] sm:h-[13px] bg-current rounded-full"></div>
                  </div>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-1 sm:flex-none sm:min-w-[200px]">
                <button
                  type="button"
                  className="w-full h-9 sm:h-10 px-3 sm:px-4 bg-[#FAFAF5] border border-[#E5E3D4] rounded-xl flex items-center justify-between gap-2 cursor-pointer outline-none hover:border-[#729855] transition-colors shadow-2xs"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  aria-expanded={isSortOpen}
                  aria-haspopup="listbox"
                >
                  <span className="text-[10.5px] sm:text-[11.5px] font-heading font-extrabold text-[#111827] tracking-[0.05em] uppercase truncate">{activeSort}</span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#729855] flex-shrink-0" />
                </button>

                {/* Dropdown Menu */}
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

          {/* Product Grid */}
          {loading ? (
            <div className="w-full py-20 flex justify-center">
              <Loader size="large" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="w-full text-center py-20 font-body">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className={`grid ${gridClass} gap-3 sm:gap-6`}>
                {displayedProducts.map((product) => (
                  <ListingProductCard
                    key={product._id}
                    product={product}
                    gridCols={gridCols}
                    cardWidthClass={cardWidthClass}
                    isInWishlist={isInWishlist}
                    toggleWishlist={toggleWishlist}
                    addToCart={addToCart}
                    handleImageError={handleImageError}
                  />
                ))}
              </div>

              {/* Pagination controls showing up to 16 products dynamically */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 font-heading text-xs font-bold uppercase tracking-widest no-print select-none">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                      window.scrollTo(0, 0);
                    }}
                    className="px-4 py-3 border border-gray-200 hover:border-black text-black disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 transition-colors bg-white font-bold cursor-pointer"
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
                        className={`w-11 h-11 border transition-colors cursor-pointer flex items-center justify-center ${currentPage === pageNumber
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-white text-black hover:border-black'
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
                    className="px-4 py-3 border border-gray-200 hover:border-black text-black disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 transition-colors bg-white font-bold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Half Underline Scroll element below products */}
              <div className="w-full h-[2px] bg-gray-200 mt-14">
                <div className="w-1/2 h-full bg-black"></div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Mobile Filter Drawer Overlay as a Bottom Sheet */}
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

            {/* Filter Content */}
            <div className="flex flex-col space-y-5">
              {/* Availability filter */}
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

              {/* Skin Type filter */}
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

              {/* Unit Count filter */}
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

            {/* Sticky bottom Action buttons */}
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