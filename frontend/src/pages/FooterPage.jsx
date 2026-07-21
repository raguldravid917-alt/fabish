import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useFooterPage } from '../hooks/useFooterPage';
import FooterPageSkeleton from '../components/FooterPageSkeleton';
import { ENV } from '../config/env';

/* ─── SEO Head Manager ──────────────────────────────────────────────────── */
const SEOHead = ({ page, slug }) => {
  useEffect(() => {
    const siteUrl = ENV.SITE_URL || window.location.origin;
    const canonicalUrl = `${siteUrl}/pages/${slug}`;
    const title = page.seoTitle || page.title;
    const description = page.seoDescription || page.shortDescription || '';
    const image = page.bannerImage?.url || page.featuredImage?.url || '';

    // Title
    document.title = `${title} — Fabish`;

    // Update/create meta tags
    const setMeta = (name, content, property = false) => {
      if (!content) return;
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('keywords', (page.seoKeywords || []).join(', '));

    // Open Graph
    setMeta('og:type', 'website', true);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:image', image, true);
    setMeta('og:site_name', 'Fabish', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // JSON-LD Structured Data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonicalUrl,
      publisher: {
        '@type': 'Organization',
        name: 'Fabish',
        url: siteUrl,
      },
      ...(page.publishedDate && { datePublished: page.publishedDate }),
      ...(page.updatedAt && { dateModified: page.updatedAt }),
    };

    let scriptEl = document.querySelector('script[type="application/ld+json"][data-page="footer"]');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.setAttribute('data-page', 'footer');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      // Reset title on unmount
      document.title = 'Fabish — Organic Skincare';
    };
  }, [page, slug]);

  return null;
};

/* ─── 404 State ─────────────────────────────────────────────────────────── */
const NotFoundState = ({ slug }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
    <div className="text-[80px] font-extrabold text-gray-100 select-none leading-none mb-4">404</div>
    <h1 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: '"Outfit", sans-serif' }}>
      Page Not Found
    </h1>
    <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
      The page <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">/pages/{slug}</code> does
      not exist or may have been removed.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white text-sm font-semibold tracking-wide uppercase hover:bg-[#8B5A2B] transition-colors"
      style={{ fontFamily: '"Outfit", sans-serif' }}
    >
      ← Back to Home
    </Link>
  </div>
);

/* ─── Inactive State ─────────────────────────────────────────────────────── */
const InactiveState = ({ title }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
      <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>
    <h1 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: '"Outfit", sans-serif' }}>
      {title || 'Page Unavailable'}
    </h1>
    <p className="text-gray-500 max-w-sm mb-8">
      This page is currently not available. Please check back later.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white text-sm font-semibold tracking-wide uppercase hover:bg-[#8B5A2B] transition-colors"
      style={{ fontFamily: '"Outfit", sans-serif' }}
    >
      ← Back to Home
    </Link>
  </div>
);

/* ─── Error State ─────────────────────────────────────────────────────────── */
const ErrorState = ({ message, onRetry }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <h2 className="text-xl font-semibold text-gray-700 mb-2">Something went wrong</h2>
    <p className="text-gray-500 max-w-sm mb-6 text-sm">{message}</p>
    <button
      onClick={onRetry}
      className="px-8 py-3 bg-black text-white text-sm font-semibold tracking-wide uppercase hover:bg-[#8B5A2B] transition-colors"
      style={{ fontFamily: '"Outfit", sans-serif' }}
    >
      Try Again
    </button>
  </div>
);

