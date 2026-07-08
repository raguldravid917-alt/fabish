/**
 * Badge — Reusable status badge component.
 * Replaces repeated badge styling in Admin tables (Paid, Unpaid, Admin, Customer, etc.)
 */
import React from 'react';

const VARIANTS = {
  success: 'text-green-600 bg-green-50',
  danger: 'text-red-500 bg-red-50',
  warning: 'text-orange-500 bg-orange-50',
  info: 'text-blue-600 bg-blue-50',
  purple: 'text-purple-700 bg-purple-50',
  neutral: 'text-brand-muted bg-brand-gray-light',
};

/**
 * @param {object} props
 * @param {'success' | 'danger' | 'warning' | 'info' | 'purple' | 'neutral'} [props.variant='neutral']
 * @param {string} props.children - Badge text
 * @param {string} [props.className] - Additional classes
 */
const Badge = ({ variant = 'neutral', children, className = '' }) => {
  return (
    <span
      className={`${VARIANTS[variant]} px-2.5 py-1 text-[10px] font-heading font-bold uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
