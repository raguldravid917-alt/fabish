const fs = require('fs');
let content = fs.readFileSync('c:/Users/ragul/OneDrive/Desktop/fabish/frontend/src/pages/Cart.jsx', 'utf8');

// The file was mangled. Let's find the mangled part and fix it.
// The mangled part is around line 812:
// <p className="font-heading text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-3 leading-relaxed">Please sign in to place order.</p>
//                         </Link>
//
//                       </div>

content = content.replace(
  /<p className="font-heading text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-3 leading-relaxed">Please sign in to place order\.<\/p>\s*<\/Link>\s*<\/div>/s,
  `<p className="font-heading text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-3 leading-relaxed">Please sign in to place order.</p>
                        <Link to="/account/login?redirect=/cart?checkout=true" className="bg-brand-charcoal text-white px-6 py-2.5 font-heading font-bold text-xs uppercase tracking-widest inline-block transition-all">
                          Sign In
                        </Link>
                      </div>
                    )
                  )}

                  <div className="text-center font-heading text-[10px] text-brand-muted uppercase tracking-wider leading-relaxed pt-2">
                    <span className="block font-bold mb-1">Free Delivery Threshold:</span>
                    Spend Rs. 2,000 or more to skip shipping costs!
                  </div>
              </div>

              {/* You Might Also Like Section moved into the left column */}
              {cartItems.length > 0 && suggestedProducts.length > 0 && (
                <div className="w-full mt-10 md:mt-12">
                  <h3 className="font-heading text-xl md:text-2xl font-bold uppercase tracking-widest text-brand-charcoal mb-6 md:mb-8 text-center lg:text-left">
                    You Might Also Like
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {suggestedProducts.map((prod) => (
                      <ProductCard key={prod._id} product={prod} onQuickView={setQuickViewProduct} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Summary Column */}
            <div className="bg-white border border-brand-border p-6 md:p-8 space-y-6 lg:sticky lg:top-[110px] w-full lg:w-[380px] lg:flex-shrink-0 lg:self-start">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-brand-charcoal border-b border-brand-border pb-4">Order Summary</h3>

              <div className="space-y-4 text-sm font-semibold text-brand-muted font-heading">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="text-brand-charcoal">Rs. {itemsPrice.toLocaleString('en-IN')}.00</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#729855] select-text">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>- Rs. {discountAmount.toLocaleString('en-IN')}.00</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-[#729855]">
                    <span>Points Discount ({pointsToRedeem} pts)</span>
                    <span>- Rs. {pointsDiscount.toLocaleString('en-IN')}.00</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-brand-charcoal">
                    {shippingPrice === 0 ? 'FREE' : \`Rs. \${shippingPrice.toLocaleString('en-IN')}.00\`}
                  </span>
                </div>
                <hr className="border-brand-border" />
                <div className="flex justify-between text-base font-bold text-brand-charcoal">
                  <span>Total Amount</span>
                  <span className="text-lg">Rs. {finalTotalPrice.toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              {/* Coupon Input & Collapsible Offers list */}
              <div className="border-t border-brand-border pt-4 space-y-3">
                <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted block">Promo Code</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5 text-xs text-brand-green font-semibold rounded-none select-none">
                    <span>{appliedCoupon.code} ({appliedCoupon.discountType === 'Percentage' ? \`\${appliedCoupon.discountPercentage}% OFF\` : appliedCoupon.discountType === 'FreeShipping' ? 'FREE SHIPPING' : \`Rs. \${appliedCoupon.discountValue} OFF\`})</span>
                    <button
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-700 font-bold ml-2 text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER PROMO CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-grow border border-brand-border px-3 py-2 font-mono font-bold text-xs focus:outline-none focus:border-brand-green rounded-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCouponClick}
                      disabled={couponLoading}
                      className="bg-brand-charcoal hover:bg-brand-button-hover text-white text-[10px] font-heading font-bold uppercase tracking-widest px-4 py-2 disabled:opacity-50 transition-all rounded-none cursor-pointer"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-xs font-semibold mt-1">{couponError}</p>}
              </div>
            </div>

          </div>
        )}
      </div>
`
);

// Now we need to remove everything after `      </div>` to the end, EXCEPT the closing tags.
// Because the previous mangled replace left:
//                           />
//                         </Link>
// ... all the way down.
// Wait, actually `multi_replace_file_content` deleted the closing `</div>` and replaced it with a broken fragment.
// So let's just truncate the file at `      </div>` which is the closing of `max-w-[1440px]`? No, we just injected everything we needed.
// Wait! Let's carefully wipe out the rest of the file and append the sticky bars and QuickView Modal.

