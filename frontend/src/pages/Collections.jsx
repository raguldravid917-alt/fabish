import React, { useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
import { useCategories } from '../context/CategoryContext';
import { Link } from 'react-router-dom';
import { getLocalImageUrl } from '../utils/imageMapper';
import { productService } from '../api/productService'; // Imports backend service natively

// Helper to securely map database paths and prevent image breakage
const ensureAbsolutePath = (path) => {
  if (!path) return '';
  let pathStr = '';
  if (typeof path === 'string') {
    pathStr = path;
  } else if (typeof path === 'object' && path !== null) {
    pathStr = path.url || path.secure_url || '';
  }
  if (!pathStr || typeof pathStr !== 'string') return '';

  if (pathStr.includes('via.placeholder.com')) {
    pathStr = pathStr.replace('via.placeholder.com', 'placehold.co');
  }

  if (!pathStr.startsWith('/') && !pathStr.startsWith('http')) {
    return '/' + pathStr;
  }
  return pathStr;
};

const Collections = () => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Accordion toggle state: key is category ID, value is boolean (true = collapsed)
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (id) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch products dynamically to group them by categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAll({ limit: 100 });
        if (res.success) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching products for All Collections page:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (categoriesLoading || productsLoading) {
    return <Loader />;
  }

  // Filter dynamic categories
  const publishedCategories = categories.filter((cat) => cat.status === 'Published');

  // Distinguish Parent Categories (Roots) from subcategories
  const parentCategories = publishedCategories.filter(
    (cat) => !cat.parentCategory
  );

  // Helper to resolve all products belonging to a parent category OR its subcategories
  const getProductsForCategory = (parentCat) => {
    const subCategoryIds = publishedCategories
      .filter((c) => {
        const parentId = c.parentCategory
          ? typeof c.parentCategory === 'object'
            ? c.parentCategory._id
            : c.parentCategory
          : null;
        return parentId === parentCat._id;
      })
      .map((c) => c._id);

    return products.filter((p) => {
      const productCatId = p.category
        ? typeof p.category === 'object'
          ? p.category._id
          : p.category
        : null;
      return productCatId === parentCat._id || subCategoryIds.includes(productCatId);
    });
  };

  // Helper to extract child subcategories for a given parent
  const getSubcategoriesForCategory = (parentCat) => {
    return publishedCategories.filter((c) => {
      const parentId = c.parentCategory
        ? typeof c.parentCategory === 'object'
          ? c.parentCategory._id
          : c.parentCategory
        : null;
      return parentId === parentCat._id;
    });
  };

  return (
    <div className="w-full bg-white text-left select-none">
      <style>{`
        /* BANNER */
        .catalog-banner {
          width: 100%;
          height: 240px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url('/assets/about-breadcrumb-1.jpg');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }
        .catalog-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(245, 240, 230, 0.45);
        }
        .catalog-banner h1 {
          position: relative;
          z-index: 2;
          font-family: 'Work Sans', Georgia, serif;
          font-size: 38px;
          font-weight: 700;
          color: #4B4A48;
          margin: 0;
          letter-spacing: 0.02em;
        }

        /* DYNAMIC CATEGORY SECTION WITH ALTERNATING BLOCK BANDS */
        .cat-section {
          max-width: 100%;
          padding: 50px 0;
          border-bottom: 1px solid #f2f0e4;
        }
        .cat-section:nth-child(even) {
          background-color: #faf9f5; /* Clean light band separation */
        }
        .cat-section:last-child {
          border-bottom: none;
        }
        .cat-content-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
        }
        
        /* CATEGORY TITLE CONTAINER with signature vertical left indicator bar */
        .cat-title-container {
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 3px solid #729855; /* Left visual indicator bar */
          padding-left: 14px;
        }
        
        /* DROPDOWN INTERACTIVE BAR (Header) */
        .cat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 15px;
          cursor: pointer;
          padding: 8px 12px 8px 0;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        .cat-header:hover {
          background-color: rgba(114, 152, 85, 0.04); /* Interactive subtle green highlight */
        }
        
        .cat-title {
          font-family: 'Work Sans', sans-serif;
          font-size: 30px;
          font-weight: 600;
          color: #2f3e10;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .cat-count-badge {
          background-color: rgba(114, 152, 85, 0.1);
          color: #729855;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          font-family: 'Work Sans', sans-serif;
          white-space: nowrap;
        }
        
        /* Dropdown toggle arrow indicators */
        .cat-toggle-chevron {
          font-size: 15px;
          color: #729855;
          transition: transform 0.3s ease;
          display: inline-block;
          margin-left: 4px;
        }
        
        .cat-view-all {
          font-family: 'Work Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #729855;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease;
        }
        .cat-view-all:hover {
          color: #2f3e10;
        }

        /* SUBCATEGORY PILL CHIPS with directional indicators */
        .subcat-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 35px;
        }
        .subcat-pill {
          font-family: 'Work Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #555;
          background-color: #ffffff;
          border: 1px solid #eae8d8;
          padding: 8px 18px;
          border-radius: 30px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }
        .subcat-pill::after {
          content: '↗';
          font-size: 10px;
          color: #888;
          transition: color 0.3s ease;
        }
        .subcat-pill:hover {
          background-color: #729855;
          color: #ffffff;
          border-color: #729855;
        }
        .subcat-pill:hover::after {
          color: #ffffff;
        }

        /* 4-COLUMN PRODUCT GRID */
        .prod-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .prod-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
        }
        
        .prod-img-box {
          position: relative;
          aspect-ratio: 3/4;
          background-color: #f4f5eb;
          overflow: hidden;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .prod-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          mix-blend-mode: darken;
          transition: transform 0.5s ease;
        }
        .prod-card:hover .prod-img-box img {
          transform: scale(1.04);
        }

        .prod-info {
          text-align: center;
          padding: 0 6px;
        }
        .prod-title {
          font-family: 'Work Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #111;
          margin: 0 0 6px 0;
          line-height: 1.4;
          transition: color 0.3s ease;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .prod-card:hover .prod-title {
          color: #729855;
        }
        .prod-price {
          font-family: 'Work Sans', sans-serif;
          font-size: 14px;
          color: #444;
          margin: 0;
          font-weight: 600;
        }

        /* Empty state styling */
        .empty-showcase {
          grid-column: span 4;
          padding: 40px;
          text-align: center;
          border: 1px dashed #eae8d8;
          color: #999;
          font-style: italic;
          font-size: 13px;
        }

        /* Webkit scrollbars customized to match the warm-neutral beige palette of the About Us page */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #faf9f5;
        }
        ::-webkit-scrollbar-thumb {
          background: #b1b0a3;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #4b4a48;
        }

        /* Responsive Grid viewports */
        @media (max-width: 1024px) {
          .prod-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .prod-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .cat-section {
            padding: 30px 0;
          }
          .cat-content-container {
            padding: 0 20px;
          }
        }
        @media (max-width: 480px) {
          .prod-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* TOP HEADER HERO BANNER */}
      <div className="catalog-banner">
        <h1>All Collections</h1>
      </div>

      {/* ITERATING PARENT CATEGORY GROUPS SEQUENTIALLY */}
      <div className="w-full">
        {parentCategories.map((parentCat) => {
          const categoryProducts = getProductsForCategory(parentCat);
          const subCategories = getSubcategoriesForCategory(parentCat);
          const parentLink = `/collections/${parentCat.slug}`;
          const isCollapsed = !!collapsedCategories[parentCat._id]; // Safety boolean check

          return (
            <section key={parentCat._id} className="cat-section">
              <div className="cat-content-container">

                {/* Accordion Dropdown Bar - Clickable Category Row */}
                <div
                  className="cat-header"
                  onClick={() => toggleCategory(parentCat._id)}
                  title="Click to Expand/Collapse"
                >
                  <div className="cat-title-container">
                    <h2 className="cat-title">{parentCat.name}</h2>
                    {categoryProducts.length > 0 && (
                      <span className="cat-count-badge">
                        {categoryProducts.length} items
                      </span>
                    )}
                    <span className="cat-toggle-chevron">
                      {isCollapsed ? '▼' : '▲'}
                    </span>
                  </div>
                  <Link
                    to={parentLink}
                    onClick={(e) => {
                      e.stopPropagation(); // Stops toggleCategory from executing on View All click
                      window.scrollTo(0, 0);
                    }}
                    className="cat-view-all"
                  >
                    View All &nbsp;&rsaquo;
                  </Link>
                </div>

                {/* Conditional Rendering of Nested Subcategories and Products Grid based on Accordion toggle state */}
                {!isCollapsed && (
                  <>
                    {/* Category Sub-navigation (Subcategory pill buttons with up-right arrows) */}
                    {subCategories.length > 0 && (
                      <div className="subcat-row">
                        {subCategories.map((sub) => (
                          <Link
                            key={sub._id}
                            to={`/collections/${sub.slug}`}
                            onClick={() => window.scrollTo(0, 0)}
                            className="subcat-pill"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Top 4 Products Mini-Grid */}
                    <div className="prod-grid">
                      {categoryProducts.slice(0, 4).map((product) => {
                        const productImg = getLocalImageUrl(
                          ensureAbsolutePath(product.images?.[0] || product.image || '/assets/14.jpg')
                        );
                        return (
                          <Link
                            key={product._id}
                            to={`/products/${product.slug}`}
                            onClick={() => window.scrollTo(0, 0)}
                            className="prod-card"
                          >
                            <div className="prod-img-box">
                              <img src={productImg} alt={product.title} loading="lazy" />
                            </div>
                            <div className="prod-info">
                              <h3 className="prod-title">{product.title}</h3>
                              <p className="prod-price">
                                Rs. {product.price.toLocaleString('en-IN')}.00 INR
                              </p>
                            </div>
                          </Link>
                        );
                      })}

                      {categoryProducts.length === 0 && (
                        <div className="empty-showcase">
                          No products currently assigned to this collection.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Collections;