/**
 * Shape of the data a site module can extract from a job offer / application
 * page. Every field is optional except `url`: a given site may not expose
 * all of them, and the generic extractor only fills what it can find
 * without knowing anything about the page's specific markup.
 */
export interface OfferData {
  url: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  /** Raw structured data the extractor found (e.g. schema.org JobPosting), for debugging or future fields. */
  raw?: unknown;
}
