import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Eye, Heart, Menu, X } from 'lucide-react';
import { productService } from '../api/productService';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { getLocalImageUrl } from '../utils/imageMapper';
import Loader from '../components/ui/Loader';
import { useCategories } from '../context/CategoryContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
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
    if (gridCols === 1 || gridCols === 2) return "max-w-[320px] mx-auto w-full";
    return "w-full";
  }, [gridCols]);

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
        className="relative w-full h-[300px] md:h-[250px] flex items-center justify-center bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: `url('/assets/Rectangle_337.jpg')` }}
      >
        <div className="absolute inset-0 bg-[#faf9f5]/50"></div>
        <div className="relative z-10 text-center mt-6">
          <h1 className="text-[40px] md:text-[50px] font-heading font-semibold text-[#555] mb-3 tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#729855]">
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-black">{displayTitle}</span>
          </p>
        </div>
      </div>

      {/* 2. CATALOG WORKSPACE CONTAINER */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-[60px] flex flex-col lg:flex-row gap-12 lg:items-stretch items-start relative">

        {/* LEFT COLUMN OUTER WRAPPER - Stretches full-height to match the right column track height perfectly, hidden on mobile/tablet */}
        <div className="hidden lg:block lg:w-[22%] shrink-0 select-none relative pt-6 pb-10 pr-2">

          {/* INNER STICKY CONTAINER - Sticky aligned at top-6 and h-fit so it slides and ends perfectly in parallel */}
          <div className="lg:sticky lg:top-6 lg:h-fit flex flex-col">

            {/* Availability filter */}
            <div className="border-b border-[#eae8d8] pb-6 mb-6">
              <button
                onClick={() => toggleSection('availability')}
                className="w-full flex items-center justify-between font-heading font-semibold text-[17px] text-[#111] uppercase tracking-wide py-2 cursor-pointer bg-transparent border-none"
              >
                <span>Availability</span>
                {openSections.availability ? (
                  <ChevronUp className="w-4 h-4 text-[#555]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#555]" />
                )}
              </button>
              {openSections.availability && (
                <div className="flex flex-col space-y-4 pl-1">
                  {['In stock', 'Out of stock'].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(option)}
                        onChange={() => toggleFilter('availability', option)}
                        className="w-[18px] h-[18px] border-gray-300 rounded-none text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-[15px] text-[#444] group-hover:text-black transition-colors">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Skin Type filter */}
            <div className="border-b border-[#eae8d8] pb-6 mb-6">
              <button
                onClick={() => toggleSection('skinType')}
                className="w-full flex items-center justify-between font-heading font-semibold text-[17px] text-[#111] uppercase tracking-wide py-2 cursor-pointer bg-transparent border-none"
              >
                <span>Skin Type</span>
                {openSections.skinType ? (
                  <ChevronUp className="w-4 h-4 text-[#555]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#555]" />
                )}
              </button>
              {openSections.skinType && (
                <div className="flex flex-col space-y-4 pl-1">
                  {skinTypeOptions.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSkinTypes.includes(type)}
                        onChange={() => toggleFilter('skinType', type)}
                        className="w-[18px] h-[18px] border-gray-300 rounded-none text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-[15px] text-[#444] group-hover:text-black transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Unit Count filter */}
            <div className="border-[#eae8d8] pb-6 border-b mb-6">
              <button
                onClick={() => toggleSection('unitCount')}
                className="w-full flex items-center justify-between font-heading font-semibold text-[17px] text-[#111] uppercase tracking-wide py-2 cursor-pointer bg-transparent border-none"
              >
                <span>Unit Count</span>
                {openSections.unitCount ? (
                  <ChevronUp className="w-4 h-4 text-[#555]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#555]" />
                )}
              </button>
              {openSections.unitCount && (
                <div className="flex flex-col space-y-4 pl-1">
                  {unitCountOptions.map((unit) => (
                    <label key={unit} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedUnitCounts.includes(unit)}
                        onChange={() => toggleFilter('unitCount', unit)}
                        className="w-[18px] h-[18px] border-gray-300 rounded-none text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-[15px] text-[#444] group-hover:text-black transition-colors">{unit}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Best Seller Section - Styled exactly like the Xerox reference image layout */}
            <div className="border-b border-[#eae8d8] pb-8 mb-6 pt-4 text-left">
              <h3 className="text-[22px] font-heading font-semibold text-[#111] mb-6">
                Best Seller
              </h3>
              {currentBestSeller ? (
                <div
                  onClick={() => {
                    navigate(`/products/${currentBestSeller?.slug}`);
                    window.scrollTo(0, 0);
                  }}
                  className="block cursor-pointer text-center"
                >
                  <div className="group relative aspect-[3/4] bg-[#f2f3ee] flex items-center justify-center overflow-hidden mb-5">
                    <img
                      src={getLocalImageUrl(ensureAbsolutePath(currentBestSeller?.images?.[0] || currentBestSeller?.image))}
                      alt={currentBestSeller?.title || "Best Seller"}
                      className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                      onError={handleImageError}
                      loading="lazy"
                    />

                    {/* Hover Actions - Icons (Top Right): quick view, wishlist */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-20">
                      <Link
                        to={`/products/${currentBestSeller?.slug}`}
                        aria-label={`Quick view ${currentBestSeller?.title || ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.scrollTo(0, 0);
                        }}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-[#729855] hover:text-white transition-all duration-300 hover:scale-105 text-[#111]"
                      >
                        <Eye className="w-4 h-4 stroke-[1.8]" />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Add ${currentBestSeller?.title || ""} to wishlist`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(currentBestSeller);
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 border-none cursor-pointer ${currentBestSeller?._id && isInWishlist(currentBestSeller._id)
                          ? 'bg-black text-white hover:bg-[#729855]'
                          : 'bg-white text-black hover:bg-[#729855] hover:text-white'
                          }`}
                      >
                        <Heart className="w-4 h-4 stroke-[1.8]" fill={currentBestSeller?._id && isInWishlist(currentBestSeller._id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Hover Action - Add to Cart Button (Bottom) */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(currentBestSeller, 1);
                        }}
                        className="w-[68%] h-[40px] bg-[#3e4e20] hover:bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-md border-none cursor-pointer"
                      >
                        Add Cart
                      </button>
                    </div>
                  </div>
                  <h4 className="text-[20px] font-heading font-medium text-center text-[#111] mb-1.5 hover:text-[#729855] transition-colors leading-[1.3]">
                    {currentBestSeller?.title}
                  </h4>
                  <p className="text-[14px] text-[#555] font-body text-center">
                    Rs. {(currentBestSeller?.price ?? 0).toLocaleString('en-IN')}.00 INR
                  </p>

                  {/* Navigation pagination controls below the best seller metadata */}
                  <div className="flex items-center justify-center gap-6 mt-4 text-black font-semibold">
                    <button
                      type="button"
                      onClick={handlePrevBestSeller}
                      className="bg-transparent border-none cursor-pointer px-3 py-1 text-lg font-bold hover:text-[#729855] transition-colors"
                      aria-label="Previous Best Seller"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={handleNextBestSeller}
                      className="bg-transparent border-none cursor-pointer px-3 py-1 text-lg font-bold hover:text-[#729855] transition-colors"
                      aria-label="Next Best Seller"
                    >
                      →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-400 italic">
                  No products available
                </div>
              )}
            </div>

            {/* New Arrivals */}
            <div className="pt-4 text-left">
              <h3 className="text-[22px] font-heading font-semibold text-[#111] mb-6">
                New Arrivals
              </h3>
              {newArrivals.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {newArrivals.slice(0, MIN_NEW_ARRIVALS).map((item) => (
                    <Link
                      key={item._id}
                      to={`/products/${item.slug}`}
                      onClick={() => window.scrollTo(0, 0)}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-[80px] h-[80px] bg-[#f2f3ee] flex-shrink-0 overflow-hidden">
                        <img
                          src={getLocalImageUrl(ensureAbsolutePath(item.images?.[0] || item.image))}
                          alt={item.title}
                          className="w-full h-full object-cover mix-blend-multiply"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[14px] font-heading font-medium text-[#111] group-hover:text-[#729855] transition-colors leading-snug">
                          {item.title}
                        </span>
                        <span className="text-[13px] text-[#555] mt-1">Rs. {(item?.price ?? 0).toLocaleString('en-IN')}.00 INR</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-400 italic">
                  No products available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT (Toolbar + Grid) */}
        <div className="w-full lg:w-[78%] flex flex-col pt-6 pb-10">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b border-[#eae8d8] pb-4">
            <span className="text-[14px] text-[#333] font-body">
              Showing {showingStart}-{showingEnd} of {filteredProducts.length} Results
            </span>

            {/* Mobile filters button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden h-11 px-6 border border-gray-200 hover:border-black flex items-center justify-center gap-2 font-heading text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white text-black"
            >
              Filters
            </button>

            {/* Grid Layout Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGridCols(1)}
                aria-label="View 1 column"
                aria-pressed={gridCols === 1}
                className={`w-[35px] h-[35px] flex items-center justify-center border transition-colors cursor-pointer ${gridCols === 1 ? 'border-black bg-black text-white' : 'border-gray-200 text-[#555] hover:border-black'}`}
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(2)}
                aria-label="View 2 columns"
                aria-pressed={gridCols === 2}
                className={`w-[35px] h-[35px] flex items-center justify-center border transition-colors cursor-pointer ${gridCols === 2 ? 'border-black bg-black text-white' : 'border-gray-200 text-[#555] hover:border-black'}`}
              >
                <div className="flex gap-[2px]">
                  <div className="w-[3px] h-[14px] bg-current"></div>
                  <div className="w-[3px] h-[14px] bg-current"></div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGridCols(3)}
                aria-label="View 3 columns"
                aria-pressed={gridCols === 3}
                className={`w-[35px] h-[35px] flex items-center justify-center border transition-colors cursor-pointer ${gridCols === 3 ? 'border-black bg-black text-white' : 'border-gray-200 text-[#555] hover:border-black'}`}
              >
                <div className="flex gap-[2px]">
                  <div className="w-[3px] h-[14px] bg-current"></div>
                  <div className="w-[3px] h-[14px] bg-current"></div>
                  <div className="w-[3px] h-[14px] bg-current"></div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                aria-label="View 4 columns"
                aria-pressed={gridCols === 4}
                className={`w-[35px] h-[35px] flex items-center justify-center border transition-colors cursor-pointer ${gridCols === 4 ? 'border-black bg-black text-white' : 'border-gray-200 text-[#555] hover:border-black'}`}
              >
                <div className="flex gap-[2px]">
                  <div className="w-[3px] h-[14px] bg-current"></div>
                  <div className="w-[3px] h-[14px] bg-current"></div>
                  <div className="w-[3px] h-[14px] bg-current"></div>
                  <div className="w-[3px] h-[14px] bg-current"></div>
                </div>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-[250px]">
              <button
                type="button"
                className="w-full flex items-center justify-between border-b border-gray-200 pb-2 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none"
                onClick={() => setIsSortOpen(!isSortOpen)}
                aria-expanded={isSortOpen}
                aria-haspopup="listbox"
              >
                <span className="text-[12px] font-medium text-[#111] tracking-[0.1em] uppercase">{activeSort}</span>
                <ChevronDown className="w-4 h-4 text-[#111]" />
              </button>

              {/* Dropdown Menu */}
              {isSortOpen && (
                <div
                  role="listbox"
                  className="absolute top-full right-0 mt-2 w-full bg-white shadow-xl border border-gray-100 py-4 z-50 flex flex-col"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={activeSort === option}
                      className={`text-left px-6 py-2.5 text-[11px] font-medium tracking-[0.1em] uppercase cursor-pointer hover:bg-gray-50 transition-colors bg-transparent border-none ${activeSort === option ? 'text-[#729855]' : 'text-[#555]'}`}
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
              <div className={`grid ${gridClass} gap-6`}>
                {displayedProducts.map((product) => {
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

                  const mainImg = getLocalImageUrl(ensureAbsolutePath(product.images?.[0] || product.image || '/assets/14.jpg'));
                  const discount = product.comparePrice > product.price
                    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                    : 0;
                  const isSoldOut = product.stock === 0;

                  return (
                    <div key={product._id} className={`flex flex-col ${cardWidthClass}`}>
                      {/* Image Container with Hover Effects */}
                      <div className="group relative aspect-[3/4] bg-[#f2f3ee] flex items-center justify-center overflow-hidden mb-5 cursor-pointer">

                        {/* Sold Out / Discount Badge — top-left, responsive sizing */}
                        {isSoldOut ? (
                          <span className={`absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-black text-white font-bold uppercase tracking-[0.15em] ${gridCols === 4 ? 'text-[7px] px-1.5 py-0.5' : 'text-[9px] sm:text-[10px] px-2 py-1 sm:px-3 sm:py-1.5'
                            }`}>
                            Sold Out
                          </span>
                        ) : discount > 0 ? (
                          <span className={`absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-[#5b8a72] text-white font-bold uppercase tracking-[0.15em] ${gridCols === 4 ? 'text-[7px] px-1.5 py-0.5' : 'text-[9px] sm:text-[10px] px-2 py-1 sm:px-3 sm:py-1.5'
                            }`}>
                            {discount}% OFF
                          </span>
                        ) : null}

                        <Link to={`/products/${product.slug}`} onClick={() => window.scrollTo(0, 0)} className="w-full h-full block">
                          <img
                            src={mainImg}
                            alt={product.title}
                            className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                            onError={handleImageError}
                            loading="lazy"
                          />
                        </Link>

                        {/* Floating Price Badge (Mobile Only — renders inside card boundaries) */}
                        <div className={`absolute bottom-2 left-2 bg-[#2f3e10]/95 text-white font-medium z-10 lg:hidden ${gridCols === 4 ? 'text-[8px] px-1 py-0.5' : 'text-[11px] px-2 py-1'
                          }`}>
                          Rs. {(product?.price ?? 0).toLocaleString('en-IN')}
                        </div>

                        {/* Actions Overlay - Always visible on mobile, hover-only on desktop */}
                        <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-300 ${gridCols === 4 ? 'gap-1' : 'gap-1.5 sm:gap-2'
                          }`}>
                          <Link
                            to={`/products/${product.slug}`}
                            onClick={() => window.scrollTo(0, 0)}
                            aria-label={`Quick view ${product.title}`}
                            className={`rounded-full bg-white flex items-center justify-center shadow-md hover:bg-[#729855] hover:text-white transition-all duration-300 hover:scale-105 text-[#111] ${gridCols === 4 ? 'w-6 h-6' : 'w-8 h-8 sm:w-9 sm:h-9'
                              }`}
                          >
                            <Eye size={gridCols === 4 ? 10 : 14} strokeWidth={1.8} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(product)}
                            aria-label={`Add ${product.title} to wishlist`}
                            className={`rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 border-none cursor-pointer ${gridCols === 4 ? 'w-6 h-6' : 'w-8 h-8 sm:w-9 sm:h-9'
                              } ${product?._id && isInWishlist(product._id)
                                ? 'bg-black text-white hover:bg-[#729855]'
                                : 'bg-white text-black hover:bg-[#729855] hover:text-white'
                              }`}
                          >
                            <Heart className="transition-all duration-300" size={gridCols === 4 ? 10 : 14} strokeWidth={1.8} fill={product?._id && isInWishlist(product._id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        {/* Hover Action - Add to Cart Button (Bottom — desktop only) */}
                        <div className="absolute bottom-4 left-0 right-0 hidden lg:flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                          {!isSoldOut ? (
                            <button
                              type="button"
                              onClick={() => addToCart(product, 1)}
                              className="w-[68%] h-[40px] bg-[#3e4e20] hover:bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-md border-none cursor-pointer"
                            >
                              Add Cart
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-[68%] h-[40px] bg-gray-400 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-md border-none cursor-not-allowed"
                            >
                              Sold Out
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Product Info (Title always visible, price displays here on desktop only) */}
                      <div className="text-center px-2 flex flex-col flex-grow mt-3">
                        <h3 className={`font-heading font-semibold text-[#111] leading-[1.35] mb-1 hover:text-[#729855] transition-colors cursor-pointer inline-block mx-auto line-clamp-2 ${gridCols === 4 ? 'text-[10px]' : 'text-xs sm:text-[16px]'
                          }`}>
                          <Link to={`/products/${product.slug}`} onClick={() => window.scrollTo(0, 0)}>{product.title}</Link>
                        </h3>
                        <p className="text-[14px] text-[#555] font-body hidden lg:block">
                          Rs. {(product?.price ?? 0).toLocaleString('en-IN')}.00 INR
                        </p>
                      </div>
                    </div>
                  );
                })}
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
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          ></div>
          <div className="relative flex flex-col w-full max-h-[80vh] bg-[#F9F9EB] shadow-2xl rounded-t-2xl p-6 overflow-y-auto z-50 animate-slide-up pb-24">
            <div className="flex items-center justify-between mb-6 border-b border-[#eae8d8] pb-4 sticky top-0 bg-[#F9F9EB] z-10">
              <span className="font-heading text-lg font-bold text-black uppercase tracking-wider">Filters</span>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-11 h-11 flex items-center justify-center text-black hover:text-[#729855] bg-transparent border-none cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex flex-col space-y-6">
              {/* Availability filter */}
              <div className="border-b border-[#eae8d8] pb-6">
                <h3 className="font-heading font-semibold text-[17px] text-[#111] uppercase tracking-wide mb-4">Availability</h3>
                <div className="flex flex-col space-y-4 pl-1">
                  {['In stock', 'Out of stock'].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(option)}
                        onChange={() => toggleFilter('availability', option)}
                        className="w-11 h-11 lg:w-[18px] lg:h-[18px] border-gray-300 rounded-none text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-[15px] text-[#444] group-hover:text-black transition-colors">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skin Type filter */}
              <div className="border-b border-[#eae8d8] pb-6">
                <h3 className="font-heading font-semibold text-[17px] text-[#111] uppercase tracking-wide mb-4">Skin Type</h3>
                <div className="flex flex-col space-y-4 pl-1">
                  {skinTypeOptions.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSkinTypes.includes(type)}
                        onChange={() => toggleFilter('skinType', type)}
                        className="w-11 h-11 lg:w-[18px] lg:h-[18px] border-gray-300 rounded-none text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-[15px] text-[#444] group-hover:text-black transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Unit Count filter */}
              <div className="pb-6">
                <h3 className="font-heading font-semibold text-[17px] text-[#111] uppercase tracking-wide mb-4">Unit Count</h3>
                <div className="flex flex-col space-y-4 pl-1">
                  {unitCountOptions.map((unit) => (
                    <label key={unit} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedUnitCounts.includes(unit)}
                        onChange={() => toggleFilter('unitCount', unit)}
                        className="w-11 h-11 lg:w-[18px] lg:h-[18px] border-gray-300 rounded-none text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-[15px] text-[#444] group-hover:text-black transition-colors">{unit}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky bottom Action buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#F9F9EB] border-t border-[#eae8d8] z-10 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedAvailability([]);
                  setSelectedSkinTypes([]);
                  setSelectedUnitCounts([]);
                }}
                className="w-1/2 py-3 border border-black hover:bg-black hover:text-white font-heading font-bold text-xs uppercase tracking-widest transition-all bg-transparent text-black cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-1/2 py-3 bg-[#2f3e10] text-white hover:bg-black font-heading font-bold text-xs uppercase tracking-widest transition-all border-none cursor-pointer"
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