import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import CatalogDropdown from './CatalogDropdown';
import { ArrowRight, Heart } from 'lucide-react';

const NavLink = ({ to, label, active }) => (
  <Link
    to={to}
    className="text-[16px] font-heading font-normal transition-colors py-[5px] px-[16px] h-full flex items-center"
    style={{
      color: active ? '#729855' : '#000000',
      textDecoration: 'none',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = '#729855')}
    onMouseLeave={(e) => (e.currentTarget.style.color = active ? '#729855' : '#000000')}
  >
    {label}
  </Link>
);

const Navigation = ({ bestSellers = [], toggleWishlist, addToCart, isInWishlist, showToast, navigate }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="hidden lg:flex items-center h-full">
      {/* Home */}
      <NavLink to="/" label="Home" active={currentPath === '/'} />

      {/* Catalog Dropdown (Refactored interactive menu) */}
      <CatalogDropdown />

      {/* Skin Care Mega Menu Dropdown */}
      <div className="group h-full flex items-center">
        <Link
          to="/collections/all"
          className="flex items-center gap-1.5 text-[16px] font-heading font-normal py-[5px] px-[16px] text-black group-hover:text-[#729855] transition-colors h-full"
          style={{ textDecoration: 'none' }}
        >
          Skin Care
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:-scale-y-100 mt-0.5"
          >
            <path d="M1 1L5 5L9 1" />
          </svg>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 w-[100vw] bg-[#F9F9EB] shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border-t border-[#eae8d8] cursor-default pb-20 pt-12 top-[66px]">
          <div className="max-w-[1440px] w-full mx-auto px-6 lg:px-12 flex justify-between gap-6">
            {/* Column 1: Cleansers */}
            <div className="text-center w-[22%]">
              <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] mb-8">
                Cleansers
              </h4>
              <ul className="space-y-4 flex flex-col items-center">
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Creamy Foam Cleanser</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Erotic Ayruvedic Lotion</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Sensitive Skin Gel Face Wash</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Oil Skin Cleaning Lotion</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Anit Polution Face Cream</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Nourish Honey Gel Face Cream</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Dry Skin Glow Face Cleanser</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Skin Hydrating Foaming Cleanser</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Gentle Skin Face Cleanser</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Alove Oil Dry Skin Cleanser</Link></li>
                <li><Link to="/collections/cleansers" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Oil Free Vitamin Face Cream</Link></li>
              </ul>
            </div>

            {/* Column 2: Moisturizers */}
            <div className="text-center w-[22%]">
              <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] mb-8">
                Moisturizers
              </h4>
              <ul className="space-y-4 flex flex-col items-center">
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Aloe Vera Freshness Cream</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Azalea Fields Soothing Cream</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Hydro Boost Moisturizing Cream</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Oil Free Vitamin Face Cream</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Daily Use Vitamin C Cream</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Honey Drop Moisturizing Lotion</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Oil Absorption Moisturizing Cream</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Strawberry Flavour Face Care Gel</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Multi Vitamin Daily Use</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Birch Butter Silkiness Cream</Link></li>
                <li><Link to="/collections/moisturizers" className="inline-block font-medium text-[14px] text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Fragrance Free Multi Vitamin Cream</Link></li>
              </ul>
            </div>

            {/* Column 3: Serums */}
            <div className="text-center w-[22%]">
              <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] mb-8">
                Serums
              </h4>
              <ul className="space-y-4 flex flex-col items-center">
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Skin Naturals BB Cream VitaminC</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Vitamin C Glow Skin Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Glow Face Vitamin E Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Skin Brighten Green Tea Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Anti Aging Face Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Skin Brightening Fruit Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Ance Fighting Cucumber Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Dead Skin Cell Removal Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Skin Hydrate Face Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Vitamin Repair Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Natural Glow Serum</Link></li>
                <li><Link to="/collections/serums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Hydrating Night Serum</Link></li>
              </ul>
            </div>

            {/* Column 4: Best Sellers */}
            <div className="w-[32%] pl-6">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-[#111]">
                  Best Sellers
                </h4>
                <Link to="/collections/all">
                  <ArrowRight className="w-5 h-5 text-[#111] hover:text-[#729855] transition-colors" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {bestSellers && bestSellers.length > 0 ? (
                  bestSellers.map((product, idx) => {
                    if (!product) return null;
                    const prodImg = product.images && product.images[0]
                      ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].secure_url || product.images[0].url || ''))
                      : (idx === 0 ? '/assets/1.jpg' : '/assets/3.jpg');

                    return (
                      <Link
                        key={product._id}
                        to={`/products/${product.slug}`}
                        className="bg-white group/item cursor-pointer text-center flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow"
                      >
                        <div className="relative aspect-square bg-[#f0f2eb] flex items-center justify-center p-0 overflow-hidden">
                          <img
                            src={prodImg || (idx === 0 ? '/assets/1.jpg' : '/assets/3.jpg')}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                            onError={(e) => {
                              e.target.src = '/assets/14.jpg';
                            }}
                          />

                          {/* Hover Actions - Icons (Top Right) */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (navigate) navigate(`/products/${product.slug}`);
                              }}
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-colors text-black"
                              aria-label="Quick View"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                            {toggleWishlist && (
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  await toggleWishlist(product);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${isInWishlist && isInWishlist(product._id) ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                                aria-label={isInWishlist && isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                              >
                                <Heart className={`w-4 h-4 ${isInWishlist && isInWishlist(product._id) ? 'fill-current' : ''}`} />
                              </button>
                            )}
                          </div>

                          {/* Hover Action - Add to Cart Button */}
                          {addToCart && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-300">
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const success = await addToCart(product, 1);
                                  if (showToast) {
                                    if (success) {
                                      showToast(`Added ${product.title} to cart!`, 'success');
                                    } else {
                                      showToast('Failed to add product to cart', 'error');
                                    }
                                  }
                                }}
                                className="w-[78%] mx-auto py-3 bg-[#2f3e10] hover:bg-black text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-colors"
                              >
                                Add Cart
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col flex-grow justify-between">
                          <h5 className="text-[15px] font-heading font-bold text-[#111] leading-[1.4] mb-3 group-hover/item:text-[#729855] transition-colors">
                            {product.title}
                          </h5>
                          <span className="text-[13px] text-[#555] font-body">
                            Rs. {Number(product.price || 0).toLocaleString('en-IN')}.00 INR
                          </span>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-[13px] text-gray-500 py-10 font-body">
                    Loading best sellers...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Us */}
      <NavLink to="/pages/about-us" label="About Us" active={currentPath === '/pages/about-us'} />

      {/* Pages Dropdown */}
      <div className="group relative h-full flex items-center">
        <button
          className="flex items-center gap-1.5 text-[16px] font-heading font-normal py-[5px] px-[16px] text-black group-hover:text-[#729855] transition-colors h-full bg-transparent border-none cursor-pointer"
          style={{ textDecoration: 'none' }}
        >
          Pages
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:-scale-y-100 mt-0.5"
          >
            <path d="M1 1L5 5L9 1" />
          </svg>
        </button>

        <div className="absolute top-[66px] left-1/2 -translate-x-1/2 w-[120px] bg-[#F9F9EB] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 py-3 border-t border-[#eae8d8] rounded-b-lg">
          <Link
            to="/blogs/news"
            className="block py-2 px-4 text-[14px] text-[#222] hover:text-[#729855] text-center font-body transition-colors"
          >
            Blog
          </Link>
          <Link
            to="/pages/faq"
            className="block py-2 px-4 text-[14px] text-[#222] hover:text-[#729855] text-center font-body transition-colors"
          >
            FAQ
          </Link>
          <Link
            to="/pages/contact"
            className="block py-2 px-4 text-[14px] text-[#222] hover:text-[#729855] text-center font-body transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
