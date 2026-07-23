import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Box,
  ArrowLeftRight,
  ClipboardList,
  Star,
  AlertCircle,
  Truck,
  Tag,
  User,
  HelpCircle,
  Plus,
  Minus,
  Search,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  Sparkles,
  Lock,
  Leaf,
  Check,
  ArrowRight,
  RefreshCw,
  Award,
  Headphones,
  Send
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useProductsQuery } from '../hooks/queries/useProductsQuery';
import ProductCard from '../components/ProductCard';

// Framer Motion Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const FAQ = () => {
  useDocumentTitle('Help Center & FAQs — Fabish Support');

  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Recommended products via server state query
  const { data: recommendedProducts = [], isLoading: productsLoading } = useProductsQuery({ limit: 4 });

  // Exact 10 categories & contents as per original codebase
  const faqs = [
    {
      id: 0,
      title: "Payment",
      category: "Payment",
      content: "We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and Cash on Delivery (COD). All online payments are securely processed and 256-bit encrypted.",
      icon: CheckSquare
    },
    {
      id: 1,
      title: "Order",
      category: "Order",
      content: "You can modify or cancel your order within 2 hours of placing it by emailing our customer support team or through your account dashboard.",
      icon: Box
    },
    {
      id: 2,
      title: "Returns & Exchange",
      category: "Returns",
      content: "If an item doesn't fit or you're not happy, you can return or swap it within 30 days of purchase. Items must be unopened and unused.",
      icon: ArrowLeftRight
    },
    {
      id: 3,
      title: "Package",
      category: "Shipping",
      content: "All items are securely packaged in temperature-stable containers to ensure they reach you in perfect condition using eco-friendly materials.",
      icon: ClipboardList
    },
    {
      id: 4,
      title: "Special Offers",
      category: "Offers",
      content: "Sign up for our newsletter to receive updates on special offers, seasonal sales, and exclusive discounts for VIP members.",
      icon: Star
    },
    {
      id: 5,
      title: "Damage",
      category: "Returns",
      content: "If you receive a damaged item, please contact us immediately with photos of the product and packaging for a fast replacement.",
      icon: AlertCircle
    },
    {
      id: 6,
      title: "Shipment",
      category: "Shipping",
      content: "We ship orders worldwide. Domestic orders take 3-5 business days to arrive, while international shipping ranges between 7-14 business days.",
      icon: Truck
    },
    {
      id: 7,
      title: "Purchase",
      category: "Payment",
      content: "Once a purchase is confirmed, you will receive an email with your order details and a live tracking link to monitor your delivery status.",
      icon: Tag
    },
    {
      id: 8,
      title: "Customer Care Service",
      category: "Support",
      content: "You can submit an inquiry through our Contact form, write to us directly, or call our customer service hotline at 1-800-FABISH-SKIN.",
      icon: User
    },
    {
      id: 9,
      title: "Refund",
      category: "Returns",
      content: "Once we receive your return item in our warehouse, we process the inspection and issue refunds within 5-7 business days to your original payment method.",
      icon: HelpCircle
    }
  ];

  const quickHelpCards = [
    { title: 'Track Order', desc: 'Real-time courier tracking', link: '/orders/track', icon: Truck },
    { title: 'Return Product', desc: 'Hassle-free 30-day returns', link: '/pages/support', icon: ArrowLeftRight },
    { title: 'Shipping Policy', desc: 'Nationwide & Global info', link: '/pages/terms-conditions', icon: ClipboardList },
    { title: 'Contact Support', desc: 'Chat or call 24x7', link: '/pages/contact', icon: Headphones },
  ];

  const relatedGuides = [
    { title: 'Complete Shipping & Logistics Guide', desc: 'Everything about 48h express dispatch and temperature-controlled delivery.', category: 'Shipping' },
    { title: '30-Day Money Back & Exchange Policy', desc: 'Step-by-step instructions on returning unopened items.', category: 'Returns' },
    { title: 'Dermatologist Routine Selection Guide', desc: 'How to choose formulas tailored for sensitive, oily, or dry skin types.', category: 'Skincare' },
    { title: 'Fabish VIP Rewards Program', desc: 'Earn points on every purchase and unlock exclusive member perks.', category: 'Rewards' }
  ];

  const trustBadges = [
    { title: '256-Bit Encryption', desc: 'Bank-Grade Payment Security', icon: Lock },
    { title: '30-Day Easy Returns', desc: '100% Satisfaction Guarantee', icon: RefreshCw },
    { title: 'Express Delivery', desc: 'Free Shipping Over ₹2000', icon: Truck },
    { title: 'Dermatologist Tested', desc: 'Clinical Grade Formulations', icon: ShieldCheck },
    { title: '100% Cruelty Free', desc: 'Leaping Bunny Certified', icon: Sparkles },
    { title: 'Bio-Active Extracts', desc: '100% Organically Sourced', icon: Leaf }
  ];

  // Filter FAQs based on Search Query & Selected Category
  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q);

      const matchesCat =
        selectedCat === 'All' ||
        item.category.toLowerCase() === selectedCat.toLowerCase() ||
        item.title.toLowerCase().includes(selectedCat.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCat]);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div className="w-full bg-[#faf9f5] font-body text-[#1c2415] selection:bg-[#729855] selection:text-white min-h-screen overflow-x-hidden">

      {/* =========================================================
         1. HERO SECTION (Scandinavian Luxury Support Center)
         ========================================================= */}
      <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-[#f4f2e6] via-[#edebe0] to-[#faf9f5] border-b border-[#e2dfce] px-4 sm:px-8 lg:px-16 overflow-hidden">
        {/* Ambient Glow Effects */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#729855]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#d2e2c5]/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

        <div className="max-w-[1340px] w-full mx-auto relative z-10 text-center">

          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] mb-4">
            <Link to="/" className="hover:text-[#3a4d23] transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#1c2415]">Help Center & FAQs</span>
          </div>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#e2dfce] text-[10px] font-heading font-bold uppercase tracking-widest text-[#3a4d23] shadow-sm mb-4">
            <Headphones size={12} className="text-[#729855]" />
            24x7 Customer Support Center
          </span>

          <h1 className="font-heading font-medium text-4xl sm:text-5xl lg:text-6xl text-[#1c2415] leading-tight tracking-tight mb-4 max-w-4xl mx-auto">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 font-body font-light text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Everything you need to know about Fabish botanical products, nationwide shipping, secure payments, and 30-day returns.
          </p>

          {/* 2. SMART SEARCH BAR (Sticky on Scroll) */}
          <div className="sticky top-20 z-30 max-w-2xl mx-auto">
            <div className="relative bg-white/95 backdrop-blur-xl border border-[#e2dfce] rounded-full p-2 shadow-xl flex items-center">
              <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search FAQs (e.g. shipping, returns, payment, tracking)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none px-4 py-2.5 text-sm text-[#1c2415] focus:outline-none placeholder-gray-400 font-body"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 text-xs font-bold text-gray-400 hover:text-black bg-transparent border-none cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Popular Tag Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs text-gray-500 font-body">
            <span className="font-semibold text-[#1c2415]">Popular:</span>
            {['All', 'Payment', 'Order', 'Shipping', 'Returns', 'Offers', 'Support'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1 rounded-full font-heading text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${selectedCat === cat
                    ? 'bg-[#3a4d23] text-white shadow-sm'
                    : 'bg-white/80 hover:bg-white text-gray-700 border border-[#e2dfce]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================
         5. FEATURED QUICK HELP CARDS
         ========================================================= */}
      <section className="py-12 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickHelpCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <Link
                  to={card.link}
                  className="bg-white border border-[#e2dfce] rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group block no-underline"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#eef4ea] text-[#3a4d23] flex items-center justify-center flex-shrink-0 group-hover:bg-[#3a4d23] group-hover:text-white transition-colors duration-300">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-base text-[#1c2415] group-hover:text-[#729855] transition-colors">{card.title}</h3>
                    <p className="text-xs text-gray-500 font-body font-light">{card.desc}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>


      {/* =========================================================
         4. FAQ ACCORDION GRID (Preserving all 10 items)
         ========================================================= */}
      <section className="py-16 lg:py-24 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-2 block font-heading">
            SUPPORT KNOWLEDGE BASE
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-medium text-[#1c2415]">
            Detailed Support Answers
          </h2>
          <p className="text-gray-600 font-body font-light text-sm mt-2">
            Showing <strong className="text-[#1c2415]">{filteredFaqs.length}</strong> help articles
          </p>
        </div>

        {/* 2-Column Responsive Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredFaqs.map((faq) => {
            const Icon = faq.icon;
            const isOpen = openIndex === faq.id;

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`bg-white border rounded-[28px] overflow-hidden transition-all duration-300 shadow-sm ${isOpen ? 'border-[#729855] ring-2 ring-[#729855]/20 shadow-md' : 'border-[#e2dfce] hover:border-gray-300'
                  }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-6 sm:p-8 flex items-center justify-between gap-4 cursor-pointer bg-transparent border-none select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-[#3a4d23] text-white' : 'bg-[#f4f2e6] text-[#1c2415]'
                      }`}>
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg sm:text-xl text-[#1c2415]">
                      {faq.title}
                    </h3>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'bg-[#3a4d23] text-white rotate-180' : 'bg-[#f4f2e6] text-[#1c2415]'
                    }`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
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
                      <div className="px-6 sm:px-8 pb-8 pt-2 border-t border-gray-100 text-sm text-gray-600 font-body font-light leading-relaxed">
                        <p className="ml-15">{faq.content}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Empty Search Result State */}
        {filteredFaqs.length === 0 && (
          <div className="bg-white border border-dashed border-[#e2dfce] rounded-[32px] p-12 text-center space-y-4 max-w-xl mx-auto">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-heading font-semibold text-2xl text-[#1c2415]">No FAQ Matches</h3>
            <p className="text-sm text-gray-500 font-body">We couldn't find any questions matching "{searchQuery}". Try searching another keyword or contact customer support directly.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCat('All'); }}
              className="px-6 py-2.5 bg-[#3a4d23] text-white font-heading text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#1c2415] transition-colors cursor-pointer border-none"
            >
              SHOW ALL FAQS
            </button>
          </div>
        )}
      </section>


      {/* =========================================================
         6. CUSTOMER SUPPORT CHANNELS BANNER
         ========================================================= */}
      <section className="py-16 lg:py-24 px-4 sm:px-8 lg:px-16 bg-[#f4f2e6]/70 border-y border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-2 block font-heading">
              DIRECT ASSISTANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-[#1c2415]">
              Still Need Help? Talk to Our Support Team
            </h2>
            <p className="text-gray-600 font-body font-light text-sm mt-2">Average response time: &lt; 15 minutes during operating hours (9 AM - 9 PM IST)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#e2dfce] rounded-[28px] p-8 text-center space-y-4 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <MessageSquare size={26} />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#1c2415]">Live Chat Support</h3>
              <p className="text-xs text-gray-500 font-body">Chat instantly with a support representative.</p>
              <Link to="/pages/contact" className="inline-block px-6 py-3 bg-[#3a4d23] hover:bg-[#1c2415] text-white font-heading text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all">
                START CHAT
              </Link>
            </div>

            <div className="bg-white border border-[#e2dfce] rounded-[28px] p-8 text-center space-y-4 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Mail size={26} />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#1c2415]">Email Support</h3>
              <p className="text-xs text-gray-500 font-body">contact@fabish.com</p>
              <Link to="/pages/support" className="inline-block px-6 py-3 bg-[#3a4d23] hover:bg-[#1c2415] text-white font-heading text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all">
                SUBMIT TICKET
              </Link>
            </div>

            <div className="bg-white border border-[#e2dfce] rounded-[28px] p-8 text-center space-y-4 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Phone size={26} />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#1c2415]">Toll-Free Hotline</h3>
              <p className="text-xs text-gray-500 font-body">1-800-FABISH-SKIN</p>
              <a href="tel:1800322474" className="inline-block px-6 py-3 bg-[#3a4d23] hover:bg-[#1c2415] text-white font-heading text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all">
                CALL NOW
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
         7. AMAZON STYLE RECOMMENDED PRODUCTS SECTION
         ========================================================= */}
      <section className="py-16 lg:py-24 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] block mb-1">
              FEATURED BOTANICALS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-medium text-[#1c2415]">
              Recommended Best Sellers
            </h2>
          </div>
          <Link to="/collections/all" className="text-xs font-heading font-bold uppercase tracking-wider text-[#3a4d23] hover:text-[#729855] flex items-center gap-1">
            VIEW ALL <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((prod) => (
            <ProductCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      </section>


      {/* =========================================================
         8. RELATED GUIDES & ARTICLES
         ========================================================= */}
      <section className="py-16 lg:py-24 px-4 sm:px-8 lg:px-16 bg-[#f4f2e6]/50 border-t border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-2 block font-heading">
              SUPPORT GUIDES
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-[#1c2415]">
              Popular Help Documentation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedGuides.map((g, idx) => (
              <div key={idx} className="bg-white border border-[#e2dfce] rounded-[24px] p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
                <div>
                  <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#729855] block mb-2">{g.category}</span>
                  <h3 className="font-heading font-semibold text-base text-[#1c2415] group-hover:text-[#729855] transition-colors mb-2 leading-snug">{g.title}</h3>
                  <p className="text-xs text-gray-500 font-body font-light leading-relaxed">{g.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                  <Link to="/blogs/news" className="text-xs font-heading font-bold uppercase tracking-wider text-[#3a4d23] hover:text-[#729855] flex items-center gap-1">
                    READ GUIDE <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================
         9. LUXURY TRUST BADGES STRIP
         ========================================================= */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white border-y border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="p-4 space-y-2 group">
                <div className="w-10 h-10 rounded-2xl bg-[#eef4ea] text-[#3a4d23] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Icon size={20} />
                </div>
                <h4 className="font-heading font-bold text-xs text-[#1c2415]">{badge.title}</h4>
                <p className="text-[10px] text-gray-400 font-body">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </section>


      {/* =========================================================
         10. NEWSLETTER SECTION
         ========================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-r from-[#3a4d23] via-[#2a3818] to-[#1c2415] text-white relative overflow-hidden">
        <div className="max-w-[900px] mx-auto text-center space-y-6 relative z-10">
          <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-[#d2e2c5]">
            STAY INFORMED
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-medium leading-tight">
            Subscribe to Customer Support & Sales Updates
          </h2>
          <p className="text-white/80 font-body font-light text-sm sm:text-base max-w-xl mx-auto">
            Get instant alerts on sales events, order updates, and new organic formulation releases.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="w-full bg-white/90 backdrop-blur-md border-none rounded-full px-6 py-3.5 text-xs text-[#1c2415] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#729855]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#729855] hover:bg-white hover:text-[#1c2415] font-heading text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer border-none shadow-lg flex-shrink-0"
            >
              SUBSCRIBE
            </button>
          </form>

          {subscribed && (
            <p className="text-xs text-[#d2e2c5] font-bold uppercase tracking-wider animate-bounce">
              ✓ You've successfully subscribed to Fabish support dispatches!
            </p>
          )}
        </div>
      </section>

    </div>
  );
};

export default FAQ;