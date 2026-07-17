import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
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

  const mainImg = getLocalImageUrl(ensureAbsolutePath(product.images?.[0] || product.image || '/assets/14.jpg'));
  const hoverImg = product.images?.[1]
    ? getLocalImageUrl(ensureAbsolutePath(product.images[1]))
    : mainImg;
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const isSoldOut = product.stock === 0;

  return (
    <div
      ref={cardRef}
      data-card-id={cardId}
      onClickCapture={handleCardInteraction}
      className="flex flex-col group w-full col-span-1"
    >
      <div className="relative overflow-hidden w-full aspect-[533/622] flex items-center justify-center cursor-pointer p-0 bg-[#f4f5eb]">
        <Link to={`/products/${product.slug}`} className="block w-full h-full relative">
          <img
            src={mainImg}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-400 ease group-hover:scale-[1.05] group-hover:opacity-0"
          />
          {hoverImg && (
            <img
              src={hoverImg}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-400 ease scale-100 opacity-0 group-hover:scale-[1.05] group-hover:opacity-100"
            />
          )}
        </Link>

        {discount > 0 && !isSoldOut && (
          <div className="absolute top-[12px] left-[12px] bg-[#729855] text-white text-[10px] font-bold px-[10px] py-[4px] tracking-widest z-20 font-heading uppercase">
            {discount}% OFF
          </div>
        )}
        {isSoldOut && (
          <div className="absolute top-[12px] left-[12px] bg-black text-white text-[10px] font-bold px-[10px] py-[4px] tracking-widest z-20 font-heading uppercase">
            SOLD OUT
          </div>
        )}

        {/* Actions Overlay */}
        <div className={useMobileInteraction
          ? `absolute top-[12px] right-[12px] flex flex-col gap-[8px] z-20 transition-all duration-[250ms] ease-in-out ${
              isActiveMobile
                ? 'opacity-100 pointer-events-auto translate-y-0'
                : 'opacity-0 pointer-events-none translate-y-[10px]'
            }`
          : "absolute top-[12px] right-[12px] flex flex-col gap-[8px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-300 z-20"
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
            className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center text-black shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:bg-[#729855] hover:text-white transition-colors border-none cursor-pointer"
          >
            <Eye size={14} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleWishlist(product);
            }}
            className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-colors border-none cursor-pointer ${isInWishlist(product._id)
                ? 'bg-black text-white hover:bg-[#729855]'
                : 'bg-white text-black hover:bg-[#729855] hover:text-white'
              }`}
          >
            <Heart size={14} strokeWidth={2} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Add to Cart */}
        {!isSoldOut ? (
          <button
            onClick={() => addToCart(product, 1)}
            className={useMobileInteraction
              ? `absolute bottom-[16px] left-1/2 -translate-x-1/2 w-[110px] h-[36px] bg-[#2f3e10] hover:bg-[#729855] text-white text-[11px] font-bold tracking-[2px] uppercase z-20 border-none cursor-pointer shadow-sm flex items-center justify-center transition-all duration-[250ms] ease-in-out ${
                  isActiveMobile
                    ? 'opacity-100 pointer-events-auto translate-y-0'
                    : 'opacity-0 pointer-events-none translate-y-[10px]'
                }`
              : "absolute bottom-[16px] lg:bottom-[24px] left-1/2 -translate-x-1/2 w-[110px] lg:w-[120px] h-[36px] lg:h-[40px] bg-[#2f3e10] hover:bg-[#729855] text-white text-[11px] font-bold tracking-[2px] lg:tracking-[3px] uppercase opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-0 lg:translate-y-2 transition-all duration-300 z-20 border-none cursor-pointer shadow-sm flex items-center justify-center"
            }
          >
            ADD CART
          </button>
        ) : (
          <button
            disabled
            className={useMobileInteraction
              ? `absolute bottom-[16px] left-1/2 -translate-x-1/2 w-[110px] h-[36px] bg-[#5a5a5a] text-white text-[11px] font-bold tracking-[2px] uppercase z-20 border-none cursor-not-allowed shadow-sm flex items-center justify-center transition-all duration-[250ms] ease-in-out ${
                  isActiveMobile
                    ? 'opacity-100 pointer-events-auto translate-y-0'
                    : 'opacity-0 pointer-events-none translate-y-[10px]'
                }`
              : "absolute bottom-[16px] lg:bottom-[24px] left-1/2 -translate-x-1/2 w-[110px] lg:w-[120px] h-[36px] lg:h-[40px] bg-[#5a5a5a] text-white text-[11px] font-bold tracking-[2px] lg:tracking-[3px] uppercase opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-0 lg:translate-y-2 transition-all duration-300 z-20 border-none cursor-not-allowed shadow-sm flex items-center justify-center"
            }
          >
            SOLD OUT
          </button>
        )}
      </div>

      <div className="flex flex-col items-center mt-[18px]">
        <h3 className="text-center font-heading font-medium text-[16px] lg:text-[20px] leading-[26px] text-black hover:text-[#729855] transition-colors block line-clamp-2 px-1">
          <Link to={`/products/${product.slug}`} className="hover:text-[#729855] transition-colors block">
            {product.title}
          </Link>
        </h3>

        <div className="flex flex-col items-center mt-[8px]">
          <p className="text-center text-[14px] lg:text-[16px] text-[#212b36] font-normal font-body">
            Rs. {product.price.toLocaleString('en-IN')}.00 INR
          </p>
          {discount > 0 && (
            <p className="text-center text-[12px] lg:text-[14px] text-black/40 line-through mt-[4px] font-body">
              Rs. {product.comparePrice.toLocaleString('en-IN')}.00 INR
            </p>
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

  if (loading) {
    return (
      <div className="w-full text-center py-[40px] bg-white font-body">
        <span className="text-gray-400 font-semibold animate-pulse">Loading items...</span>
      </div>
    );
  }

  return (
    <section className="w-full bg-white select-none">
      <div className="max-w-[1280px] mx-auto px-6 md:px-[40px] pt-[40px] pb-[80px]">

        <h2 className="text-center font-heading font-medium text-[40px] leading-[52px] tracking-normal text-black mt-0 mb-[35px]">
          Beauty Care Products
        </h2>

        <div className="flex items-center justify-center gap-[40px] mb-[36px] border-b border-gray-100 pb-[12px]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-semibold text-[15px] cursor-pointer bg-transparent border-none pb-[8px] transition-colors -mb-[13px] ${activeTab === tab
                  ? 'text-[#2f3e10] border-b-[2px] border-[#2f3e10]'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Changed grid layout to strictly force 2 columns on mobile viewports */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[24px]">
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

      </div>
    </section>
  );
};

export default BeautyProductGrid;