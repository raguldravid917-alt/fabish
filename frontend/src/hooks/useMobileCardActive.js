import { useState, useEffect, useId, useMemo } from 'react';
import { cardListeners, getSharedObserver, setActiveCardId, getActiveCardId, isMobileOrTouchTablet } from '../utils/mobileCardObserver';

export const useMobileCardActive = (productId, cardRef) => {
  const [isActiveMobile, setIsActiveMobile] = useState(false);
  const reactId = useId();
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

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof window === 'undefined') return;

    cardListeners.set(cardId, setIsActiveMobile);

    const observer = getSharedObserver();
    if (observer) {
      observer.observe(el);
    }

    return () => {
      cardListeners.delete(cardId);
      if (observer && el) {
        observer.unobserve(el);
      }
      if (getActiveCardId() === cardId) {
        setActiveCardId(null);
      }
    };
  }, [cardId, cardRef]);

  const handleCardInteraction = (e) => {
    if (!isMobileOrTouchTablet()) return;
    if (isActiveMobile) return;

    // First tap: prevent navigation, show action buttons, mark card active
    e.preventDefault();
    e.stopPropagation();

    setActiveCardId(cardId);
  };

  return {
    isActiveMobile,
    useMobileInteraction,
    handleCardInteraction,
    cardId,
  };
};
