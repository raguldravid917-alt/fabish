import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">

              {/* Blog Post 1 */}
              <div className="flex flex-col">
                <Link to="/blogs/news/best-cleansers-for-sensitive-skin" className="w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-6 block">
                  <img
                    src="/assets/Blog07.jpg"
                    alt="Best Cleansers For Sensitive Skin"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => { e.target.src = '/assets/Rectangle_342.jpg'; }}
                  />
                </Link>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#111] tracking-[0.15em] uppercase mb-4">
                  <span>25 MAR 2024</span>
                  <span className="text-[#111]">|</span>
                  <span>3 COMMENTS</span>
                </div>
                <Link to="/blogs/news/best-cleansers-for-sensitive-skin" className="group block mb-4">
                  <h3 className="text-[26px] md:text-[28px] font-heading font-semibold text-[#111] group-hover:text-[#729855] transition-colors duration-300 leading-[1.25]">
                    Best Cleansers For Sensitive Skin
                  </h3>
                </Link>
                <p className="text-[15px] text-[#444] font-body leading-[1.8] mb-8">
                  Sit amet justo donec enim diam vulputate ut pharetra sit. Risus sed vulputate odio ut enim blandit. Dictumst vestibulum rhoncus est pellentesque elit. Semper risus...
                </p>
                <div>
                  <Link to="/blogs/news/best-cleansers-for-sensitive-skin" className="inline-block text-[12px] font-bold text-[#111] tracking-[0.15em] uppercase border-b-[2px] border-[#111] pb-1 hover:text-[#729855] hover:border-[#729855] transition-colors duration-300">
                    READ MORE
                  </Link>
                </div>
              </div>

              {/* Blog Post 2 */}
              <div className="flex flex-col">
                <Link to="/blogs/news/how-to-treat-an-infected-pimple" className="w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-6 block">
                  <img
                    src="/assets/Rectangle_338.jpg"
                    alt="How To Treat An Infected Pimple"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => { e.target.src = '/assets/1_3.jpg'; }}
                  />
                </Link>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#111] tracking-[0.15em] uppercase mb-4">
                  <span>25 MAR 2024</span>
                  <span className="text-[#111]">|</span>
                  <span>1 COMMENT</span>
                </div>
                <Link to="/blogs/news/how-to-treat-an-infected-pimple" className="group block mb-4">
                  <h3 className="text-[26px] md:text-[28px] font-heading font-semibold text-[#111] group-hover:text-[#729855] transition-colors duration-300 leading-[1.25]">
                    How To Treat An Infected Pimple
                  </h3>
                </Link>
                <p className="text-[15px] text-[#444] font-body leading-[1.8] mb-8">
                  Laoreet suspendisse interdum consectetur libero id faucibus. Tortor at risus viverra adipiscing at in. Cursus euismod quis viverra nibh cras. Magnis dis parturient montes nascetur...
                </p>
                <div>
                  <Link to="/blogs/news/how-to-treat-an-infected-pimple" className="inline-block text-[12px] font-bold text-[#111] tracking-[0.15em] uppercase border-b-[2px] border-[#111] pb-1 hover:text-[#729855] hover:border-[#729855] transition-colors duration-300">
                    READ MORE
                  </Link>
                </div>
              </div>

              {/* Blog Post 3 */}
              <div className="flex flex-col">
                <Link to="/blogs/news/best-sunscreens-for-everyday-wear" className="w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-6 block">
                  <img
                    src="/assets/Blog08.jpg"
                    alt="Best Sunscreens For Everyday Wear"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => { e.target.src = '/assets/14.jpg'; }}
                  />
                </Link>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#111] tracking-[0.15em] uppercase mb-4">
                  <span>25 MAR 2024</span>
                  <span className="text-[#111]">|</span>
                  <span>1 COMMENT</span>
                </div>
                <Link to="/blogs/news/best-sunscreens-for-everyday-wear" className="group block mb-4">
                  <h3 className="text-[26px] md:text-[28px] font-heading font-semibold text-[#111] group-hover:text-[#729855] transition-colors duration-300 leading-[1.25]">
                    Best Sunscreens For Everyday Wear
                  </h3>
                </Link>
                <p className="text-[15px] text-[#444] font-body leading-[1.8] mb-8">
                  Erat pellentesque adipiscing commodo elit at. Ut pharetra sit amet aliquam id diam maecenas. Dictum fusce ut placerat orci nulla pellentesque dignissim. Pellentesque diam volutpat...
                </p>
                <div>
                  <Link to="/blogs/news/best-sunscreens-for-everyday-wear" className="inline-block text-[12px] font-bold text-[#111] tracking-[0.15em] uppercase border-b-[2px] border-[#111] pb-1 hover:text-[#729855] hover:border-[#729855] transition-colors duration-300">
                    READ MORE
                  </Link>
                </div>
              </div>

              {/* Blog Post 4 */}
              <div className="flex flex-col">
                <Link to="/blogs/news/the-different-types-of-face-cleansers" className="w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-6 block">
                  <img
                    src="/assets/Rectangle_340.jpg"
                    alt="The Different Types Of Face Cleansers"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => { e.target.src = '/assets/14.jpg'; }}
                  />
                </Link>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#111] tracking-[0.15em] uppercase mb-4">
                  <span>25 MAR 2024</span>
                  <span className="text-[#111]">|</span>
                  <span>1 COMMENT</span>
                </div>
                <Link to="/blogs/news/the-different-types-of-face-cleansers" className="group block mb-4">
                  <h3 className="text-[26px] md:text-[28px] font-heading font-semibold text-[#111] group-hover:text-[#729855] transition-colors duration-300 leading-[1.25]">
                    The Different Types Of Face Cleansers
                  </h3>
                </Link>
                <p className="text-[15px] text-[#444] font-body leading-[1.8] mb-8">
                  Posuere morbi leo urna molestie at elementum eu facilisis sed. Quis commodo odio aenean sed adipiscing. Tincidunt vitae semper quis lectus nulla at. A lacus...
                </p>
                <div>
                  <Link to="/blogs/news/the-different-types-of-face-cleansers" className="inline-block text-[12px] font-bold text-[#111] tracking-[0.15em] uppercase border-b-[2px] border-[#111] pb-1 hover:text-[#729855] hover:border-[#729855] transition-colors duration-300">
                    READ MORE
                  </Link>
                </div>
              </div>

              {/* Blog Post 5 */}
              <div className="flex flex-col">
                <Link to="/blogs/news/how-hormones-affect-your-skin" className="w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-6 block">
                  <img
                    src="/assets/Blog09.jpg"
                    alt="How Hormones Affect Your Skin?"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => { e.target.src = '/assets/14.jpg'; }}
                  />
                </Link>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#111] tracking-[0.15em] uppercase mb-4">
                  <span>25 MAR 2024</span>
                  <span className="text-[#111]">|</span>
                  <span>1 COMMENT</span>
                </div>
                <Link to="/blogs/news/how-hormones-affect-your-skin" className="group block mb-4">
                  <h3 className="text-[26px] md:text-[28px] font-heading font-semibold text-[#111] group-hover:text-[#729855] transition-colors duration-300 leading-[1.25]">
                    How Hormones Affect Your Skin?
                  </h3>
                </Link>
                <p className="text-[15px] text-[#444] font-body leading-[1.8] mb-8">
                  Neque sodales ut etiam sit amet nisl purus in mollis. Lacinia quis vel eros donec ac odio tempor orci. Adipiscing commodo elit at imperdiet dui...
                </p>
                <div>
                  <Link to="/blogs/news/how-hormones-affect-your-skin" className="inline-block text-[12px] font-bold text-[#111] tracking-[0.15em] uppercase border-b-[2px] border-[#111] pb-1 hover:text-[#729855] hover:border-[#729855] transition-colors duration-300">
                    READ MORE
                  </Link>
                </div>
              </div>

              {/* Blog Post 6 */}
              <div className="flex flex-col">
                <Link to="/blogs/news/dermatologist-recommended-skin-care" className="w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-6 block">
                  <img
                    src="/assets/Blog10.jpg"
                    alt="Dermatologist Recommended Skin Care"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => { e.target.src = '/assets/1_2.jpg'; }}
                  />
                </Link>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#111] tracking-[0.15em] uppercase mb-4">
                  <span>25 MAR 2024</span>
                  <span className="text-[#111]">|</span>
                  <span>2 COMMENTS</span>
                </div>
                <Link to="/blogs/news/dermatologist-recommended-skin-care" className="group block mb-4">
                  <h3 className="text-[26px] md:text-[28px] font-heading font-semibold text-[#111] group-hover:text-[#729855] transition-colors duration-300 leading-[1.25]">
                    Dermatologist Recommended Skin Care
                  </h3>
                </Link>
                <p className="text-[15px] text-[#444] font-body leading-[1.8] mb-8">
                  Molestie at elementum eu facilisis sed odio. Enim nulla aliquet porttitor lacus. Id consectetur purus ut faucibus pulvinar elementum. Morbi tristique senectus et netus et....
                </p>
                <div>
                  <Link to="/blogs/news/dermatologist-recommended-skin-care" className="inline-block text-[12px] font-bold text-[#111] tracking-[0.15em] uppercase border-b-[2px] border-[#111] pb-1 hover:text-[#729855] hover:border-[#729855] transition-colors duration-300">
                    READ MORE
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          {/* STICKY CLASSES ADDED HERE: lg:sticky lg:top-[120px] lg:self-start */}
          {/* RIGHT COLUMN: Sidebar */}
          {/* RIGHT COLUMN: Sidebar */}
          {/* Sticky Fix: 'self-stretch' add panniruken, appo thaan left column height-ku ithuvum stretch aagi sticky work aagum */}
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
                  {/* Article 1 */}
                  <Link to="#" className="group flex gap-5 items-center">
                    <div className="w-[85px] h-[85px] bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img src="/assets/Blog07.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Recent 1" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="flex-grow">
                      <span className="block text-[10px] font-bold text-[#111] tracking-[0.15em] uppercase mb-1.5">MAR 25</span>
                      <h4 className="text-[15px] font-heading font-semibold text-[#111] leading-snug group-hover:text-[#729855] transition-colors line-clamp-2">
                        Best cleansers for sensitive skin
                      </h4>
                    </div>
                  </Link>

                  {/* Article 2 */}
                  <Link to="#" className="group flex gap-5 items-center">
                    <div className="w-[85px] h-[85px] bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img src="/assets/Rectangle_338.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Recent 2" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="flex-grow">
                      <span className="block text-[10px] font-bold text-[#111] tracking-[0.15em] uppercase mb-1.5">MAR 25</span>
                      <h4 className="text-[15px] font-heading font-semibold text-[#111] leading-snug group-hover:text-[#729855] transition-colors line-clamp-2">
                        How To Treat An Infected Pimple
                      </h4>
                    </div>
                  </Link>

                  {/* Article 3 */}
                  <Link to="#" className="group flex gap-5 items-center">
                    <div className="w-[85px] h-[85px] bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img src="/assets/Blog08.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Recent 3" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="flex-grow">
                      <span className="block text-[10px] font-bold text-[#111] tracking-[0.15em] uppercase mb-1.5">MAR 25</span>
                      <h4 className="text-[15px] font-heading font-semibold text-[#111] leading-snug group-hover:text-[#729855] transition-colors line-clamp-2">
                        Best sunscreens for everyday wear
                      </h4>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* --- STICKY SECTION (New Arrivals & Tags) --- */}
            {/* 'top-[100px]' ah 'top-0' nu maathiyachu, so extra white space varathu */}
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
                  <Link to="#" className="text-[11px] font-bold text-[#555] tracking-[0.1em] uppercase px-4 py-2 border border-gray-200 hover:text-white hover:bg-[#729855] hover:border-[#729855] transition-colors">
                    DARK SPOT
                  </Link>
                  <Link to="#" className="text-[11px] font-bold text-[#555] tracking-[0.1em] uppercase px-4 py-2 border border-gray-200 hover:text-white hover:bg-[#729855] hover:border-[#729855] transition-colors">
                    SKIN
                  </Link>
                  <Link to="#" className="text-[11px] font-bold text-[#555] tracking-[0.1em] uppercase px-4 py-2 border border-gray-200 hover:text-white hover:bg-[#729855] hover:border-[#729855] transition-colors">
                    SUN PROTECTION
                  </Link>
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