/**
 * Centralized Skin Type & Collection Config
 * Single source of truth for "Shop By Skin Type" cards and Collection page resolvers.
 */

export const SKIN_TYPE_MAP = {
  'sensitive-skin': {
    name: 'Sensitive Skin',
    tag: 'SOOTHING',
    color: 'from-[#eef4ea] to-[#e4edd9]',
    icon: '🌿',
    slug: 'sensitive-skin',
    keywords: ['sensitive', 'soothing', 'gentle', 'calming', 'redness', 'aloe'],
    description: 'Ultra-gentle, biocompatible botanical formulations designed to soothe reactivity and reinforce delicate skin barriers.',
    fallbackCount: 18,
  },
  'dry-skin': {
    name: 'Dry & Dehydrated',
    tag: 'HYDRATING',
    color: 'from-blue-50 to-[#eef4ff]',
    icon: '💧',
    slug: 'dry-skin',
    aliases: ['dry-dehydrated'],
    keywords: ['dry', 'dehydrated', 'hydrating', 'moisture', 'nourishing', 'hyaluronic'],
    description: 'Deeply restorative, lipid-replenishing moisture treatments engineered for parched, dehydrated skin.',
    fallbackCount: 24,
  },
  'dry-dehydrated': {
    name: 'Dry & Dehydrated',
    tag: 'HYDRATING',
    color: 'from-blue-50 to-[#eef4ff]',
    icon: '💧',
    slug: 'dry-skin',
    keywords: ['dry', 'dehydrated', 'hydrating', 'moisture', 'nourishing', 'hyaluronic'],
    description: 'Deeply restorative, lipid-replenishing moisture treatments engineered for parched, dehydrated skin.',
    fallbackCount: 24,
  },
  'oily-skin': {
    name: 'Oily & Acne Prone',
    tag: 'BALANCING',
    color: 'from-amber-50 to-orange-100',
    icon: '✨',
    slug: 'oily-skin',
    aliases: ['oily-acne-prone'],
    keywords: ['oily', 'acne', 'blemish', 'purifying', 'balancing', 'sebum', 'niacinamide', 'foam', 'cleanser'],
    description: 'Weightless, pore-refining botanical actives that clarify excess sebum without stripping essential hydration.',
    fallbackCount: 15,
  },
  'oily-acne-prone': {
    name: 'Oily & Acne Prone',
    tag: 'BALANCING',
    color: 'from-amber-50 to-orange-100',
    icon: '✨',
    slug: 'oily-skin',
    keywords: ['oily', 'acne', 'blemish', 'purifying', 'balancing', 'sebum', 'niacinamide', 'foam', 'cleanser'],
    description: 'Weightless, pore-refining botanical actives that clarify excess sebum without stripping essential hydration.',
    fallbackCount: 15,
  },
  'combination-skin': {
    name: 'Combination Skin',
    tag: 'HARMONIZING',
    color: 'from-rose-50 to-pink-100',
    icon: '🌸',
    slug: 'combination-skin',
    aliases: ['combination'],
    keywords: ['combination', 'harmonizing', 'balancing', 'medium', 'matte', 'foundation'],
    description: 'Harmonizing formulas that target dry cheeks while controlling T-zone shine for balanced skin clarity.',
    fallbackCount: 20,
  },
  'combination': {
    name: 'Combination Skin',
    tag: 'HARMONIZING',
    color: 'from-rose-50 to-pink-100',
    icon: '🌸',
    slug: 'combination-skin',
    keywords: ['combination', 'harmonizing', 'balancing', 'medium', 'matte', 'foundation'],
    description: 'Harmonizing formulas that target dry cheeks while controlling T-zone shine for balanced skin clarity.',
    fallbackCount: 20,
  },
  'normal-skin': {
    name: 'Normal Skin',
    tag: 'RADIANCE',
    color: 'from-stone-50 to-amber-100',
    icon: '☀️',
    slug: 'normal-skin',
    aliases: ['normal'],
    keywords: ['normal', 'radiance', 'all skin types', 'everyday', 'antioxidant', 'wash', 'body'],
    description: 'Daily protective and radiance-enhancing organic skincare to maintain optimal skin vitality.',
    fallbackCount: 30,
  },
  'normal': {
    name: 'Normal Skin',
    tag: 'RADIANCE',
    color: 'from-stone-50 to-amber-100',
    icon: '☀️',
    slug: 'normal-skin',
    keywords: ['normal', 'radiance', 'all skin types', 'everyday', 'antioxidant', 'wash', 'body'],
    description: 'Daily protective and radiance-enhancing organic skincare to maintain optimal skin vitality.',
    fallbackCount: 30,
  },
  'anti-aging': {
    name: 'Anti-Aging',
    tag: 'RENEWAL',
    color: 'from-purple-50 to-indigo-100',
    icon: '👑',
    slug: 'anti-aging',
    keywords: ['anti-aging', 'anti aging', 'wrinkle', 'firming', 'renewal', 'rejuvenating', 'collagen', 'peptide', 'aging'],
    description: 'Advanced cellular-renewal bio-actives that diminish fine lines and promote youthful skin firmness.',
    fallbackCount: 16,
  },
};

