/**
 * Dynamic document title hook.
 * Sets the page title for SEO and browser tab display.
 *
 * @param {string} title - Page title (will be suffixed with " | Fabish")
 *
 * @example
 * useDocumentTitle('Home');      // → "Home | Fabish"
 * useDocumentTitle('Face Cream'); // → "Face Cream | Fabish"
 */
import { useEffect } from 'react';

const SITE_NAME = 'Fabish';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};
