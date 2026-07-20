import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Tag, Clock, ChevronLeft, ChevronRight, AlertTriangle, BookOpen, ArrowLeft, Calendar, User } from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { api } from '../api/client';
import { getLocalImageUrl } from '../utils/imageMapper';

const ITEMS_PER_PAGE = 12;

/* ── Skeleton ───────────────────────────────────────────────── */
const ArticleSkeleton = () => (
  <div className="animate-pulse bg-white border border-[#eae8d8]">
    <div className="w-full h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-100 rounded w-20" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-16" />
    </div>
  </div>
);

/* ── Article Card ──────────────────────────────────────────── */
const ArticleCard = ({ blog, featured = false }) => {
  const imgSrc = blog.image
    ? blog.image.startsWith('http') ? blog.image : getLocalImageUrl(blog.image)
    : null;

  if (featured) {
    return (
      <Link to={`/pages/latest-news/${blog.slug}`} className="no-underline group block">
        <div className="relative w-full h-[380px] overflow-hidden bg-gray-100">
          {imgSrc ? (
            <img src={imgSrc} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-[#f0ede0] flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-[#8B5A2B] text-white px-3 py-1 mb-3">
              {blog.category || 'Featured'}
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white leading-tight mb-2 line-clamp-2">
              {blog.title}
            </h2>
            <div className="flex items-center gap-4 text-white/70 text-xs">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{blog.author || 'Admin'}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(blog.date || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {blog.readTime > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime} min read</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/pages/latest-news/${blog.slug}`} className="no-underline group block bg-white border border-[#eae8d8] hover:shadow-md transition-shadow">
      <div className="w-full h-48 overflow-hidden bg-[#f0ede0]">
        {imgSrc ? (
          <img src={imgSrc} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5A2B]">{blog.category || 'General'}</span>
        <h3 className="text-sm font-semibold text-black mt-1 mb-2 leading-snug line-clamp-2 group-hover:text-[#8B5A2B] transition-colors">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{blog.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{new Date(blog.date || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          {blog.readTime > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime} min</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

/* ── Article Detail View ──────────────────────────────────── */
const ArticleDetail = ({ slug }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentTitle(data?.blog?.metaTitle || data?.blog?.title || 'Article - Fabish');

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

  // SEO meta
  useEffect(() => {
    if (!data?.blog) return;
    const b = data.blog;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = b.metaDescription || b.excerpt || '';
  }, [data]);

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Latest News', to: '/pages/latest-news' },
    { label: data?.blog?.title || '...' },
  ];

  if (loading) {
    return (
      <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24">
        <PageBanner title="..." breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Latest News', to: '/pages/latest-news' }]} />
        <div className="max-w-[900px] mx-auto px-6 md:px-12 py-16 animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="w-full h-72 bg-gray-200 rounded mt-6" />
          {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24">
        <PageBanner title="Article Not Found" breadcrumbs={breadcrumbs.slice(0, 2)} />
        <div className="max-w-[900px] mx-auto px-6 md:px-12 py-16">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-8">
            <AlertTriangle className="w-5 h-5" />
            <p>{error || 'Article not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { blog, related } = data;
  const imgSrc = blog.image ? (blog.image.startsWith('http') ? blog.image : getLocalImageUrl(blog.image)) : null;

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24 text-left select-text">
      <PageBanner title={blog.title} breadcrumbs={breadcrumbs} titleSize="text-[28px] md:text-[32px]" />

      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-12">
        <button
          onClick={() => navigate('/pages/latest-news')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-8 bg-transparent border-none cursor-pointer p-0 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to News
        </button>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-gray-500">
          {blog.category && (
            <span className="bg-[#f0ede0] text-[#8B5A2B] font-bold uppercase tracking-wider px-3 py-1 text-[10px]">
              {blog.category}
            </span>
          )}
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{blog.author || 'Admin'}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(blog.date || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          {blog.readTime > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime} min read</span>}
          {blog.tags?.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="w-3 h-3" />
              {blog.tags.map((t) => (
                <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {imgSrc && (
          <div className="w-full h-72 md:h-96 overflow-hidden mb-8 bg-gray-100">
            <img src={imgSrc} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="bg-white border border-[#eae8d8] p-8 md:p-12 shadow-sm mb-12">
          <div
            className="prose max-w-none text-[#333] text-[15px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Related Articles */}
        {related?.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#8B5A2B] mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => <ArticleCard key={r._id} blog={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main News Listing ─────────────────────────────────────── */
const LatestNews = () => {
  const { slug } = useParams();

  // If slug is present, show detail view
  if (slug) {
    return <ArticleDetail slug={slug} />;
  }

  useDocumentTitle('Latest News - Fabish');

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

  // Debounce search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  // Fetch categories once
  useEffect(() => {
    api.get('/blogs/categories').then((res) => {
      if (res.success) setCategories(res.data || []);
    }).catch(() => {});
  }, []);

  // Fetch articles whenever filters change
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

  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Latest News' }];

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24 text-left">
      <PageBanner title="Latest News" breadcrumbs={breadcrumbs} />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12">

        {/* Search + Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search articles..."
              className="w-full bg-white border border-[#eae8d8] pl-10 pr-4 py-2.5 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveCategory('All'); setPage(1); }}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors cursor-pointer ${activeCategory === 'All' ? 'bg-black text-white border-black' : 'bg-white text-black border-[#eae8d8] hover:bg-[#f0ede0]'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors cursor-pointer ${activeCategory === cat ? 'bg-black text-white border-black' : 'bg-white text-black border-[#eae8d8] hover:bg-[#f0ede0]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <>
            <div className="w-full h-80 bg-gray-200 animate-pulse mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ArticleSkeleton key={i} />)}
            </div>
          </>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-8">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24 bg-white border border-[#eae8d8]">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-semibold text-gray-400 mb-2">
              {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No articles yet'}
            </h2>
            {debouncedSearch && (
              <button onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1); }} className="mt-3 text-sm text-[#8B5A2B] underline cursor-pointer bg-transparent border-none">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && page === 1 && !debouncedSearch && activeCategory === 'All' && (
              <div className="mb-8">
                <ArticleCard blog={featuredArticle} featured />
              </div>
            )}

            {/* Article Grid */}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {gridArticles.map((b) => <ArticleCard key={b._id} blog={b} />)}
              </div>
            )}

            {/* Show ALL articles in grid when featured is filtered */}
            {(debouncedSearch || activeCategory !== 'All') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {blogs.map((b) => <ArticleCard key={b._id} blog={b} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#eae8d8] bg-white text-black hover:bg-[#f0ede0] transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-xs text-gray-500">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#eae8d8] bg-white text-black hover:bg-[#f0ede0] transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
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
