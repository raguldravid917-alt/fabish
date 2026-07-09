import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Heart, Eye, ShoppingBag, X, Star } from 'lucide-react';
import { getLocalImageUrl } from '../utils/imageMapper';
import FaceCreamBanner from '../components/FaceCreamBanner';
import BeautyProductGrid from '../components/BeautyProductGrid';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { productService } from '../api/productService';
import { api } from '../api/client';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { slugify } from '../utils/slugify';

const HERO_SLIDES = [
  {
    tag: 'HEALTHY SKIN',
    heading: <>Organic Anti-Aging Cosmetic<br className="hidden md:inline" />Cream</>,
    body: 'Praesent in nunc vel urna consequat mattis eget vel libero. Phasellus entesque',
    cta: 'VIEW ALL',
    ctaTo: '/collections/all',
    image: '/assets/homepage/Slider_0b0fe4fc-3aef-4572-88a1-1de862680afa.jpg',
    imageAlt: 'Organic Anti-Aging Cosmetic Cream',
    position: 'left',
    objectPosition: 'object-[80%_top]',
  },
  {
    tag: 'UP TO 50% OFF',
    heading: <>Luxurious Feeling<br className="hidden md:inline" />Face Creams</>,
    body: 'Quisque non tellus orci ac auctor augue mauris augue. Placerat orci nulla.',
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
    body: 'Ut aliquam amet venenatis urna purus sit amet luctus venenatis lectus magna fringilla.',
    cta: 'VIEW ALL',
    ctaTo: '/collections/all',
    image: '/assets/homepage/Slider-3.jpg',
    imageAlt: 'Healthy Skin Care Product',
    position: 'left',
    objectPosition: 'object-[80%_top]',
  },
];

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

  // Strictly enforcing exact mock data matching the reference image layout
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

  // Static Blogs data to match exact Xerox design with local assets
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
    <div className="w-full bg-white">
      {/* HERO SECTION */}
      <section className="w-full select-none relative overflow-hidden bg-[#faf9f5] lg:h-[580px] md:h-[500px] h-[400px]">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ el: '.hero-pagination', clickable: true, bulletClass: 'hero-bullet', bulletActiveClass: 'hero-bullet-active' }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          slidesPerView={1}
          loop={true}
          className="w-full h-full lg:min-h-[580px] md:min-h-[500px] min-h-[400px]"
        >
          {HERO_SLIDES.map((slide, idx) => (
            <SwiperSlide key={idx} className="relative w-full h-full lg:h-[580px] md:h-[500px] h-[400px] overflow-hidden bg-[#faf9f5]">
              <img src={getLocalImageUrl(slide.image)} alt={slide.imageAlt} className={`absolute inset-0 w-full h-full object-cover z-0 ${slide.objectPosition || 'object-center'}`} />
              <div className="absolute inset-0 z-10 w-full h-full flex items-center">
                <div className="w-full max-w-[1280px] mx-auto px-[24px] md:px-[64px] lg:px-[100px] flex">
                  <div className={`w-full lg:w-1/2 flex flex-col justify-center text-left ${slide.position === 'right' ? 'lg:ml-auto' : 'lg:mr-auto'}`}>
                    <span className="block font-body font-normal text-[12px] uppercase text-[#000] mb-[12px]" style={{ letterSpacing: '0.4em' }}>{slide.tag}</span>
                    <h1 className="font-serif text-[32px] md:text-[48px] lg:text-[52px] font-normal leading-[1.1] text-[#000] mb-[16px]">{slide.heading}</h1>
                    <p className="font-body text-[16px] leading-[1.8] text-[#333333] mb-[24px] max-w-[440px]">{slide.body}</p>
                    <div>
                      <Link to={slide.ctaTo} className="inline-flex items-center justify-center bg-[#2f3e10] hover:bg-[#1f2a0a] text-white font-body font-bold text-[12px] tracking-[0.18em] uppercase transition-colors duration-200" style={{ width: '142px', height: '48px', textDecoration: 'none' }}>
                        {slide.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="hero-pagination"></div>
      </section>

      {/* FEATURES SECTION - Animate with stagger entry from bottom to top */}
      <section className="bg-[#f3f3f3] py-[60px] md:py-[80px] lg:py-[100px] select-none overflow-hidden">
        <motion.div
          className="max-w-[1280px] mx-auto px-[2%]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }} // Triggers animation once when 15% of section enters viewport
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15, // Time gap between each column slide-up
              }
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[40px] md:gap-[30px] text-center">

            {/* 1. Natural Ingredients Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
              }}
              className="flex flex-col items-center max-w-[280px] mx-auto"
            >
              <div className="h-[60px] flex items-center justify-center mb-[20px]">
                <img src="/assets/homepage/Group.svg" alt="Natural Ingredients" className="h-[60px] w-auto transition-transform duration-300 hover:scale-105" />
              </div>
              <h3 className="font-heading text-[24px] lg:text-[26px] font-normal text-black mb-[10px]">Natural Ingredients</h3>
              <p className="font-body text-[16px] text-black/70 font-normal leading-[1.8]">Praesent in nunc vel urna consequat mattis eget vel libero. Phasellus entesque</p>
            </motion.div>

            {/* 2. Fragrance Free Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
              }}
              className="flex flex-col items-center max-w-[280px] mx-auto"
            >
              <div className="h-[60px] flex items-center justify-center mb-[20px]">
                <img src="/assets/homepage/Group-1.svg" alt="Fragrance Free" className="h-[60px] w-auto transition-transform duration-300 hover:scale-105" />
              </div>
              <h3 className="font-heading text-[24px] lg:text-[26px] font-normal text-black mb-[10px]">Fragrance Free</h3>
              <p className="font-body text-[16px] text-black/70 font-normal leading-[1.8]">Ahasellus entesque praesent in nunc vel urna consequat mattis eget vel libero.</p>
            </motion.div>

            {/* 3. Allergy Tested Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
              }}
              className="flex flex-col items-center max-w-[280px] mx-auto"
            >
              <div className="h-[60px] flex items-center justify-center mb-[20px]">
                <img src="/assets/homepage/Group-2.svg" alt="Allergy Tested" className="h-[60px] w-auto transition-transform duration-300 hover:scale-105" />
              </div>
              <h3 className="font-heading text-[24px] lg:text-[26px] font-normal text-black mb-[10px]">Allergy Tested</h3>
              <p className="font-body text-[16px] text-black/70 font-normal leading-[1.8]">Nunc vel urna consequat praesent in mattis eget vel libero zhasellus entesque.</p>
            </motion.div>

            {/* 4. Paraben Free Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
              }}
              className="flex flex-col items-center max-w-[280px] mx-auto"
            >
              <div className="h-[60px] flex items-center justify-center mb-[20px]">
                <img src="/assets/homepage/Group-3.svg" alt="Paraben Free" className="h-[60px] w-auto transition-transform duration-300 hover:scale-105" />
              </div>
              <h3 className="font-heading text-[24px] lg:text-[26px] font-normal text-black mb-[10px]">Paraben Free</h3>
              <p className="font-body text-[16px] text-black/70 font-normal leading-[1.8]">Mattis eget vel libero praesent in nunc vel urna consequat ehasellus entesque</p>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* PREMIUM CATEGORY GRID */}
      <section className="w-full bg-white select-none">
        <div className="max-w-[1280px] mx-auto px-4 md:px-[40px] pt-[60px] pb-[60px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] auto-rows-[300px] md:auto-rows-[320px]">

            {/* 1. Serums Image Card */}
            <div className="md:col-span-1 md:row-span-2 relative w-full h-full overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/homepage/Rectangle_1_f394c5a5-71c4-413b-8939-f8b03e00b527.jpg" alt="Organic Face Cream" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-10 w-[80%] max-w-[180px]">
                <Link to="/collections/all" className="flex items-center justify-center bg-white text-black hover:bg-black hover:text-white font-heading font-bold text-[12px] tracking-[0.2em] uppercase h-[46px] w-full transition-all duration-300 shadow-sm border-none" style={{ textDecoration: 'none' }}>SERUMS</Link>
              </div>
            </div>

            {/* 2. Animated "Worldwide Fashion Collection" Text Card */}
            <motion.div
              className="md:col-span-1 md:row-span-1 bg-white flex flex-col justify-center items-center text-center p-6 w-full h-full"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            >
              <span className="text-black font-body font-normal text-[12px] tracking-[0.2em] uppercase mb-[15px] block">VITAL CATEGORIES</span>
              <h2 className="font-serif text-[36px] lg:text-[42px] font-normal leading-[1.2] text-black">Worldwide<br />Fashion<br />Collection</h2>
            </motion.div>

            {/* 3. Lotion Image Card */}
            <div className="md:col-span-1 md:row-span-1 relative w-full h-full overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/homepage/Rectangle_3_af090527-90c1-41b6-9c56-1e551d99d1bf.jpg" alt="Natural Organic Face Wash" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-10 w-[80%] max-w-[180px]">
                <Link to="/collections/all" className="flex items-center justify-center bg-white text-black hover:bg-black hover:text-white font-heading font-bold text-[12px] tracking-[0.2em] uppercase h-[46px] w-full transition-all duration-300 shadow-sm border-none" style={{ textDecoration: 'none' }}>LOTION</Link>
              </div>
            </div>

            {/* 4. Face Cream Image Card */}
            <div className="md:col-span-1 md:row-span-1 relative w-full h-full overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/homepage/Rectangle_2_5d23986c-81f7-4e44-a103-f90ce659a719.jpg" alt="Open Face Cream Jar" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-10 w-[80%] max-w-[180px]">
                <Link to="/collections/all" className="flex items-center justify-center bg-white text-black hover:bg-black hover:text-white font-heading font-bold text-[12px] tracking-[0.2em] uppercase h-[46px] w-full transition-all duration-300 shadow-sm border-none" style={{ textDecoration: 'none' }}>FACE CREAM</Link>
              </div>
            </div>

            {/* 5. Cleanse Image Card */}
            <div className="md:col-span-1 md:row-span-1 relative w-full h-full overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/homepage/Rectangle_4_d29da3f1-b9e8-43ab-93cd-f60f9edceb81.jpg" alt="Cosmetic Cream Peaks" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-10 w-[80%] max-w-[180px]">
                <Link to="/collections/all" className="flex items-center justify-center bg-white text-black hover:bg-black hover:text-white font-heading font-bold text-[12px] tracking-[0.2em] uppercase h-[46px] w-full transition-all duration-300 shadow-sm border-none" style={{ textDecoration: 'none' }}>CLEANSE</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* POPULAR PRODUCTS SECTION */}
      <section className="w-full bg-white select-none">
        {/* Margin issue fixed with px-[24px] md:px-[40px] and better gap */}
        <div className="max-w-[1280px] mx-auto px-[24px] md:px-[40px] pt-[40px] pb-[84px] flex flex-col lg:flex-row items-start justify-start gap-8 md:gap-12">

          {/* Text Section */}
          <div className="w-full lg:w-[320px] shrink-0 text-left pt-4">
            <span className="text-black font-sans font-normal text-[13px] uppercase tracking-[0.2em] block mb-[16px]" style={{ fontFamily: '"Work Sans", sans-serif' }}>
              POPULAR PRODUCTS OF THE WEEK
            </span>
            <h2 className="text-[40px] font-semibold leading-[1.2] text-black mt-0 font-sans tracking-tight">
              Latest<br />Worthwhile<br />Collections
            </h2>
          </div>

          {/* Products Grid & Half Underline Container */}
          <div className="flex-grow flex flex-col w-full">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] md:gap-[30px] w-full">
              {popularProducts.map((product) => {
                const discount = product.comparePrice > product.price ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
                const imageSrc = getLocalImageUrl(product.images?.[0] || product.image || '/assets/14.jpg');
                return (
                  <div key={product._id} className="group flex flex-col w-full relative">
                    <div className="relative overflow-hidden w-full aspect-[4/5] bg-[#f6f5ea] flex items-center justify-center mb-4 cursor-pointer p-0 transition-colors group/imgbox">

                      {/* Full fit image using object-cover */}
                      <img src={imageSrc} alt={product.title} className="w-full h-full object-cover mix-blend-darken transition-transform duration-500 ease-out group-hover/imgbox:scale-105" />

                      {discount > 0 && <span className="absolute top-3 left-3 bg-[#598e6a] text-white text-[10px] font-bold px-[8px] py-[4px] tracking-widest z-10">-{discount}%</span>}

                      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 ease-out z-20">

                        {/* Quick View */}
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="w-11 h-11 lg:w-9 lg:h-9 rounded-full bg-white flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 border-none cursor-pointer"
                        >
                          <Eye
                            size={18}
                            strokeWidth={1.8}
                            className="text-black hover:text-[#729855] transition-colors duration-300"
                          />
                        </button>

                        {/* Wishlist */}
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="w-11 h-11 lg:w-9 lg:h-9 rounded-full bg-white flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 border-none cursor-pointer"
                        >
                          <Heart
                            size={18}
                            strokeWidth={1.8}
                            className={`transition-colors duration-300 ${isInWishlist(product._id)
                              ? "fill-red-500 text-red-500"
                              : "text-black hover:text-[#729855]"
                              }`}
                          />
                        </button>

                      </div>

                      <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[85%] max-w-[160px] translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 ease-out z-10">
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full bg-[#3a4d23] hover:bg-black text-white text-center text-[11px] font-bold tracking-[0.2em] py-[12px] md:py-[14px] uppercase cursor-pointer border-none rounded-none transition-colors duration-300 h-11 flex items-center justify-center"
                        >
                          ADD CART
                        </button>
                      </div>
                    </div>

                    <Link to={`/products/${product.slug || slugify(product.title)}`}>
                      <h3 className="text-center font-medium text-[16px] text-black leading-[1.4] mt-[4px] mb-[4px] px-1 hover:text-[#729855] transition-colors line-clamp-2 cursor-pointer">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="flex flex-col items-center justify-center gap-1 font-sans text-center mt-1">
                      <span className="text-[14px] font-normal text-[#222]">Rs. {product.price.toLocaleString('en-IN')}.00 INR</span>
                      {discount > 0 && <span className="text-[13px] font-normal text-[#999] line-through">Rs. {product.comparePrice.toLocaleString('en-IN')}.00 INR</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FIX: Half Underline (Scroll/Progress bar) moved exactly below the products */}
            <div className="w-full h-[2px] bg-gray-200 mt-14">
              <div className="w-1/2 h-full bg-black"></div>
            </div>

          </div>

        </div>
      </section>

      {/* HAIR SERUM SECTION */}
      <section className="w-full bg-white select-none">
        <div className="max-w-[1280px] mx-auto px-4 md:px-[40px] pt-[60px] pb-[60px]">
          <div className="flex flex-col lg:flex-row items-stretch gap-[60px]">
            <div className="w-full lg:w-1/2 flex-shrink-0 flex items-center">
              <img src="/assets/homepage/Image-Sectio-3_4bf9d804-e941-478d-98bf-9867ba97363b.png" alt="Deeply Nourishing Hair Serum" className="w-full h-full object-cover" style={{ maxHeight: '520px', objectFit: 'cover' }} />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <span className="block font-body font-normal text-[12px] uppercase tracking-[0.18em] text-[#729855] mb-[16px]">PURE AND SIMPLE</span>
              <h2 className="font-heading font-bold text-[36px] leading-[1.2] text-black mb-[18px]">Deeply Nourishing Hair Serum<br />For Glowing &amp; Healthy Hair</h2>
              <p className="font-body text-[15px] leading-[1.7] text-[#4a4a4a] mb-[32px]">Ut Tempor Sem Leo, A <a href="/collections/all" className="text-[#729855] hover:underline">Ultricies Quam Aliquam Eget.</a> Vivamus Commodo Scelerisq Ue Velit, Quis Viverra Velit Bibendum Vel. <a href="/collections/all" className="text-[#729855] hover:underline">Phasell Sus Id Leo Et Vestibulum.</a></p>
              <div className="grid grid-cols-2 gap-x-[32px] gap-y-[20px] mb-[36px]">
                {[
                  { label: 'Strong & Smooth', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-[20px] h-[20px]"><path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm-1 13l-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7z" /></svg> },
                  { label: 'Paraben-Free', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-[20px] h-[20px]"><circle cx="12" cy="12" r="9" /><path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 3.5 9.5 14.5 14.5 0 0 1-3.5 9.5A14.5 14.5 0 0 1 8.5 12 14.5 14.5 0 0 1 12 2.5z" /></svg> },
                  { label: 'Sulfate-Free', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-[20px] h-[20px]"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M4.93 4.93l14.14 14.14" /></svg> },
                  { label: '100% Vegan', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-[20px] h-[20px]"><path d="M12 21.5C12 21.5 3 16 3 8.5a5.5 5.5 0 0 1 9-4.24A5.5 5.5 0 0 1 21 8.5c0 7.5-9 13-9 13z" /></svg> },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-[14px]">
                    <div className="w-[50px] h-[50px] rounded-full border border-black flex items-center justify-center flex-shrink-0 text-black bg-transparent">{icon}</div>
                    <span className="font-body text-[15px] font-normal text-black">{label}</span>
                  </div>
                ))}
              </div>
              <div>
                <Link to="/collections/all" className="inline-flex items-center justify-center bg-[#2f3e10] hover:bg-[#4a5c20] text-white font-body font-bold text-[12px] tracking-[0.18em] uppercase transition-colors duration-200" style={{ width: '142px', height: '50px', textDecoration: 'none' }}>SHOP NOW</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaceCreamBanner />

      <BeautyProductGrid setQuickViewProduct={setQuickViewProduct} />

      {/* AuraBloom Video Section */}
      <section className="relative w-full h-[500px] lg:h-[650px] overflow-hidden my-12 bg-[#f6f5ea]">
        <video
          ref={videoRef}
          src="/assets/WhatsApp Video 2026-06-21 at 11.32.21 AM.mp4"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 z-10 w-full max-w-[1280px] mx-auto px-4 md:px-[60px] lg:px-[100px] flex items-center justify-between pointer-events-none">
          <div className="w-full md:w-[60%] lg:w-[45%] text-left pointer-events-auto">
            <h2 className="font-heading font-medium text-[36px] md:text-[44px] lg:text-[48px] leading-[1.2] text-black mb-[24px]">
              AuraBloom Beauty &amp; Personal Care
            </h2>
            <p className="font-body text-[15px] md:text-[16px] leading-[1.8] text-[#111] font-medium mb-[32px]">
              Mollis Aliquam Ut Porttitor Leo A. Diam Quis Enim Lobortis Scelerisque Fermentum Dui. Turpis Tincidunt Id Aliquet Risus Feugiat In Ante. Luctus Venenatis Lectus Magna Fringilla Urna Porttitor. Venenatis A Condimentum Vitae Sapien Pellentesque Habitant. Odio Aenean Sed Adipiscing Diam Donec Adipiscing. Gravida Arcu Ac Tortor Dignissim Convallis Aenean Et Tortor.
            </p>
          </div>

          <div className="hidden lg:flex pointer-events-auto">
            <button
              onClick={toggleVideoPlay}
              className="w-[88px] h-[88px] rounded-full border-[2px] border-black hover:border-[#729855] flex items-center justify-center cursor-pointer bg-transparent transition-all duration-300"
            >
              {isVideoPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="4" width="4" height="16" fill="black" />
                  <rect x="14" y="4" width="4" height="16" fill="black" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                  <path d="M6 4L19 12L6 20V4Z" fill="black" stroke="black" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="w-full bg-white py-[80px] flex flex-col justify-start select-none">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-[40px]">
          <span className="block font-body font-normal text-[12px] uppercase tracking-[0.2em] text-[#000000] mb-[16px] text-left" style={{ fontFamily: '"Work Sans", sans-serif' }}>
            CUSTOMER REVIEWS
          </span>
          <h2 className="font-heading font-semibold text-[36px] md:text-[44px] leading-[1.2] text-[#000000] mb-[60px] text-left">
            Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] lg:gap-[80px] w-full text-left">
            <div className="flex flex-col">
              <div className="flex gap-[3.5px] mb-[27px] items-center">
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="none" strokeWidth={1.5} />
              </div>
              <p className="font-body text-[15px] leading-[1.8] text-[#333333] font-normal mb-[32px] max-w-full">
                Ut sem nulla pharetra diam sit amet nisl. A iaculis at erat pellentesque adipiscing commodo elit.
              </p>
              <div className="flex items-center gap-[20px]">
                <img src="/assets/homepage/Test02.jpg" alt="Jessica James" className="w-[60px] h-[60px] rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.src = "/assets/homepage/Rectangle_1_f394c5a5-71c4-413b-8939-f8b03e00b527.jpg"; }} />
                <div className="flex flex-col gap-[4px] justify-center">
                  <p className="font-heading font-medium text-[15px] text-black m-0 tracking-wide">Jessica James</p>
                  <p className="font-body text-[13px] text-[#777] m-0">Paris, France</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex gap-[3.5px] mb-[27px] items-center">
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="none" strokeWidth={1.5} />
              </div>
              <p className="font-body text-[15px] leading-[1.8] text-[#333333] font-normal mb-[32px] max-w-full">
                Eu consequat ac felis donec. Justo donec enim diam vulputate ut pharetra sit amet aliquam.
              </p>
              <div className="flex items-center gap-[20px]">
                <img src="/assets/homepage/Test01.jpg" alt="Luce Aurora" className="w-[60px] h-[60px] rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.src = "/assets/homepage/Rectangle_3_af090527-90c1-41b6-9c56-1e551d99d1bf.jpg"; }} />
                <div className="flex flex-col gap-[4px] justify-center">
                  <p className="font-heading font-medium text-[15px] text-black m-0 tracking-wide">Luce Aurora</p>
                  <p className="font-body text-[13px] text-[#777] m-0">Newyork,US</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex gap-[3.5px] mb-[27px] items-center">
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="#fec42d" strokeWidth={1.5} />
                <Star className="w-[16px] h-[16px]" stroke="#fec42d" fill="none" strokeWidth={1.5} />
              </div>
              <p className="font-body text-[15px] leading-[1.8] text-[#333333] font-normal mb-[32px] max-w-full">
                Aliquam purus sit amet luctus venenatis lectus. Arcu non odio euismod lacinia at quis risus sed.
              </p>
              <div className="flex items-center gap-[20px]">
                <img src="/assets/homepage/Test03.jpg" alt="Ottavia Leila" className="w-[60px] h-[60px] rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.src = "/assets/homepage/Rectangle_2_5d23986c-81f7-4e44-a103-f90ce659a719.jpg"; }} />
                <div className="flex flex-col gap-[4px] justify-center">
                  <p className="font-heading font-medium text-[15px] text-black m-0 tracking-wide">Ottavia Leila</p>
                  <p className="font-body text-[13px] text-[#777] m-0">Losangles, US</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FROM OUR BLOG SECTION - XEROX COPY FIX */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-[40px] py-[80px] bg-white">
        <h2 className="font-heading font-medium text-[36px] md:text-[42px] lg:text-[48px] text-center mb-[40px]">From Our Blog</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[32px] mb-12">
          {(blogs.length > 0 ? blogs.slice(0, 3) : staticBlogs).map((post, index) => (
            <div key={post._id || index} className="bg-white overflow-hidden flex flex-col text-left">
              <div className="w-full aspect-[16/10] overflow-hidden mb-6 bg-[#f6f5ea]">
                <Link to={`/blogs/news/${post.slug || ''}`}>
                  <img 
                    src={post.image ? `${getLocalImageUrl(post.image)}?t=${new Date(post.updatedAt || post.createdAt || Date.now()).getTime()}` : getLocalImageUrl(post.image)} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                    onError={(e) => { e.target.src = '/assets/Blog07.jpg'; }}
                  />
                </Link>
              </div>
              <div className="flex flex-col pr-4">
                <p className="font-body text-[13px] text-black mb-[10px]">
                  {post.author || 'Admin'} &nbsp;|&nbsp; {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (post.date || '25 Mar 2024')} &nbsp;|&nbsp; {post.comments || 'General'}
                </p>
                <h3 className="font-heading font-semibold text-[22px] leading-[1.3] text-black mb-[20px] line-clamp-2 hover:text-[#729855] transition-colors">
                  <Link to={`/blogs/news/${post.slug || ''}`}>{post.title}</Link>
                </h3>
                <div>
                  <Link to={`/blogs/news/${post.slug || ''}`} className="font-body text-[12px] font-bold uppercase tracking-[0.15em] text-black border-b border-black pb-1 hover:text-[#729855] hover:border-[#729855] transition-colors">
                    READ MORE
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Link to="/blogs/news" className="inline-flex items-center justify-center border-[2px] border-black hover:bg-black hover:text-white text-black font-heading font-bold text-[12px] tracking-[0.18em] uppercase transition-all duration-300" style={{ width: '190px', height: '50px', textDecoration: 'none' }}>VIEW ALL POSTS</Link>
        </div>
      </section>

      {/* INSTAGRAM GALLERY / GAP FIXED WITH CORRECT ASPECT HEIGHT */}
      <section className="w-full bg-white pt-[40px] pb-[80px] select-none">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-[40px]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-[15px] lg:gap-[30px]">
            {/* Image 1 */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/Rectangle_342.jpg" alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/10">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
            {/* Image 2 */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/Rectangle_341.jpg" alt="Gallery 2" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/10">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
            {/* Video (Middle) */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-black">
              <video src="/assets/73b7434b832e4989a63b1d48f8e21ccf.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/20">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
            {/* Image 4 */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/Rectangle_339.jpg" alt="Gallery 3" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/10">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
            {/* Image 5 */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/Rectangle_340.jpg" alt="Gallery 4" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/10">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn">
          <div className="absolute inset-0 cursor-default" onClick={() => setQuickViewProduct(null)} />
          <div className="bg-white max-w-[800px] w-full shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] overflow-y-auto md:overflow-visible rounded-none z-10 animate-scaleIn border border-[#f7e9e3]">
            <button onClick={() => setQuickViewProduct(null)} className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center text-brand-charcoal hover:text-brand-green bg-white/90 rounded-full shadow-md z-20 cursor-pointer border-none" title="Close Quick View"><X className="w-6 h-6" /></button>
            <div className="w-full md:w-1/2 bg-[#f6f5ea] flex items-center justify-center p-8 aspect-square md:aspect-auto">
              <img src={getLocalImageUrl(quickViewProduct.images?.[0])} alt={quickViewProduct.title} className="max-h-[280px] md:max-h-[350px] w-auto object-contain" />
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <span className="text-[#729855] font-heading text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
                {typeof quickViewProduct.category === 'object' ? quickViewProduct.category?.name : quickViewProduct.category}
              </span>
              <h2 className="font-heading text-xl md:text-2xl font-medium text-brand-charcoal mb-3">{quickViewProduct.title}</h2>
              <div className="flex items-center gap-1.5 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(quickViewProduct.ratings || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-xs text-brand-muted">({quickViewProduct.reviewsCount || 0} reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mb-4 border-b border-[#f7e9e3] pb-4">
                <span className="text-xl font-semibold text-brand-charcoal">Rs. {quickViewProduct.price.toLocaleString('en-IN')}.00 INR</span>
                {quickViewProduct.comparePrice > quickViewProduct.price && <span className="text-sm line-through text-brand-muted">Rs. {quickViewProduct.comparePrice.toLocaleString('en-IN')}.00 INR</span>}
              </div>
              <p className="text-sm text-brand-muted leading-relaxed mb-6 line-clamp-3 md:line-clamp-4">{quickViewProduct.description}</p>
              {quickViewProduct.stock > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-charcoal">Quantity:</span>
                    <div className="flex items-center border border-[#d0d0d0] h-11 bg-white">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-full px-4 text-sm bg-transparent border-none hover:bg-gray-100 cursor-pointer font-bold flex items-center justify-center">-</button>
                      <span className="px-4 text-sm font-semibold select-none">{quantity}</span>
                      <button onClick={() => setQuantity(q => Math.min(quickViewProduct.stock, q + 1))} className="h-full px-4 text-sm bg-transparent border-none hover:bg-gray-100 cursor-pointer font-bold flex items-center justify-center">+</button>
                    </div>
                    <span className="text-xs text-brand-green font-semibold">In Stock ({quickViewProduct.stock} left)</span>
                  </div>
                  <button onClick={() => { addToCart(quickViewProduct, quantity); setQuickViewProduct(null); }} className="w-full bg-[#2f3e10] hover:bg-[#729855] text-white py-4 px-6 font-heading text-xs font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer border-none h-12 flex items-center justify-center">Add to Cart</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-sm font-heading font-bold text-red-500 uppercase tracking-wider block">Sold Out</span>
                  <button disabled className="w-full bg-brand-muted text-white py-4 px-6 font-heading text-xs font-bold tracking-[0.2em] uppercase cursor-not-allowed border-none h-12 flex items-center justify-center">Out of Stock</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;