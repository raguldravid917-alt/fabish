/**
 * AdminPageHeader — Reusable section header for all admin sub-pages.
 *
 * WHY: All admin pages had inconsistent or missing page-level headings.
 * This centralizes the heading pattern so every page has a consistent
 * title, subtitle, and optional action button.
 *
 * Usage:
 *   <AdminPageHeader
 *     title="Products"
 *     subtitle="Manage catalog items and inventory"
 *     action={<button onClick={...}>+ Create</button>}
 *   />
 */
import React from 'react';

const AdminPageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-base font-heading font-bold text-black uppercase tracking-wider leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1 font-body">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 flex-shrink-0">{action}</div>}
    </div>
  );
};

export default AdminPageHeader;
