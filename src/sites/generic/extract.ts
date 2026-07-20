import { textOf } from '../../shared/text';
import type { OfferData } from './types';

/**
 * Generic, site-agnostic extraction. Kept deliberately simple for now:
 * reads schema.org JobPosting JSON-LD if present (many ATS/job boards embed
 * it for SEO), and falls back to <title> / meta description otherwise.
 *
 * Site-specific modules under src/sites/<site>/ can override any of this
 * with selectors tailored to that site.
 */
export function extractGenericOffer(): OfferData {
  const jobPosting = findJobPostingJsonLd();

  return {
    url: location.href,
    title: textOf(jobPosting?.title) ?? textOf(document.title),
    company: textOf(jobPosting?.hiringOrganization?.name),
    location: textOf(jobPosting?.jobLocation?.address?.addressLocality),
    description: textOf(jobPosting?.description) ?? textOf(getMetaContent('description')),
    raw: jobPosting,
  };
}

interface JsonLdJobPosting {
  '@type'?: string;
  title?: string;
  description?: string;
  hiringOrganization?: { name?: string };
  jobLocation?: { address?: { addressLocality?: string } };
}

function findJobPostingJsonLd(): JsonLdJobPosting | undefined {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of Array.from(scripts)) {
    const parsed = tryParseJson(script.textContent);
    if (!parsed) continue;
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const jobPosting = items.find((item) => item && item['@type'] === 'JobPosting');
    if (jobPosting) return jobPosting as JsonLdJobPosting;
  }
  return undefined;
}

function tryParseJson(text: string | null): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function getMetaContent(name: string): string | null {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;
}