export const SKIN_TYPE_CARDS = [
  { name: 'Sensitive Skin', tag: 'SOOTHING', color: 'from-[#eef4ea] to-[#e4edd9]', icon: '🌿', fallbackCount: 18, slug: 'sensitive-skin', link: '/collections/sensitive-skin' },
  { name: 'Dry & Dehydrated', tag: 'HYDRATING', color: 'from-blue-50 to-[#eef4ff]', icon: '💧', fallbackCount: 24, slug: 'dry-skin', link: '/collections/dry-skin' },
  { name: 'Oily & Acne Prone', tag: 'BALANCING', color: 'from-amber-50 to-orange-100', icon: '✨', fallbackCount: 15, slug: 'oily-skin', link: '/collections/oily-skin' },
  { name: 'Combination', tag: 'HARMONIZING', color: 'from-rose-50 to-pink-100', icon: '🌸', fallbackCount: 20, slug: 'combination-skin', link: '/collections/combination-skin' },
  { name: 'Normal Skin', tag: 'RADIANCE', color: 'from-stone-50 to-amber-100', icon: '☀️', fallbackCount: 30, slug: 'normal-skin', link: '/collections/normal-skin' },
  { name: 'Anti-Aging', tag: 'RENEWAL', color: 'from-purple-50 to-indigo-100', icon: '👑', fallbackCount: 16, slug: 'anti-aging', link: '/collections/anti-aging' },
];

/**
 * Get skin type configuration object by URL slug
 * @param {string} slug
 * @returns {object|null}
 */
export const getSkinTypeConfig = (slug) => {
  if (!slug || typeof slug !== 'string') return null;
  const normalized = slug.toLowerCase().trim();
  return SKIN_TYPE_MAP[normalized] || null;
};

/**
 * Filter an array of products matching a given skin type slug
 * @param {Array} products
 * @param {string} slug
 * @returns {Array}
 */
export const filterProductsBySkinType = (products, slug) => {
  if (!Array.isArray(products) || products.length === 0) return [];
  const config = getSkinTypeConfig(slug);
  if (!config) return [];

  return products.filter((product) => {
    if (!product || typeof product !== 'object') return false;

    // Direct skinType or suitableFor array match
    if (Array.isArray(product.skinType) && product.skinType.some(st => config.keywords.some(kw => String(st).toLowerCase().includes(kw)))) {
      return true;
    }
    if (Array.isArray(product.suitableFor) && product.suitableFor.some(sf => config.keywords.some(kw => String(sf).toLowerCase().includes(kw)))) {
      return true;
    }
    if (Array.isArray(product.tags) && product.tags.some(tag => config.keywords.some(kw => String(tag).toLowerCase().includes(kw)))) {
      return true;
    }

    // Text content matching title, description, subcategory
    const searchableText = [
      product.title || '',
      product.description || '',
      product.subcategory || '',
      typeof product.category === 'object' ? product.category?.name : (product.category || ''),
    ].join(' ').toLowerCase();

    return config.keywords.some((kw) => searchableText.includes(kw.toLowerCase()));
  });
};
