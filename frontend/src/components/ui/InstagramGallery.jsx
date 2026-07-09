/**
 * InstagramGallery — Reusable Instagram-style image/video grid.
 * Replaces 3 identical ~50-line gallery blocks in:
 * AboutUs.jsx, Contact.jsx, Home.jsx.
 *
 * UI is EXACTLY preserved — same hover effects, same SVG overlays.
 */
import React from 'react';

/**
 * Instagram overlay icon (camera/Instagram SVG).
 * Extracted to avoid repeating the same SVG block 5x per gallery.
 */
const InstaOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/10">
    <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    </div>
  </div>
);

/**
 * @param {object} props
 * @param {Array<{ type: 'image' | 'video', src: string, alt?: string }>} props.items - Gallery items
 * @param {string} [props.containerClass] - Override container class
 * @param {string} [props.gap] - Override gap class (default: 'gap-[15px] lg:gap-[30px]')
 */
const InstagramGallery = ({
  items = [],
  containerClass = 'w-full max-w-[1280px] mx-auto px-4 md:px-[40px]',
  gap = 'gap-[15px] lg:gap-[30px]',
}) => {
  return (
    <section className="w-full bg-white pt-[40px] pb-[80px] select-none">
      <div className={containerClass}>
        <div className={`grid grid-cols-2 md:grid-cols-5 ${gap}`}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`relative aspect-[4/5] overflow-hidden group cursor-pointer ${
                item.type === 'video' ? 'bg-black' : 'bg-[#f6f5ea]'
              }`}
            >
              {item.type === 'video' ? (
                <video
                  src={item.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.alt || `Gallery ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              )}
              <InstaOverlay />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;