/* ─── Main Page Renderer ─────────────────────────────────────────────────── */
const FooterPage = () => {
  const { slug } = useParams();
  const { page, loading, error, notFound, inactive, retry } = useFooterPage(slug);

  if (loading) return <FooterPageSkeleton />;

  if (notFound) return <NotFoundState slug={slug} />;

  if (inactive) return <InactiveState title={page?.title} />;

  if (error) return <ErrorState message={error} onRetry={retry} />;

  if (!page) return <NotFoundState slug={slug} />;

  // Sanitize HTML content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(page.content || '', {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel', 'width', 'height'],
    ADD_ATTR: ['target'],
  });

  return (
    <>
      <SEOHead page={page} slug={slug} />

      <article className="w-full min-h-screen bg-white">
        {/* ── Banner Image ──────────────────────────────────── */}
        {page.bannerImage?.url && (
          <div className="w-full h-[240px] md:h-[340px] overflow-hidden relative bg-gray-100">
            <img
              src={page.bannerImage.url}
              alt={page.bannerImage.alt || page.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
            <div className="absolute inset-0 flex items-end pb-8 px-6 md:px-12 max-w-[900px] mx-auto">
              <h1
                className="text-white text-3xl md:text-5xl font-extrabold drop-shadow-sm"
                style={{ fontFamily: '"Outfit", sans-serif' }}
              >
                {page.title}
              </h1>
            </div>
          </div>
        )}

        <div className="max-w-[900px] mx-auto px-6 md:px-10 py-12">
          {/* ── Title (if no banner) ───────────────────────── */}
          {!page.bannerImage?.url && (
            <h1
              className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              {page.title}
            </h1>
          )}

          {/* ── Featured Image + Short Description ─────────── */}
          {(page.featuredImage?.url || page.shortDescription) && (
            <div className="flex flex-col md:flex-row gap-8 mb-10 items-start">
              {page.featuredImage?.url && (
                <div className="md:w-1/3 flex-shrink-0">
                  <img
                    src={page.featuredImage.url}
                    alt={page.featuredImage.alt || page.title}
                    className="w-full rounded-sm object-cover aspect-[4/3]"
                    loading="lazy"
                  />
                </div>
              )}
              {page.shortDescription && (
                <p className="flex-1 text-[17px] text-gray-600 leading-relaxed font-medium">
                  {page.shortDescription}
                </p>
              )}
            </div>
          )}

          {/* ── Divider ────────────────────────────────────── */}
          <div className="h-px bg-gray-100 mb-10" />

          {/* ── Rich HTML Content ──────────────────────────── */}
          {sanitizedContent ? (
            <div
              className="prose prose-gray max-w-none footer-page-content"
              style={{ fontFamily: '"Work Sans", sans-serif' }}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          ) : (
            <p className="text-gray-400 italic">No content available for this page.</p>
          )}

          {/* ── Metadata Footer ────────────────────────────── */}
          {page.publishedDate && (
            <div className="mt-12 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Last updated:{' '}
                {new Date(page.updatedAt || page.publishedDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </article>

      {/* Prose styling for rich content */}
      <style>{`
        .footer-page-content h1,
        .footer-page-content h2,
        .footer-page-content h3,
        .footer-page-content h4 {
          font-family: "Outfit", sans-serif;
          font-weight: 700;
          color: #111;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .footer-page-content h2 { font-size: 1.5rem; }
        .footer-page-content h3 { font-size: 1.25rem; }
        .footer-page-content p { margin-bottom: 1rem; line-height: 1.8; color: #444; }
        .footer-page-content ul,
        .footer-page-content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        .footer-page-content li { margin-bottom: 0.4rem; color: #555; }
        .footer-page-content a { color: #8B5A2B; text-decoration: underline; }
        .footer-page-content a:hover { color: #000; }
        .footer-page-content blockquote {
          border-left: 3px solid #e5e5e5;
          padding-left: 1rem;
          color: #666;
          font-style: italic;
          margin: 1.5rem 0;
        }
        .footer-page-content img { max-width: 100%; border-radius: 4px; margin: 1rem 0; }
        .footer-page-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        .footer-page-content th,
        .footer-page-content td {
          border: 1px solid #e5e5e5;
          padding: 0.6rem 1rem;
          text-align: left;
          font-size: 0.9rem;
        }
        .footer-page-content th { background: #f9f9f9; font-weight: 600; }
        .footer-page-content hr { border: none; border-top: 1px solid #eee; margin: 2rem 0; }
        .footer-page-content code {
          background: #f4f4f4;
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          font-size: 0.85em;
          font-family: monospace;
        }
        .footer-page-content pre {
          background: #f4f4f4;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
      `}</style>
    </>
  );
};

export default FooterPage;
