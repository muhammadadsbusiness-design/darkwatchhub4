/**
 * Dark Watch - Central Dynamic SEO & Social Share Controller
 * Domain: https://darkwatchhub.vercel.app
 */

export const PUBLIC_DOMAIN = 'https://darkwatchhub.vercel.app';

export class SEOManager {
  static updatePageSEO(options = {}) {
    const {
      title,
      description,
      canonicalPath = '',
      robots = 'index, follow',
      image = `${PUBLIC_DOMAIN}/images/logo.svg`,
      type = 'website',
      jsonLd = null
    } = options;

    // 1. Title
    const formattedTitle = title
      ? (title.includes('Dark Watch') ? title : `${title} | Dark Watch`)
      : 'Dark Watch - مشاهدة مسلسلات وأفلام الكرتون والأنمي';
    document.title = formattedTitle;

    // 2. Meta Description
    const defaultDesc = 'Dark Watch - منصة مشاهدة مسلسلات وأفلام الكرتون والأنمي أونلاين بجودة عالية وبدون إعلانات مزعجة.';
    const cleanDesc = (description && description.trim().length > 5)
      ? description.trim().slice(0, 160)
      : defaultDesc;

    this.setMetaTag('name', 'description', cleanDesc);

    // 3. Meta Robots
    this.setMetaTag('name', 'robots', robots);

    // 4. Canonical URL (Canonical domain: https://darkwatchhub.vercel.app)
    let cleanPath = canonicalPath || '';
    if (!cleanPath.startsWith('/') && !cleanPath.startsWith('#')) {
      cleanPath = '/' + cleanPath;
    }
    const fullCanonicalUrl = `${PUBLIC_DOMAIN}${cleanPath ? (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath) : '/'}`;
    
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 5. OpenGraph Tags
    this.setMetaTag('property', 'og:site_name', 'Dark Watch');
    this.setMetaTag('property', 'og:title', formattedTitle);
    this.setMetaTag('property', 'og:description', cleanDesc);
    this.setMetaTag('property', 'og:url', fullCanonicalUrl);
    this.setMetaTag('property', 'og:type', type);
    this.setMetaTag('property', 'og:image', image || `${PUBLIC_DOMAIN}/images/logo.svg`);

    // 6. Twitter Card Tags
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:title', formattedTitle);
    this.setMetaTag('name', 'twitter:description', cleanDesc);
    this.setMetaTag('name', 'twitter:image', image || `${PUBLIC_DOMAIN}/images/logo.svg`);

    // 7. Structured Data (JSON-LD)
    this.updateJsonLd(jsonLd);
  }

  static setMetaTag(attrName, attrValue, contentValue) {
    let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attrName, attrValue);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', contentValue || '');
  }

  static updateJsonLd(data) {
    let scriptTag = document.getElementById('json-ld-data');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (data) {
      scriptTag.textContent = JSON.stringify(data);
    } else {
      scriptTag.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Dark Watch",
        "url": PUBLIC_DOMAIN,
        "description": "منصة مشاهدة مسلسلات وأفلام الكرتون والأنمي بجودة عالية وبدون إعلانات مزعجة."
      });
    }
  }
}

export default SEOManager;
