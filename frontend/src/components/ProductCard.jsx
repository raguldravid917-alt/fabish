import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye, ArrowLeftRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { getLocalImageUrl } from '../utils/imageMapper';

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const mainImage = getLocalImageUrl(product.images?.[0]);
  let hoverImage = product.images?.[1] ? getLocalImageUrl(product.images[1]) : mainImage;

  // Intercept and fix dummy Map/Satellite image hover URLs with valid secondary cosmetic assets
  if (hoverImage && hoverImage.includes('vt (7).webp')) {
    hoverImage = '/assets/homepage/9.jpg';
  } else if (hoverImage && hoverImage.includes('vt (22).webp')) {
    hoverImage = '/assets/homepage/20.jpg';
  }

  const isWishlisted = isInWishlist(product._id);
  const isSoldOut = product.stock === 0;
  const discount = product.comparePrice > product.price 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
    : 0;

  return (
    <div className="group relative bg-white border border-transparent rounded-none p-0 transition-all duration-300 flex flex-col h-full">
      {/* Product Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none">
        {isSoldOut && (
          <span className="bg-black text-white text-[10px] font-heading font-bold uppercase tracking-widest px-2.5 py-1">
            Sold Out
          </span>
        )}
        {!isSoldOut && discount > 0 && (
          <span className="bg-[#729855] text-white text-[10px] font-heading font-bold uppercase tracking-widest px-2.5 py-1">
            {discount}%
          </span>
        )}
      </div>

      {/* Image Gallery Container */}
      <div className="relative overflow-hidden aspect-[4/5] bg-[#f6f5ea] mb-[16px] select-none flex items-center justify-center">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={hoverImage}
            alt={product.title}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 ease-out scale-100 opacity-0 group-hover:scale-105 group-hover:opacity-100"
          />
        </Link>

        {/* Quick Action Overlay Icons */}
        <div className="absolute top-[10px] right-[10px] w-11 lg:w-[36px] flex flex-col gap-[8px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={() => {
              if (onQuickView) {
                onQuickView(product);
              } else {
                window.location.href = `/products/${product.slug}`;
              }
            }}
            className="w-11 h-11 lg:w-[36px] lg:h-[36px] rounded-full bg-white flex items-center justify-center text-black hover:bg-[#729855] hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer border-none"
            title="Quick View"
          >
            <Eye className="w-[16px] h-[16px]" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => toggleWishlist(product)}
            className={`w-11 h-11 lg:w-[36px] lg:h-[36px] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer border-none ${
              isWishlisted 
                ? 'bg-black text-white hover:bg-[#729855] hover:text-white' 
                : 'bg-white text-black hover:bg-[#729855] hover:text-white'
            }`}
            title="Add to Wishlist"
          >
            <Heart className="w-[16px] h-[16px]" strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => {}}
            className="w-11 h-11 lg:w-[36px] lg:h-[36px] rounded-full bg-white flex items-center justify-center text-black hover:bg-[#729855] hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer border-none"
            title="Compare"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[16px] h-[16px]">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M3 17v2a2 2 0 0 1 2 2h2" />
              <circle cx="12" cy="12" r="3" />
              <path d="M16 16v.01" strokeWidth="2.5" />
            </svg>
          </button>
        </div>

        {/* Add to Cart overlay */}
        {!isSoldOut ? (
          <div className="absolute bottom-0 left-0 right-0 h-[48px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={() => addToCart(product, 1)}
              className="w-full h-full bg-[#2f3e10] hover:bg-[#729855] text-white text-center font-heading text-[12px] font-bold tracking-[3px] uppercase cursor-pointer border-none rounded-none transition-colors"
            >
              ADD CART
            </button>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-0 h-[48px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              disabled
              className="w-full h-full bg-[#5a5a5a] text-white text-center font-heading text-[12px] font-bold tracking-[3px] uppercase cursor-not-allowed border-none rounded-none"
            >
              SOLD OUT
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow text-center">
        <h3 className="font-heading font-medium text-[18px] leading-[24px] text-black hover:text-[#729855] text-center mb-[10px] h-[48px] overflow-hidden line-clamp-2 block transition-colors">
          <Link to={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        
        {/* Prices */}
        <div className="flex flex-row items-center justify-center gap-2 mt-auto font-body whitespace-nowrap">
          <span className="text-[16px] font-medium text-black">
            Rs. {product.price.toLocaleString('en-IN')}.00 INR
          </span>
          {product.comparePrice > product.price && (
            <span className="text-[14px] line-through text-gray-400">
              Rs. {product.comparePrice.toLocaleString('en-IN')}.00 INR
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
