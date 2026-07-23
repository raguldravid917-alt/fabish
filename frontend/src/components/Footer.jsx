import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  Leaf,
  Award,
  Truck,
  Lock,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Heart,
  Check,
  Send,
  CreditCard,
  QrCode,
  Smartphone,
  Globe
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { contactService } from '../api/contactService';
import { useFooterPages } from '../hooks/useFooterPages';

/* ── Social Icon SVG Components ──────────────────────────────────────── */
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
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="3" />
  </svg>
);

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { pages: footerPages, loading: footerLoading } = useFooterPages();

  // Mobile Accordion State
  const [openMobileSection, setOpenMobileSection] = useState(null);

  const toggleMobileSection = (sec) => {
    setOpenMobileSection(openMobileSection === sec ? null : sec);
  };

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
        showToast('Thank you for subscribing to our newsletter! 15% discount code applied.', 'success');
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
      { threshold: 0.05 }
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

  const paymentMethods = ['VISA', 'Mastercard', 'RuPay', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Apple Pay', 'COD'];

  return (
    <footer className="w-full bg-[#f4f3ea] text-[#1c2415] border-t border-[#e8e6d9] overflow-hidden font-body select-none">

      {/* =========================================================
         1. PREMIUM TOP CTA STRIP (Apple / Dior / Aesop)
         ========================================================= */}
      <div className="bg-gradient-to-r from-[#3a4d23] via-[#2a3818] to-[#1c2415] text-white py-10 px-4 sm:px-8 lg:px-16 border-b border-white/10 relative overflow-hidden">
        {/* Ambient Blur Orbs */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#729855]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1340px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left space-y-1">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-[#d2e2c5]">
              <Sparkles size={12} /> Join 250,000+ Happy Customers
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-medium">
              Get Exclusive Botanical Skincare Offers &amp; Early VIP Access
            </h3>
          </div>

          <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-auto max-w-md">
            <input
              type="email"
              placeholder="Enter your email for 15% OFF..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
              className="w-full md:w-72 h-11 px-5 bg-white/90 backdrop-blur-md rounded-full text-xs text-[#1c2415] outline-none placeholder-gray-500 focus:ring-2 focus:ring-[#729855]"
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 bg-[#729855] hover:bg-white hover:text-[#1c2415] text-white text-xs font-heading font-bold uppercase tracking-wider rounded-full transition-all duration-300 shadow-lg shrink-0 cursor-pointer border-none flex items-center gap-2"
            >
              {submitting ? 'JOINING...' : 'SUBSCRIBE'}
            </button>
          </form>
        </div>
      </div>


      {/* =========================================================
         2. MAIN 5-COLUMN ENTERPRISE FOOTER GRID
         ========================================================= */}
      <div
        ref={footerRef}
        className={`max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-16 pt-16 pb-28 lg:pb-12 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 items-start mb-16">

          {/* COLUMN 1: BRAND IDENTITY & TRUST */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="block">
              <img
                src="/assets/homepage/Fabish_Logo_Final_a68866dc-7573-4072-bd3f-3e356eca427e.svg"
                alt="Fabish Organic Cosmetics"
                className="w-36 h-auto block"
              />
            </Link>

            <p className="text-xs text-[#4a4a4a] font-body font-light leading-relaxed">
              Empowering natural skin radiance with certified organic formulations, bio-active nutrients, and zero-waste Scandinavian luxury packaging.
            </p>

            {/* Social Icons Strip */}
            <div className="flex items-center gap-2 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white border border-[#e8e6d9] flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all duration-300 shadow-xs">
                <InstagramIcon size={14} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white border border-[#e8e6d9] flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all duration-300 shadow-xs">
                <FacebookIcon size={14} />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest" className="w-8 h-8 rounded-full bg-white border border-[#e8e6d9] flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all duration-300 shadow-xs">
                <PinterestIcon size={14} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="w-8 h-8 rounded-full bg-white border border-[#e8e6d9] flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all duration-300 shadow-xs">
                <TwitterIcon size={14} />
              </a>
            </div>
          </div>

          {/* COLUMN 2: SHOP CATEGORIES */}
          <div className="space-y-4">
            <h4 className="text-xs font-heading font-bold tracking-[0.2em] uppercase text-[#1c2415] border-b border-[#e8e6d9] pb-2">
              COLLECTIONS &amp; SHOP
            </h4>
            <nav className="flex flex-col space-y-2.5 text-xs text-[#4a4a4a] font-body">
              <Link to="/collections/all" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all flex items-center gap-1.5">
                <ArrowRight size={11} className="text-[#729855]" /> Shop All Botanicals
              </Link>
              <Link to="/collections/all" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all flex items-center gap-1.5">
                <ArrowRight size={11} className="text-[#729855]" /> New Arrivals 2026
              </Link>
              <Link to="/pages/promotions" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all flex items-center gap-1.5">
                <ArrowRight size={11} className="text-[#729855]" /> Special Offers &amp; Bundles
              </Link>
              <Link to="/collections/all" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all flex items-center gap-1.5">
                <ArrowRight size={11} className="text-[#729855]" /> Aloe &amp; Niacinamide Serums
              </Link>
              <Link to="/collections/all" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all flex items-center gap-1.5">
                <ArrowRight size={11} className="text-[#729855]" /> Organic Hydration Creams
              </Link>
            </nav>
          </div>

          {/* COLUMN 3: CUSTOMER SUPPORT */}
          <div className="space-y-4">
            <h4 className="text-xs font-heading font-bold tracking-[0.2em] uppercase text-[#1c2415] border-b border-[#e8e6d9] pb-2">
              CUSTOMER CARE
            </h4>
            <nav className="flex flex-col space-y-2.5 text-xs text-[#4a4a4a] font-body">
              <Link to="/pages/shipping-returns" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Shipping &amp; Return Policy</Link>
              <Link to="/pages/faq" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Help Center &amp; FAQs</Link>
              <Link to="/orders/track" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Track Your Order</Link>
              <Link to="/account/profile?tab=orders" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Order History</Link>
              <Link to="/pages/contact" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Contact Customer Support</Link>
              <Link to="/pages/privacy-policy" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Privacy &amp; Security Policy</Link>
              <Link to="/pages/terms-conditions" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Terms of Service</Link>
            </nav>
          </div>

          {/* COLUMN 4: COMPANY & CMS PAGES */}
          <div className="space-y-4">
            <h4 className="text-xs font-heading font-bold tracking-[0.2em] uppercase text-[#1c2415] border-b border-[#e8e6d9] pb-2">
              OUR COMPANY
            </h4>
            <nav className="flex flex-col space-y-2.5 text-xs text-[#4a4a4a] font-body">
              <Link to="/pages/about-us" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">About Fabish</Link>
              <Link to="/blogs/news" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Beauty Journal &amp; Blog</Link>
              <Link to="/pages/latest-news" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Latest Press &amp; News</Link>
              <Link to="/pages/press-release" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Press Release</Link>
              <Link to="/pages/partnership" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Retail Partnership</Link>
              <Link to="/pages/our-team" className="hover:text-[#3a4d23] hover:translate-x-1 transition-all">Formulation Team</Link>
              
              {/* Dynamic CMS Pages */}
              {footerPages.length > 0 && footerPages.map((page) => (
                <Link
                  key={page._id}
                  to={`/pages/${page.slug}`}
                  className="hover:text-[#3a4d23] hover:translate-x-1 transition-all"
                >
                  {page.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* COLUMN 5: GET ACTIVE NEWSLETTER CARD */}
          <div className="bg-white border border-[#e8e6d9] rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-lg text-[#1c2415]">Get Active Dispatch</h4>
              <p className="text-xs text-[#4a4a4a] font-body font-light">
                Receive organic formulation breakdowns and exclusive subscriber discounts.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
                className="w-full h-10 px-4 bg-[#faf9f5] border border-[#e8e6d9] rounded-full text-xs text-[#1c2415] outline-none focus:border-[#3a4d23]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-[11px] font-heading font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-300 cursor-pointer border-none shadow-sm flex items-center justify-center gap-1.5"
              >
                {submitting ? 'SUBMITTING...' : 'SUBSCRIBE NOW'}
              </button>
            </form>

            <p className="text-[10px] text-[#729855] font-bold uppercase tracking-wider">
              ★ 15% OFF code delivered to inbox
            </p>
          </div>

        </div>


        {/* =========================================================
           9. TRUST BADGES STRIP
           ========================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-[#e8e6d9] mb-10 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#3a4d23] flex items-center justify-center shadow-xs shrink-0">
              <Lock size={16} />
            </div>
            <div>
              <p className="font-heading font-bold text-[#1c2415]">256-Bit SSL Encryption</p>
              <p className="text-[10px] text-gray-500 font-body">Bank Grade Payment Safety</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#3a4d23] flex items-center justify-center shadow-xs shrink-0">
              <RefreshCw size={16} />
            </div>
            <div>
              <p className="font-heading font-bold text-[#1c2415]">30-Day Easy Returns</p>
              <p className="text-[10px] text-gray-500 font-body">100% Satisfaction Guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#3a4d23] flex items-center justify-center shadow-xs shrink-0">
              <Truck size={16} />
            </div>
            <div>
              <p className="font-heading font-bold text-[#1c2415]">Express Delivery</p>
              <p className="text-[10px] text-gray-500 font-body">Free Shipping Over ₹2000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#3a4d23] flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="font-heading font-bold text-[#1c2415]">Dermatologist Tested</p>
              <p className="text-[10px] text-gray-500 font-body">100% Bio-Active Sourced</p>
            </div>
          </div>
        </div>


        {/* =========================================================
           10. PAYMENT METHOD CHIPS
           ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 text-xs text-gray-500 border-b border-[#e8e6d9] mb-8">
          <span className="font-heading font-bold uppercase tracking-wider text-[#1c2415]">ACCEPTED SECURE PAYMENTS</span>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((pm) => (
              <span key={pm} className="px-3 py-1 bg-white rounded-md border border-[#e8e6d9] font-heading font-bold text-[10px] text-gray-700 shadow-xs">
                {pm}
              </span>
            ))}
          </div>
        </div>


        {/* =========================================================
           13. FOOTER BOTTOM ROW
           ========================================================= */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 text-xs text-gray-500 font-body">
          <div className="text-center md:text-left">
            <span>© 2026 Fabish Organic Cosmetics. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/pages/privacy-policy" className="hover:text-[#1c2415]">Privacy Policy</Link>
            <span>•</span>
            <Link to="/pages/terms-conditions" className="hover:text-[#1c2415]">Terms &amp; Conditions</Link>
            <span>•</span>
            <Link to="/pages/shipping-returns" className="hover:text-[#1c2415]">Shipping Policy</Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px]">Made with <Heart size={12} className="inline fill-rose-500 text-rose-500" /> in India • v2.6.0</span>
            <button
              onClick={scrollToTop}
              className="w-9 h-9 bg-[#3a4d23] text-white rounded-full flex items-center justify-center hover:bg-[#1c2415] transition-all duration-300 shadow-md cursor-pointer border-none"
              aria-label="Scroll to top"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;