/**
 * ErrorAlert — Reusable alert/notification component.
 * Replaces repeated error/success div blocks across Login, Register, Cart, Admin, Contact, ProductDetail.
 */
import React from 'react';

/**
 * @param {object} props
 * @param {'error' | 'success'} [props.type='error'] - Alert type
 * @param {string} props.message - Alert message text
 * @param {string} [props.className] - Additional classes
 */
const ErrorAlert = ({ type = 'error', message, className = '' }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-red-100 border border-red-400 text-red-700',
    success: 'bg-green-100 border border-green-400 text-green-700',
  };

  return (
    <div className={`${styles[type]} px-4 py-3 text-xs font-semibold mb-6 text-center ${className}`}>
      {message}
    </div>
  );
};

export default ErrorAlert;
