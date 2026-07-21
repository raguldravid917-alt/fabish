import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { contactService } from '../api/contactService';
import { useFooterPages } from '../hooks/useFooterPages';

/* ── Social Icon Helpers ──────────────────────────────────────── */
const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);

const PinterestIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="3.5" />
  </svg>
);

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { pages: footerPages, loading: footerLoading } = useFooterPages();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await contactService.submit({
        name: 'Get Active Subscriber',
        email: trimmedEmail,
        message: 'Newsletter subscription request from Get Active footer form.'
      });
      if (res.success) {
        showToast('Thank you for subscribing to our newsletter!', 'success');
        setEmail('');
      } else {
        showToast(res.message || 'Subscription failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Connection error. Please check your network.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="w-full bg-[#f6f5ea] text-black overflow-hidden" style={{ fontFamily: '"Work Sans", sans-serif' }}>
      {/* Reduced pb-[40px] to pb-[20px] and lg:pb-[60px] to lg:pb-[24px] to remove bottom empty space */}
      <div
        ref={footerRef}
        className={`max-w-[1280px] mx-auto px-[24px] md:px-[40px] pt-[60px] pb-[20px] lg:pt-[80px] lg:pb-[24px] box-border transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      >
        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[40px] lg:gap-[60px] items-start w-full">

          {/* Column 1 */}
          <div className="flex flex-col w-full">
            <div className="mb-[20px]">
              <img
                src="/assets/homepage/Fabish_Logo_Final_a68866dc-7573-4072-bd3f-3e356eca427e.svg"
                alt="Fabish"
                className="w-[140px] h-auto block"
              />
            </div>
            <p className="text-[15px] leading-[1.8] text-black font-medium max-w-[280px] mt-0 mb-[24px]">
              At surprisingly low prices, we at our Koka<br />
              fashion shop provide stunning and<br />
              fashionable apparel.
            </p>
            <div className="flex items-center gap-[20px] mb-[60px]">
              <a href="#" aria-label="Twitter" className="text-black hover:opacity-60 transition-opacity flex">
                <TwitterIcon size={20} />
              </a>
              <a href="#" aria-label="Facebook" className="text-black hover:opacity-60 transition-opacity flex">
                <FacebookIcon size={20} />
              </a>
              <a href="#" aria-label="Pinterest" className="text-black hover:opacity-60 transition-opacity flex">
                <PinterestIcon size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-black hover:opacity-60 transition-opacity flex">
                <InstagramIcon size={20} />
              </a>
            </div>

            {/* FABISH Section — dynamic CMS footer links */}
            <div>
              <h3 className="text-[13px] font-extrabold tracking-[0.2em] uppercase text-black mt-0 mb-[24px]" style={{ fontFamily: '"Outfit", sans-serif' }}>
                FABISH
              </h3>
              <nav className="flex flex-col gap-[14px]">
                {footerLoading ? (
                  /* Loading skeleton shimmer */
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  ))
                ) : footerPages.length > 0 ? (
                  footerPages.map((page) => (
                    <Link
                      key={page._id}
                      to={`/pages/${page.slug}`}
                      className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]"
                      style={{ textDecoration: 'none' }}
                    >
                      {page.title}
                    </Link>
                  ))
                ) : null}
              </nav>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col w-full">
            {/* PRESETS Section */}
            <div className="mb-[60px]">
              <h3 className="text-[13px] font-extrabold tracking-[0.2em] uppercase text-black mt-0 mb-[24px]" style={{ fontFamily: '"Outfit", sans-serif' }}>
                PRESETS
              </h3>
              <nav className="flex flex-col gap-[14px]">
                <Link to="/pages/about-us" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>About</Link>
                <Link to="/pages/faq" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>Faq</Link>
                <Link to="/blogs/news" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>Blog</Link>
                <Link to="/pages/contact" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>Contact</Link>
                <Link to="#" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>Press Release</Link>
              </nav>
            </div>

            {/* Get Active Section */}
            <div className="flex flex-col items-start w-full">
              <h3 className="text-[28px] font-extrabold text-black mt-0 mb-[16px]" style={{ fontFamily: '"Outfit", sans-serif', letterSpacing: 'normal' }}>
                Get Active
              </h3>
              <p className="text-[15px] leading-[1.8] text-black font-medium max-w-[340px] mt-0 mb-[24px] text-left">
                The ideal way to stay in contact and learn<br />
                about our exclusive offers.
              </p>

              {/* Form & Button Fixed */}
              <form onSubmit={handleSubscribe} className="flex flex-col gap-[16px] w-full max-w-[340px]">
                <input
                  type="email"
                  placeholder="Your Email Id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                  className="w-full h-[50px] px-[20px] bg-white border-none outline-none text-[15px] text-black font-medium box-border rounded-none text-left font-body"
                />
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-[46px] px-[36px] bg-[#000000] hover:bg-[#8B5A2B] text-white text-[12px] font-extrabold tracking-[0.15em] uppercase border-none cursor-pointer rounded-none transition-colors duration-300 font-heading inline-flex items-center justify-center disabled:opacity-50"
                    style={{ fontFamily: '"Outfit", sans-serif' }}
                  >
                    {submitting ? 'SUBMITTING...' : 'SUBMIT NOW'}
                  </button>
                </div>
              </form>

              <p className="text-[13px] text-black font-medium mt-[24px] mb-0 text-left">
                By subscribing to Get Special Discount!
              </p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col w-full">
            <div>
              <h3 className="text-[13px] font-extrabold tracking-[0.2em] uppercase text-black mt-0 mb-[24px]" style={{ fontFamily: '"Outfit", sans-serif' }}>
                SHOP
              </h3>
              <nav className="flex flex-col gap-[14px]">
                <Link to="/pages/shipping-returns" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>Shipping & Return</Link>
                <Link to="/orders/track" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>Track Order</Link>
                <Link to="/account/profile?tab=orders" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>History</Link>
                <Link to="/pages/promotions" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>Promotion</Link>
                <Link to="/pages/privacy-policy" className="text-[15px] text-black font-medium hover:text-[#8B5A2B] transition-colors leading-[1.4]" style={{ textDecoration: 'none' }}>Privacy Policy</Link>
              </nav>
            </div>
          </div>

        </div>

        {/* Divider line above copyright row */}
        <div className="w-full h-[1px] bg-black/10 mt-[60px] mb-[20px]" />

        {/* Copyright Row - Updated to match image 2 */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-[20px] md:gap-0">

          {/* Left: Copyright */}
          <div className="flex-1 text-center md:text-left">
            <span className="text-[13px] text-black font-medium font-body">
              © Copyright, Fabish, 2024
            </span>
          </div>

          {/* Center: Hello @2024 */}
          <div className="flex-1 text-center">
            <span className="text-[13px] text-black font-medium font-body">
              Hello @2024
            </span>
          </div>

          {/* Right: Social Icons + Scroll to Top Button */}
          <div className="flex-1 flex justify-center md:justify-end items-center gap-[16px]">
            <a href="#" aria-label="Twitter" className="text-black hover:opacity-60 transition-opacity flex">
              <TwitterIcon size={16} />
            </a>
            <a href="#" aria-label="Facebook" className="text-black hover:opacity-60 transition-opacity flex">
              <FacebookIcon size={16} />
            </a>
            <a href="#" aria-label="Pinterest" className="text-black hover:opacity-60 transition-opacity flex">
              <PinterestIcon size={16} />
            </a>
            <a href="#" aria-label="Instagram" className="text-black hover:opacity-60 transition-opacity flex">
              <InstagramIcon size={16} />
            </a>

            {/* Scroll To Top Button */}
            <button
              onClick={scrollToTop}
              className="ml-4 w-11 h-11 bg-black text-white rounded-full flex items-center justify-center hover:bg-[#8B5A2B] transition-colors cursor-pointer border-none"
              aria-label="Scroll to top"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;