import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Save current scroll behavior
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    // Disable smooth scroll temporarily to prevent visual animation delays or jumps
    document.documentElement.style.scrollBehavior = 'auto';

    window.scrollTo(0, 0);

    // Restore original scroll behavior
    document.documentElement.style.scrollBehavior = originalScrollBehavior;
  }, [pathname]);

  return null;
};

export default ScrollToTop;
