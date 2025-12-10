import React, { useEffect } from 'react';
import { validateSEO } from '../utils/seoValidation';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  product?: {
    name?: string;
    price?: number;
    currency?: string;
    availability?: 'in stock' | 'out of stock' | 'preorder';
    brand?: string;
    category?: string;
  };
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Medifocal | Australian Dental Equipment Supplier",
  description = "Australia's leading dental equipment supplier. Shop premium dental supplies, autoclaves, dental chairs, imaging equipment, sterilization equipment, and consumables. Fast shipping, expert support, 60+ years experience.",
  keywords = "dental equipment supplier, dental supplies Australia, medical equipment supplier, autoclaves, dental chairs, dental imaging, sterilization equipment, dental consumables, dental instruments, dental practice supplies, dental X-ray, dental compressors, dental suction units, intraoral scanner, dental lasers, electro surgical, dental equipment repair, dental equipment service, Australian dental supplier, dental equipment wholesale",
  image = "https://medifocal.com/og-image.jpg",
  url = "https://medifocal.com",
  type = "website",
  product,
  article,
  structuredData
}) => {
  const fullTitle = title.includes('Medifocal') ? title : `${title} | Medifocal`;
  const fullUrl = url.startsWith('http') ? url : `https://medifocal.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://medifocal.com${image}`;

  // Generate structured data
  const generateStructuredData = () => {
    const baseData: any = {
      "@context": "https://schema.org",
    };

    if (product) {
      // Product schema
      return {
        ...baseData,
        "@type": "Product",
        "name": product.name || title,
        "description": description,
        "image": fullImage,
        "brand": {
          "@type": "Brand",
          "name": product.brand || "Medifocal"
        },
        "offers": {
          "@type": "Offer",
          "url": fullUrl,
          "priceCurrency": product.currency || "AUD",
          "price": product.price?.toString() || "0",
          "availability": `https://schema.org/${product.availability === 'in stock' ? 'InStock' : product.availability === 'out of stock' ? 'OutOfStock' : 'PreOrder'}`,
          "seller": {
            "@type": "Organization",
            "name": "Medifocal"
          }
        },
        "category": product.category
      };
    } else if (article) {
      // Article schema
      return {
        ...baseData,
        "@type": "Article",
        "headline": title,
        "description": description,
        "image": fullImage,
        "datePublished": article.publishedTime,
        "dateModified": article.modifiedTime || article.publishedTime,
        "author": {
          "@type": "Person",
          "name": article.author || "Medifocal"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Medifocal",
          "logo": {
            "@type": "ImageObject",
            "url": "https://firebasestorage.googleapis.com/v0/b/medifocal.firebasestorage.app/o/MediFocal_Logo?alt=media&token=bac54fce-346e-47ec-9699-1a7533e9aeef"
          }
        },
        "articleSection": article.section,
        "keywords": article.tags?.join(', ')
      };
    } else {
      // Organization/Website schema
      return {
        ...baseData,
        "@type": "Organization",
        "name": "Medifocal",
        "url": "https://medifocal.com",
        "logo": "https://firebasestorage.googleapis.com/v0/b/medifocal.firebasestorage.app/o/MediFocal_Logo?alt=media&token=bac54fce-346e-47ec-9699-1a7533e9aeef",
        "description": description,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Site 2, 7 Friesian Close",
          "addressLocality": "Sandgate",
          "addressRegion": "NSW",
          "postalCode": "2304",
          "addressCountry": "AU"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+61-2-4056-1419",
          "contactType": "Customer Service",
          "email": "admin@medifocal.com"
        },
        "sameAs": [
          // Add social media links if available
        ]
      };
    }
  };

  const schemaData = structuredData || generateStructuredData();

  // Update canonical link in head (replace existing one from index.html)
  useEffect(() => {
    // Find existing canonical link or create new one
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullUrl);
  }, [fullUrl]);

  // Update title
  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  // Update meta description
  useEffect(() => {
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }, [description]);

  // Validate SEO in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const validation = validateSEO({
        title: fullTitle,
        description,
        url: fullUrl,
        image: fullImage,
        canonical: fullUrl
      });
      
      if (!validation.isValid) {
        console.warn('SEO Validation Errors:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('SEO Validation Warnings:', validation.warnings);
      }
    }
  }, [fullTitle, description, fullUrl, fullImage]);

  return (
    <>
      {/* Primary Meta Tags - These update the DOM via useEffect above */}
      <meta name="title" content={fullTitle} />
      {/* Description updated via useEffect */}
      {/* Keywords meta tag removed - considered spam indicator by search engines */}
      <meta name="author" content="Medifocal" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      {/* Canonical updated via useEffect - don't add duplicate */}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Medifocal" />
      <meta property="og:locale" content="en_AU" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Additional Meta Tags */}
      <meta name="geo.region" content="AU-NSW" />
      <meta name="geo.placename" content="Sandgate" />
      <meta name="geo.position" content="-32.8703;151.7028" />
      <meta name="ICBM" content="-32.8703, 151.7028" />
      
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </>
  );
};

export default SEOHead;


