import { useEffect } from "react";
import rawToolContent from "./tool-content.json";

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolSection {
  heading: string;
  body?: string;
  steps?: string[];
  subsections?: { heading: string; body: string }[];
}

export interface ToolInternalLink {
  route: string;
  anchor: string;
}

/** Landing-page guide + SEO fields for one tool route (also used by prerender). */
export interface ToolContent {
  name: string;
  /** Document / Open Graph title */
  title: string;
  /** Meta description */
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  h1: string;
  slug: string;
  /** Lead paragraphs (also HowTo description in JSON-LD) */
  intro: string;
  /** HowTo steps for JSON-LD */
  steps: string[];
  sections: ToolSection[];
  faqs: ToolFaq[];
  conclusion: string;
  internalLinks: ToolInternalLink[];
}

export const SITE_NAME = "PDFRobin";

export const DEFAULT_TITLE =
  "PDFRobin — 38 Free PDF Tools That Don’t Keep Your Files";

export const DEFAULT_DESCRIPTION =
  "Free tools for your better productivity. Merge, split, compress, convert, sign, OCR and edit PDFs — free and fast.";

export const OG_IMAGE_PATH = "/og-image.png";

export const toolContent = rawToolContent as Record<string, ToolContent>;

export const getToolContent = (route: string): ToolContent | undefined =>
  toolContent[route];

type MetaKey = { name: string } | { property: string };

function upsertMeta(key: MetaKey, content: string) {
  const selector =
    "name" in key ? `meta[name="${key.name}"]` : `meta[property="${key.property}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    if ("name" in key) el.setAttribute("name", key.name);
    else el.setAttribute("property", key.property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Canonical origin, fixed rather than read from window.location.origin.
 *
 * A visitor arriving on www.pdfrobin.com used to get a canonical naming www,
 * so the same page was advertised under two hosts and Google had to choose -
 * part of why pages sat in "Crawled - currently not indexed". The Vercel
 * redirect handles the request; this makes the tag agree with it.
 */
const SITE_ORIGIN = (
  import.meta.env.VITE_SITE_URL || "https://pdfrobin.com"
).replace(/\/+$/, "");

export interface SeoOptions {
  title: string;
  description: string;
  /** Absolute path, e.g. "/merge-pdf". Defaults to the current location. */
  path?: string;
  noindex?: boolean;
}

/**
 * Keeps the document head in step with client-side navigation.
 *
 * The static HTML for each route is written at build time by
 * scripts/prerender.mjs; this only has to correct the head once React takes
 * over routing, so the two must agree on how a title is composed.
 */
export function useSeo({ title, description, path, noindex }: SeoOptions) {
  useEffect(() => {
    const url = `${SITE_ORIGIN}${
      path ?? (typeof window === "undefined" ? "/" : window.location.pathname)
    }`;

    document.title = title;
    upsertMeta({ name: "description" }, description);
    upsertMeta({ property: "og:title" }, title);
    upsertMeta({ property: "og:description" }, description);
    upsertMeta({ property: "og:url" }, url);
    upsertMeta({ name: "twitter:title" }, title);
    upsertMeta({ name: "twitter:description" }, description);
    upsertCanonical(url);

    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noindex) {
      upsertMeta({ name: "robots" }, "noindex, follow");
    } else if (robots) {
      robots.remove();
    }
  }, [title, description, path, noindex]);
}
