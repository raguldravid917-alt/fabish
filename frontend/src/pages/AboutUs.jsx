import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  Award,
  CheckCircle2,
  Truck,
  Lock,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  ArrowRight,
  Heart,
  Eye,
  ShoppingBag,
  BadgePercent,
  Check,
  Quote,
  Flame,
  Globe
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useProductsQuery } from '../hooks/queries/useProductsQuery';
import ProductCard from '../components/ProductCard';

// Framer Motion Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const AboutUs = () => {
  useDocumentTitle('About Us — Fabish Luxury Organic Skincare');

  // Video State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Product recommendations server state query
  const { data: recommendedProducts = [], isLoading: productsLoading } = useProductsQuery({ limit: 4 });

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const timelineEvents = [
    { year: '2022', title: 'Founded', desc: 'Born in Mumbai with a vision for pure, botanical skincare.' },
    { year: '2023', title: '10,000+ Customers', desc: 'Expanded nationwide with 98% customer satisfaction.' },
    { year: '2024', title: 'Lab Innovation', desc: 'Pioneered cold-pressed bio-fermented antioxidant serums.' },
    { year: '2025', title: 'Award Winning', desc: 'Voted Best Organic Beauty Brand in Vogue Beauty Awards.' },
    { year: '2026', title: 'Global Benchmark', desc: 'Setting the 2026 standard for zero-waste luxury beauty.' }
  ];

  const whyChooseFeatures = [
    {
      title: '100% Bio-Active Ingredients',
      desc: 'Cold-pressed, wild-harvested botanical actives engineered for cellular absorption.',
      icon: Leaf,
      color: 'from-emerald-500/20 to-teal-500/10'
    },
    {
      title: 'Dermatologist Tested',
      desc: 'Rigorously tested in clinical trial facilities for all skin types including sensitive.',
      icon: ShieldCheck,
      color: 'from-blue-500/20 to-indigo-500/10'
    },
    {
      title: '100% Cruelty Free',
      desc: 'Leaping Bunny certified. We never test on animals at any stage.',
      icon: Sparkles,
      color: 'from-rose-500/20 to-pink-500/10'
    },
    {
      title: 'Express Nationwide Delivery',
      desc: 'Insured temperature-controlled shipping directly to your doorstep in 48h.',
      icon: Truck,
      color: 'from-amber-500/20 to-orange-500/10'
    },
    {
      title: '256-Bit Encrypted Checkout',
      desc: 'Bank-grade security protocols ensuring complete data privacy.',
      icon: Lock,
      color: 'from-purple-500/20 to-violet-500/10'
    },
    {
      title: 'Sustainable Packaging',
      desc: 'Recyclable frosted glass bottles and biodegradable soy-ink printed boxes.',
      icon: Globe,
      color: 'from-lime-500/20 to-green-500/10'
    }
  ];

  const ingredientChips = [
    { name: 'Cold-Pressed Aloe Vera', benefit: 'Calms redness & deep hydration' },
    { name: 'Stable Vitamin C 15%', benefit: 'Brightens tone & boosts collagen' },
    { name: 'Niacinamide 10%', benefit: 'Tightens pores & smooths texture' },
    { name: 'Matcha Green Tea', benefit: 'Potent polyphenol antioxidant shield' },
    { name: 'Encapsulated Retinol', benefit: 'Gentle night-time cell turnover' },
    { name: 'Triple Ceramide Complex', benefit: 'Restores skin barrier integrity' }
  ];

  const bentoGridItems = [
    {
      title: 'Clean Beauty Standards',
      desc: 'Formulated without parabens, sulfates, phthalates, synthetic dyes, or artificial fragrances.',
      tag: '0% Toxins',
      size: 'col-span-1 lg:col-span-2',
      bg: 'bg-gradient-to-br from-[#f4f7f0] to-[#e8efe2]'
    },
    {
      title: 'Ethical Sourcing',
      desc: 'Partnering directly with micro-farms across Western Ghats & Himachal Valley.',
      tag: '100% Fair Trade',
      size: 'col-span-1',
      bg: 'bg-gradient-to-br from-[#faf8f5] to-[#f2eedf]'
    },
    {
      title: 'Zero Plastics Initiative',
      desc: 'Over 95% plastic-free packaging using ocean-bound glass and aluminum closures.',
      tag: 'Eco Conscious',
      size: 'col-span-1',
      bg: 'bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]'
    },
    {
      title: 'Clinical Lab Testing',
      desc: 'Each batch undergoes double-blind patch testing and heavy metal safety screening.',
      tag: 'ISO Certified',
      size: 'col-span-1 lg:col-span-2',
      bg: 'bg-gradient-to-br from-[#f5f8f5] to-[#e2ebe2]'
    }
  ];

  const statMetrics = [
    { value: '100K+', label: 'Happy Customers', subtext: 'Across 28 Indian States' },
    { value: '500+', label: 'Daily Orders', subtext: 'Shipped from Mumbai Hub' },
    { value: '4.9★', label: 'Average Rating', subtext: 'Based on 12,400+ Reviews' },
    { value: '98%', label: 'Repeat Customers', subtext: 'Industry Leading Loyalty' }
  ];

  const teamMembers = [
    {
      name: 'Dr. Dafni Sen',
      role: 'Founder & Chief Formulation Scientist',
      bio: 'Ph.D. in Botanical Chemistry from Cambridge. 12+ years pioneering bio-fermented skincare.',
      image: '/assets/1_2.jpg',
      fallback: '/assets/Blog07.jpg'
    },
    {
      name: 'Stefania Kapoor',
      role: 'Head of Aesthetic Design & Product UX',
      bio: 'Former Milan luxury brand lead passionate about minimalist Scandinavian packaging.',
      image: '/assets/1_3.jpg',
      fallback: '/assets/Blog08.jpg'
    },
    {
      name: 'Emilia D\'Souza',
      role: 'VP of Sustainable Operations',
      bio: 'Leading zero-waste supply chains and ethical farm partnerships nationwide.',
      image: '/assets/1_4.jpg',
      fallback: '/assets/Blog03.jpg'
    }
  ];

  const testimonials = [
    {
      quote: "Fabish completely transformed my barrier health in just 3 weeks. The Aloe & Niacinamide formula feels like liquid silk and smells divine without synthetic fragrance.",
      author: "Priya Sharma",
      location: "Mumbai",
      role: "Verified Purchaser",
      rating: 5
    },
    {
      quote: "As someone with ultra-sensitive skin, finding a clean brand that actually delivers clinical results was impossible until I discovered Fabish. Worth every rupee.",
      author: "Ananya Roy",
      location: "Bengaluru",
      role: "Verified Purchaser",
      rating: 5
    },
    {
      quote: "The packaging is breathtaking and the serum absorbs instantaneously. My skin hasn't looked this radiant in years. Fabish is true luxury.",
      author: "Dr. Meera Iyer",
      location: "New Delhi",
      role: "Dermatologist & User",
      rating: 5
    }
  ];

  const certLogos = [
    { name: 'Dermatologically Tested', badge: 'CLINICAL' },
    { name: 'FDA Compliant', badge: 'APPROVED' },
    { name: 'GMP Certified Facility', badge: 'QUALITY' },
    { name: 'ISO 9001:2026', badge: 'CERTIFIED' },
    { name: 'Cruelty Free International', badge: 'LEAPING BUNNY' },
    { name: '100% Organic Sourced', badge: 'NATURAL' }
  ];

  const faqs = [
    {
      q: 'Are Fabish products suitable for sensitive skin?',
      a: 'Yes, absolutely. Every Fabish formula undergoes independent clinical patch testing specifically on sensitive skin types. We avoid synthetic fragrances, drying alcohols, parabens, and essential oils that trigger irritation.'
    },
    {
      q: 'Where are Fabish products manufactured?',
      a: 'All our formulations are manufactured in our state-of-the-art ISO 9001 & GMP certified facility in Maharashtra, India under strict pharmaceutical-grade sterile conditions.'
    },
    {
      q: 'Are your products 100% natural and organic?',
      a: 'We combine wild-harvested organic botanical extracts with safe, scientifically proven active ingredients (like 15% Vitamin C and 10% Niacinamide) to deliver peak efficacy without compromising clean standards.'
    },
    {
      q: 'What is your shipping & return policy?',
      a: 'We offer free shipping on all orders over ₹2000 across India with 2-4 business day delivery. We also offer a hassle-free 14-day satisfaction guarantee.'
    }
  ];

  return (
    <div className="w-full bg-[#faf9f5] font-body text-[#1c2415] selection:bg-[#729855] selection:text-white overflow-x-hidden">

      {/* =========================================================
         1. HERO SECTION (Apple / Aesop / Dior Scandinavian Luxury)
         ========================================================= */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-[#f5f4ed] via-[#edebe0] to-[#faf9f5] py-16 lg:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden">
        {/* Ambient Floating Botanical Blur Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#729855]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#d2e2c5]/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

        <div className="max-w-[1340px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

          {/* Left Column: Glassmorphism Hero Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Breadcrumb Navigation */}
            <motion.div variants={fadeInUp} className="mb-6 flex items-center gap-2">
              <span className="bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#e2dfce] text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#3a4d23] shadow-sm flex items-center gap-2">
                <Leaf size={12} className="text-[#729855]" />
                Organic Botanical Science
              </span>
            </motion.div>

            {/* Breadcrumb path text */}
            <motion.div variants={fadeInUp} className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
              <Link to="/" className="hover:text-[#3a4d23] transition-colors">Home</Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-[#1c2415]">About Us</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              variants={fadeInUp}
              className="font-heading font-medium text-4xl sm:text-5xl lg:text-6xl text-[#1c2415] leading-[1.15] mb-6 tracking-tight"
            >
              Naturally Crafted. <br />
              <span className="italic font-serif text-[#3a4d23]">Scientifically Proven.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-[#3d4a30] leading-relaxed max-w-xl mb-8 font-body font-light"
            >
              Fabish creates high-performance, dermatologist-formulated skincare crafted from ethically sourced botanicals and bio-active nutrients engineered for radiant skin health.
            </motion.p>

            {/* CTA Buttons & Trust Badges */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                to="/collections/all"
                className="px-8 py-4 bg-[#3a4d23] hover:bg-[#1c2415] text-white font-heading text-[12px] font-bold tracking-[0.2em] uppercase rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-3 group"
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#our-story"
                className="px-8 py-4 bg-white/90 hover:bg-white text-[#1c2415] font-heading text-[12px] font-bold tracking-[0.2em] uppercase rounded-full border border-[#dcd7c5] shadow-sm hover:shadow-md transition-all duration-300"
              >
                OUR STORY
              </a>
            </motion.div>

            {/* Hero Trust Badges Grid */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#e2dfce]/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#729855]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Dermatologist Tested</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#729855]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">100% Cruelty Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#729855]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Made in India</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#729855]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Eco Packaging</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Hero Showcase Image with Floating Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="relative w-full max-w-[460px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/80 group">
              <img
                src="/assets/Rectangle_338.jpg"
                alt="Fabish Botanical Skincare"
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                onError={(e) => { e.target.src = '/assets/14.jpg'; }}
              />

              {/* Floating Glassmorphism Pill Badges */}
              <div className="absolute top-6 left-6 bg-white/85 backdrop-blur-xl border border-white/60 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-subtle">
                <div className="w-10 h-10 rounded-full bg-[#729855] text-white flex items-center justify-center font-bold">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">VOGUE BEAUTY</p>
                  <p className="text-[12px] font-heading font-bold text-[#1c2415]">Best Organic Brand 2025</p>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img src="/assets/1_2.jpg" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="User" onError={(e) => { e.target.src = '/assets/Blog07.jpg'; }} />
                  <img src="/assets/1_3.jpg" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="User" onError={(e) => { e.target.src = '/assets/Blog08.jpg'; }} />
                  <img src="/assets/1_4.jpg" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="User" onError={(e) => { e.target.src = '/assets/Blog03.jpg'; }} />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[11px] font-heading font-bold text-[#1c2415]">100K+ Glowing Reviews</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>


      {/* =========================================================
         2. COMPANY STORY & ANIMATED TIMELINE
         ========================================================= */}
      <section id="our-story" className="py-20 lg:py-28 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Editorial Image Stack */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] rounded-[30px] overflow-hidden shadow-xl border border-[#e8e6d9]">
              <img
                src="/assets/Rectangle_337.jpg"
                alt="Fabish Story Editorial"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/assets/homepage/9.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d2e2c5] block mb-1">OUR PHILOSOPHY</span>
                <p className="font-serif italic text-lg leading-snug">"True beauty flourishes when pure nature meets rigorous clinical formulation."</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Story Content & Vertical Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-3 block font-heading">
              HERITAGE & INNOVATION
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium text-[#1c2415] mb-6 leading-tight">
              Our Journey to Redefining Clean Beauty
            </h2>
            <p className="text-gray-600 leading-relaxed font-body font-light mb-10 text-base sm:text-lg">
              Founded in 2022, Fabish was created out of a desire to eliminate toxic filler ingredients from daily beauty routines. By merging cold-pressed Indian botanicals with dermatological science, we deliver uncompromised radiance.
            </p>

            {/* Vertical Animated Timeline */}
            <div className="relative pl-6 border-l-2 border-[#729855]/30 space-y-8">
              {timelineEvents.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="relative group"
                >
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#faf9f5] border-2 border-[#729855] group-hover:bg-[#729855] transition-colors duration-300" />
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-heading font-bold text-[#3a4d23] bg-[#eef4ea] px-2.5 py-0.5 rounded-full">{item.year}</span>
                    <h3 className="font-heading font-bold text-lg text-[#1c2415]">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 font-body font-light">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>


      {/* =========================================================
         3. WHY CHOOSE FABISH (6 Premium Cards with Lift + Shadow)
         ========================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-8 lg:px-16 bg-[#f4f2e6]/60 border-y border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-3 block font-heading">
              THE FABISH DIFFERENCE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium text-[#1c2415] leading-tight">
              Why Discerning Skincare Lovers Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white/90 backdrop-blur-sm border border-[#e8e6d9] rounded-[24px] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group hover:border-[#729855]/40 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} text-[#3a4d23] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon size={26} strokeWidth={1.8} />
                    </div>
                    <h3 className="font-heading font-semibold text-xl text-[#1c2415] mb-3 group-hover:text-[#729855] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-body font-light">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#729855]">
                    <span>GUARANTEED QUALITY</span>
                    <Check size={14} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* =========================================================
         4. INGREDIENTS SECTION (Luxury Split + Animated Chips)
         ========================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          <div className="lg:col-span-6">
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-3 block font-heading">
              ACTIVE BOTANICAL SCIENCE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium text-[#1c2415] mb-6 leading-tight">
              Powered by Nature's Most Potent Bio-Extracts
            </h2>
            <p className="text-gray-600 leading-relaxed font-body font-light mb-8 text-base">
              We extract maximum bioactive potency using low-temperature cold processing, protecting essential phytonutrients and antioxidants from heat degradation.
            </p>

            {/* Animated Ingredient Chips */}
            <div className="space-y-3">
              {ingredientChips.map((chip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white border border-[#e2dfce] p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-[#729855] transition-all flex items-center justify-between group cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#eef4ea] text-[#3a4d23] flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <span className="font-heading font-bold text-[#1c2415] text-sm group-hover:text-[#729855] transition-colors">{chip.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-body italic">{chip.benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Ingredient Lifestyle Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="/assets/Rectangle_342.jpg"
                alt="Botanical Ingredients"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/assets/14.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="font-heading text-xl font-medium mb-1">Cold-Pressed Freshness</p>
                <p className="text-xs text-gray-200 font-body">Retaining 99.4% phytonutrient antioxidant integrity</p>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
         5. BRAND VALUES (Bento Grid Layout)
         ========================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-8 lg:px-16 bg-[#f4f2e6]/50 border-t border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-3 block font-heading">
              CORE FOUNDATION
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium text-[#1c2415]">
              Our Uncompromised Brand Values
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {bentoGridItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`${item.size} ${item.bg} border border-[#e2dfce] rounded-[28px] p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between group`}
              >
                <div>
                  <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-heading font-bold uppercase tracking-widest text-[#3a4d23] mb-4 shadow-sm">
                    {item.tag}
                  </span>
                  <h3 className="font-heading font-semibold text-2xl text-[#1c2415] mb-3 group-hover:text-[#729855] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-body font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-8 flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-[#1c2415] flex items-center justify-center shadow-sm group-hover:bg-[#3a4d23] group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================
         6. ACHIEVEMENTS & ANIMATED METRICS
         ========================================================= */}
      <section className="py-20 lg:py-24 px-4 sm:px-8 lg:px-16 bg-[#3a4d23] text-white relative overflow-hidden">
        <div className="max-w-[1340px] mx-auto relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
          {statMetrics.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10"
            >
              <p className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-[#d2e2c5] mb-2 tracking-tight">
                {stat.value}
              </p>
              <p className="font-heading text-base font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-xs text-white/70 font-body font-light">{stat.subtext}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* =========================================================
         7. FASHION & SCIENCE TEAM SECTION
         ========================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-3 block font-heading">
            THE MINDS BEHIND FABISH
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium text-[#1c2415]">
            Our Formulation & Creative Team
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              className="bg-white rounded-[28px] border border-[#e8e6d9] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between"
            >
              <div className="relative aspect-[4/4] overflow-hidden bg-[#f4f2e6]">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.target.src = member.fallback; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-xs text-white/90 font-body font-light leading-relaxed">{member.bio}</p>
                </div>
              </div>

              <div className="p-6 text-center">
                <h3 className="font-heading font-bold text-xl text-[#1c2415] mb-1">{member.name}</h3>
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#729855]">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* =========================================================
         8. CUSTOMER TESTIMONIALS CAROUSEL / GRID
         ========================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-8 lg:px-16 bg-[#f4f2e6]/60 border-y border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-3 block font-heading">
              COMMUNITY VOICES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium text-[#1c2415]">
              Loved by 100,000+ Skin Enthusiasts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-[28px] border border-[#e8e6d9] shadow-sm flex flex-col justify-between relative"
              >
                <Quote className="w-10 h-10 text-[#729855]/20 absolute top-6 right-6" />
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic font-body font-light text-sm leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#1c2415]">{t.author}</h4>
                    <p className="text-[10px] text-gray-500 font-body">{t.location} • {t.role}</p>
                  </div>
                  <span className="bg-[#eef4ea] text-[#3a4d23] text-[9px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================
         9. LUXURY CERTIFICATIONS STRIP
         ========================================================= */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 border-b border-[#e2dfce] bg-white">
        <div className="max-w-[1340px] mx-auto flex flex-wrap items-center justify-around gap-8 text-center">
          {certLogos.map((cert, idx) => (
            <div key={idx} className="group cursor-default">
              <span className="text-[9px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] block mb-1">
                {cert.badge}
              </span>
              <p className="font-heading font-bold text-sm text-[#1c2415] group-hover:text-[#729855] transition-colors">
                {cert.name}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* =========================================================
         10. PREMIUM VIDEO SECTION
         ========================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="relative w-full aspect-[16/9] max-h-[600px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-white group">
          <video
            ref={videoRef}
            src="/assets/73b7434b832e4989a63b1d48f8e21ccf.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />

          {/* Floating Play / Pause Overlay Button */}
          <button
            onClick={toggleVideo}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/90 backdrop-blur-md text-[#1c2415] hover:bg-[#3a4d23] hover:text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer border-none"
            aria-label={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>

          <div className="absolute bottom-8 left-8 right-8 text-white flex justify-between items-end pointer-events-none">
            <div>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#d2e2c5] block mb-1">BEHIND THE FORMULATION</span>
              <p className="font-heading text-2xl font-medium">Inside Our Cold-Process Science Lab</p>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
         11. FAQ ACCORDION SECTION
         ========================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-8 lg:px-16 bg-[#f4f2e6]/50 border-t border-[#e2dfce]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-16">
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-3 block font-heading">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-[#1c2415]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#e2dfce] rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer bg-transparent border-none"
                  >
                    <span className="font-heading font-semibold text-base sm:text-lg text-[#1c2415]">{faq.q}</span>
                    <div className="w-8 h-8 rounded-full bg-[#f4f2e6] text-[#3a4d23] flex items-center justify-center flex-shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-sm text-gray-600 font-body font-light leading-relaxed border-t border-gray-100 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* =========================================================
         12. CTA BANNER SECTION (Botanical Gradient Illustration)
         ========================================================= */}
      <section className="relative w-full h-[480px] sm:h-[540px] flex items-center justify-center overflow-hidden group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-in-out group-hover:scale-105"
          style={{ backgroundImage: `url('/assets/Rectangle_336_copy.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />

        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <span className="text-[11px] sm:text-[12px] font-heading font-bold text-[#d2e2c5] tracking-[0.3em] uppercase mb-4 block">
            LIMITED TIME OFFER — 50% OFF
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-medium leading-tight mb-8">
            Ready for Healthier, Radiant Skin?
          </h2>
          <Link
            to="/collections/all"
            className="inline-block bg-[#3a4d23] hover:bg-white hover:text-[#1c2415] text-white px-10 py-4 text-[12px] font-heading font-bold tracking-[0.2em] uppercase rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          >
            EXPLORE FABISH COLLECTION
          </Link>
        </div>
      </section>


      {/* =========================================================
         13. PRODUCT RECOMMENDATION SECTION (Amazon-Inspired Cards)
         ========================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-2 block font-heading">
              RECOMMENDED FOR YOU
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-[#1c2415]">
              Featured Botanical Best Sellers
            </h2>
          </div>
          <Link
            to="/collections/all"
            className="text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#3a4d23] hover:text-[#729855] flex items-center gap-1 transition-colors"
          >
            VIEW ALL PRODUCTS <ArrowRight size={14} />
          </Link>
        </div>

        {/* Products Grid using ProductCard component */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Array.isArray(recommendedProducts) ? recommendedProducts : []).slice(0, 4).map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
};

export default AboutUs;