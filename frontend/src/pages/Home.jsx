import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Heart, Eye, ShoppingBag, X, Star, Sparkles, CheckCircle2, ShieldCheck, Truck, Award, Play, Pause, ChevronRight, Leaf, Lock } from 'lucide-react';
import { getLocalImageUrl } from '../utils/imageMapper';
import FaceCreamBanner from '../components/FaceCreamBanner';
import BeautyProductGrid from '../components/BeautyProductGrid';
import { motion } from 'framer-motion';
import { useMobileCardActive } from '../hooks/useMobileCardActive';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { productService } from '../api/productService';
import { api } from '../api/client';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { slugify } from '../utils/slugify';

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

const HERO_SLIDES = [
  {
    tag: 'HEALTHY SKIN',
    heading: <>Organic Anti-Aging Cosmetic<br className="hidden md:inline" />Cream</>,
    body: 'Formulated with cold-pressed botanical extracts and natural antioxidants to restore skin elasticity.',
    cta: 'DISCOVER COLLECTION',
    ctaTo: '/collections/all',
    image: '/assets/homepage/Slider_0b0fe4fc-3aef-4572-88a1-1de862680afa.jpg',
    imageAlt: 'Organic Anti-Aging Cosmetic Cream',
    position: 'left',
    objectPosition: 'object-[80%_top]',
  },
  {
    tag: 'UP TO 50% OFF',
    heading: <>Luxurious Feeling<br className="hidden md:inline" />Face Creams</>,
    body: 'Deeply hydrating night & day creams enriched with pure lavender and jojoba oils.',
    cta: 'EXPLORE NOW',
    ctaTo: '/collections/moisturizer',
    image: '/assets/homepage/Slider-2.jpg',
    imageAlt: 'Luxurious Feeling Face Creams',
    position: 'right',
    objectPosition: 'object-[20%_top]',
  },
  {
    tag: 'MOISTURIZER',
    heading: <>Healthy Skin<br className="hidden md:inline" />Care Product</>,
    body: 'Dermatologically tested formulas designed for sensitive and radiance-seeking skin.',
    cta: 'VIEW ALL',
    ctaTo: '/collections/all',
    image: '/assets/homepage/Slider-3.jpg',
    imageAlt: 'Healthy Skin Care Product',
    position: 'left',
    objectPosition: 'object-[80%_top]',
  },
];

