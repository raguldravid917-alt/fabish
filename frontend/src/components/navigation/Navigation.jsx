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

        {/* ── Skin Care Luxury 2026 Dropdown ── */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[100vw] bg-[#FAFAF5] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border-t border-[#E5E3D4] cursor-default py-10 top-[66px]">
          <div className="max-w-[1440px] w-full mx-auto px-8 lg:px-12 grid grid-cols-12 gap-8">
            
            {/* Column 1: Cleansers (2 cols) */}
            <div className="col-span-2 border-r border-[#E5E3D4]/80 pr-4">
              <h4 className="font-heading text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#111111] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#729855]"></span>
                Cleansers
              </h4>
              <ul className="space-y-3.5 flex flex-col">
                {[
                  { name: 'Cream Cleanser', slug: 'cleansers' },
                  { name: 'Gel Cleanser', slug: 'cleansers' },
                  { name: 'Foam Cleanser', slug: 'cleansers' },
                  { name: 'Oil Cleanser', slug: 'cleansers' },
                  { name: 'Face Wash', slug: 'cleansers' },
                  { name: 'Micellar Water', slug: 'cleansers' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={`/collections/${item.slug}`}
                      className="group/item inline-flex items-center gap-2 text-[14px] font-medium text-[#374151] hover:text-[#729855] font-body transition-all duration-200 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#729855] opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"></span>
                      <span className="group-hover/item:translate-x-1 transition-transform duration-200">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Moisturizers (2 cols) */}
            <div className="col-span-2 border-r border-[#E5E3D4]/80 pr-4">
              <h4 className="font-heading text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#111111] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#729855]"></span>
                Moisturizers
              </h4>
              <ul className="space-y-3.5 flex flex-col">
                {[
                  { name: 'Day Cream', slug: 'moisturizers' },
                  { name: 'Night Cream', slug: 'moisturizers' },
                  { name: 'Moisturizer', slug: 'moisturizers' },
                  { name: 'Face Cream', slug: 'moisturizers' },
                  { name: 'Hydrating Cream', slug: 'moisturizers' },
                  { name: 'Brightening Cream', slug: 'moisturizers' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={`/collections/${item.slug}`}
                      className="group/item inline-flex items-center gap-2 text-[14px] font-medium text-[#374151] hover:text-[#729855] font-body transition-all duration-200 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#729855] opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"></span>
                      <span className="group-hover/item:translate-x-1 transition-transform duration-200">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Serums & Treatments (3 cols) */}
            <div className="col-span-3 border-r border-[#E5E3D4]/80 pr-6">
              <h4 className="font-heading text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#111111] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#729855]"></span>
                Serums &amp; Treatments
              </h4>
              <ul className="space-y-3.5 flex flex-col">
                {[
                  { name: 'Vitamin C', slug: 'serums' },
                  { name: 'Hyaluronic Acid', slug: 'serums' },
                  { name: 'Niacinamide', slug: 'serums' },
                  { name: 'Retinol', slug: 'serums' },
                  { name: 'Anti Aging', slug: 'serums' },
                  { name: 'Acne Care', slug: 'serums' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={`/collections/${item.slug}`}
                      className="group/item inline-flex items-center gap-2 text-[14px] font-medium text-[#374151] hover:text-[#729855] font-body transition-all duration-200 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#729855] opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"></span>
                      <span className="group-hover/item:translate-x-1 transition-transform duration-200">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Featured Collection (5 cols - Spacious 2-card grid) */}
            <div className="col-span-5 pl-2">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-heading text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#111111] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#729855]"></span>
                  Featured Collection
                </h4>
                <Link
                  to="/collections/all"
                  className="text-[11px] font-heading font-bold text-[#729855] hover:text-[#2f3e10] uppercase tracking-wider transition-colors flex items-center gap-1"
                >
                  Shop All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 2 Spacious Product Cards Grid */}
              <div className="grid grid-cols-2 gap-5">
                {(bestSellers && bestSellers.length >= 2 ? bestSellers.slice(0, 2) : [
                  {
                    _id: 'feat-1',
                    title: 'Aura Natural Face Cream',
                    slug: 'aura-natural-face-cream',
                    price: 2400,
                    image: '/assets/homepage/P1.jpg'
                  },
                  {
                    _id: 'feat-2',
                    title: 'Hydrating Glow Serum',
                    slug: 'aura-natural-face-cream',
                    price: 2900,
                    image: '/assets/homepage/P13.jpg'
                  }
                ]).map((product, idx) => {
                  if (!product) return null;
                  const prodImg = product.images && product.images[0]
                    ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].secure_url || product.images[0].url || ''))
                    : (product.image || (idx === 0 ? '/assets/homepage/P1.jpg' : '/assets/homepage/P13.jpg'));

                  return (
                    <Link
                      key={product._id || idx}
                      to={`/products/${product.slug || 'aura-natural-face-cream'}`}
                      className="group/card bg-white rounded-2xl p-4 border border-[#E5E3D4] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full min-h-[310px] cursor-pointer text-left overflow-hidden"
                    >
                      <div className="flex flex-col gap-2.5">
                        {/* Full Product Thumbnail Container */}
                        <div className="relative w-full aspect-[4/3] bg-[#EEF3E8] rounded-xl overflow-hidden">
                          <img
                            src={prodImg}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = '/assets/homepage/P1.jpg'; }}
                          />
                        </div>

                        {/* Product Title (Max 2 lines, no clipping) */}
                        <h5 className="text-[13.5px] font-heading font-bold text-[#111111] line-clamp-2 leading-snug group-hover/card:text-[#729855] transition-colors">
                          {product.title}
                        </h5>
                      </div>

                      {/* Price & Shop Now Button Section */}
                      <div className="pt-3 border-t border-[#F0EFE6] flex flex-col gap-2.5 mt-3">
                        <span className="text-[13px] font-bold text-[#2f3e10] font-body block">
                          Rs. {Number(product.price || 0).toLocaleString('en-IN')}.00 INR
                        </span>
                        <span className="w-full py-2 px-3 bg-[#729855] group-hover/card:bg-[#2f3e10] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                          Shop Now <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
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
