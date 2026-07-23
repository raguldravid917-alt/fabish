import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Star, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { usePrefetch } from '../hooks/usePrefetch';
import { getLocalImageUrl } from '../utils/imageMapper';
import { useMobileCardActive } from '../hooks/useMobileCardActive';

const ProductCard = ({ product, onQuickView }) => {
  if (!product || typeof product !== 'object' || !product._id) {
    return null;
  }

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { prefetchProduct } = usePrefetch();

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

  const [isAdding, setIsAdding] = useState(false);

  const cardRef = useRef(null);
  const { isActiveMobile, useMobileInteraction, handleCardInteraction, cardId } =
    useMobileCardActive(product._id || product.id, cardRef);

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
      onMouseEnter={() => prefetchProduct(product?.slug)}
      className="group relative bg-white/90 border border-[#e8e6d9]/80 rounded-2xl p-3 transition-all duration-500 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 select-none overflow-hidden glass-card"
    >
      {/* Product Badges (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        {isSoldOut && (
          <span className="bg-black/80 backdrop-blur-md text-white text-[9px] font-heading font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            Sold Out
          </span>
        )}
        {!isSoldOut && discount > 0 && (
          <span className="bg-[#3a4d23] backdrop-blur-md text-white text-[9px] font-heading font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Action Drawer Overlay (Top Right) */}
      <div className={useMobileInteraction
        ? `absolute top-4 right-4 z-20 flex flex-col gap-2 transition-all duration-300 ${
            isActiveMobile
              ? 'opacity-100 pointer-events-auto translate-y-0'
              : 'opacity-0 pointer-events-none translate-y-2'
          }`
        : "absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-2 lg:group-hover:translate-x-0 transition-all duration-300"
      }>
        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-300 border border-white/50 cursor-pointer hover:scale-110 ${
            isWishlisted 
              ? 'bg-rose-500 text-white' 
              : 'bg-white/90 text-[#1c2415] hover:bg-[#3a4d23] hover:text-white'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className="w-4 h-4" strokeWidth={1.8} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={() => {
            if (onQuickView) onQuickView(product);
            else window.location.href = `/products/${product.slug}`;
          }}
          className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#1c2415] hover:bg-[#3a4d23] hover:text-white flex items-center justify-center shadow-md transition-all duration-300 border border-white/50 cursor-pointer hover:scale-110"
          title="Quick View"
          aria-label="Quick View"
        >
          <Eye className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/5] bg-[#f7f6f0] rounded-xl mb-3 flex items-center justify-center">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {hoverImage && hoverImage !== mainImage && (
            <img
              src={hoverImage}
              alt={product.title}
              className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-col flex-grow text-center justify-between p-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#729855] block mb-1 font-heading">
            {typeof product.category === 'object' ? product.category?.name : (product.category || 'Organic Skincare')}
          </span>
          <h3 className="font-heading font-medium text-sm leading-snug text-[#1c2415] hover:text-[#729855] mb-2 line-clamp-2 min-h-[36px] transition-colors">
            <Link to={`/products/${product.slug}`} className="block">{product.title}</Link>
          </h3>
        </div>

        {/* Rating & Prices */}
        <div className="mt-auto">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
            ))}
            <span className="text-[10px] text-gray-500 font-body ml-1">(4.9)</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3 font-body">
            <span className="text-sm font-bold text-[#1c2415]">
              Rs. {product.price.toLocaleString('en-IN')}.00
            </span>
            {product.comparePrice > product.price && (
              <span className="text-xs line-through text-gray-400">
                Rs. {product.comparePrice.toLocaleString('en-IN')}.00
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {!isSoldOut ? (
            <button
              disabled={isAdding}
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-center font-heading text-[10px] font-bold tracking-[0.18em] uppercase rounded-xl cursor-pointer border-none flex items-center justify-center gap-2 shadow-md transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
            >
              <ShoppingBag size={13} />
              <span>{isAdding ? 'ADDING...' : 'ADD TO CART'}</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2.5 bg-gray-400 text-white text-center font-heading text-[10px] font-bold tracking-[0.18em] uppercase rounded-xl cursor-not-allowed border-none flex items-center justify-center"
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
