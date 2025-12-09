import React, { useState } from 'react';
import { View } from '../App';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  id?: string;
  name: string;
  imageUrl: string;
  displayPrice: string;
  originalPrice?: string;
  tag?: string;
  tagColor?: string;
  manufacturer?: string;
  itemNumber: string;
  specialPrice?: string;
  price?: number;
  category?: string;
  setCurrentView: (view: View) => void;
  [key: string]: any; // Allow additional product props
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  id, 
  name, 
  imageUrl, 
  displayPrice, 
  originalPrice, 
  tag,
  tagColor = 'bg-red-500', 
  manufacturer, 
  itemNumber, 
  specialPrice, 
  price,
  category,
  setCurrentView,
  ...productProps 
}) => {
    const [imageError, setImageError] = useState(false);
    const { addItem } = useCart();
    
    const handleImageError = () => {
        setImageError(true);
    };
    
    const displayImage = imageError || !imageUrl 
        ? 'https://via.placeholder.com/250x250?text=No+Image' 
        : imageUrl;
    
    const handleNavigate = () => {
        if (itemNumber && setCurrentView) {
            setCurrentView({ page: 'productDetail', itemNumber });
            window.scrollTo(0, 0);
        }
    };
    
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        let productPrice = price || 0;
        if (!productPrice && displayPrice) {
            const priceMatch = displayPrice.replace(/[^0-9.]/g, '');
            productPrice = parseFloat(priceMatch) || 0;
        }
        
        addItem({
            id: id || itemNumber,
            itemNumber,
            name,
            imageUrl,
            price: productPrice,
            displayPrice,
            manufacturer,
            category,
            ...productProps
        }, 1);
    };
    
    // Enhanced alt text for SEO
    const imageAlt = `${name}${manufacturer ? ` by ${manufacturer}` : ''}${category ? ` - ${category}` : ''} | Medifocal`;
    
    return (
        <div className="bg-white border border-gray-200 p-4 h-full flex flex-col hover:shadow-md transition-shadow">
            <div className="relative mb-4 cursor-pointer" onClick={handleNavigate}>
                    <img 
                        src={displayImage} 
                        alt={imageAlt}
                        className="w-full h-48 object-contain"
                        onError={handleImageError}
                        loading="lazy"
                        width="250"
                        height="250"
                    />
                {tag && (
                    <span className={`absolute top-0 right-0 ${tagColor} text-white text-xs font-bold px-2 py-1`}>
                        {tag}
                    </span>
                )}
            </div>
            
            <div className="flex-grow flex flex-col">
                {manufacturer && (
                    <p className="text-sm text-gray-500 mb-1">{manufacturer}</p>
                )}
                
                <h3 
                    className="text-brand-blue font-medium text-sm mb-2 cursor-pointer hover:underline line-clamp-2 min-h-[2.5em]"
                    onClick={handleNavigate}
                >
                        {name}
                </h3>
                
                <p className="text-xs text-gray-500 mb-3">{itemNumber}</p>
                
                <div className="mt-auto">
                    {/* Pricing Section */}
                    <div className="mb-3">
                        {originalPrice ? (
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 line-through">{originalPrice}</span>
                                <span className="text-lg font-bold text-gray-900">{displayPrice}</span>
                            </div>
                        ) : (
                            <span className="text-lg font-bold text-gray-900">{displayPrice}</span>
                        )}
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        className="w-full bg-brand-blue text-white font-bold py-2 px-4 text-sm hover:bg-brand-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
