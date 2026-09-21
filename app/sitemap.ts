import type { MetadataRoute } from 'next';

const BASE_URL = 'https://novamart.demo';

const STATIC_ROUTES: string[] = [
  '/',
  '/shop',
  '/deals',
  '/about',
  '/contact',
  '/faq',
  '/shipping',
  '/privacy',
  '/terms',
  '/track',
  '/login',
  '/signup',
  '/cart',
  '/checkout',
];

const CATEGORY_SLUGS: string[] = [
  'electronics',
  'home-kitchen',
  'fashion',
  'beauty',
  'sports',
  'toys-and-games',
];

// Read-only snapshot of data/seed.json product slugs (48 products). Do not edit by hand —
// regenerate from the seed file if the catalog changes.
const PRODUCT_SLUGS: string[] = [
  'aurora-x9-noise-cancelling-headphones',
  'voltcharge-65w-gan-charger',
  'pixelpro-4k-action-camera',
  'homehub-mini-smart-speaker',
  'mechpro-rgb-mechanical-keyboard',
  'ultraview-27-4k-monitor',
  'airbuds-pro-wireless-earbuds',
  'voltpack-20000mah-power-bank',
  'brewmaster-pour-over-coffee-set',
  'chefpro-12pc-knife-set',
  'aromamist-ultrasonic-diffuser',
  'culina-ceramic-cookware-10pc',
  'lumiglow-desk-lamp',
  'robovac-s9-self-cleaning',
  'nordhaus-bamboo-bath-tray',
  'trailmate-insulated-bottle-1l',
  'essential-organic-cotton-tee',
  'urbanweave-denim-trucker-jacket',
  'cloudstep-running-sneakers',
  'nordknit-merino-crew-sweater',
  'amara-linen-summer-dress',
  'velluto-classic-leather-tote',
  'threadline-slim-fit-chinos',
  'solstice-aviator-sunglasses',
  'lumiere-vitamin-c-serum',
  'hydraboost-hyaluronic-moisturizer',
  'velvetine-12pc-brush-set',
  'botanica-argan-repair-oil',
  'velvetine-matte-lipstick-set',
  'pureearth-charcoal-clay-mask',
  'glowtech-facial-cleansing-brush',
  'pureearth-natural-deodorant-duo',
  'flexform-progrip-yoga-mat',
  'ironcore-adjustable-dumbbell',
  'trailmate-gym-duffel',
  'flexform-resistance-band-set',
  'summit-trail-backpack-20l',
  'pulsefit-smart-jump-rope',
  'courtking-pickleball-paddle-set',
  'flexform-recovery-foam-roller',
  'brickworks-city-builder-1200pc',
  'empires-strategy-board-game',
  'turbotots-rc-stunt-car',
  'cuddlecrew-plush-dragon',
  'mindspark-volcano-science-kit',
  'timbertots-wooden-train-set',
  'pieceful-starry-harbor-puzzle',
  'skydart-mini-4k-drone',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/shop/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = PRODUCT_SLUGS.map((slug) => ({
    url: `${BASE_URL}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
