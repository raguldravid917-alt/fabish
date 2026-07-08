/**
 * PageBanner — Reusable breadcrumb hero banner.
 * Replaces 6 identical copy-pasted banner blocks across:
 * AboutUs, Contact, FAQ, Blog, ProductListing, Collections.
 *
 * UI is EXACTLY preserved — same classes, same structure.
 */
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * @param {object} props
 * @param {string} props.title - Page title displayed in the banner
 * @param {Array<{label: string, to?: string}>} props.breadcrumbs - Breadcrumb items
 * @param {string} [props.backgroundImage] - Background image URL (defaults to Rectangle_337.jpg)
 * @param {string} [props.titleSize] - Override title font size class
 * @param {string} [props.overlayClass] - Override overlay background class
 */
const PageBanner = ({
  title,
  breadcrumbs = [],
  backgroundImage = '/assets/Rectangle_337.jpg',
  titleSize = 'text-[40px] md:text-[40px]',
  overlayClass = 'bg-[#faf9f5]/50',
}) => {
  return (
    <div
      className="relative w-full h-[300px] md:h-[250px] flex items-center justify-center bg-cover bg-left bg-no-repeat"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className={`absolute inset-0 ${overlayClass}`}></div>
      <div className="relative z-10 text-center">
        <h1 className={`${titleSize} font-heading font-semibold text-[#555] mb-2 tracking-tight`}>
          {title}
        </h1>
        {breadcrumbs.length > 0 && (
          <p className="text-[12px] font-bold text-[#666] tracking-[0.2em] uppercase">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <span className="mx-2">|</span>}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-black transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageBanner;
