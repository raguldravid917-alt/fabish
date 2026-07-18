import { useState, useEffect, useId, useMemo } from 'react';

// Helper function to detect mobile/touch-tablet interface
export const isMobileOrTouchTablet = () => {
  if (typeof window === 'undefined') return false;
  const isMobileWidth = window.innerWidth < 768;
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  return isMobileWidth || !supportsHover;
};

export const useMobileCardActive = (productId, cardRef) => {
  const [isActiveMobile, setIsActiveMobile] = useState(false);
  const reactId = useId();
  // Unique card ID for state management/accessibility
  const cardId = useMemo(() => `card-${productId}-${reactId.replace(/:/g, '')}`, [productId, reactId]);

  const [useMobileInteraction, setUseMobileInteraction] = useState(false);

  useEffect(() => {
    const checkInteraction = () => {
      setUseMobileInteraction(isMobileOrTouchTablet());
    };
    checkInteraction();
    window.addEventListener('resize', checkInteraction);
    return () => window.removeEventListener('resize', checkInteraction);
  }, []);

  // Listen for clicks outside to deactivate the card on mobile
  useEffect(() => {
    if (!useMobileInteraction) return;

    const handleOutsideClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsActiveMobile(false);
      }
    };

    // Use capture phase for click to ensure we intercept it, and touchstart for mobile responsiveness
    document.addEventListener('click', handleOutsideClick, { capture: true });
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });

    return () => {
      document.removeEventListener('click', handleOutsideClick, { capture: true });
      document.removeEventListener('touchstart', handleOutsideClick, { passive: true });
    };
  }, [useMobileInteraction, cardRef]);

  const handleCardInteraction = (e) => {
    if (!isMobileOrTouchTablet()) return;
    if (isActiveMobile) return;

    // First tap: prevent navigation/default action, show action buttons/icons, and mark card active
    e.preventDefault();
    e.stopPropagation();

    setIsActiveMobile(true);
  };

  return {
    isActiveMobile,
    useMobileInteraction,
    handleCardInteraction,
    cardId,
  };
};
