import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Tag } from 'lucide-react';
import { getLocalImageUrl } from '../../utils/imageMapper';

const CategoryItem = React.memo(({ category, onSelect, isFocused }) => {
  const location = useLocation();

  if (!category) return null;

  const slug = category.slug || category.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const collectionPath = `/collections/${slug}`;
  const isActive = location.pathname === collectionPath;
  const imageUrl = category.image ? getLocalImageUrl(category.image) : null;

  return (
    <li role="none" className="w-full">
      <Link
        to={collectionPath}
        role="menuitem"
        tabIndex={0}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => {
          if (onSelect) onSelect(category);
        }}
        className={`group relative flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-l-4 cursor-pointer outline-none ${
          isActive
            ? 'border-[#729855] bg-[#729855]/15 text-[#2f3e10] font-semibold shadow-sm'
            : isFocused
            ? 'border-[#729855] bg-[#729855]/10 text-[#729855]'
            : 'border-transparent text-[#222222] hover:border-[#729855] hover:bg-[#729855]/10 hover:text-[#729855]'
        }`}
        style={{ fontFamily: '"Outfit", "Work Sans", sans-serif' }}
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={category.name}
              className="w-8 h-8 rounded-full object-cover border border-[#eae8d8] flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#729855]/10 text-[#729855] flex items-center justify-center flex-shrink-0 group-hover:bg-[#729855] group-hover:text-white transition-colors duration-300">
              <Tag className="w-4 h-4" />
            </div>
          )}

          <span className="truncate text-[15px] font-heading font-medium tracking-wide">
            {category.name}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {typeof category.productCount === 'number' && category.productCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eae8d8]/80 text-[#555] group-hover:bg-[#729855] group-hover:text-white transition-colors duration-200">
              {category.productCount}
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#729855] group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </Link>
    </li>
  );
});

CategoryItem.displayName = 'CategoryItem';

export default CategoryItem;
