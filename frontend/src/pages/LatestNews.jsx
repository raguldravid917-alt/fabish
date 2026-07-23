import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Tag,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  Calendar,
  User,
  Sparkles,
  Leaf,
  Check,
  Bookmark,
  Share2,
  Copy,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { api } from '../api/client';
import { getLocalImageUrl } from '../utils/imageMapper';
import { useWishlist } from '../hooks/useWishlist';
import { useProductsQuery } from '../hooks/queries/useProductsQuery';
import ProductCard from '../components/ProductCard';

const ITEMS_PER_PAGE = 12;

/* ── Shimmer Skeleton ─────────────────────────────────────────────── */
const ArticleSkeleton = () => (
  <div className="animate-pulse bg-white border border-[#e2dfce] rounded-[24px] overflow-hidden shadow-sm">
    <div className="w-full aspect-[4/3] bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-24" />
      <div className="h-5 bg-gray-300 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="pt-4 flex justify-between items-center border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
    </div>
  </div>
);

/* ── Article Card Component ──────────────────────────────────────── */
const ArticleCard = ({ blog, featured = false }) => {
  const imgSrc = blog.image
    ? (blog.image.startsWith('http') ? blog.image : getLocalImageUrl(blog.image))
    : '/assets/Blog07.jpg';

  if (featured) {
    return (
      <Link to={`/pages/latest-news/${blog.slug}`} className="no-underline group block">
        <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-[32px] overflow-hidden shadow-xl border border-[#e2dfce] bg-[#f4f2e6]">
          <img
            src={imgSrc}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
            <span className="inline-block text-[10px] font-heading font-bold uppercase tracking-widest bg-[#3a4d23] text-white px-3.5 py-1 rounded-full mb-4 shadow-sm">
              {blog.category || 'Featured Story'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-medium text-white leading-tight mb-3 line-clamp-2">
              {blog.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-xs font-body font-light">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#d2e2c5]" />{blog.author || 'Dr. Dafni Sen'}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(blog.date || blog.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {blog.readTime > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{blog.readTime} min read</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/pages/latest-news/${blog.slug}`} className="no-underline group block">
      <div className="bg-white border border-[#e2dfce] rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f2e6]">
          <img
            src={imgSrc}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-heading text-[10px] font-bold uppercase tracking-widest text-[#3a4d23] shadow-sm">
            {blog.category || 'Journal'}
          </span>
        </div>
        <div className="p-6 flex flex-col justify-between flex-grow">
          <div>
            <div className="flex items-center gap-3 text-[11px] text-gray-400 font-body mb-2">
              <span>{new Date(blog.date || blog.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              {blog.readTime > 0 && (
                <>
                  <span>•</span>
                  <span>{blog.readTime} min read</span>
                </>
              )}
            </div>
            <h3 className="font-heading font-semibold text-lg text-[#1c2415] group-hover:text-[#729855] transition-colors leading-snug mb-2 line-clamp-2">
              {blog.title}
            </h3>
            {blog.excerpt && (
              <p className="text-xs text-gray-600 font-body font-light line-clamp-2 leading-relaxed mb-4">{blog.excerpt}</p>
            )}
          </div>
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1c2415]">{blog.author || 'Admin'}</span>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#3a4d23] group-hover:text-[#729855] flex items-center gap-1 transition-colors">
              READ MORE <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ── Article Detail View Component ───────────────────────────── */
const ArticleDetail = ({ slug }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: recommendedProducts = [] } = useProductsQuery({ limit: 4 });

  useDocumentTitle(data?.blog?.metaTitle || data?.blog?.title || 'Article - Fabish Journal');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/blogs/${slug}`);
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Article not found');
        }
      } catch {
        setError('Could not load article');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full bg-[#faf9f5] font-body min-h-screen py-24 px-4 sm:px-8">
        <div className="max-w-[900px] mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="w-full h-80 bg-gray-200 rounded-[32px] mt-6" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-[#faf9f5] font-body min-h-screen py-24 px-4 sm:px-8">
        <div className="max-w-[900px] mx-auto bg-white border border-red-200 rounded-[32px] p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-heading font-semibold text-2xl text-[#1c2415]">Article Not Found</h2>
          <p className="text-sm text-gray-500 font-body">{error || 'Could not locate requested journal entry.'}</p>
          <button
            onClick={() => navigate('/pages/latest-news')}
            className="px-6 py-3 bg-[#3a4d23] text-white font-heading text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#1c2415] transition-colors cursor-pointer border-none"
          >
            RETURN TO LATEST NEWS
          </button>
        </div>
      </div>
    );
  }

  const { blog, related } = data;
  const imgSrc = blog.image ? (blog.image.startsWith('http') ? blog.image : getLocalImageUrl(blog.image)) : '/assets/Blog07.jpg';

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen py-16 px-4 sm:px-8 lg:px-16 selection:bg-[#729855] selection:text-white">
      <div className="max-w-[950px] mx-auto space-y-8">

        {/* Back Button */}
        <button
          onClick={() => navigate('/pages/latest-news')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#e2dfce] hover:bg-[#3a4d23] hover:text-white font-heading text-xs font-bold uppercase tracking-wider text-[#1c2415] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Latest News
        </button>

        {/* Article Header Card */}
        <article className="bg-white border border-[#e2dfce] rounded-[32px] p-6 sm:p-12 shadow-sm space-y-8">
          {/* Cover Visual */}
          {imgSrc && (
            <div className="w-full aspect-[16/9] rounded-[24px] overflow-hidden bg-[#f4f2e6] relative">
              <img src={imgSrc} alt={blog.title} className="w-full h-full object-cover" />
              {blog.category && (
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full font-heading text-[10px] font-bold uppercase tracking-widest text-[#3a4d23] shadow-sm">
                  {blog.category}
                </span>
              )}
            </div>
          )}

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6 text-xs text-gray-500 font-body">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#1c2415] font-semibold">
                <User size={14} className="text-[#729855]" />
                {blog.author || 'Admin'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(blog.date || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {blog.readTime > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} />{blog.readTime} min read</span>
                </>
              )}
            </div>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-full bg-[#faf9f5] border border-gray-200 hover:bg-[#729855] hover:text-white transition-colors cursor-pointer"
              title="Copy Link"
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl text-[#1c2415] leading-tight font-medium">
            {blog.title}
          </h1>

          {/* Content Body */}
          <div
            className="prose prose-lg max-w-none text-gray-700 font-body leading-relaxed space-y-6 select-text border-b border-gray-100 pb-8"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Recommended Products Grid in Article */}
          {recommendedProducts.length > 0 && (
            <div className="pt-6">
              <h3 className="font-heading font-bold text-xl text-[#1c2415] mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-[#729855]" /> Recommended Skincare Products
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recommendedProducts.slice(0, 2).map((prod) => (
                  <ProductCard key={prod._id || prod.id} product={prod} />
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Related Articles */}
        {related?.length > 0 && (
          <div className="pt-8">
            <h2 className="font-heading font-bold text-xl text-[#1c2415] mb-6">Related Journal Entries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((r) => <ArticleCard key={r._id} blog={r} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* ── Main News Listing Component ───────────────────────────── */
const LatestNews = () => {
  const { slug } = useParams();

  if (slug) {
    return <ArticleDetail slug={slug} />;
  }

  useDocumentTitle('Latest News & Journal — Fabish Skincare');

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const searchTimer = useRef(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  useEffect(() => {
    api.get('/blogs/categories').then((res) => {
      if (res.success) setCategories(res.data || []);
    }).catch(() => {});
  }, []);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        ...(activeCategory !== 'All' && { category: activeCategory }),
        ...(debouncedSearch && { search: debouncedSearch }),
      };
      const res = await api.get('/blogs', { params });
      if (res.success) {
        setBlogs(res.data || res.blogs || []);
        setPagination(res.pagination || null);
      } else {
        setError(res.message || 'Failed to load news');
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, debouncedSearch]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const featuredArticle = blogs.find((b) => b.featured) || blogs[0];
  const gridArticles = featuredArticle
    ? blogs.filter((b) => b._id !== featuredArticle._id)
    : [];

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24 text-left select-none overflow-x-hidden">
      
      {/* 1. HERO HEADER */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#f4f2e6] via-[#edebe0] to-[#faf9f5] border-b border-[#e2dfce] px-4 sm:px-8 lg:px-16 overflow-hidden">
        <div className="max-w-[1340px] mx-auto relative z-10">
          <div className="flex items-center gap-2 text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] mb-4">
            <Link to="/" className="hover:text-[#3a4d23] transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#1c2415]">Latest News</span>
          </div>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#e2dfce] text-[10px] font-heading font-bold uppercase tracking-widest text-[#3a4d23] shadow-sm mb-4">
            <Sparkles size={12} className="text-[#729855]" />
            Editorial Newsroom 2026
          </span>
          
          <h1 className="font-heading font-medium text-4xl sm:text-5xl lg:text-6xl text-[#1c2415] leading-tight tracking-tight mb-4">
            Latest News & Skincare Stories
          </h1>
          <p className="text-gray-600 font-body font-light text-base sm:text-lg max-w-2xl leading-relaxed">
            Discover breaking organic formulation announcements, botanical ingredient research, and clinical skincare updates.
          </p>
        </div>
      </section>

      {/* 2. MAIN NEWS AREA */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-16 py-12 lg:py-16 space-y-12">

        {/* Search & Category Filter Bar */}
        <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-xl border border-[#e2dfce] rounded-[24px] p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search news articles..."
              className="w-full bg-[#faf9f5] border border-[#e8e6d9] rounded-full pl-11 pr-10 py-2.5 text-xs text-[#1c2415] focus:outline-none focus:border-[#729855]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveCategory('All'); setPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${activeCategory === 'All' ? 'bg-[#3a4d23] text-white shadow-md' : 'bg-white hover:bg-gray-50 text-[#1c2415] border border-[#e2dfce]'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${activeCategory === cat ? 'bg-[#3a4d23] text-white shadow-md' : 'bg-white hover:bg-gray-50 text-[#1c2415] border border-[#e2dfce]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid / Content States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <ArticleSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-[24px] flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-[#e2dfce] rounded-[32px] space-y-4">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-2" />
            <h3 className="font-heading font-semibold text-2xl text-[#1c2415]">No Articles Found</h3>
            <p className="text-sm text-gray-500 font-body max-w-sm mx-auto">We couldn't find any news entries matching your search filter.</p>
            {debouncedSearch && (
              <button
                onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1); }}
                className="px-6 py-2.5 bg-[#3a4d23] text-white font-heading text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer border-none"
              >
                CLEAR SEARCH
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && page === 1 && !debouncedSearch && activeCategory === 'All' && (
              <div className="mb-10">
                <ArticleCard blog={featuredArticle} featured />
              </div>
            )}

            {/* Grid Articles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridArticles.map((b) => <ArticleCard key={b._id} blog={b} />)}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8 border-t border-[#e2dfce]">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-heading font-bold uppercase tracking-wider border border-[#e2dfce] bg-white text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-xs text-gray-500 font-heading font-bold uppercase tracking-wider">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-heading font-bold uppercase tracking-wider border border-[#e2dfce] bg-white text-[#1c2415] hover:bg-[#3a4d23] hover:text-white transition-all disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default LatestNews;
