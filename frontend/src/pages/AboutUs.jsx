import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="w-full bg-[#faf9f5]">

      {/* 1. TOP BANNER */}
      <div
        // Note the change from 'bg-center' to 'bg-right'
        className="relative w-full h-[300px] md:h-[250px] flex items-center justify-center bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: `url('/assets/Rectangle_337.jpg')` }}
      >
        <div className="absolute inset-0 bg-[#faf9f5]/50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-[40px] md:text-[40px] font-heading font-semibold text-[#555] mb-2 tracking-tight">
            About Us
          </h1>
          <p className="text-[12px] font-bold text-[#666] tracking-[0.2em] uppercase">
            <Link to="/" className="hover:text-black">Home</Link> <span className="mx-2">|</span> About Us
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24">

        {/* Main Grid: Changed to 12 columns for better ratio control */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">

          {/* Left: Product Image (Added lg:col-span-5 to reduce size) */}
          <div className="w-full flex justify-center lg:col-span-6">
            <img
              src="/assets/Rectangle_338.jpg"
              alt="Daily Essentials"
              className="w-full h-auto object-cover"
              onError={(e) => { e.target.src = '/assets/14.jpg'; }}
            />
          </div>

          {/* Right: Text and Features (Added lg:col-span-7 to expand width) */}
          <div className="lg:pl-6 lg:col-span-6">
            <span className="text-[12px] font-bold text-[#555] tracking-[0.2em] uppercase mb-4 block">
              Discover Beauty
            </span>

            {/* whitespace-nowrap theva illa, space athigama irukurathala athuve single line-la set aagidum */}
            <h2 className="text-[22px] md:text-[24px] lg:text-[38px] font-heading font-medium text-[#111] leading-[1.2] mb-6">
              Daily Essentials Makeup Range
            </h2>

            <p className="text-[16px] text-[#222] leading-[1.8] mb-12 font-body">
              Ut Aliquam Purus Sit Amet Luctus Venenatis Lectus Magna Fringilla.
            </p>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 mb-14">
              <div className="flex items-center gap-5">
                <img src="/assets/homepage/Group.svg" className="w-11 h-11 object-contain flex-shrink-0" alt="Icon" />
                <h4 className="font-heading font-normal text-[22px] text-[#111] leading-snug">
                  Lightweight Formula
                </h4>
              </div>

              <div className="flex items-center gap-5">
                <img src="/assets/homepage/Group-1.svg" className="w-11 h-11 object-contain flex-shrink-0" alt="Icon" />
                <h4 className="font-heading font-normal text-[22px] text-[#111] leading-snug">
                  In-house Quality<br />Control
                </h4>
              </div>

              <div className="flex items-center gap-5">
                <img src="/assets/homepage/Group-2.svg" className="w-11 h-11 object-contain flex-shrink-0" alt="Icon" />
                <h4 className="font-heading font-normal text-[22px] text-[#111] leading-snug">
                  Hygienically<br />Manufactured
                </h4>
              </div>

              <div className="flex items-center gap-5">
                <img src="/assets/homepage/Group-3.svg" className="w-11 h-11 object-contain flex-shrink-0" alt="Icon" />
                <h4 className="font-heading font-normal text-[22px] text-[#111] leading-snug">
                  Ultra-Light Mixture
                </h4>
              </div>
            </div>

            <Link to="/collections/all" className="inline-block bg-[#2d3a1b] hover:bg-black text-white px-10 py-4 text-[13px] font-bold tracking-[0.2em] uppercase transition-colors">
              Explore More
            </Link>
          </div>

        </div>
      </div>

      {/* 3. FULL WIDTH WRAP UP BANNER */}
      {/* 'group' class add panni iruken zoom effect trigger panrathuku, and overflow-hidden for staying inside container */}
      <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden group">

        {/* Background Image Layer with Zoom Effect */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-in-out group-hover:scale-110"
          style={{ backgroundImage: `url('/assets/Rectangle_336_copy.jpg')` }} /* Replace with actual leafy flatlay image */
        ></div>

        {/* Overlay Layer (Lighten the background slightly for text readability) */}
        <div className="absolute inset-0 bg-transparent transition-colors duration-500"></div>

        {/* Content Layer */}
        <div className="relative z-10 text-center w-full px-4">

          <span className="text-[12px] md:text-[13px] font-bold text-[#444] tracking-[0.25em] uppercase mb-6 block">
            Limited Offers 50% Off
          </span>

          {/* max-w removed and font size adjusted to keep it in a single line like the 2nd image */}
          <h2 className="text-[32px] md:text-[44px] lg:text-[48px] font-heading font-medium text-black leading-tight mb-10 whitespace-nowrap">
            Wrap Up Your List With Deals
          </h2>

          {/* Button changed to thin border (border-[1px]) and wider padding */}
          <Link to="/collections/all" className="inline-block border border-black hover:bg-black hover:text-white text-black px-12 py-4 text-[13px] font-bold tracking-[0.2em] uppercase transition-all duration-300 bg-transparent">
            Shop All
          </Link>

        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-24">

        {/* 4. OUR FASHION TEAM */}
        <div className="text-center mb-16">
          <span className="text-[12px] font-bold text-[#444] tracking-[0.2em] uppercase mb-3 block">
            Success Team
          </span>
          <h2 className="text-[38px] md:text-[46px] font-heading font-semibold text-[#111]">
            Our Fashion Team
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">

          {/* Team Member 1 */}
          <div className="group relative flex flex-col items-center justify-end bg-white hover:shadow-2xl transition-all duration-500 h-[380px] py-10 px-6 overflow-hidden border border-gray-100">
            {/* Expanding Image on Hover */}
            <img
              src="/assets/1_2.jpg"
              alt="Dafni"
              className="absolute top-10 left-1/2 -translate-x-1/2 w-[150px] h-[150px] rounded-full object-cover transition-all duration-500 ease-in-out group-hover:top-0 group-hover:left-0 group-hover:translate-x-0 group-hover:w-full group-hover:h-full group-hover:rounded-none z-0"
              onError={(e) => { e.target.src = '/assets/Blog07.jpg'; }}
            />
            {/* Dark Overlay for Text Readability on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

            {/* Invisible Spacer to keep layout intact */}
            <div className="w-[150px] h-[150px] mb-8 flex-shrink-0 z-20"></div>

            {/* Text & Icons Content */}
            <div className="relative z-20 flex flex-col items-center">
              <h3 className="text-[22px] font-heading font-bold mb-1 text-[#111] transition-colors duration-500 group-hover:text-white">Dafni</h3>
              <p className="text-[14px] text-[#555] mb-6 transition-colors duration-500 group-hover:text-gray-200">CEO</p>

              {/* Social Icons Container */}
              <div className="flex gap-6 text-[#222] transition-colors duration-500 group-hover:text-white">
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z" /></svg>
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </div>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="group relative flex flex-col items-center justify-end bg-white hover:shadow-2xl transition-all duration-500 h-[380px] py-10 px-6 overflow-hidden border border-gray-100">
            <img
              src="/assets/1_3.jpg"
              alt="Stefania"
              className="absolute top-10 left-1/2 -translate-x-1/2 w-[150px] h-[150px] rounded-full object-cover transition-all duration-500 ease-in-out group-hover:top-0 group-hover:left-0 group-hover:translate-x-0 group-hover:w-full group-hover:h-full group-hover:rounded-none z-0"
              onError={(e) => { e.target.src = '/assets/Blog08.jpg'; }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

            <div className="w-[150px] h-[150px] mb-8 flex-shrink-0 z-20"></div>

            <div className="relative z-20 flex flex-col items-center">
              <h3 className="text-[22px] font-heading font-bold mb-1 text-[#111] transition-colors duration-500 group-hover:text-white">Stefania</h3>
              <p className="text-[14px] text-[#555] mb-6 transition-colors duration-500 group-hover:text-gray-200">Designer</p>

              <div className="flex gap-6 text-[#222] transition-colors duration-500 group-hover:text-white">
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z" /></svg>
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </div>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="group relative flex flex-col items-center justify-end bg-white hover:shadow-2xl transition-all duration-500 h-[380px] py-10 px-6 overflow-hidden border border-gray-100">
            <img
              src="/assets/1_4.jpg"
              alt="Emilia"
              className="absolute top-10 left-1/2 -translate-x-1/2 w-[150px] h-[150px] rounded-full object-cover transition-all duration-500 ease-in-out group-hover:top-0 group-hover:left-0 group-hover:translate-x-0 group-hover:w-full group-hover:h-full group-hover:rounded-none z-0"
              onError={(e) => { e.target.src = '/assets/Blog03.jpg'; }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

            <div className="w-[150px] h-[150px] mb-8 flex-shrink-0 z-20"></div>

            <div className="relative z-20 flex flex-col items-center">
              <h3 className="text-[22px] font-heading font-bold mb-1 text-[#111] transition-colors duration-500 group-hover:text-white">Emilia</h3>
              <p className="text-[14px] text-[#555] mb-6 transition-colors duration-500 group-hover:text-gray-200">Manager</p>

              <div className="flex gap-6 text-[#222] transition-colors duration-500 group-hover:text-white">
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z" /></svg>
                <svg className="w-[18px] h-[18px] fill-current cursor-pointer hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 5. CLIENTS & PARTNERS */}
      {/* Safer Full-width breakout trick without breaking horizontal scroll */}
      <div className="w-[100vw] ml-[calc(50%-50vw)] border-t border-b border-gray-200 py-16 mb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">

          <div className="text-center mb-16">
            <span className="text-[12px] font-bold text-[#444] tracking-[0.2em] uppercase mb-3 block">
              Production
            </span>
            <h2 className="text-[38px] md:text-[46px] font-heading font-semibold text-[#111]">
              Client & Partners
            </h2>
          </div>

          {/* Logos with FIXED pixel heights to match exactly with your reference image */}
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">

            <img src="/assets/brand-h2-2-1x.png" alt="Client Logo 1" className="h-[70px] md:h-[90px] w-auto object-contain cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300" onError={(e) => { e.target.style.display = 'none'; }} />

            <img src="/assets/brand-h2-3-1x.png" alt="Unique Logo" className="h-[20px] md:h-[26px] w-auto object-contain cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300" onError={(e) => { e.target.style.display = 'none'; }} />

            <img src="/assets/brand-h2-4-1x.png" alt="Client Logo 3" className="h-[65px] md:h-[85px] w-auto object-contain cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300" onError={(e) => { e.target.style.display = 'none'; }} />

            <img src="/assets/brand-h2-5-1x.png" alt="Am Logo" className="h-[90px] md:h-[120px] w-auto object-contain cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300" onError={(e) => { e.target.style.display = 'none'; }} />

            <img src="/assets/brand-h2-6-1x.png" alt="Design Logo" className="h-[24px] md:h-[30px] w-auto object-contain cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300" onError={(e) => { e.target.style.display = 'none'; }} />

            <img src="/assets/brand-h2-7-1x.png" alt="Elegant Logo" className="h-[35px] md:h-[45px] w-auto object-contain cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300" onError={(e) => { e.target.style.display = 'none'; }} />

          </div>
        </div>
      </div>

      {/* INSTAGRAM GALLERY / GAP FIXED WITH CORRECT ASPECT HEIGHT */}
      <section className="w-full bg-white pt-[40px] pb-[80px] select-none">
        <div className="w-full max-w-[1280px] mx-auto px-[40px]">
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


    </div>
  );
};

export default AboutUs;