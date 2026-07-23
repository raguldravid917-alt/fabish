import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Heart, ShoppingBag, User as UserIcon, Trash2, ArrowRight, Eye, Home as HomeIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../context/ToastContext';
import { useCategories } from '../hooks/useCategories';
import { usePrefetch } from '../hooks/usePrefetch';
import { getLocalImageUrl } from '../utils/imageMapper';
import { api } from '../api/client'; // Added API import for fetching real products
import { productService } from '../api/productService';
import Navigation from './navigation/Navigation';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartItems, itemsCount, addToCart, removeFromCart, updateQty, totalPrice } = useCart();
  const { wishlistItems, toggleWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { categories, loading: categoriesLoading } = useCategories();
  const { prefetchCart, prefetchProfile } = usePrefetch();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogAccordionOpen, setIsCatalogAccordionOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [movingWishlistItems, setMovingWishlistItems] = useState(new Set());

  // Dynamic Best Sellers State
  const [bestSellers, setBestSellers] = useState([]);

  // Account Dropdown states & refs
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const accountDropdownRef = useRef(null);

  const rawAvatar = user?.avatar || user?.picture || user?.profileImage || null;
  const userAvatarUrl = !avatarError && rawAvatar
    ? (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('data:'))
      ? rawAvatar
      : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${rawAvatar.startsWith('/') ? '' : '/'}${rawAvatar}`
    : null;

  // Scroll tracking state for 2026 sticky glass header
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // FETCH REAL PRODUCTS FROM DATABASE SO CART & WISHLIST WORKS PROPERLY
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await productService.getAll({ bestSeller: true, limit: 2 });
        if (response.success && response.data) {
          setBestSellers(response.data.slice(0, 2));
        } else {
          setBestSellers([]);
        }
      } catch (err) {
        console.error('Failed to fetch best sellers', err);
        setBestSellers([]);
      }
    };
    fetchBestSellers();
  }, []);

  // Close all drawers on route change (navigation)
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsSearchOpen(false);
    setIsAccountOpen(false);
  }, [location.pathname]);

  const handleMoveToCart = async (item) => {
    if (!item || !item._id) return;
    const itemIdStr = item._id.toString();
    if (movingWishlistItems.has(itemIdStr)) return;

    setMovingWishlistItems((prev) => {
      const next = new Set(prev);
      next.add(itemIdStr);
      return next;
    });

    try {
      const success = await addToCart(item, 1);
      if (success) {
        const removed = await removeFromWishlist(item._id);
        if (removed) {
          showToast('Product moved to cart', 'success');
        } else {
          await removeFromCart(item._id);
          showToast('Failed to remove item from wishlist. Operation cancelled.', 'error');
        }
      } else {
        showToast('Failed to add item to bag', 'error');
      }
    } catch (err) {
      showToast('An error occurred while moving item to bag', 'error');
    } finally {
      setMovingWishlistItems((prev) => {
        const next = new Set(prev);
        next.delete(itemIdStr);
        return next;
      });
    }
  };

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
    }
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
      <header
        className={`sticky top-0 w-full z-50 bg-[#faf9f5]/95 backdrop-blur-xl border-b border-[#e8e6d9] transition-shadow duration-300 ${
          isScrolled ? 'shadow-md' : 'shadow-xs'
        }`}
      >
        <div
          className="mx-auto flex items-center justify-between px-4 sm:px-8 h-16 sm:h-20"
          style={{
            maxWidth: '1360px',
          }}
        >
          {/* Left: Logo and Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-4 h-full">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#1c2415] hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-all bg-transparent border-none cursor-pointer"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center select-none h-full group">
              <img
                src="/assets/homepage/Fabish_Logo_Final_a68866dc-7573-4072-bd3f-3e356eca427e.svg"
                alt="Fabish"
                className="w-[110px] min-[360px]:w-[125px] sm:w-[145px] h-auto transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <Navigation
            bestSellers={bestSellers}
            toggleWishlist={toggleWishlist}
            addToCart={addToCart}
            isInWishlist={isInWishlist}
            showToast={showToast}
            navigate={navigate}
          />

          {/* Right: Inline Search + Actions */}
          <div className="flex items-center h-full gap-2 sm:gap-3 text-[#1c2415]">

            {/* Desktop Inline Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden xl:flex items-center gap-2 bg-white/80 border border-[#e8e6d9] focus-within:border-[#3a4d23] focus-within:ring-2 focus-within:ring-[#3a4d23]/20 rounded-full px-3.5 py-1.5 shadow-xs transition-all w-64 hover:border-[#3a4d23]/40"
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-body text-[#1c2415] placeholder-gray-400 focus:outline-none"
              />
            </form>

            {/* Search Icon Trigger (Mobile & Laptop) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="xl:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#1c2415] hover:bg-[#eef3e8] hover:text-[#3a4d23] hover:scale-105 transition-all bg-transparent border-none cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" strokeWidth={1.6} />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => {
                if (!user) {
                  navigate('/account/profile?tab=wishlist');
                } else {
                  setIsWishlistOpen(true);
                }
              }}
              className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center text-[#1c2415] hover:bg-[#eef3e8] hover:text-[#3a4d23] hover:scale-105 transition-all bg-transparent border-none cursor-pointer relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" strokeWidth={1.6} />
              {wishlistItems.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-heading font-bold flex items-center justify-center text-[10px] shadow-sm animate-pulse-subtle"
                >
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              onMouseEnter={prefetchCart}
              className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center text-[#1c2415] hover:bg-[#eef3e8] hover:text-[#3a4d23] hover:scale-105 transition-all bg-transparent border-none cursor-pointer relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.6} />
              {itemsCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#3a4d23] text-white font-heading font-bold flex items-center justify-center text-[10px] shadow-sm"
                >
                  {itemsCount}
                </span>
              )}
            </button>

            {/* Account Icon / Avatar */}
            <div className="relative h-full hidden lg:flex items-center" ref={accountDropdownRef}>
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                onMouseEnter={prefetchProfile}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#1c2415] hover:bg-[#eef3e8] hover:text-[#3a4d23] hover:scale-105 transition-all bg-transparent border-none cursor-pointer relative"
                aria-label="Account"
              >
                {userAvatarUrl ? (
                  <div className="relative">
                    <img
                      src={userAvatarUrl}
                      alt={user?.name || 'Account'}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-[#3a4d23]/40"
                    />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                  </div>
                ) : (
                  <UserIcon className="w-5 h-5" strokeWidth={1.6} />
                )}
              </button>

              {/* Account Dropdown */}
              <div
                className={`absolute right-0 top-[55px] w-52 bg-white/95 backdrop-blur-xl border border-[#e8e6d9] rounded-2xl shadow-xl py-2 z-50 transition-all duration-300 transform origin-top-right ${isAccountOpen
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
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
                    {user.isAdmin || user.role === 'Admin' ? (
                      // Admin Dropdown Items
                      <>
                        <Link
                          to="/account/profile"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/profile?tab=orders"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Orders
                        </Link>
                        <Link
                          to="/account/profile?tab=addresses"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Address
                        </Link>
                        <Link
                          to="/account/profile?tab=rewards"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Reward Points
                        </Link>
                        <button
                          onClick={() => {
                            setIsAccountOpen(false);
                            setIsWishlistOpen(true);
                          }}
                          className="w-full text-left block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors bg-transparent border-none cursor-pointer font-medium font-body"
                        >
                          Wishlist
                        </button>
                        <Link
                          to="/cart"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Cart
                        </Link>
                        <Link
                          to="/account/profile?tab=settings"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Settings
                        </Link>

                        {/* Divider */}
                        <div className="border-t border-[#eae8d8] my-1" />

                        {/* Admin Section */}
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-bold"
                          style={{ textDecoration: 'none' }}
                        >
                          Admin Dashboard
                        </Link>
                      </>
                    ) : (
                      // Customer Dropdown Items
                      <>
                        <Link
                          to="/account/profile"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/profile?tab=orders"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Orders
                        </Link>
                        <Link
                          to="/account/profile?tab=addresses"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Address
                        </Link>
                        <Link
                          to="/account/profile?tab=rewards"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Reward Points
                        </Link>
                        <button
                          onClick={() => {
                            setIsAccountOpen(false);
                            setIsWishlistOpen(true);
                          }}
                          className="w-full text-left block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors bg-transparent border-none cursor-pointer font-medium"
                        >
                          Wishlist
                        </button>
                        <Link
                          to="/cart"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Cart
                        </Link>
                        <Link
                          to="/account/profile?tab=settings"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-[14px] text-black hover:text-[#729855] hover:bg-[#eae8d8]/30 transition-colors text-left font-medium"
                          style={{ textDecoration: 'none' }}
                        >
                          Settings
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setIsAccountOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left block px-4 py-2 text-[14px] text-red-600 hover:text-red-800 hover:bg-[#eae8d8]/30 transition-colors bg-transparent border-none cursor-pointer border-t border-[#eae8d8] mt-1 font-medium"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav data-sticky-bottom="true" className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-[#F9F9EB] border-t border-[#eae8d8] shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-50 flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full ${currentPath === '/' ? 'text-[#729855]' : 'text-black'}`}
          style={{ textDecoration: 'none' }}
        >
          <HomeIcon className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[11px] font-heading">Home</span>
        </Link>
        <Link
          to="/collections"
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full ${currentPath === '/collections' ? 'text-[#729855]' : 'text-black'}`}
          style={{ textDecoration: 'none' }}
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[11px] font-heading">Shop</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-black bg-transparent border-none cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {itemsCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#729855] text-white flex items-center justify-center"
                style={{ fontSize: '9px', fontWeight: 700 }}
              >
                {itemsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-heading">Cart</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (!user) {
              navigate('/account/profile?tab=wishlist');
            } else {
              setIsWishlistOpen(true);
            }
          }}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-black bg-transparent border-none cursor-pointer"
        >
          <div className="relative">
            <Heart className="w-5 h-5" strokeWidth={1.5} />
            {wishlistItems.length > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#729855] text-white flex items-center justify-center"
                style={{ fontSize: '9px', fontWeight: 700 }}
              >
                {wishlistItems.length}
              </span>
            )}
          </div>
          <span className="text-[11px] font-heading">Wishlist</span>
        </button>

        {/* UPDATED: Mobile Account Button with Dropdown matching Desktop View */}
        <div
          className="relative flex-1 h-full flex justify-center"
          onMouseDown={(e) => e.stopPropagation()} // Prevents desktop click-outside event from closing it
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                navigate('/account/login');
              } else {
                setIsAccountOpen(!isAccountOpen);
              }
            }}
            className="flex flex-col items-center justify-center gap-1 w-full h-full text-black bg-transparent border-none cursor-pointer"
          >
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt={user?.name || 'Account'}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-5 h-5 rounded-full object-cover border border-brand-border"
              />
            ) : (
              <UserIcon className="w-5 h-5" strokeWidth={1.5} />
            )}
            <span className="text-[11px] font-heading">{user ? 'Account' : 'Login'}</span>
          </button>

          {/* Mobile Account Dropdown Panel (Opens Upwards with 2026 Glass Aesthetics) */}
          <div
            className={`absolute right-2 bottom-[70px] w-56 bg-[#ffffff]/95 backdrop-blur-2xl border border-[#e8e6d9] rounded-[20px] shadow-2xl p-2 z-50 transition-all duration-300 transform origin-bottom-right ${isAccountOpen && user
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
              }`}
          >
            {user && (
              <>
                <div className="px-3 py-2.5 border-b border-[#e8e6d9] mb-1 select-none text-left flex items-center gap-2.5 bg-[#f7f6f0] rounded-xl">
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt={user?.name || 'Account'}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#3a4d23]/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#eef3e8] border border-[#d2e2c5] flex items-center justify-center text-[#3a4d23]">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0 font-heading">WELCOME</p>
                    <p className="text-xs text-[#1c2415] font-bold truncate leading-tight font-heading">{user.name}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 text-xs font-heading font-medium text-[#1c2415]">
                  <Link to="/account/profile" onClick={() => setIsAccountOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-colors text-left" style={{ textDecoration: 'none' }}>My Account</Link>
                  <Link to="/account/profile?tab=orders" onClick={() => setIsAccountOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-colors text-left" style={{ textDecoration: 'none' }}>Orders</Link>
                  <Link to="/account/profile?tab=addresses" onClick={() => setIsAccountOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-colors text-left" style={{ textDecoration: 'none' }}>Address</Link>
                  <Link to="/account/profile?tab=rewards" onClick={() => setIsAccountOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-colors text-left" style={{ textDecoration: 'none' }}>Reward Points</Link>
                  <button onClick={() => { setIsAccountOpen(false); setIsWishlistOpen(true); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-colors bg-transparent border-none cursor-pointer font-heading text-xs">Wishlist</button>
                  <Link to="/cart" onClick={() => setIsAccountOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-colors text-left" style={{ textDecoration: 'none' }}>Cart</Link>
                  <Link to="/account/profile?tab=settings" onClick={() => setIsAccountOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-colors text-left" style={{ textDecoration: 'none' }}>Settings</Link>

                  {(user.isAdmin || user.role === 'Admin') && (
                    <>
                      <div className="border-t border-[#e8e6d9] my-1" />
                      <Link to="/admin/dashboard" onClick={() => setIsAccountOpen(false)} className="px-3 py-2 rounded-lg bg-[#eef3e8] text-[#3a4d23] font-bold text-left tracking-wide" style={{ textDecoration: 'none' }}>★ Admin Dashboard</Link>
                    </>
                  )}

                  <div className="border-t border-[#e8e6d9] my-1" />
                  <button onClick={() => { setIsAccountOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors bg-transparent border-none cursor-pointer font-bold text-xs">Logout Account</button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu (2026 Luxury Glass Edition) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />
          <div className="relative flex flex-col w-full max-w-[320px] bg-white/95 backdrop-blur-2xl h-full shadow-2xl p-6 overflow-y-auto border-r border-[#e8e6d9] rounded-r-3xl animate-slide-in">
            
            {/* Drawer Top Header / User Info */}
            <div className="flex items-center justify-between pb-5 border-b border-[#e8e6d9] mb-6">
              {user ? (
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatar}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#3a4d23]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#eef3e8] border border-[#d2e2c5] flex items-center justify-center text-[#3a4d23]">
                      <UserIcon size={20} />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block font-heading">WELCOME BACK</span>
                    <h4 className="text-sm font-bold text-[#1c2415] truncate font-heading">{user.name}</h4>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg font-bold text-[#1c2415]">FABISH BOTANICALS</span>
                </div>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-[#f4f3ea] flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all cursor-pointer border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Menu Links */}
            <div className="flex flex-col gap-2 font-heading text-sm font-semibold tracking-wide text-[#1c2415]">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-all"
              >
                <HomeIcon size={18} className="text-[#3a4d23]" />
                <span>Home</span>
              </Link>
              
              {/* Expandable Catalog Accordion for Mobile */}
              <div className="flex flex-col rounded-xl overflow-hidden bg-[#f7f6f0] border border-[#e8e6d9] my-1">
                <div className="flex items-center justify-between px-3.5 py-3">
                  <Link
                    to="/collections"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-[#3a4d23] text-[#1c2415] font-bold"
                  >
                    Catalog &amp; Collections
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCatalogAccordionOpen(!isCatalogAccordionOpen);
                    }}
                    className="p-1 hover:text-[#3a4d23] text-gray-500 bg-transparent border-none cursor-pointer"
                    aria-label="Toggle Catalog Categories"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCatalogAccordionOpen ? 'rotate-180 text-[#3a4d23]' : ''}`} />
                  </button>
                </div>

                {isCatalogAccordionOpen && (
                  <div className="px-3.5 py-2 flex flex-col gap-1.5 bg-white/80 border-t border-[#e8e6d9] text-xs">
                    <Link
                      to="/collections/all"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xs font-bold uppercase text-[#3a4d23] hover:underline py-1.5 flex items-center justify-between"
                    >
                      <span>Explore All Products</span>
                      <span>&rsaquo;</span>
                    </Link>

                    {categoriesLoading ? (
                      <div className="text-xs text-gray-500 py-2">Loading categories...</div>
                    ) : categories && categories.length > 0 ? (
                      categories.map((cat) => {
                        const catSlug = cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        return (
                          <Link
                            key={cat._id || catSlug}
                            to={`/collections/${catSlug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-[13px] font-medium text-[#1c2415] hover:text-[#3a4d23] py-1.5 px-2 rounded-lg hover:bg-[#eef3e8] flex items-center justify-between transition-colors"
                          >
                            <span>{cat.name}</span>
                            {typeof cat.productCount === 'number' && (
                              <span className="text-[10px] font-semibold bg-[#e8e6d9] text-[#3a4d23] px-2 py-0.5 rounded-full">
                                {cat.productCount}
                              </span>
                            )}
                          </Link>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-500 py-1">No categories available</div>
                    )}
                  </div>
                )}
              </div>

              <Link to="/pages/about-us" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-all">About Us</Link>
              <Link to="/pages/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-all">Contact Us</Link>
              <Link to="/pages/faq" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-all">FAQ</Link>
              <Link to="/blogs/news" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#eef3e8] hover:text-[#3a4d23] transition-all">Beauty Blog</Link>

              <div className="border-t border-[#e8e6d9] pt-4 mt-3 flex flex-col gap-2 font-body">
                {!user ? (
                  <>
                    <Link to="/account/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-[#3a4d23] text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">Login</Link>
                    <Link to="/account/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-white border border-[#3a4d23] text-[#1c2415] py-3 rounded-full text-xs font-bold uppercase tracking-widest mt-1">Register</Link>
                  </>
                ) : (
                  <>
                    {(user.isAdmin || user.role === 'Admin') && (
                      <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="bg-[#eef3e8] border border-[#d2e2c5] text-[#3a4d23] font-bold px-3.5 py-2.5 rounded-xl text-center text-xs tracking-wider uppercase mb-1">
                        ★ Admin Dashboard
                      </Link>
                    )}
                    <Link to="/account/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl hover:bg-[#eef3e8] text-[#1c2415] font-semibold text-xs uppercase tracking-wider">My Profile &amp; Orders</Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left text-rose-600 hover:bg-rose-50 px-3.5 py-2.5 rounded-xl font-semibold uppercase tracking-wider text-xs border-none cursor-pointer bg-transparent"
                    >
                      Logout Account
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
                <div className="flex-grow overflow-y-auto space-y-4 pr-2 no-scrollbar font-sans">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4 border-b border-brand-border pb-4">
                      <img src={getLocalImageUrl(item.images?.[0])} alt={item.title} className="w-20 h-24 object-cover bg-brand-gray-light" />
                      <div className="flex-grow">
                        <h4 className="font-heading font-medium text-sm text-brand-charcoal leading-snug line-clamp-2 hover:text-brand-green mb-1 text-left">
                          <Link to={`/products/${item.slug}`} onClick={() => setIsCartOpen(false)}>{item.title}</Link>
                        </h4>
                        <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-muted mb-2 block text-left">
                          {typeof item.category === 'object' && item.category !== null
                            ? item.category?.name
                            : (typeof item.category === 'string' && !/^[0-9a-fA-F]{24}$/.test(item.category)
                              ? item.category
                              : '')}
                        </span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-brand-border select-none h-9 sm:h-11 bg-white">
                            <button onClick={() => updateQty(item._id, item.qty - 1)} className="h-full px-2.5 sm:px-3.5 text-brand-muted hover:text-brand-charcoal font-semibold flex items-center justify-center cursor-pointer border-none bg-transparent">-</button>
                            <span className="px-2 sm:px-3 text-xs font-bold text-brand-charcoal">{item.qty}</span>
                            <button onClick={() => updateQty(item._id, item.qty + 1)} className="h-full px-2.5 sm:px-3.5 text-brand-muted hover:text-brand-charcoal font-semibold flex items-center justify-center cursor-pointer border-none bg-transparent">+</button>
                          </div>
                          <span className="font-heading text-xs sm:text-sm font-semibold whitespace-nowrap ml-2">Rs. {(item.price * item.qty).toLocaleString('en-IN')}.00</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 p-1 self-start bg-transparent border-none cursor-pointer">
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
              <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:text-[#729855] bg-transparent border-none cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <Heart className="w-16 h-16 text-[#eae8d8] mb-4" />
                <p className="font-heading text-brand-muted">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 no-scrollbar">
                {wishlistItems.map((item) => (
                  <div key={item._id} className="flex gap-4 border-b border-[#eae8d8] pb-4 items-center">
                    <img src={getLocalImageUrl(item.images?.[0])} alt={item.title} className="w-16 h-20 object-cover bg-brand-gray-light" />
                    <div className="flex-grow">
                      <h4 className="font-heading font-medium text-sm text-brand-charcoal line-clamp-2 hover:text-[#729855] mb-1 text-left">
                        <Link to={`/products/${item.slug}`} onClick={() => setIsWishlistOpen(false)}>{item.title}</Link>
                      </h4>
                      <span className="font-heading text-sm font-semibold">Rs. {item.price.toLocaleString('en-IN')}.00</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/products/${item.slug}`} onClick={() => setIsWishlistOpen(false)} className="text-gray-500 hover:text-[#729855] p-2" aria-label="View Product">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={movingWishlistItems.has(item._id?.toString())}
                        className="text-gray-500 hover:text-[#729855] p-2 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
                        aria-label="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleWishlist(item)} className="text-red-500 hover:text-red-700 p-2 bg-transparent border-none cursor-pointer">
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
            <div className="flex items-center justify-between mb-4 border-b border-[#eae8d8] pb-2">
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
              <button type="submit" className="bg-brand-charcoal text-white hover:bg-brand-button-hover h-12 sm:h-auto px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 border-none cursor-pointer">
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