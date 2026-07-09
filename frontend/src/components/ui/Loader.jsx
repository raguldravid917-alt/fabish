/**
 * Loader — Branded reusable loading component.
 *
 * Usage:
 *   <Loader />                    → Full-page centered loader (default, large logo)
 *   <Loader size="small" />       → Raw logo only — for use inside buttons (20px)
 *   <Loader size="medium" />      → Card/section loader (48px, inline centered)
 *   <Loader fullScreen />         → Fixed viewport overlay (for Suspense, layouts)
 *
 * Rules:
 *   - Uses ONLY /public/logo.png — no other icon, SVG, or external asset.
 *   - Animation: smooth scale + opacity pulse on the logo only. No rotation.
 *   - Background: clean premium white (#ffffff) for fullScreen/inline modes.
 *   - size="small" renders ONLY the img tag (no wrapper) for button use.
 */
import React from 'react';
import './Loader.css';

const SIZE_CLASS = {
  small:  'fabish-loader__logo--small',
  medium: 'fabish-loader__logo--medium',
  large:  'fabish-loader__logo--large',
};

const Loader = ({
  size = 'large',
  fullScreen = false,
  className = '',
}) => {
  const logoClass = `fabish-loader__logo ${SIZE_CLASS[size] || SIZE_CLASS.large}`;

  // ── Small size: render only the logo (used inside buttons) ──────────────
  if (size === 'small') {
    return (
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className={`${logoClass} ${className}`}
      />
    );
  }

  // ── Full-screen fixed overlay (Suspense fallback, layout-level) ─────────
  const wrapperClass = [
    'fabish-loader',
    fullScreen ? 'fabish-loader--fullscreen' : 'fabish-loader--inline',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass} role="status" aria-label="Loading">
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className={logoClass}
      />
    </div>
  );
};

export default Loader;