const contentSplit = content.split('          </div>\n        )}\n      </div>');
if (contentSplit.length > 1) {
  content = contentSplit[0] + '          </div>\n        )}\n      </div>\n\n' + `
        {/* Sticky Bottom Checkout Bar for Mobile (Cart View Only) */}
        {!isCheckoutMode && cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-brand-border shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-3.5 px-6 z-40 flex items-center justify-between lg:hidden select-none">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-brand-muted uppercase tracking-wider font-heading font-bold">Total Amount</span>
              <span className="font-sans text-base font-bold text-brand-charcoal">Rs. {totalPrice.toLocaleString('en-IN')}.00</span>
            </div>
            <Link
              to="/cart?checkout=true"
              className="bg-brand-charcoal hover:bg-brand-button-hover text-white h-11 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 no-underline"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Sticky Bottom Pay Bar for Mobile (Checkout View Only) */}
        {isCheckoutMode && cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-brand-border shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-3.5 px-6 z-40 flex items-center justify-between lg:hidden select-none">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-brand-muted uppercase tracking-wider font-heading font-bold">Order Total</span>
              <span className="font-sans text-base font-bold text-brand-charcoal">Rs. {totalPrice.toLocaleString('en-IN')}.00</span>
            </div>
            {user ? (
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                className="bg-[#2f3e10] hover:bg-black text-white h-11 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
            ) : (
              <Link
                to="/account/login?redirect=/cart?checkout=true"
                className="bg-brand-charcoal hover:bg-brand-button-hover text-white h-11 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 no-underline"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Quick View Modal */}
    {quickViewProduct && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default" onClick={() => setQuickViewProduct(null)} />
        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl animate-fade-in-up z-10">
          <button onClick={() => setQuickViewProduct(null)} className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center text-brand-charcoal hover:text-brand-green bg-white/90 rounded-full shadow-md z-20 cursor-pointer border-none" title="Close Quick View">
            <X className="w-6 h-6" />
          </button>
          <div className="w-full md:w-1/2 bg-brand-gray-light flex items-center justify-center p-6 md:p-12 relative group">
            <img src={getLocalImageUrl(quickViewProduct.images?.[0])} alt={quickViewProduct.title} className="max-h-[280px] md:max-h-[350px] w-auto object-contain" />
          </div>
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-white text-left">
            <div className="mb-4 text-[10px] font-heading font-bold uppercase tracking-widest text-brand-muted">
              {typeof quickViewProduct.category === 'object' ? quickViewProduct.category?.name : quickViewProduct.category}
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-medium text-brand-charcoal mb-3">{quickViewProduct.title}</h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={\`w-3.5 h-3.5 \${i < Math.floor(quickViewProduct.ratings || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}\`} />
                ))}
              </div>
              <span className="text-xs text-brand-muted">({quickViewProduct.reviewsCount || 0} reviews)</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl font-semibold text-brand-charcoal">Rs. {quickViewProduct.price.toLocaleString('en-IN')}.00</span>
              {quickViewProduct.comparePrice > quickViewProduct.price && <span className="text-sm line-through text-brand-muted">Rs. {quickViewProduct.comparePrice.toLocaleString('en-IN')}.00</span>}
            </div>
            <p className="text-sm text-brand-muted leading-relaxed mb-6 line-clamp-3 md:line-clamp-4">{quickViewProduct.description}</p>
            {quickViewProduct.stock > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 h-12">
                  <div className="flex items-center border border-brand-border h-full bg-white">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-full px-4 text-sm bg-transparent border-none hover:bg-gray-100 cursor-pointer font-bold flex items-center justify-center">-</button>
                    <span className="w-12 text-center text-sm font-bold text-brand-charcoal flex items-center justify-center h-full border-x border-brand-border">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(quickViewProduct.stock, q + 1))} className="h-full px-4 text-sm bg-transparent border-none hover:bg-gray-100 cursor-pointer font-bold flex items-center justify-center">+</button>
                  </div>
                  <span className="text-xs text-brand-green font-semibold">In Stock ({quickViewProduct.stock} left)</span>
                </div>
                <button onClick={() => { addToCart(quickViewProduct, quantity); setQuickViewProduct(null); showToast(\`Added \${quickViewProduct.title} to cart!\`); }} className="w-full bg-[#2f3e10] hover:bg-[#729855] text-white py-4 px-6 font-heading text-xs font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer border-none h-12 flex items-center justify-center">Add to Cart</button>
              </div>
            ) : (
              <button disabled className="w-full bg-gray-300 text-gray-500 py-4 px-6 font-heading text-xs font-bold tracking-[0.2em] uppercase cursor-not-allowed border-none h-12">Out of Stock</button>
            )}
          </div>
        </div>
      </div>
    )}
  );
};

export default Cart;
`;
} else {
  console.log("Failed to split content properly. Check logic.");
}

fs.writeFileSync('c:/Users/ragul/OneDrive/Desktop/fabish/frontend/src/pages/Cart.jsx', content);
console.log('Fixed Cart.jsx');
