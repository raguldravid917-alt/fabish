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
    <footer className="w-full bg-[#f4f3ea] text-[#1c2415] overflow-hidden border-t border-[#e8e6d9]" style={{ fontFamily: '"Work Sans", sans-serif' }}>
      <div
        ref={footerRef}
        className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16 items-start w-full mb-12">

          {/* Column 1 */}
          <div className="flex flex-col w-full">
            <div className="mb-6">
              <img
                src="/assets/homepage/Fabish_Logo_Final_a68866dc-7573-4072-bd3f-3e356eca427e.svg"
                alt="Fabish Organic Cosmetics"
                className="w-36 h-auto block"
              />
            </div>
            <p className="text-sm leading-relaxed text-[#4a4a4a] font-normal max-w-xs mb-6">
              Empowering natural skin confidence with certified organic formulas, sustainably sourced ingredients, and cruelty-free ethics.
            </p>
            <div className="flex items-center gap-4 mb-8">
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all duration-300 shadow-xs">
                <TwitterIcon size={16} />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all duration-300 shadow-xs">
                <FacebookIcon size={16} />
              </a>
              <a href="#" aria-label="Pinterest" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all duration-300 shadow-xs">
                <PinterestIcon size={16} />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all duration-300 shadow-xs">
                <InstagramIcon size={16} />
              </a>
            </div>

            {/* CMS Pages Section */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#1c2415] mb-4 font-heading">
                FABISH
              </h3>
              <nav className="flex flex-col gap-2.5">
                {footerLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-black/5 animate-pulse rounded w-32" />
                  ))
                ) : footerPages.length > 0 ? (
                  footerPages.map((page) => (
                    <Link
                      key={page._id}
                      to={`/pages/${page.slug}`}
                      className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors leading-snug"
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
            <div className="mb-8">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#1c2415] mb-4 font-heading">
                PRESETS
              </h3>
              <nav className="flex flex-col gap-2.5">
                <Link to="/pages/about-us" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">About Us</Link>
                <Link to="/pages/faq" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">FAQ &amp; Help</Link>
                <Link to="/blogs/news" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">Blog &amp; Stories</Link>
                <Link to="/pages/contact" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">Contact Support</Link>
                <Link to="/pages/press-release" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">Press Release</Link>
              </nav>
            </div>

            {/* Newsletter Section */}
            <div className="flex flex-col items-start w-full">
              <h3 className="text-2xl font-bold text-[#1c2415] mb-2 font-heading">
                Get Active
              </h3>
              <p className="text-sm text-[#4a4a4a] font-normal leading-relaxed mb-4">
                Subscribe to receive organic skin tips and exclusive offers.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 w-full max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                  className="w-full h-12 px-4 bg-white border border-[#e8e6d9] rounded-full text-sm text-[#1c2415] outline-none focus:border-[#3a4d23] transition-all font-body shadow-xs"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 px-8 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-xs font-bold tracking-[0.18em] uppercase rounded-full transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center disabled:opacity-50 font-heading"
                >
                  {submitting ? 'SUBMITTING...' : 'SUBSCRIBE NOW'}
                </button>
              </form>

              <p className="text-xs text-[#729855] font-semibold mt-3">
                ★ Receive 15% OFF your first order upon subscribing!
              </p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col w-full">
            <div>
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#1c2415] mb-4 font-heading">
                SHOP &amp; POLICIES
              </h3>
              <nav className="flex flex-col gap-2.5">
                <Link to="/pages/shipping-returns" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">Shipping &amp; Return Policy</Link>
                <Link to="/orders/track" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">Track Your Order</Link>
                <Link to="/account/profile?tab=orders" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">Order History</Link>
                <Link to="/pages/promotions" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">Special Promotions</Link>
                <Link to="/pages/privacy-policy" className="text-sm text-[#4a4a4a] font-medium hover:text-[#3a4d23] transition-colors">Privacy Policy</Link>
              </nav>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#e8e6d9] my-6" />

        {/* Copyright Row */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 text-xs text-[#777] font-body">
          <div className="text-center md:text-left">
            <span>© 2026 Fabish Organic Cosmetics. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Crafted with Organic Care</span>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 bg-[#3a4d23] text-white rounded-full flex items-center justify-center hover:bg-[#1c2415] transition-all duration-300 shadow-md cursor-pointer border-none"
              aria-label="Scroll to top"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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