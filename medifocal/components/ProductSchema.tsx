import React from 'react';

interface ProductSchemaProps {
  product: {
    name: string;
    itemNumber: string;
    price: number;
    displayPrice?: string;
    imageUrl?: string;
    images?: string[];
    description?: string;
    manufacturer?: string;
    category?: string;
    parentCategory?: string;
    inStock?: boolean;
    rating?: number;
    reviewCount?: number;
  };
}

const ProductSchema: React.FC<ProductSchemaProps> = ({ product }) => {
  // Ensure images are absolute URLs
  const productImages = [];
  if (product.images && product.images.length > 0) {
    productImages.push(...product.images.map((img: string) => 
      img.startsWith('http') ? img : `https://medifocal.com${img}`
    ));
  }
  if (product.imageUrl) {
    const mainImage = product.imageUrl.startsWith('http') 
      ? product.imageUrl 
      : `https://medifocal.com${product.imageUrl}`;
    if (!productImages.includes(mainImage)) {
      productImages.unshift(mainImage); // Main image first
    }
  }
  
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "sku": product.itemNumber,
    "mpn": product.itemNumber, // Manufacturer Part Number
    "description": product.description || `${product.name} - Premium dental equipment from ${product.manufacturer || 'Medifocal'}. Available at Medifocal with fast shipping across Australia.`,
    "image": productImages.length > 0 ? productImages : [],
    "brand": {
      "@type": "Brand",
      "name": product.manufacturer || "Medifocal"
    },
    "category": product.parentCategory || product.category || "Dental Equipment",
    "offers": {
      "@type": "Offer",
      "url": `https://medifocal.com/product/${encodeURIComponent(product.itemNumber)}`,
      "priceCurrency": "AUD",
      "price": product.price.toString(),
      "availability": product.inStock !== false 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Medifocal",
        "url": "https://medifocal.com",
        "logo": "https://firebasestorage.googleapis.com/v0/b/medifocal.firebasestorage.app/o/MediFocal_Logo?alt=media&token=bac54fce-346e-47ec-9699-1a7533e9aeef"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "AUD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "AU"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "businessDays": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
          },
          "cutoffTime": "14:00",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
      }
    },
    ...(product.rating && product.reviewCount ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating.toString(),
        "reviewCount": product.reviewCount.toString(),
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {})
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
};

export default ProductSchema;







