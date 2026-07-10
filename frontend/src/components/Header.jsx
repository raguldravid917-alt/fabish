import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Heart, ShoppingBag, User as UserIcon, Trash2, ArrowRight, Eye } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { getLocalImageUrl } from '../utils/imageMapper';

const NavLink = ({ to, label, active }) => (
  <Link
    to={to}
    className="text-[16px] font-heading font-normal transition-colors py-[5px] px-[16px] h-full flex items-center"
    style={{
      color: active ? '#729855' : '#000000',
      textDecoration: 'none',
    }}
    onMouseEnter={e => e.currentTarget.style.color = '#729855'}
    onMouseLeave={e => e.currentTarget.style.color = active ? '#729855' : '#000000'}
  >
    {label}
  </Link>
);

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { cartItems, itemsCount, removeFromCart, updateQty, totalPrice } = useContext(CartContext);
  const { wishlistItems, toggleWishlist } = useContext(WishlistContext);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Account Dropdown states & refs
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountDropdownRef = useRef(null);

  // Close all drawers on route change (navigation)
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsSearchOpen(false);
    setIsAccountOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawers are open
  useEffect(() => {
    const isAnyDrawerOpen = isMobileMenuOpen || isCartOpen || isWishlistOpen || isSearchOpen;
    if (isAnyDrawerOpen) {
      document.body.classList.add('body-scroll-lock');
    } else {
      document.body.classList.remove('body-scroll-lock');
    }
    return () => {
      document.body.classList.remove('body-scroll-lock');
    };
  }, [isMobileMenuOpen, isCartOpen, isWishlistOpen, isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsAccountOpen(false);
        setIsMobileMenuOpen(false);
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections/all?search=${searchQuery.trim()}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <>
      <header className="top-0 w-full z-50 bg-[#F9F9EB] border-b border-[#eae8d8]/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-md">
        <div
          className="mx-auto flex items-center justify-between"
          style={{
            maxWidth: '1280px',
            paddingLeft: '2%',
            paddingRight: '2%',
            height: '66px',
          }}
        >
          {/* Left: Logo */}
          <div className="flex items-center gap-1 sm:gap-2 h-full">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-black hover:text-[#729855] w-11 h-11 flex items-center justify-center bg-transparent border-none cursor-pointer"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center select-none h-full">
              <img
                src="/assets/homepage/Fabish_Logo_Final_a68866dc-7573-4072-bd3f-3e356eca427e.svg"
                alt="Fabish"
                className="w-[100px] min-[360px]:w-[120px] sm:w-[140px] h-auto"
              />
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:flex items-center h-full">
            <NavLink to="/" label="Home" active={currentPath === '/'} />
            <NavLink to="/collections" label="Catalog" active={currentPath === '/collections'} />

            {/* Skin Care Mega Menu Dropdown */}
            <div className="group h-full flex items-center">
              <Link to="/collections/all" className="flex items-center gap-1.5 text-[16px] font-heading font-normal py-[5px] px-[16px] text-black group-hover:text-[#729855] transition-colors h-full" style={{ textDecoration: 'none' }}>
                Skin Care
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-scale-y-100 mt-0.5"><path d="M1 1L5 5L9 1" /></svg>
              </Link>

              {/* Mega Menu Panel (Spans full 100vw width) */}
              <div className="absolute left-1/2 -translate-x-1/2 w-[100vw] bg-[#F9F9EB] shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border-t border-[#eae8d8] cursor-default pb-20 pt-12 top-[66px]">
                {/* Content spreads end-to-end using a wider max-width container */}
                <div className="max-w-[1440px] w-full mx-auto px-6 lg:px-12 flex justify-between gap-6">

                  {/* Column 1: Cleansers */}
                  <div className="text-center w-[22%]">
                    <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] mb-8">Cleansers</h4>
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
                    <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] mb-8">Moisturizers</h4>
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

                  {/* Column 3: Scerums */}
                  <div className="text-center w-[22%]">
                    <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] mb-8">Scerums</h4>
                    <ul className="space-y-4 flex flex-col items-center">
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Skin Naturals BB Cream VitaminC</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Vitamin C Glow Skin Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Glow Face Vitamin E Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Skin Brighten Green Tea Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Anti Aging Face Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Skin Brightening Fruit Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Ance Fighting Cucumber Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Dead Skin Cell Removal Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Skin Hydrate Face Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Vitamin Repair Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Natural Glow Serum</Link></li>
                      <li><Link to="/collections/scerums" className="inline-block text-[14px] font-medium text-[#222] hover:text-[#729855] hover:translate-x-1.5 font-body transition-all duration-300">Hydrating Night Serum</Link></li>
                    </ul>
                  </div>

                  {/* Column 4: Best Sellers */}
                  <div className="w-[32%] pl-6">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-[#111]">Best Sellers</h4>
                      <Link to="/collections/all"><ArrowRight className="w-5 h-5 text-[#111] hover:text-[#729855] transition-colors" /></Link>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {/* Product 1 */}
                      <Link to="/collections/all" className="bg-white group/item cursor-pointer text-center flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow">
                        <div className="relative aspect-square bg-[#f0f2eb] flex items-center justify-center p-0 overflow-hidden">
                          <img src="/assets/1.jpg" alt="Azalea Fields" className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" onError={(e) => { e.target.src = '/assets/14.jpg'; }} />

                          {/* Hover Actions - Icons (Top Right) */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">
                            <button onClick={(e) => e.preventDefault()} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-colors text-black">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                            <button onClick={(e) => e.preventDefault()} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-colors text-black">
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Hover Action - Add to Cart Button (Bottom) */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-300">
                            <button onClick={(e) => e.preventDefault()} className="w-[78%] mx-auto py-3 bg-[#2f3e10] hover:bg-black text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-colors">
                              Add Cart
                            </button>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow justify-between">
                          <h5 className="text-[15px] font-heading font-bold text-[#111] leading-[1.4] mb-3 group-hover/item:text-[#729855] transition-colors">Azalea Fields Soothing Cream</h5>
                          <span className="text-[13px] text-[#555] font-body">Rs. 24,100.00 INR</span>
                        </div>
                      </Link>

                      {/* Product 2 */}
                      <Link to="/collections/all" className="bg-white group/item cursor-pointer text-center flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow">
                        <div className="relative aspect-square bg-[#f0f2eb] flex items-center justify-center p-0 overflow-hidden">
                          <img src="/assets/3.jpg" alt="Bluebell Dream" className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" onError={(e) => { e.target.src = '/assets/14.jpg'; }} />

                          {/* Hover Actions - Icons (Top Right) */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">
                            <button onClick={(e) => e.preventDefault()} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-colors text-black">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                            <button onClick={(e) => e.preventDefault()} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-colors text-black">
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Hover Action - Add to Cart Button (Bottom) */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-300">
                            <button onClick={(e) => e.preventDefault()} className="w-[78%] mx-auto py-3 bg-[#2f3e10] hover:bg-black text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-colors">
                              Add Cart
                            </button>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow justify-between">
                          <h5 className="text-[15px] font-heading font-bold text-[#111] leading-[1.4] mb-3 group-hover/item:text-[#729855] transition-colors">Bluebell Dream Nourishing Cream</h5>
                          <span className="text-[13px] text-[#555] font-body">Rs. 72,200.00 INR</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <NavLink to="/pages/about-us" label="About Us" active={currentPath === '/pages/about-us'} />

            {/* Pages Dropdown (Simple Menu) */}
            <div className="group relative h-full flex items-center">
              <button className="flex items-center gap-1.5 text-[16px] font-heading font-normal py-[5px] px-[16px] text-black group-hover:text-[#729855] transition-colors h-full bg-transparent border-none cursor-pointer" style={{ textDecoration: 'none' }}>
                Pages
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-scale-y-100 mt-0.5"><path d="M1 1L5 5L9 1" /></svg>
              </button>

              <div className="absolute top-[66px] left-1/2 -translate-x-1/2 w-[80px] bg-[#F9F9EB] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 py-4 border-t border-[#eae8d8]">
                <Link to="/blogs/news" className="block py-2.5 px-4 text-[15px] text-[#222] hover:text-[#729855] text-center font-body transition-colors">Blog</Link>
                <Link to="/pages/faq" className="block py-2.5 px-4 text-[15px] text-[#222] hover:text-[#729855] text-center font-body transition-colors">Faq</Link>
                <Link to="/pages/contact" className="block py-2.5 px-4 text-[15px] text-[#222] hover:text-[#729855] text-center font-body transition-colors">Contact</Link>
              </div>
            </div>
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center h-full gap-2 min-[375px]:gap-3.5 sm:gap-[20px]" style={{ color: '#000000' }}>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-11 h-11 flex items-center justify-center hover:text-[#729855] transition-colors bg-transparent border-none cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-[20px] h-[20px]" strokeWidth={1.5} />
            </button>
            <div className="relative h-full flex items-center" ref={accountDropdownRef}>
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="w-11 h-11 flex items-center justify-center hover:text-[#729855] transition-colors text-black bg-transparent border-none cursor-pointer"
                aria-label="Account"
                aria-haspopup="true"
                aria-expanded={isAccountOpen}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatar}`}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-brand-border"
                  />
                ) : (
                  <UserIcon className="w-[20px] h-[20px]" strokeWidth={1.5} />
                )}
              </button>
              <div
                className={`absolute right-0 top-[50px] w-48 bg-[#F9F9EB] border border-[#eae8d8] shadow-[0_10px_30px_rgba(0,0,0,0.06)] py-2 z-50 transition-all duration-300 transform origin-top-right ${isAccountOpen
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                style={{ fontFamily: '"Outfit", sans-serif' }}
              >
                {!user ? (
                  <>
                    <Link
                      to="/account/login"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left"
                      style={{ textDecoration: 'none' }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/account/register"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left"
                      style={{ textDecoration: 'none' }}
                    >
                      Register
                    </Link>
                    <Link
                      to="/account/forgot-password"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left"
                      style={{ textDecoration: 'none' }}
                    >
                      Forgot Password
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-1.5 border-b border-[#eae8d8] mb-1 select-none text-left flex items-center gap-2">
                      {user.avatar && (
                        <img
                          src={user.avatar.startsWith('http') ? user.avatar : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatar}`}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-brand-border"
                        />
                      )}
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Welcome,</p>
                        <p className="text-[13px] text-black font-semibold truncate leading-tight">{user.name}</p>
                      </div>
                    </div>
                    {user.isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsAccountOpen(false)}
                        className="block px-4 py-2 text-[14px] text-[#729855] font-bold hover:bg-[#eae8d8]/30 transition-colors text-left"
                        style={{ textDecoration: 'none' }}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/account/profile"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left"
                      style={{ textDecoration: 'none' }}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/account/profile?tab=orders"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left"
                      style={{ textDecoration: 'none' }}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setIsAccountOpen(false);
                        setIsWishlistOpen(true);
                      }}
                      className="w-full text-left block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      Wishlist
                    </button>
                    <Link
                      to="/account/profile?tab=addresses"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left"
                      style={{ textDecoration: 'none' }}
                    >
                      Addresses
                    </Link>
                    <Link
                      to="/account/profile?tab=settings"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left"
                      style={{ textDecoration: 'none' }}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsAccountOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left block px-4 py-2 text-[14px] text-red-600 hover:text-red-800 hover:bg-[#eae8d8]/30 transition-colors bg-transparent border-none cursor-pointer border-t border-[#eae8d8] mt-1"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="w-11 h-11 flex items-center justify-center hover:text-[#729855] transition-colors bg-transparent border-none cursor-pointer"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart className="w-[20px] h-[20px]" strokeWidth={1.5} />
                {wishlistItems.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#729855] text-white flex items-center justify-center"
                    style={{ fontSize: '9px', fontWeight: 700 }}
                  >
                    {wishlistItems.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-11 h-11 flex items-center justify-center hover:text-[#729855] transition-colors animate-none bg-transparent border-none cursor-pointer"
              aria-label="Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-[20px] h-[20px]" strokeWidth={1.5} />
                {itemsCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#729855] text-white flex items-center justify-center"
                    style={{ fontSize: '9px', fontWeight: 700 }}
                  >
                    {itemsCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 transition-opacity"></div>
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between mb-8 border-b border-brand-border pb-4">
              <span className="font-heading text-xl font-bold text-brand-charcoal">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:text-brand-green">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-5 font-heading text-base font-semibold uppercase tracking-wider text-brand-charcoal">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green py-1">Home</Link>
              <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green py-1">Catalog</Link>
              <div className="pl-4 flex flex-col gap-3 normal-case text-brand-muted text-sm -mt-2">
                <Link to="/collections/moisturizer" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-charcoal">Moisturizers</Link>
                <Link to="/collections/creams" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-charcoal">Creams</Link>
                <Link to="/collections/lotions" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-charcoal">Lotions</Link>
                <Link to="/collections/lipstick" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-charcoal">Lipsticks</Link>
              </div>
              <Link to="/pages/about-us" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green py-1">About Us</Link>
              <Link to="/pages/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green py-1">Contact</Link>
              <Link to="/pages/faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green py-1">FAQ</Link>
              <Link to="/blogs/news" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green py-1">Blog</Link>

              <div className="border-t border-brand-border pt-4 mt-2 flex flex-col gap-4 normal-case text-brand-charcoal text-sm">
                {!user ? (
                  <>
                    <Link to="/account/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green py-1 font-semibold">Login</Link>
                    <Link to="/account/register" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green py-1 font-semibold">Register</Link>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-xs text-brand-muted uppercase tracking-wider select-none">Welcome, {user.name}</div>
                    {user.isAdmin && (
                      <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-[#729855] font-bold py-1">Admin Dashboard</Link>
                    )}
                    <Link to="/account/profile" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-green py-1 font-semibold">My Profile</Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-left text-red-600 hover:text-red-800 py-1 bg-transparent border-none cursor-pointer font-semibold uppercase tracking-widest text-xs mt-2"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/40"></div>
          <div className="relative flex flex-col w-full max-w-md bg-white h-full ml-auto shadow-2xl p-6 animate-slide-left">
            <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-6">
              <h2 className="font-heading text-lg font-bold text-brand-charcoal">Shopping Cart ({itemsCount})</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:text-brand-green">
                <X className="w-6 h-6" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <ShoppingBag className="w-16 h-16 text-brand-border mb-4" />
                <p className="font-heading text-brand-muted mb-6">Your shopping cart is empty</p>
                <Link to="/collections/all" onClick={() => setIsCartOpen(false)} className="bg-brand-charcoal hover:bg-brand-button-hover text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-all">
                  Shop Our Collection
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-grow overflow-y-auto space-y-4 pr-2 no-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4 border-b border-brand-border pb-4">
                      <img src={getLocalImageUrl(item.images?.[0])} alt={item.title} className="w-20 h-24 object-cover bg-brand-gray-light" />
                      <div className="flex-grow">
                        <h4 className="font-heading font-medium text-sm text-brand-charcoal leading-snug line-clamp-2 hover:text-brand-green mb-1">
                          <Link to={`/products/${item.slug}`} onClick={() => setIsCartOpen(false)}>{item.title}</Link>
                        </h4>
                        <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-muted mb-2 block">{typeof item.category === 'object' ? item.category?.name : item.category}</span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-brand-border select-none h-11 bg-white">
                            <button onClick={() => updateQty(item._id, item.qty - 1)} className="h-full px-3.5 text-brand-muted hover:text-brand-charcoal font-semibold flex items-center justify-center cursor-pointer border-none bg-transparent">-</button>
                            <span className="px-3 text-xs font-bold text-brand-charcoal">{item.qty}</span>
                            <button onClick={() => updateQty(item._id, item.qty + 1)} className="h-full px-3.5 text-brand-muted hover:text-brand-charcoal font-semibold flex items-center justify-center cursor-pointer border-none bg-transparent">+</button>
                          </div>
                          <span className="font-heading text-sm font-semibold">Rs. {(item.price * item.qty).toLocaleString('en-IN')}.00</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 p-1 self-start">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-brand-border pt-6 mt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-heading text-sm text-brand-muted uppercase tracking-wider">Subtotal</span>
                    <span className="font-heading text-xl font-bold">Rs. {totalPrice.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/cart" onClick={() => setIsCartOpen(false)} className="w-full text-center border border-brand-charcoal hover:bg-brand-charcoal hover:text-white py-3.5 font-heading font-bold text-xs uppercase tracking-widest transition-all">
                      View Cart
                    </Link>
                    <Link to="/cart?checkout=true" onClick={() => setIsCartOpen(false)} className="w-full text-center bg-brand-charcoal text-white hover:bg-brand-button-hover py-3.5 font-heading font-bold text-xs uppercase tracking-widest transition-all">
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Wishlist Drawer Overlay */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setIsWishlistOpen(false)} className="fixed inset-0 bg-black/40"></div>
          <div className="relative flex flex-col w-full max-w-md bg-white h-full ml-auto shadow-2xl p-6 animate-slide-left">
            <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-6">
              <h2 className="font-heading text-lg font-bold text-brand-charcoal">My Wishlist ({wishlistItems.length})</h2>
              <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:text-brand-green">
                <X className="w-6 h-6" />
              </button>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <Heart className="w-16 h-16 text-brand-border mb-4" />
                <p className="font-heading text-brand-muted">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 no-scrollbar">
                {wishlistItems.map((item) => (
                  <div key={item._id} className="flex gap-4 border-b border-brand-border pb-4 items-center">
                    <img src={getLocalImageUrl(item.images?.[0])} alt={item.title} className="w-16 h-20 object-cover bg-brand-gray-light" />
                    <div className="flex-grow">
                      <h4 className="font-heading font-medium text-sm text-brand-charcoal line-clamp-2 hover:text-brand-green mb-1">
                        <Link to={`/products/${item.slug}`} onClick={() => setIsWishlistOpen(false)}>{item.title}</Link>
                      </h4>
                      <span className="font-heading text-sm font-semibold">Rs. {item.price.toLocaleString('en-IN')}.00</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/products/${item.slug}`} onClick={() => setIsWishlistOpen(false)} className="text-gray-500 hover:text-[#729855] p-2" aria-label="View Product">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => toggleWishlist(item)} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Overlay Panel */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 overflow-x-hidden">
          <div onClick={() => setIsSearchOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="bg-white shadow-2xl p-6 relative z-10" style={{ width: 'min(92vw, 520px)' }}>
            <div className="flex items-center justify-between mb-4 border-b border-brand-border pb-2">
              <h3 className="font-heading text-base font-semibold text-brand-charcoal uppercase tracking-wider">Search Products</h3>
              <button onClick={() => setIsSearchOpen(false)} className="p-1 text-brand-muted hover:text-brand-charcoal bg-transparent border-none cursor-pointer w-10 h-10 flex items-center justify-center" aria-label="Close search">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="text"
                placeholder="Search for cosmetic items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:flex-grow border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none min-w-0"
                autoFocus
              />
              <button type="submit" className="bg-brand-charcoal text-white hover:bg-brand-button-hover h-12 sm:h-auto px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shrink-0">
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;