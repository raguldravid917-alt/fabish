import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
import { productService } from '../api/productService';
import { categoryService } from '../api/categoryService';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { getLocalImageUrl } from '../utils/imageMapper';

// Robust helper to safely process image paths and prevent crashes
const ensureAbsolutePath = (path) => {
  if (!path) return '';

  let pathStr = '';
  if (typeof path === 'string') {
    pathStr = path;
  } else if (typeof path === 'object' && path !== null) {
    // If the path is an object (like a database populated image object), extract its URL
    pathStr = path.url || path.secure_url || '';
  }

  if (!pathStr || typeof pathStr !== 'string') return '';

  if (!pathStr.startsWith('/') && !pathStr.startsWith('http')) {
    return '/' + pathStr;
  }
  return pathStr;
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

  // Tabs built dynamically using database parent categories only
  const parentCategoriesOnly = categories.filter(c => !c.parentCategory);
  const tabs = ['All', ...parentCategoriesOnly.map(cat => cat.name)];

  // Filtering uses category ObjectId or slug dynamically resolved from tab name including descendant subcategories
  const filteredProducts = activeTab === 'All'
    ? products
    : products.filter(p => {
      const selectedCategory = categories.find(c => c.name === activeTab);
      if (!selectedCategory) return false;

      const prodCatId = typeof p.category === 'object' ? p.category?._id : p.category;
      if (!prodCatId) return false;

      if (prodCatId.toString() === selectedCategory._id.toString()) return true;

      // Recursive helper to check if child category is a descendant of parent category
      const isDescendantCat = (childId, parentId) => {
        let curr = categories.find(c => c._id.toString() === childId.toString());
        while (curr && curr.parentCategory) {
          const nextId = typeof curr.parentCategory === 'object' ? curr.parentCategory._id : curr.parentCategory;
          if (!nextId) break;
          if (nextId.toString() === parentId.toString()) return true;
          curr = categories.find(c => c._id.toString() === nextId.toString());
        }
        return false;
      };

      return isDescendantCat(prodCatId, selectedCategory._id);
    });

  // Limit display to 8 products max in home grid
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

        {/* Section Heading Title */}
        <h2 className="text-center font-heading font-medium text-[40px] leading-[52px] tracking-normal text-black mt-0 mb-[35px]">
          Beauty Care Products
        </h2>

        {/* Centered Category Tabs */}
        <div className="flex items-center justify-start md:justify-center gap-[24px] md:gap-[40px] mb-[36px] border-b border-gray-100 pb-[12px] overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-semibold text-[15px] cursor-pointer bg-transparent border-none pb-[8px] transition-colors -mb-[13px] shrink-0 ${activeTab === tab
                  ? 'text-[#2f3e10] border-b-[2px] border-[#2f3e10]'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          {displayProducts.map((product) => {
            const mainImg = getLocalImageUrl(ensureAbsolutePath(product.images?.[0] || product.image || '/assets/14.jpg'));
            const hoverImg = product.images?.[1]
              ? getLocalImageUrl(ensureAbsolutePath(product.images[1]))
              : mainImg;
            const discount = product.comparePrice > product.price
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
              : 0;
            const isSoldOut = product.stock === 0;

            return (
              <div key={product._id} className="flex flex-col group w-full">

                {/* Product Card Image Container - Edge-to-Edge with 533:622 Aspect Ratio */}
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

                  {/* Sale Badge */}
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

                  {/* Action Icons Hover Stack */}
                  <div className="absolute top-[12px] right-[12px] flex flex-col gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">

                    {/* Fixed Eye/View Icon Button to trigger Quick View Modal */}
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
                      onClick={() => toggleWishlist(product)}
                      className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-colors border-none cursor-pointer ${isInWishlist(product._id)
                          ? 'bg-black text-white hover:bg-[#729855]'
                          : 'bg-white text-black hover:bg-[#729855] hover:text-white'
                        }`}
                    >
                      <Heart size={14} strokeWidth={2} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => { }}
                      className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center text-black shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:bg-[#729855] hover:text-white transition-colors border-none cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M3 17v2a2 2 0 0 1 2 2h2" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>

                  {/* Hover Add to Cart Button */}
                  {!isSoldOut ? (
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="absolute bottom-[24px] left-1/2 -translate-x-1/2 w-[120px] h-[40px] bg-[#2f3e10] hover:bg-[#729855] text-white text-[12px] font-bold tracking-[3px] uppercase opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 z-20 border-none cursor-pointer shadow-sm"
                    >
                      ADD CART
                    </button>
                  ) : (
                    <button
                      disabled
                      className="absolute bottom-[24px] left-1/2 -translate-x-1/2 w-[120px] h-[40px] bg-[#5a5a5a] text-white text-[12px] font-bold tracking-[3px] uppercase opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 z-20 border-none cursor-not-allowed shadow-sm"
                    >
                      SOLD OUT
                    </button>
                  )}

                </div>

                {/* Card Texts - Centered */}
                <div className="flex flex-col items-center mt-[18px]">
                  <h3 className="text-center font-heading font-medium text-[20px] leading-[26px] text-black hover:text-[#729855] transition-colors block">
                    <Link to={`/products/${product.slug}`} className="hover:text-[#729855] transition-colors block">
                      {product.title}
                    </Link>
                  </h3>

                  <div className="flex flex-col items-center mt-[8px]">
                    <p className="text-center text-[16px] text-[#212b36] font-normal font-body">
                      Rs. {product.price.toLocaleString('en-IN')}.00 INR
                    </p>
                    {discount > 0 && (
                      <p className="text-center text-[14px] text-black/40 line-through mt-[4px] font-body">
                        Rs. {product.comparePrice.toLocaleString('en-IN')}.00 INR
                      </p>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default BeautyProductGrid;