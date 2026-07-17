// Map to hold all registered card listeners. Key: cardId, Value: callback function (setter)
export const cardListeners = new Map();

// Global track of the currently active card's ID
let activeCardId = null;
let sharedObserver = null;

export const isMobileOrTouchTablet = () => {
  if (typeof window === 'undefined') return false;
  const isMobileWidth = window.innerWidth < 768;
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  return isMobileWidth || !supportsHover;
};

export const getActiveCardId = () => activeCardId;

export const setActiveCardId = (id) => {
  activeCardId = id;
  cardListeners.forEach((setter, listenerId) => {
    setter(listenerId === id);
  });
};

export const getSharedObserver = () => {
  if (typeof window === 'undefined') return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        // Only run visibility tracking on mobile/touch-tablet screens
        if (!isMobileOrTouchTablet()) return;

        // 1. Handle active card scrolling out of view
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            const targetId = entry.target.getAttribute('data-card-id');
            if (targetId === activeCardId) {
              setActiveCardId(null);
            }
          }
        });

        // 2. Detect card with highest visibility to make active
        let bestEntry = null;
        let maxRatio = 0.45; // Must be at least 45% visible

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        });

        if (bestEntry) {
          const targetId = bestEntry.target.getAttribute('data-card-id');
          if (targetId && targetId !== activeCardId) {
            setActiveCardId(targetId);
          }
        }
      },
      {
        root: null,
        rootMargin: '-15% 0px -15% 0px', // focused toward the vertical center
        threshold: [0.1, 0.3, 0.45, 0.6, 0.8, 1.0],
      }
    );
  }
  return sharedObserver;
};
