import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import Constants from 'expo-constants';
import type { Product } from '@types/index';

const AFFILIATE_TAG =
  Constants.expoConfig?.extra?.amazon?.affiliateTag ?? 'pricepop-20';

const AMAZON_BASE = 'https://www.amazon.com/dp/';

// ─── Build Affiliate URL ──────────────────────────────────────────────────────

/**
 * Constructs a properly tagged Amazon affiliate URL.
 * Handles both ASIN-based and pre-built URLs.
 *
 * Amazon affiliate link format:
 *   https://www.amazon.com/dp/{ASIN}?tag={AFFILIATE_TAG}&linkCode=ll1&language=en_US
 */
export function buildAffiliateUrl(
  asin: string,
  options: { tag?: string; campaign?: string } = {}
): string {
  const tag = options.tag ?? AFFILIATE_TAG;
  const campaign = options.campaign ?? 'pricepop_game';

  const params = new URLSearchParams({
    tag,
    linkCode: 'll1',
    language: 'en_US',
    ref_: `as_li_${campaign}`,
  });

  return `${AMAZON_BASE}${asin}?${params.toString()}`;
}

/**
 * Takes an existing URL and ensures the affiliate tag is present/correct.
 * Use this if you store full URLs in Firestore.
 */
export function injectAffiliateTag(url: string, tag?: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('tag', tag ?? AFFILIATE_TAG);
    parsed.searchParams.set('linkCode', 'll1');
    return parsed.toString();
  } catch {
    return url;
  }
}

// ─── Open Product in Browser ─────────────────────────────────────────────────

/**
 * Opens the Amazon product page in an in-app browser.
 * iOS → SafariViewController
 * Android → Chrome Custom Tab
 * Both stay in-app — critical for affiliate attribution.
 */
export async function openProductOnAmazon(
  product: Pick<Product, 'asin' | 'name'>,
  source: 'results' | 'reveal' | 'home' = 'results'
): Promise<void> {
  const url = buildAffiliateUrl(product.asin, { campaign: `pricepop_${source}` });

  await openBrowserAsync(url, {
    presentationStyle: WebBrowserPresentationStyle.FORM_SHEET,
    enableBarCollapsing: true,
    toolbarColor: '#0F0F1A',
    controlsColor: '#FF6B35',
    showTitle: true,
  });
}

/**
 * Opens from a pre-built URL stored in Firestore.
 * Ensures affiliate tag is always injected at call time.
 */
export async function openAffiliateUrl(
  storedUrl: string,
  source = 'app'
): Promise<void> {
  const url = injectAffiliateTag(storedUrl);
  await openBrowserAsync(url, {
    presentationStyle: WebBrowserPresentationStyle.FORM_SHEET,
    toolbarColor: '#0F0F1A',
    controlsColor: '#FF6B35',
    showTitle: true,
  });
}

// ─── Affiliate Disclosure ────────────────────────────────────────────────────

export const AFFILIATE_DISCLOSURE =
  'PricePop participates in the Amazon Associates Program. ' +
  'As an Amazon Associate, PricePop earns a commission from qualifying purchases ' +
  'at no additional cost to you.';

// ─── Track Affiliate Click (analytics) ───────────────────────────────────────

export function getAffiliateLinkInfo(asin: string): {
  url: string;
  tag: string;
  asin: string;
} {
  return {
    url: buildAffiliateUrl(asin),
    tag: AFFILIATE_TAG,
    asin,
  };
}
