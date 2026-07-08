/**
 * SectionHeading — Reusable section title pattern.
 * Used for the repeated "small subtitle + large heading" pattern across
 * Home, ProductListing, AboutUs, Blog, Contact.
 */
import React from 'react';

/**
 * @param {object} props
 * @param {string} [props.subtitle] - Small uppercase subtitle text
 * @param {string} props.title - Main heading text
 * @param {string} [props.subtitleClass] - Override subtitle classes
 * @param {string} [props.titleClass] - Override title classes
 * @param {string} [props.className] - Container classes
 * @param {'center' | 'left'} [props.align='center'] - Text alignment
 */
const SectionHeading = ({
  subtitle,
  title,
  subtitleClass = 'text-[12px] font-bold text-[#555] tracking-[0.2em] uppercase mb-4 block',
  titleClass = 'text-[38px] md:text-[46px] font-heading font-semibold text-[#111]',
  className = '',
  align = 'center',
}) => {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`${alignClass} ${className}`}>
      {subtitle && <span className={subtitleClass}>{subtitle}</span>}
      <h2 className={titleClass}>{title}</h2>
    </div>
  );
};

export default SectionHeading;
