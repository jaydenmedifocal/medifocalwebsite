import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { useCart } from '../contexts/CartContext';
import { getReviewSummary } from '../services/reviews';

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
    const [reviewSummary, setReviewSummary] = useState<{ averageRating: number; totalReviews: number } | null>(null);
    const { addItem } = useCart();
    
    useEffect(() => {
        const loadReviewSummary = async () => {
            try {
                const summary = await getReviewSummary(itemNumber);
                if (summary.totalReviews > 0) {
                    setReviewSummary(summary);
                }
            } catch (error) {
                // Silently fail - reviews are optional
            }
        };
        loadReviewSummary();
    }, [itemNumber]);
    
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
                
                {reviewSummary && reviewSummary.totalReviews > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <svg
                                    key={value}
                                    className="w-3 h-3"
                                    fill={value <= Math.round(reviewSummary.averageRating) ? '#fbbf24' : '#e5e7eb'}
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs text-gray-600">
                            {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.totalReviews})
                        </span>
                    </div>
                )}
                
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
