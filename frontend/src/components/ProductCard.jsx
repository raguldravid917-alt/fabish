import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
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
    <div className="group relative bg-[#fcfcfa] border border-[#eae8d8] rounded-none p-3 transition-all duration-300 flex flex-col h-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] select-none">
      {/* Product Badges (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        {isSoldOut && (
          <span className="bg-black text-white text-[9px] font-heading font-bold uppercase tracking-widest px-2 py-0.5">
            Sold Out
          </span>
        )}
        {!isSoldOut && discount > 0 && (
          <span className="bg-[#729855] text-white text-[9px] font-heading font-bold uppercase tracking-widest px-2 py-0.5">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Wishlist Button (Top Right) */}
      <button
        onClick={() => toggleWishlist(product)}
        className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer border-none ${
          isWishlisted 
            ? 'bg-black text-white' 
            : 'bg-white text-black hover:bg-[#729855] hover:text-white'
        }`}
        title="Add to Wishlist"
      >
        <Heart className="w-4 h-4" strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Image Gallery Container with fixed aspect ratio */}
      <div className="relative overflow-hidden aspect-[4/5] bg-[#f6f5ea] mb-4 flex items-center justify-center">
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

        {/* Hover Quick View icon (Desktop only) */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center gap-2 z-10">
          <button
            onClick={() => {
              if (onQuickView) onQuickView(product);
              else window.location.href = `/products/${product.slug}`;
            }}
            className="w-9 h-9 rounded-full bg-white text-black hover:bg-[#729855] hover:text-white flex items-center justify-center shadow-sm transition-all duration-300 cursor-pointer border-none"
            title="Quick View"
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-col flex-grow text-center">
        {/* Title */}
        <h3 className="font-heading font-medium text-xs sm:text-sm leading-tight text-black hover:text-[#729855] mb-2 line-clamp-2 min-h-[32px] sm:min-h-[40px] overflow-hidden transition-colors">
          <Link to={`/products/${product.slug}`} className="block">{product.title}</Link>
        </h3>
        
        {/* Prices */}
        <div className="flex flex-col min-[380px]:flex-row items-center justify-center gap-1 sm:gap-2 mb-3 mt-auto font-body text-center">
          <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap">
            Rs. {product.price.toLocaleString('en-IN')}.00
          </span>
          {product.comparePrice > product.price && (
            <span className="text-[10px] sm:text-xs line-through text-gray-400 whitespace-nowrap">
              Rs. {product.comparePrice.toLocaleString('en-IN')}.00
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="mt-auto">
          {!isSoldOut ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="w-full py-2.5 sm:py-3 bg-[#2f3e10] hover:bg-[#729855] text-white text-center font-heading text-[10px] sm:text-xs font-bold tracking-widest uppercase cursor-pointer border-none rounded-none transition-colors min-h-[40px] flex items-center justify-center"
            >
              ADD TO CART
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2.5 sm:py-3 bg-gray-400 text-white text-center font-heading text-[10px] sm:text-xs font-bold tracking-widest uppercase cursor-not-allowed border-none rounded-none min-h-[40px] flex items-center justify-center"
            >
              SOLD OUT
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
