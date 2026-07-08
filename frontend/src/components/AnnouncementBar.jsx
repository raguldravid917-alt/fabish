import React from 'react';

const messages = [
  'Clearance Sale Event: Up to 50% Off Select Items!',
  'Best special offers every week 40% Off! Free delivery time',
  'Free Shipping on Orders over $140',
];

const AnnouncementBar = () => {
  return (
    <div
      className="w-full overflow-hidden select-none bg-[#F5F5F5] flex items-center border-b border-[#EBEBE9] group"
      style={{ height: '35px' }}
    >
      {/* Container holding two identical lists side-by-side for infinite seamless loop */}
      <div className="flex whitespace-nowrap animate-scroll-left flex-shrink-0 group-hover:[animation-play-state:paused] items-center">
        <div className="flex items-center">
          {messages.map((msg, idx) => (
            <React.Fragment key={`msg1-${idx}`}>
              <span className="text-[#2f3e10] text-[14px] font-heading font-normal px-16 inline-flex items-center tracking-[0.05em]">
                {msg}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center">
          {messages.map((msg, idx) => (
            <React.Fragment key={`msg2-${idx}`}>
              <span className="text-[#2f3e10] text-[14px] font-heading font-normal px-16 inline-flex items-center tracking-[0.05em]">
                {msg}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;