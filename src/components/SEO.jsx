import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'KITS Sports Club — Official Sports Portal | KKR & KSR Institute of Technology & Sciences';
const DEFAULT_DESCRIPTION = 'Official Sports Management Portal of KKR & KSR Institute of Technology & Sciences (KITS Guntur). Register for sports, track memberships, varsity athletes, and university honors.';
const BASE_URL = 'https://kitssports.in';
const DEFAULT_IMAGE = `${BASE_URL}/kits_logo.png`;

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  canonicalUrl,
  robots = 'index, follow',
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  jsonLd,
}) {
  const location = useLocation();

  useEffect(() => {
    // 1. Document Title
    const formattedTitle = title
      ? (title.includes('KITS') || title.includes('KiTS') ? title : `${title} | KITS Sports Club`)
      : DEFAULT_TITLE;
    document.title = formattedTitle;

    // Helper to update or create a meta tag
    const setMetaTag = (attribute, attrValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Primary Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);

    // 3. Canonical URL
    let fullCanonical = canonicalUrl;
    if (!fullCanonical) {
      const path = canonicalPath !== undefined ? canonicalPath : location.pathname;
      const cleanPath = path === '/' ? '/' : path.replace(/\/+$/, '');
      fullCanonical = `${BASE_URL}${cleanPath}`;
    }

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonical);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullCanonical);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:url', fullCanonical);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Optional Structured Data (JSON-LD)
    let scriptTag = null;
    if (jsonLd) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.setAttribute('data-dynamic-seo', 'true');
      scriptTag.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptTag);
    }

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, canonicalPath, canonicalUrl, robots, ogType, ogImage, jsonLd, location.pathname]);

  return null;
}
