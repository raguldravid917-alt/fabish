import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';
import { api } from '../api/client';
import Loader from '../components/ui/Loader';
import { getLocalImageUrl } from '../utils/imageMapper';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/blogs');
      if (res.success) {
        setBlogs(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is handled by the filter below
  };

  // Filter blogs based on search query
  const filteredBlogs = blogs.filter(blog => {
    const query = searchQuery.toLowerCase();
    return (
      blog.title.toLowerCase().includes(query) ||
      (blog.content && blog.content.toLowerCase().includes(query)) ||
      (blog.author && blog.author.toLowerCase().includes(query))
    );
  });

  // Extract unique tags
  const allTags = Array.from(
    new Set(blogs.flatMap(blog => blog.tags || []))
  ).slice(0, 10);

  return (
    <div className="w-full bg-white font-body min-h-screen pb-24">

      {/* 1. TOP BANNER */}
      <div
        className="relative w-full h-[300px] md:h-[250px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/assets/Rectangle_337.jpg')` }}
      >
        <div className="absolute inset-0 bg-[#faf9f5]/50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-[40px] md:text-[50px] font-heading font-semibold text-[#555] mb-2 tracking-tight">
            News
          </h1>
          <p className="text-[12px] font-bold text-[#666] tracking-[0.2em] uppercase">
            <Link to="/" className="hover:text-black transition-colors">Home</Link> <span className="mx-2">|</span> News
          </p>
        </div>
      </div>

      {/* 2. MAIN BLOG CONTENT SECTION */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">

          {/* LEFT COLUMN: Blog Posts Grid */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {filteredBlogs.map((blog) => (
                  <div key={blog._id} className="flex flex-col animate-fade-in text-left">
                    <Link to={`/blogs/news/${blog.slug}`} className="w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-6 block">
                      <img
                        src={blog.image ? `${getLocalImageUrl(blog.image)}?t=${new Date(blog.updatedAt || blog.createdAt).getTime()}` : '/assets/Blog07.jpg'}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        onError={(e) => { e.target.src = '/assets/Rectangle_342.jpg'; }}
                      />
                    </Link>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-[#111] tracking-[0.15em] uppercase mb-4">
                      <span>
                        {new Date(blog.date || blog.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }).toUpperCase()}
                      </span>
                      <span className="text-[#111]">|</span>
                      <span>{typeof blog.author === 'object' ? blog.author?.name : (blog.author || 'Admin')}</span>
                    </div>
                    <Link to={`/blogs/news/${blog.slug}`} className="group block mb-4">
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
                      <Link to={`/blogs/news/${blog.slug}`} className="inline-block text-[12px] font-bold text-[#111] tracking-[0.15em] uppercase border-b-[2px] border-[#111] pb-1 hover:text-[#729855] hover:border-[#729855] transition-colors duration-300">
                        READ MORE
                      </Link>
                    </div>
                  </div>
                ))}
                {filteredBlogs.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-400 italic">
                    No articles found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="lg:col-span-1 flex flex-col self-stretch">

            {/* --- NON-STICKY SECTION --- */}
            <div className="flex flex-col space-y-12 mb-12">
              {/* Search Bar */}
              <div className="w-full">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-200 bg-transparent px-5 py-4 font-body text-[15px] text-[#111] placeholder-[#888] focus:outline-none focus:border-black rounded-none pr-14"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 px-5 flex items-center justify-center text-[#555] hover:text-black transition-colors"
                  >
                    <Search className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </form>
              </div>

              {/* Recent Articles */}
              <div>
                <h3 className="text-[24px] font-heading font-semibold text-[#111] mb-8">
                  Recent Articles
                </h3>

                <div className="flex flex-col space-y-6">
                  {loading ? (
                    <div className="text-gray-400 italic text-xs">Loading recent articles...</div>
                  ) : (
                    blogs.slice(0, 3).map((blog) => (
                      <Link key={blog._id} to={`/blogs/news/${blog.slug}`} className="group flex gap-5 items-center text-left">
                        <div className="w-[85px] h-[85px] bg-gray-100 flex-shrink-0 overflow-hidden">
                          <img 
                            src={blog.image ? `${getLocalImageUrl(blog.image)}?t=${new Date(blog.updatedAt || blog.createdAt).getTime()}` : '/assets/Blog07.jpg'} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            alt={blog.title} 
                            onError={(e) => { e.target.src = '/assets/Rectangle_342.jpg'; }} 
                          />
                        </div>
                        <div className="flex-grow">
                          <span className="block text-[10px] font-bold text-[#111] tracking-[0.15em] uppercase mb-1.5">
                            {new Date(blog.date || blog.createdAt).toLocaleDateString('en-GB', {
                              month: 'short',
                              day: 'numeric'
                            }).toUpperCase()}
                          </span>
                          <h4 className="text-[15px] font-heading font-semibold text-[#111] leading-snug group-hover:text-[#729855] transition-colors line-clamp-2">
                            {blog.title}
                          </h4>
                        </div>
                      </Link>
                    ))
                  )}
                  {!loading && blogs.length === 0 && (
                    <div className="text-gray-400 italic text-xs">No recent articles.</div>
                  )}
                </div>
              </div>
            </div>

            {/* --- STICKY SECTION (New Arrivals & Tags) --- */}
            <div className="sticky top-0 flex flex-col space-y-12">

              {/* New Arrivals */}
              <div>
                <h3 className="text-[24px] font-heading font-semibold text-[#111] mb-8">
                  New Arrivals
                </h3>
                <div className="flex flex-col items-center text-center">
                  <div className="w-full aspect-square bg-[#f0f2eb] mb-6 relative flex items-center justify-center group cursor-pointer overflow-hidden">
                    <img
                      src="/assets/Rectangle_338.jpg"
                      alt="Azalea Fields"
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = '/assets/14.jpg'; }}
                    />

                    {/* Hover Icons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <button className="w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-black hover:text-white transition-colors text-[#111]">
                        <Heart className="w-4 h-4 stroke-[1.5]" />
                      </button>
                      <button className="w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-black hover:text-white transition-colors text-[#111]">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                      </button>
                    </div>
                  </div>
                  <Link to="/products/azalea-fields" className="group">
                    <h4 className="text-[18px] font-heading font-semibold text-[#111] group-hover:text-[#729855] transition-colors mb-2">
                      Azalea Fields Soothing Cream
                    </h4>
                  </Link>
                  <span className="text-[13px] text-[#555] font-body mb-6">Rs. 24,200.00 INR</span>

                  {/* Carousel Arrows */}
                  <div className="flex items-center justify-center gap-6">
                    <button className="text-[#888] hover:text-[#111] transition-colors">
                      <svg width="24" height="10" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 1L1 6L6 11M1 6H23" /></svg>
                    </button>
                    <button className="text-[#888] hover:text-[#111] transition-colors">
                      <svg width="24" height="10" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 1L23 6L18 11M23 6H1" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-[24px] font-heading font-semibold text-[#111] mb-8">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Link key={tag} to="#" className="text-[11px] font-bold text-[#555] tracking-[0.15em] uppercase px-4 py-2 border border-gray-200 hover:text-white hover:bg-[#729855] hover:border-[#729855] transition-colors">
                      {tag}
                    </Link>
                  ))}
                  {allTags.length === 0 && (
                    <>
                      <Link to="#" className="text-[11px] font-bold text-[#555] tracking-[0.15em] uppercase px-4 py-2 border border-gray-200 hover:text-white hover:bg-[#729855] hover:border-[#729855] transition-colors">
                        DARK SPOT
                      </Link>
                      <Link to="#" className="text-[11px] font-bold text-[#555] tracking-[0.15em] uppercase px-4 py-2 border border-gray-200 hover:text-white hover:bg-[#729855] hover:border-[#729855] transition-colors">
                        SKIN
                      </Link>
                      <Link to="#" className="text-[11px] font-bold text-[#555] tracking-[0.15em] uppercase px-4 py-2 border border-gray-200 hover:text-white hover:bg-[#729855] hover:border-[#729855] transition-colors">
                        SUN PROTECTION
                      </Link>
                    </>
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