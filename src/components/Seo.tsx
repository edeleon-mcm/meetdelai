import { useEffect } from 'react';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  ogImage?: string;
}

export function Seo({ title, description, canonical, jsonLd, ogImage }: Props) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (ogImage) {
      setMeta('og:image', ogImage, 'property');
      setMeta('twitter:image', ogImage);
    }
    const url = canonical || (typeof window !== 'undefined' ? window.location.href.split('#')[0].split('?')[0] : '');
    setLink('canonical', url);
    setMeta('og:url', url, 'property');
    const cleanup = injectJsonLd(jsonLd);
    return cleanup;
  }, [title, description, canonical, jsonLd, ogImage]);
  return null;
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSON_LD_ID = 'delai-jsonld';

function injectJsonLd(data?: Record<string, unknown> | Array<Record<string, unknown>>) {
  const old = document.getElementById(JSON_LD_ID);
  if (old) old.remove();
  if (!data) return () => {};
  const tag = document.createElement('script');
  tag.type = 'application/ld+json';
  tag.id = JSON_LD_ID;
  tag.text = JSON.stringify(data);
  document.head.appendChild(tag);
  return () => { tag.remove(); };
}

const PERSON: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Elmer De Leon',
  alternateName: 'DELAI',
  url: 'https://meetdelai.com',
  jobTitle: 'AI Consultant & Founder',
  worksFor: { '@type': 'Organization', name: 'DELAI (DeLeonAI)' },
  description: 'AI consultant, fractional CTO, and full-build engineer. Founder of DELAI, operating six AI products in production (Found, Modus, BiTES, HostGPT, PAGE, Munchies).',
};

export function personSchema() {
  return PERSON;
}

export function articleSchema(opts: { title: string; description: string; url: string; datePublished: string; image?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: opts.datePublished,
    author: PERSON,
    publisher: PERSON,
    ...(opts.image ? { image: opts.image } : {}),
  };
}