const PopularProductCard = ({ product, addToCart, toggleWishlist, isInWishlist, setQuickViewProduct }) => {
  const cardRef = useRef(null);
  const { isActiveMobile, useMobileInteraction, handleCardInteraction, cardId } = useMobileCardActive(product._id, cardRef);

  const discount = product.comparePrice > product.price ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const imageSrc = getLocalImageUrl(product.images?.[0] || product.image || '/assets/14.jpg');

  return (
    <div
      ref={cardRef}
      data-card-id={cardId}
      onClickCapture={handleCardInteraction}
      className="group flex flex-col w-full relative glass-card rounded-2xl p-3 bg-white/90 border border-[#e8e6d9]/80 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
    >
      <div className="relative overflow-hidden w-full aspect-[4/5] bg-[#f7f6f0] rounded-xl flex items-center justify-center mb-3 cursor-pointer">
        <Link to={`/products/${product.slug || slugify(product.title)}`} className="block w-full h-full">
          <img
            src={imageSrc}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#3a4d23] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-heading z-10 shadow-xs backdrop-blur-md">
            -{discount}%
          </span>
        )}

        {/* Action Drawer Overlay */}
        <div className={useMobileInteraction
          ? `absolute top-3 right-3 flex flex-col gap-2 z-20 transition-all duration-300 ${
              isActiveMobile
                ? 'opacity-100 pointer-events-auto translate-y-0'
                : 'opacity-0 pointer-events-none translate-y-2'
            }`
          : "absolute top-3 right-3 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-2 lg:group-hover:translate-x-0 transition-all duration-300 z-20"
        }>
          <button
            onClick={() => setQuickViewProduct(product)}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#1c2415] hover:bg-[#3a4d23] hover:text-white flex items-center justify-center shadow-md transition-all duration-300 border border-white/50 cursor-pointer hover:scale-110"
            title="Quick View"
          >
            <Eye size={15} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => toggleWishlist(product)}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-300 border border-white/50 cursor-pointer hover:scale-110 ${
              isInWishlist(product._id)
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-[#1c2415] hover:bg-[#3a4d23] hover:text-white'
            }`}
            title="Wishlist"
          >
            <Heart size={15} strokeWidth={1.8} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Add to Cart CTA */}
        <button
          onClick={() => addToCart(product, 1)}
          className={useMobileInteraction
            ? `absolute bottom-3 left-1/2 -translate-x-1/2 w-[88%] h-10 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-[10px] font-bold tracking-[0.18em] uppercase rounded-full z-20 cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all duration-300 ${
                isActiveMobile
                  ? 'opacity-100 pointer-events-auto translate-y-0'
                  : 'opacity-0 pointer-events-none translate-y-3'
              }`
            : "absolute bottom-3 left-1/2 -translate-x-1/2 w-[88%] h-10 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-[10px] font-bold tracking-[0.18em] uppercase rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-2 lg:group-hover:translate-y-0 transition-all duration-300 z-20 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          }
        >
          <ShoppingBag size={13} />
          <span>ADD TO CART</span>
        </button>
      </div>

      <div className="flex flex-col flex-grow text-center justify-between p-1">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#729855] block mb-1 font-heading">
            {typeof product.category === 'object' ? product.category?.name : 'Organic Cosmetic'}
          </span>
          <Link to={`/products/${product.slug || slugify(product.title)}`}>
            <h3 className="font-heading font-medium text-sm leading-snug text-[#1c2415] hover:text-[#729855] transition-colors line-clamp-2 min-h-[36px]">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-3 pt-2 border-t border-[#f4f2e6]">
          <div className="flex items-center justify-center gap-2 font-body">
            <span className="text-sm font-bold text-[#1c2415]">Rs. {product.price.toLocaleString('en-IN')}.00</span>
            {discount > 0 && <span className="text-xs line-through text-gray-400">Rs. {product.comparePrice.toLocaleString('en-IN')}.00</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [blogs, setBlogs] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const videoRef = React.useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const toggleVideoPlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
  };

  const popularProductsStatic = [
    {
      _id: 'p1',
      slug: 'aloe-vera-freshness-cream',
      title: 'Aloe Vera Freshness Cream',
      price: 46200,
      comparePrice: 0,
      badge: null,
      images: ['/assets/6.jpg']
    },
    {
      _id: 'p2',
      slug: 'apricot-melon-softening-cream',
      title: 'Apricot Melon Softening Cream',
      price: 81000,
      comparePrice: 96200,
      badge: '15%',
      images: ['/assets/apricot.jpg']
    },
    {
      _id: 'p3',
      slug: 'birch-butter-silkiness-cream',
      title: 'Birch Butter Silkiness Cream',
      price: 62300,
      comparePrice: 0,
      badge: null,
      images: ['/assets/birch.jpg']
    },
    {
      _id: 'p4',
      slug: 'azalea-fields-soothing-cream',
      title: 'Azalea Fields Soothing Cream',
      price: 24100,
      comparePrice: 0,
      badge: null,
      images: ['/assets/azalea.jpg']
    }
  ];

  const staticBlogs = [
    {
      slug: 'best-cleansers-for-sensitive-skin',
      title: 'Best Cleansers For Sensitive Skin',
      author: 'John Mathew',
      date: '25 Mar 2024',
      comments: '3 Comments',
      image: '/assets/Blog08.jpg'
    },
    {
      slug: 'how-to-treat-an-infected-pimple',
      title: 'How To Treat An Infected Pimple',
      author: 'John Mathew',
      date: '25 Mar 2024',
      comments: '1 Comment',
      image: '/assets/Blog03.jpg'
    },
    {
      slug: 'best-sunscreens-for-everyday-wear',
      title: 'Best Sunscreens For Everyday Wear',
      author: 'John Mathew',
      date: '25 Mar 2024',
      comments: '1 Comment',
      image: '/assets/Blog07.jpg'
    }
  ];

  const skinTypes = [
    { name: 'Sensitive Skin', tag: 'SOOTHING', color: 'from-emerald-50 to-teal-100', icon: '🌿', count: '18 Items', link: '/collections/sensitive-skin' },
    { name: 'Dry & Dehydrated', tag: 'HYDRATING', color: 'from-blue-50 to-[#eef4ff]', icon: '💧', count: '24 Items', link: '/collections/dry-skin' },
    { name: 'Oily & Acne Prone', tag: 'BALANCING', color: 'from-amber-50 to-orange-100', icon: '✨', count: '15 Items', link: '/collections/oily-skin' },
    { name: 'Combination', tag: 'HARMONIZING', color: 'from-rose-50 to-pink-100', icon: '🌸', count: '20 Items', link: '/collections/combination-skin' },
    { name: 'Normal Skin', tag: 'RADIANCE', color: 'from-stone-50 to-amber-100', icon: '☀️', count: '30 Items', link: '/collections/normal-skin' },
    { name: 'Anti-Aging', tag: 'RENEWAL', color: 'from-purple-50 to-indigo-100', icon: '👑', count: '16 Items', link: '/collections/anti-aging' },
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get('/blogs');
        if (res.success) {
          setBlogs(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      }
    };

    const fetchPopularProducts = async () => {
      try {
        const res = await productService.getAll({ limit: 4 });
        if (res.success && res.data?.length > 0) {
          setPopularProducts(res.data);
        } else {
          setPopularProducts(popularProductsStatic);
        }
      } catch (err) {
        console.error('Error fetching popular products:', err);
        setPopularProducts(popularProductsStatic);
      }
    };

    fetchBlogs();
    fetchPopularProducts();
  }, []);

  return (
    <div className="w-full bg-[#faf9f5] font-body text-[#1c2415]">

      {/* =========================================================
         1. 2026 LUXURY HERO BANNER SECTION (Apple / Dior / Aesop Inspired)
         ========================================================= */}
      <section className="w-full select-none relative overflow-hidden bg-gradient-to-b from-[#f8f7f2] via-[#f2efdf] to-[#faf9f5] py-8 sm:py-12 lg:py-16 min-h-[640px] lg:min-h-[780px] flex items-center">

        {/* Ambient Layered Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Radial Botanical Glow Blobs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-[#729855]/20 via-[#d2e2c5]/30 to-transparent rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-[#a2c286]/20 via-[#e4edd9]/30 to-transparent rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-t from-[#3a4d23]/10 to-transparent rounded-full blur-2xl" />

          {/* Floating Subtle Botanical Decorative Particles */}
          <div className="absolute top-12 left-10 text-[#729855]/25 text-2xl animate-float-slow opacity-60">🍃</div>
          <div className="absolute top-1/4 left-1/2 text-[#3a4d23]/20 text-xl animate-float-slow opacity-50" style={{ animationDelay: '3s' }}>💧</div>
          <div className="absolute bottom-20 left-16 text-[#729855]/20 text-3xl animate-float-slow opacity-40" style={{ animationDelay: '1.5s' }}>🌸</div>
          <div className="absolute top-16 right-1/3 text-[#3a4d23]/15 text-2xl animate-float-slow opacity-45" style={{ animationDelay: '4s' }}>✨</div>
          <div className="absolute bottom-12 right-12 text-[#729855]/25 text-2xl animate-float-slow opacity-60" style={{ animationDelay: '2.5s' }}>🍃</div>
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            pagination={{ el: '.hero-pagination', clickable: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            slidesPerView={1}
            loop={true}
            className="w-full h-full"
          >
            {HERO_SLIDES.map((slide, idx) => (
              <SwiperSlide key={idx} className="w-full bg-transparent">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[560px] lg:min-h-[660px]">

                  {/* LEFT SIDE CONTENT CONTAINER (Luxury Glassmorphic Card) */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1"
                  >
                    <div className="backdrop-blur-2xl bg-white/75 rounded-[22px] sm:rounded-[28px] p-6 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white/90 relative overflow-hidden">
                      
                      {/* Subtly Animated Card Highlight */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3a4d23] via-[#729855] to-[#d2e2c5]" />

                      {/* Luxury Badge */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eef3e8]/90 border border-[#d2e2c5] mb-5 shadow-xs">
                        <Sparkles size={14} className="text-[#3a4d23] animate-spin-slow" />
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#3a4d23] uppercase font-heading">
                          ✨ 100% ORGANIC BOTANICAL FORMULATION • {slide.tag}
                        </span>
                      </div>

                      {/* Responsive Luxury Headline */}
                      {/* Desktop 72px, Laptop 60px, Tablet 48px, Mobile 34px */}
                      <h1 className="font-heading font-medium text-[34px] md:text-[48px] lg:text-[60px] xl:text-[72px] text-[#1c2415] leading-[1.05] tracking-tight mb-5">
                        {slide.heading}
                      </h1>

                      {/* Small Supporting Description */}
                      <p className="text-sm sm:text-base lg:text-lg text-[#4a5a3a]/90 leading-relaxed font-body font-normal mb-6 max-w-xl">
                        {slide.body}
                      </p>

                      {/* Customer Rating & Organic Ingredients Badge Bar */}
                      <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-[#e8e6d9]/80 text-xs text-[#2f3e10] font-heading font-medium">
                        <div className="flex items-center gap-1.5 bg-[#f6f5ea] px-3.5 py-1.5 rounded-full border border-[#e2dec9]">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="font-bold text-[#1c2415]">4.9</span>
                          <span className="text-gray-500 font-body text-[11px]">(12k+ Verified Reviews)</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-[#eef3e8] px-3.5 py-1.5 rounded-full border border-[#cbe0ba]">
                          <Leaf size={13} className="text-[#3a4d23]" />
                          <span>100% Cold-Pressed Bio-Extracts</span>
                        </div>
                      </div>

                      {/* Two CTA Buttons */}
                      <div className="flex flex-wrap items-center gap-4 mb-8">
                        {/* Primary Button */}
                        <Link
                          to={slide.ctaTo}
                          className="group inline-flex items-center justify-center gap-3 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.2em] px-8 py-4 sm:px-10 sm:py-4.5 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] font-heading"
                        >
                          <span>{slide.cta}</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* Secondary Button */}
                        <Link
                          to="/collections/all"
                          className="inline-flex items-center justify-center gap-2 bg-white/40 hover:bg-white backdrop-blur-md border border-[#3a4d23]/30 hover:border-[#3a4d23] text-[#1c2415] text-xs sm:text-sm font-bold uppercase tracking-[0.18em] px-7 py-4 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 font-heading"
                        >
                          <span>EXPLORE ALL</span>
                        </Link>
                      </div>

                      {/* Trust Cards Bar (5 Cards: Organic, Dermat-Approved, Cruelty Free, Free Shipping, Secure Checkout) */}
                      <div className="pt-2 grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
                        {[
                          { title: '100% Organic', icon: <Leaf size={15} className="text-[#3a4d23]" /> },
                          { title: 'Dermat Approved', icon: <ShieldCheck size={15} className="text-[#3a4d23]" /> },
                          { title: 'Cruelty Free', icon: <Heart size={15} className="text-rose-600" /> },
                          { title: 'Free Shipping', icon: <Truck size={15} className="text-[#3a4d23]" /> },
                          { title: 'Secure Checkout', icon: <Lock size={15} className="text-[#3a4d23]" /> }
                        ].map((card, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex flex-col items-center justify-center text-center p-2.5 rounded-xl bg-white/80 border border-[#e8e6d9] hover:border-[#3a4d23]/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                          >
                            <div className="mb-1">{card.icon}</div>
                            <span className="text-[9px] font-bold text-[#1c2415] leading-tight font-heading">
                              {card.title}
                            </span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </motion.div>


                  {/* RIGHT SIDE BANNER IMAGE SHOWCASE */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                    className="lg:col-span-5 flex items-center justify-center order-1 lg:order-2 relative"
                  >
                    <div className="relative w-full max-w-md lg:max-w-none aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[28px] lg:rounded-[36px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(47,62,16,0.25)] border border-white/70 bg-[#f6f5ea] group">
                      
                      {/* Organic Gradient Glow Behind Image */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#3a4d23]/20 via-transparent to-[#729855]/20 z-10 pointer-events-none" />

                      <img
                        src={getLocalImageUrl(slide.image)}
                        alt={slide.imageAlt}
                        className={`w-full h-full object-cover z-0 transition-transform duration-1000 ease-out group-hover:scale-105 ${slide.objectPosition || 'object-center'}`}
                      />

                      {/* Glass Highlight Floating Badge Overlay */}
                      <div className="absolute bottom-6 left-6 right-6 z-20 backdrop-blur-xl bg-white/85 border border-white/80 p-4 rounded-2xl shadow-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#eef3e8] border border-[#d2e2c5] flex items-center justify-center text-[#3a4d23]">
                            <Award size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#729855] block font-heading">
                              AWARD-WINNING FORMULA
                            </span>
                            <h4 className="text-xs font-bold text-[#1c2415] font-heading">
                              {slide.tag || 'Clinical Botanical Care'}
                            </h4>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#3a4d23] bg-[#eef3e8] px-2.5 py-1 rounded-full border border-[#d2e2c5] font-heading">
                          2026 EDITION
                        </span>
                      </div>

                    </div>
                  </motion.div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="hero-pagination mt-6 flex justify-center gap-2"></div>
        </div>
      </section>


      {/* =========================================================
         2. WHY CHOOSE FABISH (FEATURES SECTION)
         ========================================================= */}
      <section className="bg-gradient-to-b from-[#f4f3ea] to-white py-16 md:py-24 select-none">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#729855] uppercase block mb-2 font-heading">
              PURE BOTANICAL ETHICS
            </span>
            <h2 className="font-heading font-medium text-3xl md:text-4xl text-[#1c2415]">
              Why Choose Fabish Organic
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: 'Natural Ingredients', desc: '100% cold-pressed plant extracts sourced ethically without chemical fillers.', img: '/assets/homepage/Group.svg' },
              { title: 'Fragrance Free', desc: 'Hypoallergenic formulas free from artificial scent enhancers & dyes.', img: '/assets/homepage/Group-1.svg' },
              { title: 'Allergy Tested', desc: 'Rigorously dermatologically certified safe for sensitive skin types.', img: '/assets/homepage/Group-2.svg' },
              { title: 'Paraben Free', desc: 'Clean beauty formulation completely free from sulfates & toxic parabens.', img: '/assets/homepage/Group-3.svg' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card rounded-3xl p-8 text-center bg-white/80 border border-[#e8e6d9] hover:border-[#3a4d23]/40 flex flex-col items-center justify-between shadow-xs hover:shadow-xl transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#eef3e8] flex items-center justify-center mb-6 shadow-inner">
                  <img src={item.img} alt={item.title} className="w-8 h-8 object-contain" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-[#1c2415] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5a5a5a] leading-relaxed font-body">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================
         3. VITAL CATEGORIES (SHOP BY CATEGORY GRID)
         ========================================================= */}
      <section className="w-full bg-white py-16 md:py-24 select-none">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#729855] uppercase block mb-2 font-heading">
              CURATED COLLECTIONS
            </span>
            <h2 className="font-heading font-medium text-3xl md:text-4xl text-[#1c2415]">
              Vital Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[340px]">
            {/* 1. Serums Image Card */}
            <div className="md:col-span-1 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer bg-[#f6f5ea] shadow-md border border-[#e8e6d9]">
              <img src="/assets/homepage/Rectangle_1_f394c5a5-71c4-413b-8939-f8b03e00b527.jpg" alt="Serums" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col items-start">
                <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase mb-1 font-heading">CONCENTRATE</span>
                <h3 className="text-2xl font-bold text-white mb-3 font-heading">Botanical Serums</h3>
                <Link to="/collections/serums" className="inline-flex items-center justify-center bg-white/90 hover:bg-[#3a4d23] text-[#1c2415] hover:text-white font-heading font-bold text-[11px] tracking-[0.2em] uppercase px-6 py-3 rounded-full transition-all duration-300 shadow-md">
                  SERUMS
                </Link>
              </div>
            </div>

            {/* 2. Text Highlight */}
            <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-gradient-to-br from-[#eef3e8] to-[#e4edd9] p-8 flex flex-col justify-center items-center text-center shadow-xs border border-[#d2e2c5]">
              <span className="text-[#3a4d23] font-heading font-bold text-[11px] tracking-[0.2em] uppercase mb-2">WORLDWIDE ORGANIC</span>
              <h2 className="font-heading text-2xl lg:text-3xl font-medium text-[#1c2415] leading-snug">
                Worldwide Cosmetics Collection
              </h2>
            </div>

            {/* 3. Lotion */}
            <div className="md:col-span-1 md:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer bg-[#f6f5ea] shadow-md border border-[#e8e6d9]">
              <img src="/assets/homepage/Rectangle_3_af090527-90c1-41b6-9c56-1e551d99d1bf.jpg" alt="Lotion" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 z-10">
                <Link to="/collections/lotion" className="inline-flex items-center justify-center bg-white/90 hover:bg-[#3a4d23] text-[#1c2415] hover:text-white font-heading font-bold text-[11px] tracking-[0.2em] uppercase px-6 py-3 rounded-full transition-all duration-300 shadow-md">
                  LOTION
                </Link>
              </div>
            </div>

            {/* 4. Face Cream */}
            <div className="md:col-span-1 md:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer bg-[#f6f5ea] shadow-md border border-[#e8e6d9]">
              <img src="/assets/homepage/Rectangle_2_5d23986c-81f7-4e44-a103-f90ce659a719.jpg" alt="Face Cream" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 z-10">
                <Link to="/collections/face-cream" className="inline-flex items-center justify-center bg-white/90 hover:bg-[#3a4d23] text-[#1c2415] hover:text-white font-heading font-bold text-[11px] tracking-[0.2em] uppercase px-6 py-3 rounded-full transition-all duration-300 shadow-md">
                  FACE CREAM
                </Link>
              </div>
            </div>

            {/* 5. Cleanse */}
            <div className="md:col-span-1 md:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer bg-[#f6f5ea] shadow-md border border-[#e8e6d9]">
              <img src="/assets/homepage/Rectangle_4_d29da3f1-b9e8-43ab-93cd-f60f9edceb81.jpg" alt="Cleanse" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 z-10">
                <Link to="/collections/cleanse" className="inline-flex items-center justify-center bg-white/90 hover:bg-[#3a4d23] text-[#1c2415] hover:text-white font-heading font-bold text-[11px] tracking-[0.2em] uppercase px-6 py-3 rounded-full transition-all duration-300 shadow-md">
                  CLEANSE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
         4. POPULAR PRODUCTS OF THE WEEK
         ========================================================= */}
      <section className="w-full bg-gradient-to-b from-white via-[#faf9f5] to-white py-16 md:py-24 select-none">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 pb-4 border-b border-[#e8e6d9]">
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#729855] uppercase block mb-2 font-heading">
                WEEKLY ESSENTIALS
              </span>
              <h2 className="font-heading font-medium text-3xl md:text-4xl text-[#1c2415]">
                Popular Products Of The Week
              </h2>
            </div>
            <Link to="/collections/all" className="mt-4 md:mt-0 font-heading text-xs font-bold tracking-widest text-[#3a4d23] hover:text-[#1c2415] uppercase flex items-center gap-1">
              <span>EXPLORE ALL PRODUCTS</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {popularProducts.map((product) => (
              <PopularProductCard
                key={product._id}
                product={product}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
                setQuickViewProduct={setQuickViewProduct}
              />
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================
         5. SHOP BY SKIN TYPE SECTION (New 2026 Interactive Addition)
         ========================================================= */}
      <section className="w-full bg-[#f4f3ea] py-16 md:py-24 select-none border-y border-[#e8e6d9]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#729855] uppercase block mb-2 font-heading">
              PERSONALIZED CARE
            </span>
            <h2 className="font-heading font-medium text-3xl md:text-4xl text-[#1c2415]">
              Shop By Skin Type
            </h2>
            <p className="text-xs sm:text-sm text-[#5a5a5a] mt-2 font-body">
              Targeted botanical formulations engineered for your skin's precise needs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {skinTypes.map((st, i) => (
              <Link
                key={i}
                to={st.link}
                className="glass-card bg-white/90 rounded-3xl p-6 flex flex-col items-center text-center group border border-white/60 shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${st.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  {st.icon}
                </div>
                <span className="text-[9px] font-bold tracking-widest text-[#729855] uppercase mb-1 font-heading">{st.tag}</span>
                <h3 className="font-heading font-medium text-sm text-[#1c2415] mb-1">{st.name}</h3>
                <span className="text-[11px] text-gray-400 font-body">{st.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================
         6. HAIR SERUM FEATURE SECTION
         ========================================================= */}
      <section className="w-full bg-white py-16 md:py-24 select-none">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center glass-card rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#faf9f5] to-[#f4f3ea] border border-[#e8e6d9]">
            
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
              <img src="/assets/homepage/Image-Sectio-3_4bf9d804-e941-478d-98bf-9867ba97363b.png" alt="Nourishing Hair Serum" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="text-[10px] font-bold text-[#3a4d23] uppercase tracking-wider font-heading">★ BESTSELLER</span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#729855] mb-2 font-heading">
                PURE AND SIMPLE
              </span>
              <h2 className="font-heading font-medium text-3xl md:text-4xl text-[#1c2415] mb-4 leading-tight">
                Deeply Nourishing Hair Serum For Glowing Hair
              </h2>
              <p className="text-sm text-[#4a4a4a] leading-relaxed mb-6 font-body">
                Infused with organic argan and rosehip seed oils to strengthen hair follicles, eliminate frizz, and provide lasting natural shine.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  'Strong & Smooth',
                  'Paraben-Free',
                  'Sulfate-Free',
                  '100% Vegan'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-[#3a4d23] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#1c2415] font-body">{item}</span>
                  </div>
                ))}
              </div>

              <div>
                <Link
                  to="/collections/all"
                  className="inline-flex items-center justify-center gap-2 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-full transition-all duration-300 shadow-md hover:scale-105 font-heading"
                >
                  <span>SHOP NOW</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
         7. FEATURED BANNER & BEAUTY GRID
         ========================================================= */}
      <FaceCreamBanner />

      <BeautyProductGrid setQuickViewProduct={setQuickViewProduct} />


      {/* =========================================================
         8. AURABLOOM VIDEO SHOWCASE SECTION
         ========================================================= */}
      <section className="relative w-full py-16 lg:py-24 bg-[#f4f3ea] overflow-hidden my-8 select-none">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/60 shadow-xl">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#3a4d23] uppercase mb-2 block font-heading">
                BOTANICAL INNOVATION
              </span>
              <h2 className="font-heading font-medium text-3xl md:text-4xl text-[#1c2415] mb-4">
                AuraBloom Beauty &amp; Personal Care
              </h2>
              <p className="text-sm text-[#4a4a4a] leading-relaxed mb-6 font-body">
                Experience the harmony of nature and dermatological science. Our zero-waste cold-pressed processing preserves 99.4% of essential plant nutrients for visible glow.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleVideoPlay}
                  className="inline-flex items-center justify-center gap-3 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-xs font-bold tracking-[0.18em] uppercase px-6 py-3 rounded-full transition-all duration-300 shadow-md cursor-pointer font-heading"
                >
                  {isVideoPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isVideoPlaying ? 'PAUSE VIDEO' : 'PLAY VIDEO'}</span>
                </button>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl bg-black group">
              <video
                ref={videoRef}
                src="/assets/WhatsApp Video 2026-06-21 at 11.32.21 AM.mp4"
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
         9. CUSTOMER REVIEWS (TESTIMONIALS)
         ========================================================= */}
      <section className="w-full bg-white py-16 md:py-24 select-none">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#729855] uppercase block mb-2 font-heading">
              VERIFIED FEEDBACK
            </span>
            <h2 className="font-heading font-medium text-3xl md:text-4xl text-[#1c2415]">
              Customer Reviews
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: 'Jessica James',
                location: 'Paris, France',
                review: 'Fabish organic creams changed my skincare routine completely. My skin feels deeply moisturized without any greasy residue.',
                img: '/assets/homepage/Test02.jpg'
              },
              {
                name: 'Luce Aurora',
                location: 'New York, US',
                review: 'The hair serum works like magic! My split ends have visibly reduced and the natural botanical scent is so relaxing.',
                img: '/assets/homepage/Test01.jpg'
              },
              {
                name: 'Ottavia Leila',
                location: 'Los Angeles, US',
                review: '100% natural, dermatologist approved, and clean. Customer service is prompt and delivery was super fast. Highly recommended!',
                img: '/assets/homepage/Test03.jpg'
              }
            ].map((item, idx) => (
              <div key={idx} className="glass-card rounded-3xl p-8 bg-white/80 border border-[#e8e6d9] shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-[#4a4a4a] leading-relaxed mb-6 font-body">
                    "{item.review}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-[#f4f2e6]">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover shadow-xs border border-white"
                    onError={(e) => { e.target.src = "/assets/homepage/Rectangle_1_f394c5a5-71c4-413b-8939-f8b03e00b527.jpg"; }}
                  />
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-[#1c2415]">{item.name}</h4>
                    <span className="text-xs text-gray-400 font-body">{item.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================
         10. FROM OUR BLOG SECTION
         ========================================================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white border-t border-[#f4f2e6]">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#729855] uppercase block mb-2 font-heading">
            SKINCARE INSIGHTS
          </span>
          <h2 className="font-heading font-medium text-3xl md:text-4xl text-[#1c2415]">
            From Our Blog
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {(blogs.length > 0 ? blogs.slice(0, 3) : staticBlogs).map((post, index) => (
            <div key={post._id || index} className="glass-card rounded-3xl overflow-hidden bg-white border border-[#e8e6d9] flex flex-col group hover:shadow-xl transition-all duration-500">
              <div className="w-full aspect-[16/10] overflow-hidden bg-[#f6f5ea] relative">
                <Link to={`/blogs/news/${post.slug || ''}`}>
                  <img
                    src={post.image ? `${getLocalImageUrl(post.image)}` : getLocalImageUrl(post.image)}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = '/assets/Blog07.jpg'; }}
                  />
                </Link>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <span className="text-[11px] text-gray-400 font-body block mb-2">
                    {post.date || '25 Mar 2024'} • {post.comments || '3 Comments'}
                  </span>
                  <h3 className="font-heading font-medium text-lg text-[#1c2415] leading-snug hover:text-[#729855] transition-colors mb-4 line-clamp-2">
                    <Link to={`/blogs/news/${post.slug || ''}`}>{post.title}</Link>
                  </h3>
                </div>
                <Link
                  to={`/blogs/news/${post.slug || ''}`}
                  className="font-heading text-xs font-bold tracking-[0.18em] uppercase text-[#3a4d23] hover:text-[#1c2415] inline-flex items-center gap-1 transition-colors"
                >
                  <span>READ STORY</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            to="/blogs/news"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#1c2415] hover:bg-[#1c2415] hover:text-white text-[#1c2415] font-heading font-bold text-xs tracking-[0.18em] uppercase px-8 py-4 rounded-full transition-all duration-300"
          >
            <span>VIEW ALL POSTS</span>
          </Link>
        </div>
      </section>


      {/* =========================================================
         11. INSTAGRAM / SOCIAL GALLERY
         ========================================================= */}
      <section className="w-full bg-[#faf9f5] py-16 select-none border-t border-[#e8e6d9]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#729855] uppercase font-heading">
              JOIN OUR COMMUNITY @FABISH.ORGANIC
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { type: 'img', src: '/assets/Rectangle_342.jpg' },
              { type: 'img', src: '/assets/Rectangle_341.jpg' },
              { type: 'vid', src: '/assets/73b7434b832e4989a63b1d48f8e21ccf.mp4' },
              { type: 'img', src: '/assets/Rectangle_339.jpg' },
              { type: 'img', src: '/assets/Rectangle_340.jpg' }
            ].map((media, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer bg-[#f6f5ea] shadow-xs">
                {media.type === 'vid' ? (
                  <video src={media.src} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <img src={media.src} alt={`Instagram ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#1c2415]">
                    <Sparkles size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================
         12. QUICK VIEW MODAL (Luxury Frosted Glass)
         ========================================================= */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
          <div className="absolute inset-0 cursor-default" onClick={() => setQuickViewProduct(null)} />
          
          <div className="bg-white max-w-[800px] w-full shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] overflow-y-auto md:overflow-visible rounded-3xl z-10 animate-scaleIn border border-white/60">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-[#1c2415] hover:bg-[#3a4d23] hover:text-white bg-white/90 rounded-full shadow-md z-20 cursor-pointer border-none transition-all duration-300"
              title="Close Quick View"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full md:w-1/2 bg-[#f7f6f0] flex items-center justify-center p-8 aspect-square md:aspect-auto">
              <img src={getLocalImageUrl(quickViewProduct.images?.[0])} alt={quickViewProduct.title} className="max-h-[280px] md:max-h-[350px] w-auto object-contain" />
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <span className="text-[#729855] font-heading text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
                {typeof quickViewProduct.category === 'object' ? quickViewProduct.category?.name : quickViewProduct.category}
              </span>
              <h2 className="font-heading text-xl md:text-2xl font-medium text-[#1c2415] mb-3">{quickViewProduct.title}</h2>
              
              <div className="flex items-center gap-1.5 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(quickViewProduct.ratings || 4.9) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-body">(4.9 rating)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-4 border-b border-[#f4f2e6] pb-4 font-body">
                <span className="text-xl font-bold text-[#1c2415]">Rs. {quickViewProduct.price.toLocaleString('en-IN')}.00</span>
                {quickViewProduct.comparePrice > quickViewProduct.price && <span className="text-sm line-through text-gray-400">Rs. {quickViewProduct.comparePrice.toLocaleString('en-IN')}.00</span>}
              </div>

              <p className="text-xs text-[#5a5a5a] leading-relaxed mb-6 line-clamp-3 font-body">{stripHtml(quickViewProduct.description)}</p>

              {quickViewProduct.stock > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#1c2415]">Qty:</span>
                    <div className="flex items-center border border-[#e8e6d9] h-10 rounded-full bg-white px-2">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-full text-sm bg-transparent border-none cursor-pointer font-bold flex items-center justify-center">-</button>
                      <span className="px-3 text-sm font-semibold select-none font-body">{quantity}</span>
                      <button onClick={() => setQuantity(q => Math.min(quickViewProduct.stock, q + 1))} className="w-8 h-full text-sm bg-transparent border-none cursor-pointer font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <button onClick={() => { addToCart(quickViewProduct, quantity); setQuickViewProduct(null); }} className="w-full bg-[#3a4d23] hover:bg-[#1c2415] text-white py-3.5 px-6 font-heading text-xs font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 cursor-pointer border-none shadow-md flex items-center justify-center gap-2">
                    <ShoppingBag size={14} />
                    <span>ADD TO CART</span>
                  </button>
                </div>
              ) : (
                <button disabled className="w-full bg-gray-400 text-white py-3.5 px-6 font-heading text-xs font-bold tracking-[0.2em] uppercase rounded-full cursor-not-allowed border-none flex items-center justify-center">
                  OUT OF STOCK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;