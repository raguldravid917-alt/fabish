import React, { useState, useEffect } from 'react';
import { Truck, Leaf, ShieldCheck, RotateCcw, Lock, Star, Gift, Sparkles } from 'lucide-react';

const announcements = [
  { id: 1, title: 'Free Shipping Above ₹999', icon: <Truck className="w-3.5 h-3.5 text-[#3a4d23]" /> },
  { id: 2, title: '100% Cold-Pressed Organic Botanicals', icon: <Leaf className="w-3.5 h-3.5 text-[#3a4d23]" /> },
  { id: 3, title: 'Dermatologist Approved & Certified', icon: <ShieldCheck className="w-3.5 h-3.5 text-[#3a4d23]" /> },
  { id: 4, title: 'Easy 7-Day Hassle-Free Returns', icon: <RotateCcw className="w-3.5 h-3.5 text-[#3a4d23]" /> },
  { id: 5, title: '256-Bit SSL Secure Payments', icon: <Lock className="w-3.5 h-3.5 text-[#3a4d23]" /> },
  { id: 6, title: '★ 4.9/5 Rating (12k+ Verified Reviews)', icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> },
  { id: 7, title: 'Exclusive Member Offers & Rewards', icon: <Gift className="w-3.5 h-3.5 text-[#3a4d23]" /> },
  { id: 8, title: 'New Botanical Arrivals Weekly', icon: <Sparkles className="w-3.5 h-3.5 text-[#3a4d23]" /> },
];

const AnnouncementBar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % announcements.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused]);

  // 3 Items for Desktop
  const desktopItems = [
    announcements[activeIndex % announcements.length],
    announcements[(activeIndex + 1) % announcements.length],
    announcements[(activeIndex + 2) % announcements.length],
  ];

  // 2 Items for Tablet
  const tabletItems = [
    announcements[activeIndex % announcements.length],
    announcements[(activeIndex + 1) % announcements.length],
  ];

  // 1 Item for Mobile
  const mobileItem = announcements[activeIndex % announcements.length];

  return (
    <aside
      role="region"
      aria-label="Announcement Bar"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="w-full bg-gradient-to-r from-[#fdfbf7] via-[#f7f5ea] to-[#fdfbf7] backdrop-blur-md bg-white/75 border-b border-[#e8e6d9]/80 shadow-[inset_0_-1px_0_rgba(232,230,217,0.8)] select-none h-[34px] sm:h-[40px] lg:h-[44px] flex items-center justify-center px-4 overflow-hidden relative z-40 transition-all duration-300"
    >
      {/* DESKTOP VIEW (3 Cards with Botanical Dividers) */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-[1360px] px-6 transition-all duration-700 ease-in-out">
        {desktopItems.map((item, idx) => (
          <React.Fragment key={`${item.id}-${idx}`}>
            <div className="group inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/60 hover:bg-white border border-[#e8e6d9]/60 hover:border-[#3a4d23]/40 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              <div className="p-1 rounded-full bg-[#eef3e8] border border-[#d2e2c5] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="font-heading font-semibold text-xs text-[#1c2415] tracking-[0.4px] group-hover:text-[#3a4d23] transition-colors">
                {item.title}
              </span>
            </div>

            {idx < desktopItems.length - 1 && (
              <span className="text-[#729855]/60 text-[10px] select-none font-bold">✦</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* TABLET VIEW (2 Cards with Botanical Divider) */}
      <div className="hidden sm:flex lg:hidden items-center justify-around w-full max-w-[768px] transition-all duration-700 ease-in-out">
        {tabletItems.map((item, idx) => (
          <React.Fragment key={`${item.id}-${idx}`}>
            <div className="group inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 hover:bg-white border border-[#e8e6d9]/60 shadow-2xs transition-all duration-300 cursor-pointer">
              <div className="p-1 rounded-full bg-[#eef3e8] border border-[#d2e2c5] flex items-center justify-center">
                {item.icon}
              </div>
              <span className="font-heading font-semibold text-[11px] text-[#1c2415] tracking-[0.4px]">
                {item.title}
              </span>
            </div>

            {idx < tabletItems.length - 1 && (
              <span className="text-[#729855]/60 text-[9px] select-none font-bold">✦</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* MOBILE VIEW (1 Card with Smooth Fade) */}
      <div className="flex sm:hidden items-center justify-center w-full transition-all duration-500">
        <div key={mobileItem.id} className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/70 border border-[#e8e6d9]/60 shadow-2xs animate-fadeIn">
          <div className="p-1 rounded-full bg-[#eef3e8] border border-[#d2e2c5] flex items-center justify-center">
            {mobileItem.icon}
          </div>
          <span className="font-heading font-semibold text-[10.5px] text-[#1c2415] tracking-[0.4px] truncate">
            {mobileItem.title}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default AnnouncementBar;