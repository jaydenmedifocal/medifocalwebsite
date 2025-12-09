import React from 'react';
import { View } from '../App';
import { viewToUrl } from '../utils/routing';

interface BreadcrumbItem {
  label: string;
  view?: View;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  setCurrentView?: (view: View) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, setCurrentView }) => {
  const handleClick = (item: BreadcrumbItem) => {
    if (item.view && setCurrentView) {
      setCurrentView(item.view);
    } else if (item.url) {
      window.location.href = item.url;
    }
  };

  // Generate structured data for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.url || (item.view ? `https://medifocal.com${viewToUrl(item.view)}` : 'https://medifocal.com')
    }))
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {index === items.length - 1 ? (
                <span className="font-semibold text-gray-900" aria-current="page">{item.label}</span>
              ) : (
                <button
                  onClick={() => handleClick(item)}
                  className="hover:text-brand-blue transition-colors"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;







