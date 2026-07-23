import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { productService } from '../api/productService';
import { categoryService } from '../api/categoryService';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { getLocalImageUrl } from '../utils/imageMapper';
import { useMobileCardActive } from '../hooks/useMobileCardActive';

// Helper to secure absolute image paths and prevent image breakage
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

const BeautyProductCard = ({ product, addToCart, toggleWishlist, isInWishlist, setQuickViewProduct }) => {
  const cardRef = useRef(null);
  const { isActiveMobile, useMobileInteraction, handleCardInteraction, cardId } = useMobileCardActive(product._id, cardRef);
  const [isAdding, setIsAdding] = useState(false);

  const mainImg = getLocalImageUrl(ensureAbsolutePath(product.images?.[0] || product.image || '/assets/14.jpg'));
  const hoverImg = product.images?.[1]
    ? getLocalImageUrl(ensureAbsolutePath(product.images[1]))
    : mainImg;
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const isSoldOut = product.stock === 0;
  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isAdding || isSoldOut) return;
    setIsAdding(true);
    try {
      await addToCart(product, 1);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      ref={cardRef}
      data-card-id={cardId}
      onClickCapture={handleCardInteraction}
      className="flex flex-col group w-full col-span-1 glass-card rounded-2xl overflow-hidden bg-white/90 shadow-sm hover:shadow-xl transition-all duration-500 border border-[#e8e6d9]/80"
    >
      <div className="relative overflow-hidden w-full aspect-[4/5] flex items-center justify-center cursor-pointer bg-[#f7f6f0]">
        <Link to={`/products/${product.slug}`} className="block w-full h-full relative">
          <img
            src={mainImg}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {hoverImg && hoverImg !== mainImg && (
            <img
              src={hoverImg}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
          {discount > 0 && !isSoldOut && (
            <span className="bg-[#3a4d23] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase font-heading shadow-sm backdrop-blur-md">
              {discount}% OFF
            </span>
          )}
          {isSoldOut && (
            <span className="bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase font-heading shadow-sm backdrop-blur-md">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Action Buttons Overlay */}
        <div className={useMobileInteraction
          ? `absolute top-3 right-3 flex flex-col gap-2 z-20 transition-all duration-300 ${
              isActiveMobile
                ? 'opacity-100 pointer-events-auto translate-y-0'
                : 'opacity-0 pointer-events-none translate-y-2'
            }`
          : "absolute top-3 right-3 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-2 lg:group-hover:translate-x-0 transition-all duration-300 z-20"
        }>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (setQuickViewProduct) {
                setQuickViewProduct(product);
              }
            }}
            aria-label="Quick View"
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#1c2415] shadow-md hover:bg-[#3a4d23] hover:text-white transition-all duration-300 border border-white/50 cursor-pointer hover:scale-110"
          >
            <Eye size={15} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleWishlist(product);
            }}
            aria-label="Wishlist"
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-300 border border-white/50 cursor-pointer hover:scale-110 ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-[#1c2415] hover:bg-[#3a4d23] hover:text-white'
            }`}
          >
            <Heart size={15} strokeWidth={2} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Add to Cart CTA */}
        {!isSoldOut ? (
          <button
            disabled={isAdding}
            onClick={handleAddToCart}
            className={useMobileInteraction
              ? `absolute bottom-3 left-1/2 -translate-x-1/2 w-[88%] h-10 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-[11px] font-bold tracking-[0.18em] uppercase rounded-full z-20 border-none cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 ${
                  isActiveMobile
                    ? 'opacity-100 pointer-events-auto translate-y-0'
                    : 'opacity-0 pointer-events-none translate-y-3'
                }`
              : "absolute bottom-3 left-1/2 -translate-x-1/2 w-[88%] h-10 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-[11px] font-bold tracking-[0.18em] uppercase rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-2 lg:group-hover:translate-y-0 transition-all duration-300 z-20 border-none cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            }
          >
            <ShoppingBag size={14} />
            <span>{isAdding ? 'ADDING...' : 'ADD TO CART'}</span>
          </button>
        ) : (
          <button
            disabled
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[88%] h-10 bg-gray-400 text-white text-[11px] font-bold tracking-[0.18em] uppercase rounded-full z-20 border-none cursor-not-allowed shadow-sm flex items-center justify-center"
          >
            SOLD OUT
          </button>
        )}
      </div>

      <div className="flex flex-col flex-grow p-4 text-center justify-between bg-white">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#729855] block mb-1">
            {typeof product.category === 'object' ? product.category?.name : (product.category || 'Organic Care')}
          </span>
          <h3 className="font-heading font-medium text-[15px] lg:text-[17px] leading-snug text-[#1c2415] hover:text-[#729855] transition-colors block line-clamp-2">
            <Link to={`/products/${product.slug}`} className="hover:text-[#729855] transition-colors block">
              {product.title}
            </Link>
          </h3>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-[#f4f2e6]">
          <span className="text-[15px] lg:text-[16px] text-[#1c2415] font-bold font-body">
            Rs. {product.price.toLocaleString('en-IN')}.00
          </span>
          {discount > 0 && (
            <span className="text-[12px] lg:text-[13px] text-gray-400 line-through font-body">
              Rs. {product.comparePrice.toLocaleString('en-IN')}.00
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const BeautyProductGrid = ({ setQuickViewProduct }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getAll({ limit: 12 }),
          categoryService.getAll()
        ]);

        if (prodRes.success) {
          setProducts(prodRes.data || []);
        }
        if (catRes.success) {
          setCategories(catRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching BeautyProductGrid data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = ['All', ...categories.map(cat => cat.name)];

  const filteredProducts = activeTab === 'All'
    ? products
    : products.filter(p => {
      const selectedCategory = categories.find(c => c.name === activeTab);
      if (!selectedCategory) return false;

      const prodCatId = typeof p.category === 'object' ? p.category?._id : p.category;
      const prodCatSlug = typeof p.category === 'object' ? p.category?.slug : '';

      return prodCatId === selectedCategory._id || prodCatSlug === selectedCategory.slug;
    });

  const displayProducts = filteredProducts.slice(0, 8);

  return (
    <section className="w-full bg-gradient-to-b from-[#faf9f5] via-white to-[#f7f6f0] select-none py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eef3e8] border border-[#d2e2c5] mb-3">
            <Sparkles size={14} className="text-[#3a4d23]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#3a4d23] font-heading">
              BOTANICAL HARVEST
            </span>
          </div>
          <h2 className="font-heading font-medium text-3xl md:text-5xl text-[#1c2415] tracking-tight">
            Beauty Care Products
          </h2>
          <p className="text-sm md:text-base text-[#5a5a5a] mt-2 font-body">
            Pure, dermatologically tested formulas tailored for glowing skin health.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full font-heading text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer border ${
                activeTab === tab
                  ? 'bg-[#3a4d23] text-white border-[#3a4d23] shadow-md scale-105'
                  : 'bg-white/80 text-[#5a5a5a] border-[#e8e6d9] hover:bg-white hover:text-[#1c2415] hover:border-[#3a4d23]/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading Skeleton or Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white p-3 border border-[#f0eee4]">
                <div className="w-full aspect-[4/5] rounded-xl skeleton-shimmer mb-4" />
                <div className="h-4 w-3/4 skeleton-shimmer rounded mb-2 mx-auto" />
                <div className="h-4 w-1/2 skeleton-shimmer rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {displayProducts.map((product) => (
              <BeautyProductCard
                key={product._id}
                product={product}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
                setQuickViewProduct={setQuickViewProduct}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default BeautyProductGrid;