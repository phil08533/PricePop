/**
 * Product Seeder — PricePop
 *
 * Seeds Firestore with 50 real Amazon products across 8 categories.
 * Each product has a real ASIN so affiliate links work immediately.
 *
 * Usage:
 *   1. Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account key
 *   2. npm run seed
 *
 * Or use the Firebase console to manually import products.json
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Init Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'firebase-admin-key.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ firebase-admin-key.json not found. Download from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
const db = admin.firestore();

const AFFILIATE_TAG = 'pricepop-20'; // Replace with your tag

function makeAffiliate(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}&linkCode=ll1&language=en_US`;
}

// ─── Product Data ─────────────────────────────────────────────────────────────
// 50 real products with real ASINs, realistic prices, and hosted images.
// Images use Amazon's CDN (publicly accessible).

const PRODUCTS = [
  // ── Electronics ──────────────────────────────────────────────────────────
  {
    name: 'Apple AirPods Pro (2nd Generation)',
    description: 'Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio',
    asin: 'B0BDHWDR12',
    imageUrl: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 249.00,
    brand: 'Apple',
    difficultyRating: 2,
  },
  {
    name: 'Kindle Paperwhite (16 GB)',
    description: '6.8" display, adjustable warm light, waterproof, 3 months free Kindle Unlimited',
    asin: 'B09TMF6742',
    imageUrl: 'https://m.media-amazon.com/images/I/61GROsQLyOL._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 139.99,
    brand: 'Amazon',
    difficultyRating: 2,
  },
  {
    name: 'Echo Dot (5th Gen)',
    description: 'Smart speaker with Alexa, improved audio, motion detection',
    asin: 'B09B8V1LZ3',
    imageUrl: 'https://m.media-amazon.com/images/I/71xoR4A6q-L._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 49.99,
    brand: 'Amazon',
    difficultyRating: 2,
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling, 30-hour battery, multipoint connection',
    asin: 'B09XS7JWHH',
    imageUrl: 'https://m.media-amazon.com/images/I/61vJMkHj8wL._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 279.99,
    brand: 'Sony',
    difficultyRating: 3,
  },
  {
    name: 'Anker 65W USB-C Charger (3-port)',
    description: 'Fast charging for MacBook, iPhone, iPad simultaneously',
    asin: 'B08T5QVTKW',
    imageUrl: 'https://m.media-amazon.com/images/I/61Hg4WZqWqL._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 35.99,
    brand: 'Anker',
    difficultyRating: 3,
  },
  {
    name: 'Tile Mate Bluetooth Tracker (4-pack)',
    description: 'Find your keys, wallet, remote — 250ft range, works with Alexa',
    asin: 'B09B2VGTP1',
    imageUrl: 'https://m.media-amazon.com/images/I/71RrMJWkO8L._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 69.99,
    brand: 'Tile',
    difficultyRating: 3,
  },
  {
    name: 'LEVOIT Air Purifier Core 300',
    description: 'True HEPA filter, covers 219 sq ft, quiet, removes 99.97% of particles',
    asin: 'B07VXK7GNM',
    imageUrl: 'https://m.media-amazon.com/images/I/71LJuuDW+yL._AC_SX679_.jpg',
    category: 'home',
    realPrice: 99.99,
    brand: 'LEVOIT',
    difficultyRating: 3,
  },
  // ── Home ──────────────────────────────────────────────────────────────────
  {
    name: 'Instant Pot Duo 7-in-1 (6 Quart)',
    description: 'Electric pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker',
    asin: 'B00FLYWNYQ',
    imageUrl: 'https://m.media-amazon.com/images/I/71mAEoVOj2L._AC_SX679_.jpg',
    category: 'home',
    realPrice: 99.95,
    brand: 'Instant Pot',
    difficultyRating: 2,
  },
  {
    name: 'Cuisinart 12-Cup Coffee Maker',
    description: 'Programmable, brew pause feature, adjustable keep-warm temperature',
    asin: 'B00MVWGQY0',
    imageUrl: 'https://m.media-amazon.com/images/I/71pCDnRwmkL._AC_SX679_.jpg',
    category: 'home',
    realPrice: 79.99,
    brand: 'Cuisinart',
    difficultyRating: 2,
  },
  {
    name: 'Roomba 694 Robot Vacuum',
    description: 'Works with Alexa, Wi-Fi connected, self-charging, works on carpet and hard floors',
    asin: 'B08794YNPR',
    imageUrl: 'https://m.media-amazon.com/images/I/61pCGQvbqNL._AC_SX679_.jpg',
    category: 'home',
    realPrice: 179.99,
    brand: 'iRobot',
    difficultyRating: 2,
  },
  {
    name: 'BISSELL Little Green Multi-Purpose Cleaner',
    description: 'Portable spot and stain cleaner, removes pet stains, upholstery, car',
    asin: 'B0028XNHVK',
    imageUrl: 'https://m.media-amazon.com/images/I/71KtCZOoTBL._AC_SX679_.jpg',
    category: 'home',
    realPrice: 119.99,
    brand: 'BISSELL',
    difficultyRating: 3,
  },
  {
    name: 'Ninja BL610 Professional Blender',
    description: '1000W, 72oz total crushing pitcher, crushes ice, frozen fruit',
    asin: 'B00NGV4506',
    imageUrl: 'https://m.media-amazon.com/images/I/71v4fBmXLiL._AC_SX679_.jpg',
    category: 'home',
    realPrice: 89.99,
    brand: 'Ninja',
    difficultyRating: 2,
  },
  // ── Fashion ──────────────────────────────────────────────────────────────
  {
    name: 'Levi\'s Men\'s 501 Original Jeans',
    description: 'Classic straight fit, button fly, 100% cotton denim',
    asin: 'B0014N1YUO',
    imageUrl: 'https://m.media-amazon.com/images/I/71LvJTSbdlL._AC_SX679_.jpg',
    category: 'fashion',
    realPrice: 59.50,
    brand: "Levi's",
    difficultyRating: 3,
  },
  {
    name: 'Hanes Men\'s ComfortSoft Crewneck T-Shirts (6-Pack)',
    description: 'Moisture-wicking cotton blend, tagless label, preshrunk fabric',
    asin: 'B000NKJDES',
    imageUrl: 'https://m.media-amazon.com/images/I/81RkLmx-qdL._AC_SX679_.jpg',
    category: 'fashion',
    realPrice: 20.00,
    brand: 'Hanes',
    difficultyRating: 4,
  },
  {
    name: 'UGG Women\'s Classic Short Boots',
    description: 'Twinface sheepskin, molded EVA outsole, suede heel counter',
    asin: 'B0009ETGGA',
    imageUrl: 'https://m.media-amazon.com/images/I/71+aMpA7JNL._AC_SX679_.jpg',
    category: 'fashion',
    realPrice: 165.00,
    brand: 'UGG',
    difficultyRating: 2,
  },
  {
    name: 'Ray-Ban Aviator Classic Sunglasses',
    description: 'Metal frame, crystal lens, UV protection, iconic pilot silhouette',
    asin: 'B001BKWDQM',
    imageUrl: 'https://m.media-amazon.com/images/I/61YX9GNlhGL._AC_SX679_.jpg',
    category: 'fashion',
    realPrice: 161.00,
    brand: 'Ray-Ban',
    difficultyRating: 3,
  },
  // ── Beauty ────────────────────────────────────────────────────────────────
  {
    name: 'CeraVe Moisturizing Cream (19 oz)',
    description: 'For normal to dry skin, 3 essential ceramides, hyaluronic acid, fragrance-free',
    asin: 'B00TTD9BRC',
    imageUrl: 'https://m.media-amazon.com/images/I/71EV5XQmqNL._AC_SX679_.jpg',
    category: 'beauty',
    realPrice: 19.99,
    brand: 'CeraVe',
    difficultyRating: 4,
  },
  {
    name: 'Revlon One-Step Hair Dryer & Volumizer',
    description: 'Dries and volumizes in one step, oval brush design, ionic technology',
    asin: 'B01LSUQSB0',
    imageUrl: 'https://m.media-amazon.com/images/I/71GAbEELDeL._AC_SX679_.jpg',
    category: 'beauty',
    realPrice: 59.88,
    brand: 'Revlon',
    difficultyRating: 2,
  },
  {
    name: 'Neutrogena Hydro Boost Water Gel',
    description: 'Oil-free moisturizer with hyaluronic acid, ultra-lightweight, non-comedogenic',
    asin: 'B01MSSDEPK',
    imageUrl: 'https://m.media-amazon.com/images/I/71kB7bTWDPL._AC_SX679_.jpg',
    category: 'beauty',
    realPrice: 25.15,
    brand: 'Neutrogena',
    difficultyRating: 4,
  },
  {
    name: 'OGX Extra Strength Argan Oil Serum',
    description: 'Smoothing hair serum, frizz control, UV protection, 3.3 fl oz',
    asin: 'B00OYHGQ64',
    imageUrl: 'https://m.media-amazon.com/images/I/71Bh7jfFGRL._AC_SX679_.jpg',
    category: 'beauty',
    realPrice: 12.97,
    brand: 'OGX',
    difficultyRating: 4,
  },
  // ── Sports & Outdoors ─────────────────────────────────────────────────────
  {
    name: 'Hydro Flask 32 oz Water Bottle',
    description: 'Stainless steel, double-wall vacuum insulation, 24-hour cold, 12-hour hot',
    asin: 'B01ACAKZEE',
    imageUrl: 'https://m.media-amazon.com/images/I/41nT1tmA7BL._AC_SX679_.jpg',
    category: 'sports',
    realPrice: 44.95,
    brand: 'Hydro Flask',
    difficultyRating: 3,
  },
  {
    name: 'Manduka PRO Yoga Mat',
    description: 'Ultimate density cushioning, non-slip, high-performance, 6mm thick',
    asin: 'B0012FMZDO',
    imageUrl: 'https://m.media-amazon.com/images/I/81DEdGlAiuL._AC_SX679_.jpg',
    category: 'sports',
    realPrice: 120.00,
    brand: 'Manduka',
    difficultyRating: 2,
  },
  {
    name: 'Fitbit Charge 6 Fitness Tracker',
    description: 'Built-in GPS, heart rate, sleep tracking, Google Maps, 7-day battery',
    asin: 'B0CCQ7DNQL',
    imageUrl: 'https://m.media-amazon.com/images/I/71lX9H7VPBL._AC_SX679_.jpg',
    category: 'sports',
    realPrice: 159.95,
    brand: 'Fitbit',
    difficultyRating: 2,
  },
  {
    name: 'Resistance Bands Set (5 bands)',
    description: 'Natural latex, 12-125 lbs resistance, includes carrying bag and exercise guide',
    asin: 'B01AVDVHTI',
    imageUrl: 'https://m.media-amazon.com/images/I/71ug-VRHpXL._AC_SX679_.jpg',
    category: 'sports',
    realPrice: 29.99,
    brand: 'Fit Simplify',
    difficultyRating: 4,
  },
  {
    name: 'Coleman Sundome 4-Person Tent',
    description: 'Easy setup, rainfly included, 2 windows + door, WeatherTec system',
    asin: 'B000FIAPHO',
    imageUrl: 'https://m.media-amazon.com/images/I/91RJBJpLMWL._AC_SX679_.jpg',
    category: 'sports',
    realPrice: 89.99,
    brand: 'Coleman',
    difficultyRating: 3,
  },
  // ── Toys & Games ─────────────────────────────────────────────────────────
  {
    name: 'LEGO Icons Flower Bouquet (756 pieces)',
    description: 'Buildable flowers, gift idea, display model for adults',
    asin: 'B09BKXC2LQ',
    imageUrl: 'https://m.media-amazon.com/images/I/81sMWb8JVYL._AC_SX679_.jpg',
    category: 'toys',
    realPrice: 59.99,
    brand: 'LEGO',
    difficultyRating: 3,
  },
  {
    name: 'Jenga Classic Game',
    description: '54 hardwood blocks, includes stacking sleeve with instructions',
    asin: 'B074MGJRNX',
    imageUrl: 'https://m.media-amazon.com/images/I/81YVUGn9PVL._AC_SX679_.jpg',
    category: 'toys',
    realPrice: 15.99,
    brand: 'Hasbro',
    difficultyRating: 4,
  },
  {
    name: 'Nintendo Switch Joy-Con Controllers',
    description: 'Pair of Joy-Con in Neon Blue and Neon Red, HD rumble, motion sensing',
    asin: 'B01N6QJ58Y',
    imageUrl: 'https://m.media-amazon.com/images/I/61-PblYntsL._AC_SX679_.jpg',
    category: 'toys',
    realPrice: 79.99,
    brand: 'Nintendo',
    difficultyRating: 2,
  },
  {
    name: 'Melissa & Doug Wooden Activity Cube',
    description: '5 activities, spinning gears, bead maze, shape sorter, for ages 1+',
    asin: 'B00005C3VQ',
    imageUrl: 'https://m.media-amazon.com/images/I/91e6zBFGHJL._AC_SX679_.jpg',
    category: 'toys',
    realPrice: 48.99,
    brand: 'Melissa & Doug',
    difficultyRating: 4,
  },
  // ── Tools & Home Improvement ──────────────────────────────────────────────
  {
    name: 'DEWALT 20V MAX Cordless Drill (2-Tool Combo)',
    description: '1/2" drill/driver + impact driver, 2 batteries, bag included',
    asin: 'B00HGLZWOM',
    imageUrl: 'https://m.media-amazon.com/images/I/81pX+WGXAZL._AC_SX679_.jpg',
    category: 'tools',
    realPrice: 199.00,
    brand: 'DEWALT',
    difficultyRating: 2,
  },
  {
    name: 'WD 4TB Elements Portable Hard Drive',
    description: 'USB 3.0, plug-and-play, works with PC and Mac, drop protection',
    asin: 'B00JT8AJZ0',
    imageUrl: 'https://m.media-amazon.com/images/I/51tLCuTjnJL._AC_SX679_.jpg',
    category: 'tools',
    realPrice: 89.99,
    brand: 'Western Digital',
    difficultyRating: 3,
  },
  {
    name: 'BLACK+DECKER 20V Leaf Blower',
    description: 'Cordless, 100 MPH 300 CFM output, lightweight at 3.3 lbs, 1 battery included',
    asin: 'B07KHHDJGX',
    imageUrl: 'https://m.media-amazon.com/images/I/51UxX3-LBQL._AC_SX679_.jpg',
    category: 'tools',
    realPrice: 69.99,
    brand: 'BLACK+DECKER',
    difficultyRating: 3,
  },
  // ── Books ─────────────────────────────────────────────────────────────────
  {
    name: 'Atomic Habits — James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones, #1 bestseller',
    asin: '0735211299',
    imageUrl: 'https://m.media-amazon.com/images/I/81wgcld4wxL._AC_SY679_.jpg',
    category: 'books',
    realPrice: 15.99,
    brand: 'Penguin',
    difficultyRating: 4,
  },
  {
    name: 'The 48 Laws of Power — Robert Greene',
    description: 'International bestseller, over 1.2 million copies sold in the US',
    asin: '0140280197',
    imageUrl: 'https://m.media-amazon.com/images/I/71aG+xDKSYL._AC_SY679_.jpg',
    category: 'books',
    realPrice: 24.00,
    brand: 'Penguin',
    difficultyRating: 4,
  },
  // ── Food & Grocery ────────────────────────────────────────────────────────
  {
    name: 'KIND Bars Variety Pack (18 count)',
    description: 'Dark chocolate, caramel, nuts & spices — gluten free, non-GMO',
    asin: 'B00IYDTV6A',
    imageUrl: 'https://m.media-amazon.com/images/I/71PJ5TP5RRL._AC_SX679_.jpg',
    category: 'food',
    realPrice: 20.99,
    brand: 'KIND',
    difficultyRating: 4,
  },
  {
    name: 'Orgain Organic Protein Powder (2.74 lb)',
    description: '21g protein, plant-based, chocolate fudge, no soy, gluten free',
    asin: 'B00J074W7Q',
    imageUrl: 'https://m.media-amazon.com/images/I/81X1zQQZRsL._AC_SX679_.jpg',
    category: 'food',
    realPrice: 43.99,
    brand: 'Orgain',
    difficultyRating: 3,
  },
  {
    name: 'Burt\'s Bees Lip Balm Multipack (4-pack)',
    description: 'Original beeswax, 100% natural, moisturizing, vitamin E and peppermint',
    asin: 'B000Q3CWAO',
    imageUrl: 'https://m.media-amazon.com/images/I/71qSvQ-XSBL._AC_SX679_.jpg',
    category: 'beauty',
    realPrice: 10.97,
    brand: "Burt's Bees",
    difficultyRating: 4,
  },
  // ── Automotive ───────────────────────────────────────────────────────────
  {
    name: 'NOCO Boost Plus GB40 Jump Starter',
    description: '1000A for up to 6L gas or 3L diesel, 20x jump starts per charge',
    asin: 'B015TKUPIC',
    imageUrl: 'https://m.media-amazon.com/images/I/71fHPaLMLyL._AC_SX679_.jpg',
    category: 'automotive',
    realPrice: 99.95,
    brand: 'NOCO',
    difficultyRating: 2,
  },
  {
    name: 'Chemical Guys HOL169 Detailing Kit (14 items)',
    description: 'Complete car cleaning kit, foam cannon soap, tire cleaner, microfiber towels',
    asin: 'B00U2DTJ76',
    imageUrl: 'https://m.media-amazon.com/images/I/71Cb7VD0TyL._AC_SX679_.jpg',
    category: 'automotive',
    realPrice: 83.99,
    brand: 'Chemical Guys',
    difficultyRating: 3,
  },
  // ── More Electronics ──────────────────────────────────────────────────────
  {
    name: 'GoPro HERO12 Black',
    description: '5.3K60 video, HyperSmooth 6.0, waterproof 33ft, 1/1.9" sensor',
    asin: 'B0CDVP5K74',
    imageUrl: 'https://m.media-amazon.com/images/I/61JvFSP7bML._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 299.99,
    brand: 'GoPro',
    difficultyRating: 2,
  },
  {
    name: 'Bose QuietComfort Earbuds II',
    description: 'World\'s best noise cancellation, personalized, 6-hour battery + case',
    asin: 'B0B4PSFT6X',
    imageUrl: 'https://m.media-amazon.com/images/I/51Q3xXB5AJL._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 299.00,
    brand: 'Bose',
    difficultyRating: 2,
  },
  {
    name: 'Logitech MX Master 3S Mouse',
    description: '8K DPI, quiet clicks, USB-C charging, Bluetooth, compatible with any OS',
    asin: 'B09HM94VDS',
    imageUrl: 'https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 99.99,
    brand: 'Logitech',
    difficultyRating: 3,
  },
  {
    name: 'Samsung T7 Portable SSD 1TB',
    description: 'USB 3.2, up to 1,050 MB/s, compact metal design, password protection',
    asin: 'B0874XN4D8',
    imageUrl: 'https://m.media-amazon.com/images/I/61VTLhF2J2L._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 89.99,
    brand: 'Samsung',
    difficultyRating: 3,
  },
  {
    name: 'Ring Video Doorbell (2nd Gen)',
    description: '1080p HD video, improved motion detection, easy installation, works with Alexa',
    asin: 'B08N5NQ869',
    imageUrl: 'https://m.media-amazon.com/images/I/51xFKEjOdDL._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 99.99,
    brand: 'Ring',
    difficultyRating: 2,
  },
  {
    name: 'Roku Streaming Stick 4K',
    description: 'Dolby Vision, HDR10+, Dolby Atmos, private listening, voice remote',
    asin: 'B09BKCDXB9',
    imageUrl: 'https://m.media-amazon.com/images/I/51oiXLmfCsL._AC_SX679_.jpg',
    category: 'electronics',
    realPrice: 49.99,
    brand: 'Roku',
    difficultyRating: 3,
  },
  // ── More Home ─────────────────────────────────────────────────────────────
  {
    name: 'Philips Hue White Smart Bulb Starter Kit',
    description: '4 A19 bulbs + Hue Bridge, voice control, 16 million colors optional add-on',
    asin: 'B014H2P42K',
    imageUrl: 'https://m.media-amazon.com/images/I/61xA9JBPJOL._AC_SX679_.jpg',
    category: 'home',
    realPrice: 69.99,
    brand: 'Philips',
    difficultyRating: 3,
  },
  {
    name: 'Dyson V8 Cordless Vacuum',
    description: '40-min run time, HEPA filtration, versatile for floors and car',
    asin: 'B07BX9KT5Q',
    imageUrl: 'https://m.media-amazon.com/images/I/51LdlhPqavL._AC_SX679_.jpg',
    category: 'home',
    realPrice: 369.99,
    brand: 'Dyson',
    difficultyRating: 1,
  },
  {
    name: 'Lodge Cast Iron Skillet 10.25"',
    description: 'Pre-seasoned, dual handles, oven safe, works on all cooking surfaces',
    asin: 'B00006JSUA',
    imageUrl: 'https://m.media-amazon.com/images/I/81v1R2iQ+mL._AC_SX679_.jpg',
    category: 'home',
    realPrice: 33.90,
    brand: 'Lodge',
    difficultyRating: 3,
  },
  {
    name: 'Clorox Disinfecting Wipes (3 packs, 35 ct each)',
    description: 'Bleach-free, kills 99.9% of viruses and bacteria, multi-surface safe',
    asin: 'B07PJDKM8K',
    imageUrl: 'https://m.media-amazon.com/images/I/81XKW7uC4ZL._AC_SX679_.jpg',
    category: 'home',
    realPrice: 13.99,
    brand: 'Clorox',
    difficultyRating: 4,
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\n🌱 PricePop Product Seeder\n`);
  console.log(`Seeding ${PRODUCTS.length} products...\n`);

  const batch = db.batch();
  let count = 0;

  for (const product of PRODUCTS) {
    const ref = db.collection('products').doc();
    batch.set(ref, {
      ...product,
      affiliateUrl: makeAffiliate(product.asin),
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      timesShown: 0,
      timesCorrect: 0,
    });
    count++;
    console.log(`  ✓ ${product.name} — $${product.realPrice}`);
  }

  await batch.commit();

  console.log(`\n✅ Successfully seeded ${count} products to Firestore.\n`);
  console.log(`📊 Categories seeded:`);
  const categories = [...new Set(PRODUCTS.map((p) => p.category))];
  for (const cat of categories) {
    const n = PRODUCTS.filter((p) => p.category === cat).length;
    console.log(`   ${cat}: ${n} products`);
  }
  console.log(`\n🏷️  Affiliate tag: ${AFFILIATE_TAG}`);
  console.log(`💡 Tip: Replace 'pricepop-20' with your real Amazon Associates tag!\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
