import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  Eye,
  BookOpen,
  Clock,
  User,
  Calendar,
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  MessageSquare,
  Sparkles,
  Leaf,
  Check,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Copy,
  CheckCircle2,
  Mail,
  Send,
  ShoppingBag
} from 'lucide-react';
import { api } from '../api/client';
import { productService } from '../api/productService';
import { getLocalImageUrl } from '../utils/imageMapper';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useBlogsQuery, useBlogDetailQuery } from '../hooks/queries/useBlogsQuery';
import { useProductsQuery } from '../hooks/queries/useProductsQuery';
import ProductCard from '../components/ProductCard';

// Framer Motion Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

// Path Helper for images
const ensureAbsolutePath = (path) => {
  if (!path) return '';
  let pathStr = '';
  if (typeof path === 'string') {
    pathStr = path;
  } else if (typeof path === 'object' && path !== null) {
    pathStr = path.url || path.secure_url || '';
  }
  if (!pathStr || typeof pathStr !== 'string') return '';
  if (pathStr.includes('via.placeholder.com')) {
    pathStr = pathStr.replace('via.placeholder.com', 'placehold.co');
  }
  if (!pathStr.startsWith('/') && !pathStr.startsWith('http')) {
    return '/' + pathStr;
  }
  return pathStr;
};

// Shimmer Skeleton Loader Component
const BlogSkeleton = () => (
  <div className="bg-white border border-[#e2dfce] rounded-[24px] overflow-hidden shadow-sm animate-pulse flex flex-col justify-between">
    <div className="w-full aspect-[4/3] bg-gray-200/80" />
    <div className="p-6 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-5 bg-gray-300 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="pt-4 flex justify-between items-center border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  </div>
);

const CATEGORY_CHIPS = ['All', 'Skincare', 'Hair Care', 'Organic', 'Ingredients', 'Tips', 'Lifestyle', 'Beauty'];

