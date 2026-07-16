import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Heart, Eye } from 'lucide-react';
import { api } from '../api/client';
import { productService } from '../api/productService';
import Loader from '../components/ui/Loader';
import { getLocalImageUrl } from '../utils/imageMapper';
import { WishlistContext } from '../context/WishlistContext'; // Ensure this path matches your folder structure

// Enhanced path helper
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

const Blog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Global Wishlist Context
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // To track the currently clicked tag
  const [selectedTag, setSelectedTag] = useState(null);

  // Products and New Arrivals States
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Carousel controls
  const nextProduct = () => {
    if (newArrivals.length === 0) return;
    setCurrentIndex((prev) => (prev >= newArrivals.length - 1 ? 0 : prev + 1));
  };

  const prevProduct = () => {
    if (newArrivals.length === 0) return;
    setCurrentIndex((prev) => (prev <= 0 ? newArrivals.length - 1 : prev - 1));
  };

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/blogs');
      if (res.success) {
        const blogData = Array.isArray(res.data) ? res.data : (res.data?.blogs || []);
        setBlogs(blogData);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll({ newArrival: true, limit: 8 });
        if (response.success && response.data) {
          setProducts(response.data);
          setNewArrivals(response.data);
        } else {
          setProducts([]);
          setNewArrivals([]);
        }
      } catch (err) {
        console.error('Error fetching recommended products:', err);
        setProducts([]);
        setNewArrivals([]);
      }
    };
    fetchProducts();
    fetchBlogs();
  }, []);

  const activePost = useMemo(() => {
    if (!slug || !Array.isArray(blogs) || blogs.length === 0) return null;
    return blogs.find((b) => b.slug === slug);
  }, [slug, blogs]);

  // Navigate to list view if searched inside a single post
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (slug) {
      navigate('/blogs/news');
      window.scrollTo(0, 0);
    }
  };

  // Toggle tag selection and navigate to list view if needed
  const handleTagClick = (tag, e) => {
    e.preventDefault();
    setSelectedTag(prevTag => (prevTag === tag ? null : tag));
    if (slug) {
      navigate('/blogs/news');
      window.scrollTo(0, 0);
    }
  };

  // Filter blogs by both Search Query AND Selected Tag
  const filteredBlogs = Array.isArray(blogs) ? blogs.filter(blog => {
    const query = searchQuery.toLowerCase();

    const matchesSearch = query === '' ||
      blog?.title?.toLowerCase().includes(query) ||
      (blog?.content && blog.content.toLowerCase().includes(query)) ||
      (blog?.author && blog.author.toLowerCase().includes(query));

    const matchesTag = selectedTag ? (blog?.tags && blog.tags.includes(selectedTag)) : true;

    return matchesSearch && matchesTag;
  }) : [];

  const allTags = Array.isArray(blogs) ? Array.from(
    new Set(blogs.flatMap(blog => blog?.tags || []))
  ).slice(0, 10) : [];

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/assets/Blog07.jpg';
  };

  const currentArrival = newArrivals[currentIndex] || {};

  return (
    <div className="w-full bg-white font-body min-h-screen pb-24 select-none">

      {/* 1. TOP BANNER */}
      <div
        className="relative w-full h-[300px] md:h-[250px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/assets/Rectangle_337.jpg')` }}
      >
        <div className="absolute inset-0 bg-[#faf9f5]/50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-[40px] md:text-[50px] font-heading font-semibold text-[#555] mb-2 tracking-tight">
            {activePost ? 'Article' : 'News'}
          </h1>
          <p className="text-[12px] font-bold text-[#666] tracking-[0.2em] uppercase">
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">|</span>
            <Link to="/blogs/news" onClick={() => window.scrollTo(0, 0)} className="hover:text-black transition-colors">News</Link>
            {activePost && (
              <>
                <span className="mx-2">|</span>
                <span className="text-black truncate max-w-[150px] inline-block align-bottom">{activePost?.title}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* 2. MAIN BLOG CONTENT SECTION */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 lg:items-stretch items-start relative">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 text-left">
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader />
              </div>
            ) : activePost ? (
              <div className="flex flex-col animate-fade-in text-left space-y-6">

                <div>
                  <Link
                    to="/blogs/news"
                    onClick={() => {
                      setSelectedTag(null);
                      window.scrollTo(0, 0);
                    }}
                    className="inline-flex items-center gap-2 border border-[#111] hover:bg-black hover:text-white px-5 py-2.5 font-heading font-bold text-xs uppercase tracking-widest transition-all rounded-none"
                  >
                    Back to News
                  </Link>
                </div>

                <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 mb-6 shadow-sm">
                  <img
                    src={activePost.image ? `${getLocalImageUrl(activePost.image)}?t=${new Date(activePost.updatedAt || activePost.createdAt || Date.now()).getTime()}` : '/assets/Blog07.jpg'}
                    alt={activePost.title}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>

                <div className="flex items-center gap-3 text-[11px] font-bold text-[#111] tracking-[0.15em] uppercase mb-2">
                  <span>
                    {(activePost.date || activePost.createdAt)
                      ? new Date(activePost.date || activePost.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }).toUpperCase()
                      : 'DATE N/A'}
                  </span>
                  <span className="text-[#111]">|</span>
                  <span>{typeof activePost.author === 'object' ? activePost.author?.name : (activePost.author || 'Admin')}</span>
                </div>

                <h2 className="text-[32px] md:text-[42px] font-heading font-semibold text-[#111] leading-tight mb-4 select-text">
                  {activePost.title}
                </h2>

                <div
                  className="text-[16px] text-[#444] font-body leading-[1.85] space-y-6 select-text pb-8"
                  dangerouslySetInnerHTML={{ __html: activePost.content || '' }}
                />

                {Array.isArray(products) && products.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-brand-charcoal mb-6">
                      Recommended Products
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {products.slice(0, 2).map((prod) => {
                        const prodImg = getLocalImageUrl(ensureAbsolutePath(prod?.images?.[0] || prod?.image || '/assets/14.jpg'));
                        return (
                          <Link
                            key={prod._id || Math.random()}
                            to={`/products/${prod?.slug || '#'}`}
                            onClick={() => window.scrollTo(0, 0)}
                            className="flex gap-4 border border-gray-100 p-3 hover:border-[#729855] transition-colors"
                          >
                            <img src={prodImg} alt={prod?.title || 'Product'} className="w-16 h-20 object-cover bg-[#f4f5eb] shrink-0" onError={handleImageError} />
                            <div className="text-left flex flex-col justify-between">
                              <h4 className="font-heading font-semibold text-sm text-brand-charcoal line-clamp-2 leading-snug">{prod?.title || 'Product Name'}</h4>
                              <span className="text-xs font-semibold text-[#729855]">Rs. {Number(prod?.price || 0).toLocaleString('en-IN')}.00</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-gray-100 space-y-4">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-brand-charcoal">
                    Leave a Comment
                  </h3>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="text" placeholder="Name *" required className="border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#729855] rounded-none w-full bg-white" />
                      <input type="email" placeholder="Email *" required className="border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#729855] rounded-none w-full bg-white" />
                    </div>
                    <textarea placeholder="Comment *" rows={4} required className="border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#729855] rounded-none w-full bg-white"></textarea>
                    <button type="submit" className="bg-[#2f3e10] hover:bg-black text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer border-none rounded-none">
                      Post Comment
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">

                {selectedTag && (
                  <div className="col-span-1 md:col-span-2 mb-2 flex items-center justify-between bg-gray-50 p-4 border border-gray-100">
                    <span className="text-sm font-semibold text-gray-700">Showing results for tag: <span className="text-[#729855]">"{selectedTag}"</span></span>
                    <button onClick={() => setSelectedTag(null)} className="text-xs font-bold uppercase text-gray-500 hover:text-red-500 underline cursor-pointer bg-transparent border-none">Clear Filter</button>
                  </div>
                )}

                {filteredBlogs.map((blog) => (
                  <div key={blog._id || Math.random()} className="flex flex-col animate-fade-in text-left">
                    <Link to={`/blogs/news/${blog.slug}`} onClick={() => window.scrollTo(0, 0)} className="w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-6 block">
                      <img
                        src={blog.image ? `${getLocalImageUrl(blog.image)}?t=${new Date(blog.updatedAt || blog.createdAt || Date.now()).getTime()}` : '/assets/Blog07.jpg'}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        onError={handleImageError}
                      />
                    </Link>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-[#111] tracking-[0.15em] uppercase mb-4">
                      <span>
                        {(blog.date || blog.createdAt)
                          ? new Date(blog.date || blog.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          }).toUpperCase()
                          : 'DATE N/A'}
                      </span>
                      <span className="text-[#111]">|</span>
                      <span>{typeof blog.author === 'object' ? blog.author?.name : (blog.author || 'Admin')}</span>
                    </div>
                    <Link to={`/blogs/news/${blog.slug}`} onClick={() => window.scrollTo(0, 0)} className="group block mb-4">
                      <h3 className="text-[26px] md:text-[28px] font-heading font-semibold text-[#111] group-hover:text-[#729855] transition-colors duration-300 leading-[1.25]">
                        {blog.title}
                      </h3>
                    </Link>
                    <p
                      className="text-[15px] text-[#444] font-body leading-[1.8] mb-8"
                      dangerouslySetInnerHTML={{
                        __html: blog.content
                          ? blog.content.replace(/<[^>]*>/g, '').slice(0, 150) + (blog.content.length > 150 ? '...' : '')
                          : ''
                      }}
                    />
                    <div>
                      <Link to={`/blogs/news/${blog.slug}`} onClick={() => window.scrollTo(0, 0)} className="inline-block text-[12px] font-bold text-[#111] tracking-[0.15em] uppercase border-b-[2px] border-[#111] pb-1 hover:text-[#729855] hover:border-[#729855] transition-colors duration-300">
                        READ MORE
                      </Link>
                    </div>
                  </div>
                ))}

                {filteredBlogs.length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center py-20 border border-dashed border-gray-200">
                    <p className="text-gray-500 font-semibold mb-2">No articles found matching your criteria.</p>
                    {(searchQuery || selectedTag) && (
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                        className="text-[#729855] hover:underline font-bold text-sm cursor-pointer bg-transparent border-none"
                      >
                        Clear filters and see all articles
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="lg:col-span-1 shrink-0 relative">
            <div className="lg:sticky lg:top-6 lg:h-fit flex flex-col space-y-12">

              <div className="w-full">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-200 bg-transparent px-5 py-4 font-body text-[15px] text-[#111] placeholder-[#888] focus:outline-none focus:border-black rounded-none pr-14"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 px-5 flex items-center justify-center text-[#555] hover:text-black transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Search className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-[24px] font-heading font-semibold text-[#111] mb-8">
                  Recent Articles
                </h3>
                <div className="flex flex-col space-y-6">
                  {loading ? (
                    <div className="text-gray-400 italic text-xs">Loading recent articles...</div>
                  ) : (
                    Array.isArray(blogs) && blogs.slice(0, 3).map((blog) => (
                      <Link key={blog._id || Math.random()} to={`/blogs/news/${blog.slug}`} onClick={() => window.scrollTo(0, 0)} className="group flex gap-5 items-center text-left">
                        <div className="w-[85px] h-[85px] bg-gray-100 flex-shrink-0 overflow-hidden">
                          <img
                            src={blog.image ? `${getLocalImageUrl(blog.image)}?t=${new Date(blog.updatedAt || blog.createdAt || Date.now()).getTime()}` : '/assets/Blog07.jpg'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={blog.title}
                            onError={handleImageError}
                          />
                        </div>
                        <div className="flex-grow">
                          <span className="block text-[10px] font-bold text-[#111] tracking-[0.15em] uppercase mb-1.5">
                            {(blog.date || blog.createdAt)
                              ? new Date(blog.date || blog.createdAt).toLocaleDateString('en-GB', {
                                month: 'short', day: 'numeric'
                              }).toUpperCase()
                              : 'DATE N/A'}
                          </span>
                          <h4 className="text-[15px] font-heading font-semibold text-[#111] leading-snug group-hover:text-[#729855] transition-colors line-clamp-2">
                            {blog.title}
                          </h4>
                        </div>
                      </Link>
                    ))
                  )}
                  {!loading && (!Array.isArray(blogs) || blogs.length === 0) && (
                    <div className="text-gray-400 italic text-xs">No recent articles.</div>
                  )}
                </div>
              </div>

              {/* New Arrivals - Integrated with Global Context */}
              <div className="text-left mt-8">
                <h3 className="text-[24px] font-heading font-semibold text-[#111] mb-8">
                  New Arrivals
                </h3>
                {Array.isArray(newArrivals) && newArrivals.length > 0 ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-full aspect-square bg-[#f0f2eb] mb-6 relative flex items-center justify-center group cursor-pointer overflow-hidden">
                      <img
                        src={getLocalImageUrl(ensureAbsolutePath(currentArrival?.images?.[0] || currentArrival?.image || "/assets/14.jpg"))}
                        alt={currentArrival?.title || currentArrival?.name || 'New Arrival'}
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        onError={handleImageError}
                      />

                      {/* Global Wishlist Context integration */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(currentArrival); // Passing the whole product object to context
                          }}
                          className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shadow-sm transition-colors cursor-pointer border-none ${isInWishlist(currentArrival?._id)
                              ? 'bg-black text-white'
                              : 'bg-white text-[#111] hover:bg-black hover:text-white'
                            }`}
                        >
                          <Heart
                            className={`w-4 h-4 stroke-[1.5] ${isInWishlist(currentArrival?._id) ? 'fill-current' : 'fill-none'
                              }`}
                          />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/products/${currentArrival?.slug || '#'}`);
                          }}
                          className="w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-black hover:text-white transition-colors text-[#111] border-none cursor-pointer"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </button>
                      </div>
                    </div>

                    <Link to={`/products/${currentArrival?.slug || '#'}`} onClick={() => window.scrollTo(0, 0)} className="group">
                      <h4 className="text-[18px] font-heading font-semibold text-[#111] group-hover:text-[#729855] transition-colors mb-2">
                        {currentArrival?.title || currentArrival?.name || 'Product'}
                      </h4>
                    </Link>

                    <span className="text-[13px] text-[#555] font-body mb-6 block">
                      Rs. {Number(currentArrival?.price || 0).toLocaleString('en-IN')}.00 INR
                    </span>

                    <div className="flex items-center justify-center gap-6">
                      <button
                        onClick={prevProduct}
                        className="text-[#888] hover:text-[#111] transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <svg width="24" height="10" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 1L1 6L6 11M1 6H23" /></svg>
                      </button>
                      <button
                        onClick={nextProduct}
                        className="text-[#888] hover:text-[#111] transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <svg width="24" height="10" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 1L23 6L18 11M23 6H1" /></svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-gray-400 italic">
                    No products available
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div>
                <h3 className="text-[24px] font-heading font-semibold text-[#111] mb-8">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const isActive = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={(e) => handleTagClick(tag, e)}
                        className={`text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 border transition-colors cursor-pointer ${isActive
                            ? 'bg-[#729855] text-white border-[#729855]'
                            : 'text-[#555] border-gray-200 hover:text-white hover:bg-[#729855] hover:border-[#729855] bg-transparent'
                          }`}
                      >
                        {tag}
                      </button>
                    );
                  })}

                  {allTags.length === 0 && (
                    ['DARK SPOT', 'SKIN', 'SUN PROTECTION'].map(tag => {
                      const isActive = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          onClick={(e) => handleTagClick(tag, e)}
                          className={`text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 border transition-colors cursor-pointer ${isActive
                              ? 'bg-[#729855] text-white border-[#729855]'
                              : 'text-[#555] border-gray-200 hover:text-white hover:bg-[#729855] hover:border-[#729855] bg-transparent'
                            }`}
                        >
                          {tag}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Blog;