import React, { useState } from 'react';
import { Heart, ShoppingBag, Trash2, Eye, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useToast } from '../../context/ToastContext';
import { getLocalImageUrl } from '../../utils/imageMapper';

const AccountWishlist = ({ wishlist = [], onQuickView }) => {
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();
  const { showToast } = useToast();
  const [movingItems, setMovingItems] = useState({});
  const [isMovingAll, setIsMovingAll] = useState(false);

  // Move single item to bag: Add to cart -> remove from wishlist on success
  const handleMoveToCart = async (product) => {
    const pId = product._id || product.id;
    if (movingItems[pId]) return; // Prevent double trigger
    
    setMovingItems((prev) => ({ ...prev, [pId]: true }));
    try {
      const added = await addToCart(product, 1);
      if (added) {
        await removeFromWishlist(pId);
        showToast(`Moved "${product.title}" to your shopping bag!`, 'success');
      } else {
        showToast('Failed to add item to bag. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Error moving item to bag.', 'error');
    } finally {
      setMovingItems((prev) => ({ ...prev, [pId]: false }));
    }
  };

  // Move all in-stock items to bag
  const handleMoveAllToCart = async () => {
    if (wishlist.length === 0 || isMovingAll) return;
    setIsMovingAll(true);
    let count = 0;
    
    // Create copy of array to iterate safely
    const itemsToMove = [...wishlist];
    for (const prod of itemsToMove) {
      if (prod.stock !== 0) {
        const pId = prod._id || prod.id;
        const added = await addToCart(prod, 1);
        if (added) {
          await removeFromWishlist(pId);
          count += 1;
        }
      }
    }
    
    setIsMovingAll(false);
    if (count > 0) {
      showToast(`Moved ${count} in-stock wishlist items to your bag!`, 'success');
    } else {
      showToast('No in-stock items were available to move.', 'info');
    }
  };

  return (
    <div className="space-y-6 select-none font-body">
      
      {/* Header & Controls */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-[#1C2415]">
            My Saved Wishlist ({wishlist.length})
          </h2>
          <p className="text-xs text-gray-500">Your curated favorites ready for instant addition to bag</p>
        </div>

        {wishlist.length > 0 && (
          <button
            type="button"
            disabled={isMovingAll}
            onClick={handleMoveAllToCart}
            className="h-10 px-5 rounded-full bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs border-none cursor-pointer disabled:opacity-50"
          >
            {isMovingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            <span>{isMovingAll ? 'Moving Items...' : 'Move All To Bag'}</span>
          </button>
        )}
      </div>

      {/* Wishlist Product Cards Grid */}
      {wishlist.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E6D9] p-8">
          <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-[#1C2415] mb-1">Your Wishlist is Empty</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Tap the heart icon on any product card to save your favorite organic formulations for later.
          </p>
          <Link
            to="/collections/all"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-widest transition-all no-underline shadow-xs"
          >
            Explore Organic Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => {
            const pId = product._id || product.id;
            const isPending = !!movingItems[pId];
            const isSoldOut = product.stock === 0;
            const mainImg = getLocalImageUrl(product.images?.[0]);

            return (
              <div 
                key={pId} 
                className="bg-white border border-[#E8E6D9] rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative group"
              >
                {/* Image + Remove Icon */}
                <div className="relative aspect-[4/5] bg-[#F7F6F0] rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                  <img 
                    src={mainImg} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'; }}
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(pId)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-xs transition-colors border-none cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {isSoldOut && (
                    <span className="absolute top-3 left-3 bg-black/80 text-white text-[9px] font-heading font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-center flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#729855] block font-heading">
                      {typeof product.category === 'object' ? product.category?.name : (product.category || 'Skincare')}
                    </span>
                    <h3 className="font-heading font-semibold text-sm text-[#1C2415] line-clamp-2 mt-1">
                      {product.title}
                    </h3>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="fill-amber-400" />
                      ))}
                      <span className="text-[10px] text-gray-500 ml-1 font-body">(4.9)</span>
                    </div>

                    <p className="text-sm font-bold text-[#1C2415] mb-3">
                      Rs. {product.price?.toLocaleString('en-IN')}.00
                    </p>

                    {/* Move to Bag Button */}
                    {!isSoldOut ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleMoveToCart(product)}
                        className="w-full py-2.5 bg-[#3A4D23] hover:bg-[#1C2415] text-white text-center font-heading text-[10px] font-bold tracking-[0.18em] uppercase rounded-xl cursor-pointer border-none flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60"
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5" />
                        )}
                        <span>{isPending ? 'Moving...' : 'Move to Bag'}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 bg-gray-300 text-gray-600 text-center font-heading text-[10px] font-bold tracking-[0.18em] uppercase rounded-xl cursor-not-allowed border-none flex items-center justify-center"
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AccountWishlist;