const Blog = () => {
  useDocumentTitle('News & Insights — Fabish Luxury Journal');
  const { slug } = useParams();
  const navigate = useNavigate();

  // Wishlist and Cart hooks
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Server state queries
  const { data: fetchedBlogs = [], isLoading: blogsLoading } = useBlogsQuery();
  const { data: blogDetailRes } = useBlogDetailQuery(slug);
  const { data: recommendedProducts = [], isLoading: productsLoading } = useProductsQuery({ limit: 4 });

  // Local state
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState(null);
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState(new Set());
  const [copiedLink, setCopiedLink] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Fallback static blogs if backend returned empty array
  const staticBlogs = [
    {
      _id: 'b1',
      slug: 'best-cleansers-for-sensitive-skin',
      title: 'The Ultimate Guide to Calming Sensitive Skin with Botanical Actives',
      category: 'Skincare',
      author: 'Dr. Dafni Sen',
      date: '2026-03-25',
      readTime: 5,
      views: 1420,
      commentsCount: 8,
      tags: ['Sensitive Skin', 'Aloe Vera', 'Clean Beauty'],
      image: '/assets/Blog08.jpg',
      content: '<p>Sensitive skin requires biocompatible botanicals that calm inflammation without compromising the moisture barrier...</p>'
    },
    {
      _id: 'b2',
      slug: 'how-to-treat-an-infected-pimple',
      title: 'How Bio-Fermented Extracts Target Blemishes Without Drying Skin',
      category: 'Ingredients',
      author: 'Stefania Kapoor',
      date: '2026-03-24',
      readTime: 4,
      views: 980,
      commentsCount: 3,
      tags: ['Acne Care', 'Niacinamide', 'Organic'],
      image: '/assets/Blog03.jpg',
      content: '<p>Discover how bio-fermented tea tree and cold-pressed neem soothe acne while maintaining barrier hydration...</p>'
    },
    {
      _id: 'b3',
      slug: 'best-sunscreens-for-everyday-wear',
      title: 'Why Non-Nano Mineral Sunscreen is the 2026 Skincare Gold Standard',
      category: 'Tips',
      author: 'Emilia D\'Souza',
      date: '2026-03-22',
      readTime: 6,
      views: 2150,
      commentsCount: 12,
      tags: ['Sun Care', 'Antioxidants', 'Lifestyle'],
      image: '/assets/Blog07.jpg',
      content: '<p>Protecting skin from UVA/UVB rays and high-energy blue light requires physical mineral shields enriched with matcha green tea...</p>'
    }
  ];

  useEffect(() => {
    if (Array.isArray(fetchedBlogs) && fetchedBlogs.length > 0) {
      setBlogs(fetchedBlogs);
    } else {
      setBlogs(staticBlogs);
    }
  }, [fetchedBlogs]);

  // Active single article detail
  const activePost = useMemo(() => {
    if (!slug) return null;

    if (blogDetailRes?.blog) return blogDetailRes.blog;
    if (blogDetailRes && !blogDetailRes.blog && typeof blogDetailRes === 'object' && blogDetailRes.title) {
      return blogDetailRes;
    }

    if (Array.isArray(blogs) && blogs.length > 0) {
      const found = blogs.find((b) => b?.slug === slug);
      if (found) return found;
    }

    return staticBlogs.find((b) => b?.slug === slug) || null;
  }, [slug, blogDetailRes, blogs]);

  // Filtered blogs matching search + category + tag
  const filteredBlogs = useMemo(() => {
    if (!Array.isArray(blogs)) return [];
    return blogs.filter((blog) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        blog?.title?.toLowerCase().includes(q) ||
        (blog?.content && blog.content.toLowerCase().includes(q)) ||
        (typeof blog?.author === 'string' && blog.author.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' ||
        (blog?.category && blog.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchesTag = selectedTag ? (blog?.tags && blog.tags.includes(selectedTag)) : true;

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [blogs, searchQuery, selectedCategory, selectedTag]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    if (!Array.isArray(blogs)) return [];
    const tagsSet = new Set(blogs.flatMap((b) => b?.tags || []));
    if (tagsSet.size === 0) return ['Sensitive Skin', 'Clean Beauty', 'Antioxidants', 'Sun Care', 'Organic'];
    return Array.from(tagsSet).slice(0, 10);
  }, [blogs]);

  // Featured story for main grid top
  const featuredBlog = useMemo(() => {
    if (filteredBlogs.length > 0) return filteredBlogs[0];
    return blogs[0] || staticBlogs[0];
  }, [filteredBlogs, blogs]);

  const toggleBookmark = (blogSlug, e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(blogSlug)) next.delete(blogSlug);
      else next.add(blogSlug);
      return next;
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/assets/Blog07.jpg';
  };

  return (
    <div className="w-full bg-[#faf9f5] font-body text-[#1c2415] selection:bg-[#729855] selection:text-white min-h-screen overflow-x-hidden">

      {/* =========================================================
         1. LUXURY EDITORIAL HERO SECTION
         ========================================================= */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#f4f2e6] via-[#edebe0] to-[#faf9f5] border-b border-[#e2dfce] px-4 sm:px-8 lg:px-16 overflow-hidden">
        {/* Ambient Botanical Glow Elements */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#729855]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#d2e2c5]/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

        <div className="max-w-[1340px] w-full mx-auto relative z-10">

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2 text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] mb-4">
            <Link to="/" className="hover:text-[#3a4d23] transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/blogs/news" onClick={() => { setSelectedCategory('All'); setSelectedTag(null); }} className="hover:text-[#3a4d23] transition-colors">News & Journal</Link>
            {activePost && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-[#1c2415] truncate max-w-[200px]">{activePost.title}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#e2dfce] text-[10px] font-heading font-bold uppercase tracking-widest text-[#3a4d23] shadow-sm mb-4">
                <Sparkles size={12} className="text-[#729855]" />
                Fabish Skincare Journal 2026
              </span>
              <h1 className="font-heading font-medium text-4xl sm:text-5xl lg:text-6xl text-[#1c2415] leading-[1.15] tracking-tight mb-4">
                Beauty Tips, <span className="italic font-serif text-[#3a4d23]">Skincare Guides</span> & Latest Trends
              </h1>
              <p className="text-gray-600 font-body font-light text-base sm:text-lg max-w-2xl leading-relaxed">
                Explore expert botanical formulation advice, clinical skincare science, ingredient breakdowns, and holistically radiant beauty insights.
              </p>
            </div>

            {/* Quick Filter Pill Chips in Hero Header */}
            <div className="lg:col-span-4 flex flex-wrap gap-2 justify-start lg:justify-end">
              {CATEGORY_CHIPS.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (slug) navigate('/blogs/news');
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${isActive
                        ? 'bg-[#3a4d23] text-white shadow-md'
                        : 'bg-white/80 hover:bg-white text-[#1c2415] border border-[#e2dfce] shadow-sm'
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
         2. MAIN JOURNAL CONTENT & SIDEBAR WRAPPER
         ========================================================= */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-16 py-12 lg:py-20">

        {/* 3. STICKY SEARCH & CATEGORY BAR */}
        <div className="sticky top-20 z-30 mb-12 bg-white/90 backdrop-blur-xl border border-[#e2dfce] rounded-[24px] p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, ingredients, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#faf9f5] border border-[#e8e6d9] rounded-full pl-11 pr-10 py-2.5 text-xs text-[#1c2415] focus:outline-none focus:border-[#729855] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs font-bold bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tag / Category Filter Active Indicator */}
          <div className="flex items-center gap-3 text-xs">
            {(selectedTag || selectedCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedTag(null);
                }}
                className="text-[11px] font-heading font-bold uppercase tracking-wider text-rose-600 hover:underline cursor-pointer bg-transparent border-none"
              >
                Clear All Filters ✕
              </button>
            )}
            <span className="text-gray-500 font-body text-xs">
              Showing <strong className="text-[#1c2415]">{filteredBlogs.length}</strong> Articles
            </span>
          </div>
        </div>

        {/* Main Grid: Left Column Content + Right Column Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT MAIN AREA */}
          <div className="lg:col-span-8 space-y-12">

            {blogsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BlogSkeleton />
                <BlogSkeleton />
              </div>
            ) : activePost ? (

              /* =========================================================
                 SINGLE ARTICLE DETAIL VIEW
                 ========================================================= */
              <motion.article
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="bg-white border border-[#e2dfce] rounded-[32px] p-6 sm:p-10 shadow-sm space-y-8"
              >
                {/* Back to List Button */}
                <motion.div variants={fadeInUp}>
                  <Link
                    to="/blogs/news"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#faf9f5] border border-[#e2dfce] hover:bg-[#3a4d23] hover:text-white font-heading text-xs font-bold uppercase tracking-wider text-[#1c2415] transition-all"
                  >
                    <ChevronLeft size={16} /> Back to All Articles
                  </Link>
                </motion.div>

                {/* Cover Image */}
                <motion.div variants={fadeInUp} className="w-full aspect-[16/9] rounded-[24px] overflow-hidden bg-[#f4f2e6] relative">
                  <img
                    src={activePost.image ? `${getLocalImageUrl(activePost.image)}` : '/assets/Blog07.jpg'}
                    alt={activePost.title}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full font-heading text-[10px] font-bold uppercase tracking-widest text-[#3a4d23] shadow-sm">
                    {activePost.category || 'Skincare'}
                  </span>
                </motion.div>

                {/* Article Meta Header */}
                <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6 text-xs text-gray-500 font-body">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[#1c2415] font-semibold">
                      <User size={14} className="text-[#729855]" />
                      {typeof activePost.author === 'object' ? activePost.author?.name : (activePost.author || 'Admin')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(activePost.date || activePost.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {activePost.readTime || 5} min read
                    </span>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="p-2 rounded-full bg-[#faf9f5] border border-gray-200 hover:bg-[#729855] hover:text-white transition-colors cursor-pointer"
                      title="Copy Link"
                    >
                      {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => toggleBookmark(activePost.slug, { preventDefault: () => {}, stopPropagation: () => {} })}
                      className={`p-2 rounded-full border transition-colors cursor-pointer ${bookmarkedSlugs.has(activePost.slug) ? 'bg-amber-500 text-white border-amber-500' : 'bg-[#faf9f5] border-gray-200 hover:bg-amber-500 hover:text-white'}`}
                      title="Bookmark Article"
                    >
                      <Bookmark size={14} fill={bookmarkedSlugs.has(activePost.slug) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </motion.div>

                {/* Article Title */}
                <motion.h1 variants={fadeInUp} className="font-heading text-3xl sm:text-4xl text-[#1c2415] leading-tight font-medium">
                  {activePost.title}
                </motion.h1>

                {/* Article HTML Content Body */}
                <motion.div
                  variants={fadeInUp}
                  className="prose prose-lg max-w-none text-gray-700 font-body leading-relaxed space-y-6 select-text border-b border-gray-100 pb-8"
                  dangerouslySetInnerHTML={{ __html: activePost.content || '' }}
                />

                {/* Recommended Products Grid in Article View */}
                {recommendedProducts.length > 0 && (
                  <motion.div variants={fadeInUp} className="pt-6">
                    <h3 className="font-heading font-bold text-xl text-[#1c2415] mb-6 flex items-center gap-2">
                      <Sparkles size={18} className="text-[#729855]" /> Recommended Products for This Routine
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {recommendedProducts.slice(0, 2).map((prod) => (
                        <ProductCard key={prod._id || prod.id} product={prod} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Article Comment Form */}
                <motion.div variants={fadeInUp} className="pt-8 border-t border-gray-100 space-y-6">
                  <h3 className="font-heading font-bold text-xl text-[#1c2415] flex items-center gap-2">
                    <MessageSquare size={18} className="text-[#729855]" /> Leave a Comment
                  </h3>
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="text" placeholder="Your Name *" required className="w-full bg-[#faf9f5] border border-gray-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-[#729855]" />
                      <input type="email" placeholder="Your Email *" required className="w-full bg-[#faf9f5] border border-gray-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-[#729855]" />
                    </div>
                    <textarea placeholder="Share your thoughts or skin concerns..." rows={4} required className="w-full bg-[#faf9f5] border border-gray-200 rounded-2xl p-4 text-xs focus:outline-none focus:border-[#729855]" />
                    <button type="submit" className="px-8 py-3 bg-[#3a4d23] hover:bg-[#1c2415] text-white font-heading text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer border-none">
                      SUBMIT COMMENT
                    </button>
                  </form>
                </motion.div>
              </motion.article>

            ) : (

              /* =========================================================
                 BLOG LISTING VIEW & FEATURED HERO CARD
                 ========================================================= */
              <div className="space-y-12">

                {/* 2. FEATURED HERO ARTICLE CARD */}
                {featuredBlog && !searchQuery && selectedCategory === 'All' && !selectedTag && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white border border-[#e2dfce] rounded-[32px] overflow-hidden shadow-md group hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                      <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto relative overflow-hidden bg-[#f4f2e6]">
                        <img
                          src={featuredBlog.image ? `${getLocalImageUrl(featuredBlog.image)}` : '/assets/Blog08.jpg'}
                          alt={featuredBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={handleImageError}
                        />
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full font-heading text-[10px] font-bold uppercase tracking-widest text-[#3a4d23] shadow-sm">
                          FEATURED STORY
                        </span>
                      </div>

                      <div className="lg:col-span-5 p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                            <span className="font-semibold text-[#729855]">{featuredBlog.category || 'Skincare'}</span>
                            <span>•</span>
                            <span>{featuredBlog.readTime || 5} min read</span>
                          </div>
                          <Link to={`/blogs/news/${featuredBlog.slug}`} className="block group">
                            <h2 className="font-heading font-semibold text-2xl lg:text-3xl text-[#1c2415] group-hover:text-[#729855] transition-colors leading-tight mb-4">
                              {featuredBlog.title}
                            </h2>
                          </Link>
                          <p className="text-sm text-gray-600 font-body font-light line-clamp-3 leading-relaxed mb-6">
                            {featuredBlog.content ? featuredBlog.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : ''}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-semibold">{featuredBlog.author || 'Dr. Dafni Sen'}</span>
                          <Link
                            to={`/blogs/news/${featuredBlog.slug}`}
                            className="text-xs font-heading font-bold uppercase tracking-wider text-[#3a4d23] hover:text-[#729855] flex items-center gap-1 transition-colors"
                          >
                            READ STORY <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 5. EDITORIAL BLOG GRID (3 Columns / 2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                  {filteredBlogs.map((blog, idx) => (
                    <motion.div
                      key={blog._id || blog.slug || idx}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 }}
                      className="bg-white border border-[#e2dfce] rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between"
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f2e6]">
                        <Link to={`/blogs/news/${blog.slug}`}>
                          <img
                            src={blog.image ? `${getLocalImageUrl(blog.image)}` : '/assets/Blog07.jpg'}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={handleImageError}
                          />
                        </Link>
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-heading text-[10px] font-bold uppercase tracking-widest text-[#3a4d23] shadow-sm">
                          {blog.category || 'Journal'}
                        </span>
                        <button
                          onClick={(e) => toggleBookmark(blog.slug, e)}
                          className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors cursor-pointer border-none ${bookmarkedSlugs.has(blog.slug) ? 'bg-amber-500 text-white' : 'bg-white/80 text-[#1c2415] hover:bg-amber-500 hover:text-white'}`}
                        >
                          <Bookmark size={14} fill={bookmarkedSlugs.has(blog.slug) ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-6 flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex items-center gap-3 text-[11px] text-gray-400 font-body mb-2">
                            <span>{new Date(blog.date || blog.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            <span>•</span>
                            <span>{blog.readTime || 4} min read</span>
                          </div>
                          <Link to={`/blogs/news/${blog.slug}`} className="block group">
                            <h3 className="font-heading font-semibold text-xl text-[#1c2415] group-hover:text-[#729855] transition-colors leading-snug mb-3 line-clamp-2">
                              {blog.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-600 font-body font-light line-clamp-2 leading-relaxed mb-4">
                            {blog.content ? blog.content.replace(/<[^>]*>/g, '').slice(0, 110) + '...' : ''}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#1c2415]">{typeof blog.author === 'object' ? blog.author?.name : (blog.author || 'Admin')}</span>
                          <Link
                            to={`/blogs/news/${blog.slug}`}
                            className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#3a4d23] hover:text-[#729855] flex items-center gap-1 transition-colors"
                          >
                            READ MORE <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 15. EMPTY STATE */}
                {filteredBlogs.length === 0 && (
                  <div className="bg-white border border-dashed border-[#e2dfce] rounded-[32px] p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#f4f2e6] text-[#3a4d23] flex items-center justify-center mx-auto">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="font-heading font-semibold text-2xl text-[#1c2415]">No Articles Found</h3>
                    <p className="text-sm text-gray-500 font-body max-w-md mx-auto">
                      We couldn't find any journal articles matching your search query or active filter chips.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedTag(null);
                      }}
                      className="px-6 py-3 bg-[#3a4d23] text-white font-heading text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#1c2415] transition-colors cursor-pointer border-none"
                    >
                      BROWSE ALL CATEGORIES
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* RIGHT COLUMN: LUXURY STICKY SIDEBAR */}
          <div className="lg:col-span-4 space-y-8 sticky top-28">

            {/* Sidebar Author Card */}
            <div className="bg-white border border-[#e2dfce] rounded-[28px] p-6 shadow-sm text-center">
              <img src="/assets/1_2.jpg" alt="Chief Editor" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-[#729855]" onError={handleImageError} />
              <h4 className="font-heading font-bold text-lg text-[#1c2415]">Dr. Dafni Sen</h4>
              <p className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#729855] mb-2">Chief Formulator & Editor</p>
              <p className="text-xs text-gray-600 font-body font-light leading-relaxed mb-4">
                Pioneering bio-fermented botanical actives and clean Scandinavian skincare design since 2022.
              </p>
            </div>

            {/* Recent Articles Widget */}
            <div className="bg-white border border-[#e2dfce] rounded-[28px] p-6 shadow-sm">
              <h3 className="font-heading font-bold text-lg text-[#1c2415] mb-6 flex items-center gap-2">
                <Clock size={16} className="text-[#729855]" /> Recent Stories
              </h3>
              <div className="space-y-4">
                {blogs.slice(0, 3).map((b) => (
                  <Link key={b._id || b.slug} to={`/blogs/news/${b.slug}`} className="flex items-center gap-4 group">
                    <img
                      src={b.image ? `${getLocalImageUrl(b.image)}` : '/assets/Blog07.jpg'}
                      alt={b.title}
                      className="w-16 h-16 rounded-xl object-cover bg-[#f4f2e6] flex-shrink-0 group-hover:scale-105 transition-transform"
                      onError={handleImageError}
                    />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-1">
                        {new Date(b.date || b.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <h4 className="font-heading font-semibold text-xs text-[#1c2415] group-hover:text-[#729855] transition-colors line-clamp-2 leading-snug">
                        {b.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags Cloud */}
            <div className="bg-white border border-[#e2dfce] rounded-[28px] p-6 shadow-sm">
              <h3 className="font-heading font-bold text-lg text-[#1c2415] mb-4 flex items-center gap-2">
                <Tag size={16} className="text-[#729855]" /> Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isActive ? null : tag)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${isActive ? 'bg-[#729855] text-white' : 'bg-[#faf9f5] border border-gray-200 text-gray-700 hover:bg-[#729855] hover:text-white'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Product Ad Banner */}
            <div className="bg-gradient-to-br from-[#3a4d23] to-[#1c2415] rounded-[28px] p-8 text-white text-center space-y-4 shadow-xl">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-heading font-bold uppercase tracking-widest">SPOTLIGHT FORMULA</span>
              <h3 className="font-heading text-xl font-medium leading-snug">Aloe Vera Freshness Serum</h3>
              <p className="text-xs text-white/80 font-body font-light">100% bio-active cold-pressed hydration for barrier radiance.</p>
              <Link
                to="/collections/all"
                className="inline-block px-6 py-3 bg-white text-[#1c2415] hover:bg-[#d2e2c5] font-heading text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all"
              >
                SHOP NOW
              </Link>
            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
         7. AMAZON STYLE RECOMMENDED PRODUCTS SECTION
         ========================================================= */}
      <section className="py-16 lg:py-24 px-4 sm:px-8 lg:px-16 bg-[#f4f2e6]/60 border-t border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] block mb-1">
                EDITORIAL CURATION
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-medium text-[#1c2415]">
                Curated Products Featured in Journal Stories
              </h2>
            </div>
            <Link to="/collections/all" className="text-xs font-heading font-bold uppercase tracking-wider text-[#3a4d23] hover:text-[#729855] flex items-center gap-1">
              VIEW ALL <ArrowRight size={14} />
            </Link>
          </div>

          {/* Render Amazon-Inspired Product Cards using ProductCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================
         10. LUXURY NEWSLETTER SECTION
         ========================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-r from-[#3a4d23] via-[#2a3818] to-[#1c2415] text-white relative overflow-hidden">
        <div className="max-w-[900px] mx-auto text-center space-y-6 relative z-10">
          <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-[#d2e2c5]">
            BEAUTY DISPATCH
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-medium leading-tight">
            Subscribe to Fabish Beauty Journal
          </h2>
          <p className="text-white/80 font-body font-light text-sm sm:text-base max-w-xl mx-auto">
            Receive exclusive formulation insights, VIP product launches, and expert dermatologist skincare guides delivered weekly to your inbox.
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
              ✓ Thank you for subscribing to Fabish Journal!
            </p>
          )}

          <p className="text-[10px] text-white/50 font-body">We respect your privacy. Unsubscribe anytime with 1-click.</p>
        </div>
      </section>

    </div>
  );
};

export default Blog;