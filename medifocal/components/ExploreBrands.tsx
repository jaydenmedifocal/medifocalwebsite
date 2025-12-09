
import React, { useState } from 'react';

const BrandItem: React.FC<{ logo?: string; text?: string[]; isSpecial?: boolean; brandName?: string; }> = ({ logo, text, isSpecial, brandName }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const altText = brandName 
        ? `${brandName} dental equipment brand logo` 
        : text 
            ? `${text.join(' ')} dental products` 
            : 'Dental equipment brand logo';
    
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setImageError(true);
        setImageLoaded(false);
        // Prevent error from bubbling to console
        e.stopPropagation();
        // Prevent default error behavior
        e.preventDefault();
        // Hide the broken image
        const target = e.currentTarget;
        if (target) {
            target.style.display = 'none';
        }
    };
    
    const handleImageLoad = () => {
        setImageLoaded(true);
    };
    
    // Show image if logo exists and no error occurred
    // If image hasn't loaded yet but no error, still show it (it will load)
    // If error occurred, show fallback
    const shouldShowImage = logo && !imageError;
    
    const content = shouldShowImage ? (
        <img 
            src={logo} 
            alt={altText}
            className="max-h-12 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            width="120"
            height="60"
            decoding="async"
        />
    ) : text ? (
        <div className={`font-bold text-sm leading-tight text-center ${isSpecial ? 'text-red-600' : 'text-gray-700 group-hover:text-brand-blue'}`}>
            {text.map((line, i) => <span key={i} className="block">{line}</span>)}
        </div>
    ) : (
        <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center" aria-label={altText}>
            <span className="text-xs text-gray-400 font-semibold">{brandName || 'Logo'}</span>
        </div>
    );
    
    return (
        <div className="flex items-center justify-center p-4 h-28 bg-white hover:bg-gray-50 transition-colors duration-200 group cursor-pointer">
            {content}
        </div>
    );
};

const ExploreBrands: React.FC = () => {
    const brandLogos = [
        'https://storage.googleapis.com/medifocal-public-assets/kerr-logo.svg',
        'https://storage.googleapis.com/medifocal-public-assets/3m-logo.svg',
        'https://storage.googleapis.com/medifocal-public-assets/gc-logo.svg',
        'https://storage.googleapis.com/medifocal-public-assets/ivoclar-logo.svg',
        'https://storage.googleapis.com/medifocal-public-assets/dentsply-sirona-logo.svg',
    ];

    return (
        <div className="py-8">
             <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Explore Top Brands</h2>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 divide-x divide-gray-200">
                   <BrandItem logo={brandLogos[0]} brandName="Kerr" />
                   <BrandItem text={['Supplier', 'Specials']} isSpecial />
                   <BrandItem logo={brandLogos[1]} brandName="3M" />
                   <BrandItem text={['Special', 'Offers']} isSpecial />
                   <BrandItem logo={brandLogos[2]} brandName="GC" />
                   <BrandItem logo={brandLogos[3]} brandName="Ivoclar" />
                   <BrandItem logo={brandLogos[4]} brandName="Dentsply Sirona" />
                </div>
            </div>
        </div>
    );
};

export default ExploreBrands;
